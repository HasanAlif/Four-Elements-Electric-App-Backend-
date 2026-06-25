import httpStatus from 'http-status';
import { isValidObjectId } from 'mongoose';
import { Service_STATUSES } from '../../constants';
import { AppError } from '../../utils';
import { serviceModels } from '../serviceModels';

type QuoteRow = {
  _id: unknown;
  qId?: string;
  serviceType?: string;
  status?: string;
  additionalInformation?: string;
  createdAt: Date;
};

type LeanQuery = { lean: () => Promise<QuoteRow[]> };

// Full lean document (every field) for the single-quote activity view.
type QuoteDoc = Record<string, unknown> & {
  _id: unknown;
  serviceType?: string;
  status?: string;
  createdAt: Date;
  updatedAt: Date;
  statusTimeline?: { status?: string; changedAt?: Date }[];
};

type QuoteModel = {
  find: (filter: Record<string, unknown>) => {
    select: (fields: string) => LeanQuery;
    lean: () => Promise<QuoteDoc[]>;
  };
};

// Every submitted-quote collection, from the shared registry (src/app/modules/
// serviceModels.ts) so Quotes/Draft/Admin can never drift out of sync.
const quoteModels: QuoteModel[] = serviceModels.map(
  model => model as unknown as QuoteModel,
);

const MONTH_FULL = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

// "20 June, 2026" (server local time, no leading zero).
const formatSubmitted = (date: Date) => {
  const dt = new Date(date);
  return `${dt.getDate()} ${MONTH_FULL[dt.getMonth()]}, ${dt.getFullYear()}`;
};

const escapeRegex = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Every status a submitted quote can have (everything except draft).
const NON_DRAFT_STATUSES: string[] = Object.values(Service_STATUSES).filter(
  status => status !== Service_STATUSES.DRAFT,
);

type TMyQuotesFilters = {
  status?: string;
  searchQuery?: string;
};

const getAllMyQuotes = async (
  userId: string,
  filters: TMyQuotesFilters = {},
) => {
  const status = (filters.status ?? '').trim().toLowerCase();
  const searchQuery = (filters.searchQuery ?? '').trim();

  // This user's submitted quotes; drafts are never included.
  const query: Record<string, unknown> = {
    createdBy: userId,
    status: { $ne: Service_STATUSES.DRAFT },
  };

  if (status && status !== 'all') {
    if (!NON_DRAFT_STATUSES.includes(status)) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `status must be 'all' or one of: ${NON_DRAFT_STATUSES.join(', ')}!`,
      );
    }
    query.status = status;
  }

  // searchQuery filters by serviceType.
  if (searchQuery) {
    query.serviceType = { $regex: escapeRegex(searchQuery), $options: 'i' };
  }

  const rowsPerModel = await Promise.all(
    quoteModels.map(model =>
      model
        .find(query)
        .select('qId serviceType status additionalInformation createdAt')
        .lean(),
    ),
  );
  const rows = rowsPerModel.flat();

  // With a search term → relevance rank on serviceType (exact > starts-with >
  // contains), createdAt desc tiebreak. Without → newest first.
  let sorted: QuoteRow[];
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    const score = (value?: string) => {
      if (!value) return 0;
      const v = value.toLowerCase();
      if (v === q) return 3;
      if (v.startsWith(q)) return 2;
      if (v.includes(q)) return 1;
      return 0;
    };

    sorted = rows
      .map(row => ({ row, score: score(row.serviceType) }))
      .sort(
        (a, b) =>
          b.score - a.score ||
          new Date(b.row.createdAt).getTime() -
            new Date(a.row.createdAt).getTime(),
      )
      .map(item => item.row);
  } else {
    sorted = rows.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }

  return sorted.map(row => ({
    id: String(row._id),
    qId: row.qId ?? null,
    serviceType: row.serviceType,
    Submitted: formatSubmitted(row.createdAt),
    additionalNotes: row.additionalInformation ?? '',
    status: row.status,
  }));
};

const MONTH_ABBR = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

// "Apr 8, 2026" (server local time, no leading zero).
const formatShortDate = (date: Date) => {
  const dt = new Date(date);
  return `${MONTH_ABBR[dt.getMonth()]} ${dt.getDate()}, ${dt.getFullYear()}`;
};

// "just now", "2 minutes ago", "3 hours ago", "5 days ago", "2 months ago",
// "1 year ago" — how far `date` is in the past from now.
const formatRelative = (date: Date) => {
  const diffMs = Date.now() - new Date(date).getTime();
  const sec = Math.floor(diffMs / 1000);
  const unit = (value: number, name: string) =>
    `${value} ${name}${value === 1 ? '' : 's'} ago`;

  if (sec < 60) return 'just now';
  const min = Math.floor(sec / 60);
  if (min < 60) return unit(min, 'minute');
  const hour = Math.floor(min / 60);
  if (hour < 24) return unit(hour, 'hour');
  const day = Math.floor(hour / 24);
  if (day < 30) return unit(day, 'day');
  const month = Math.floor(day / 30);
  if (month < 12) return unit(month, 'month');
  return unit(Math.floor(day / 365), 'year');
};

const isUrl = (value: unknown): value is string =>
  typeof value === 'string' &&
  (value.startsWith('http://') || value.startsWith('https://'));

// Collect every uploaded-photo URL from the doc. Photos are always Cloudinary
// https URLs (single string or string[]); plain-text arrays (quickTags,
// schedulingPreference) are not, so URL-detection separates them cleanly.
const collectPhotoUrls = (doc: QuoteDoc): string[] => {
  const urls: string[] = [];

  for (const value of Object.values(doc)) {
    if (isUrl(value)) {
      urls.push(value);
    } else if (Array.isArray(value)) {
      value.forEach(item => {
        if (isUrl(item)) urls.push(item);
      });
    }
  }

  return urls;
};

// User-facing "where is my quote now" text, keyed by current status.
const PROGRESS_LABELS: Record<string, string> = {
  [Service_STATUSES.PENDING]: 'Quote received',
  [Service_STATUSES.IN_REVIEW]: 'Pending team review',
  [Service_STATUSES.SEND]: 'Quote is ready and sent to you',
  [Service_STATUSES.CLOSED]: 'Request closed',
};

const getMySingleQuoteActivityDetails = async (
  userId: string,
  quoteId: string,
) => {
  if (!isValidObjectId(quoteId)) {
    throw new AppError(httpStatus.NOT_FOUND, 'Quote not found!');
  }

  // ObjectIds are globally unique, so at most one collection holds this quote.
  // Scoped to the owner; drafts are never exposed.
  const matches = await Promise.all(
    quoteModels.map(model =>
      model
        .find({
          _id: quoteId,
          createdBy: userId,
          status: { $ne: Service_STATUSES.DRAFT },
        })
        .lean(),
    ),
  );

  const quote = matches.flat()[0];
  if (!quote) {
    throw new AppError(httpStatus.NOT_FOUND, 'Quote not found!');
  }

  const urls = collectPhotoUrls(quote);

  return {
    id: String(quote._id),
    qId: quote.qId ?? null,
    Submitted: formatShortDate(quote.createdAt),
    LastUpdated: formatRelative(quote.updatedAt),
    ServiceType: quote.serviceType,
    Details: {
      // Placeholder the frontend fills in.
      ServiceRequested: null,
      propertyType: quote.propertyType ?? null,
      currentProgress: quote.status
        ? (PROGRESS_LABELS[quote.status] ?? null)
        : null,
      notes: quote.additionalInformation ?? null,
    },
    UploadedPhotos: { count: urls.length, url: urls },
  };
};

export const QuotesService = {
  getAllMyQuotes,
  getMySingleQuoteActivityDetails,
};
