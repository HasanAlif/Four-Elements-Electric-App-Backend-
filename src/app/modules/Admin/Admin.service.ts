import httpStatus from 'http-status';
import { Service_STATUSES } from '../../constants';
import { AppError } from '../../utils';
import { serviceModels } from '../serviceModels';
import CategoryModel from './Category.model';
import PartnerModel from './Partner.model';
import FAQModel from '../FAQ/FAQ.model';
import User from '../User/user.model';
import { IUser } from '../User/user.interface';
import {
  createAccessToken,
  createRefreshToken,
  sendImageToCloudinary,
} from '../../lib';
import { defaultUserImage, ROLE, AUTH_PROVIDER } from '../User/user.constant';

type QuoteRow = {
  _id: unknown;
  qId?: string;
  fullName?: string;
  phoneNumber?: string;
  emailAddress?: string;
  serviceType?: string;
  createdAt: Date;
  status?: string;
  additionalInformation?: string;
  internalNote?: string;
};

type LeanQuery = { lean: () => Promise<QuoteRow[]> };

type QuoteModel = {
  find: (filter: Record<string, unknown>) => LeanQuery & {
    select: (fields: string) => LeanQuery;
  };
  findOneAndUpdate: (
    filter: Record<string, unknown>,
    update: Record<string, unknown>,
    options: Record<string, unknown>,
  ) => { lean: () => Promise<QuoteRow | null> };
};

// Every submitted-quote collection, from the shared registry (src/app/modules/
// serviceModels.ts) so Quotes/Draft/Admin can never drift out of sync.
const quoteModels: QuoteModel[] = serviceModels.map(
  model => model as unknown as QuoteModel,
);

const QUOTE_FIELDS =
  'qId fullName phoneNumber emailAddress serviceType createdAt status additionalInformation';

// Status badges shown in meta — every status except draft, in enum order.
const COUNTED_STATUSES = Object.values(Service_STATUSES).filter(
  status => status !== Service_STATUSES.DRAFT,
);

// `All` plus a per-status tally over the given (non-draft) rows.
const buildStatusCounts = (rows: QuoteRow[]) => {
  const counts: Record<string, number> = { All: rows.length };
  COUNTED_STATUSES.forEach(status => {
    counts[status] = 0;
  });

  rows.forEach(row => {
    if (row.status && row.status in counts) {
      counts[row.status] += 1;
    }
  });

  return counts;
};

type TGetAllQuotesFilters = {
  status?: string;
  serviceType?: string;
  searchQuery?: string;
  page?: number;
  limit?: number;
};

const escapeRegex = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const getQoutesCount = async () => {
  const rowsPerModel = await Promise.all(
    quoteModels.map(model =>
      model
        .find({ status: { $ne: Service_STATUSES.DRAFT } })
        .select('status createdAt')
        .lean(),
    ),
  );

  const rows = rowsPerModel.flat();

  // "Today" = since local midnight on the server.
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  let newToday = 0;
  let pending = 0;
  let needResponse = 0;

  rows.forEach(row => {
    if (row.createdAt && new Date(row.createdAt) >= startOfToday) {
      newToday += 1;
    }
    if (row.status === Service_STATUSES.PENDING) {
      pending += 1;
    }
    // Everything not yet closed still needs a response.
    if (row.status !== Service_STATUSES.CLOSED) {
      needResponse += 1;
    }
  });

  return {
    totalQoutes: rows.length,
    newToday,
    pending,
    needResponse,
  };
};

const getAllQuotes = async (filters: TGetAllQuotesFilters) => {
  const { status, serviceType } = filters;
  const searchQuery = (filters.searchQuery ?? '').trim();

  const page = Number(filters.page) || 1;
  const limit = Number(filters.limit) || 10;

  // Base set: all non-draft quotes, optionally narrowed by serviceType and a
  // name/qId/email search. Drafts are internal-only and never exposed here.
  const baseQuery: Record<string, unknown> = {
    status: { $ne: Service_STATUSES.DRAFT },
  };

  if (serviceType) {
    baseQuery.serviceType = serviceType;
  }

  if (searchQuery) {
    const regex = { $regex: escapeRegex(searchQuery), $options: 'i' };
    baseQuery.$or = [
      { fullName: regex },
      { qId: regex },
      { emailAddress: regex },
    ];
  }

  const quotesPerModel = await Promise.all(
    quoteModels.map(model => model.find(baseQuery).select(QUOTE_FIELDS).lean()),
  );

  const allQuotes = quotesPerModel.flat();

  // Counts are independent of the status filter so every badge always shows.
  const statusCounts = buildStatusCounts(allQuotes);

  // The status filter only narrows the rows actually returned in `data`.
  const matched = status
    ? allQuotes.filter(q => q.status === status)
    : allQuotes;

  // With a search term → relevance rank (exact > starts-with > contains across
  // name/qId/email), createdAt desc tiebreak. Without → newest first.
  let sorted: QuoteRow[];
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    const fieldScore = (value?: string) => {
      if (!value) return 0;
      const v = value.toLowerCase();
      if (v === q) return 3;
      if (v.startsWith(q)) return 2;
      if (v.includes(q)) return 1;
      return 0;
    };

    sorted = matched
      .map(row => ({
        row,
        score:
          fieldScore(row.fullName) +
          fieldScore(row.qId) +
          fieldScore(row.emailAddress),
      }))
      .sort(
        (a, b) =>
          b.score - a.score ||
          new Date(b.row.createdAt).getTime() -
            new Date(a.row.createdAt).getTime(),
      )
      .map(item => item.row);
  } else {
    sorted = matched.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }

  const total = sorted.length;
  const totalPage = Math.ceil(total / limit);
  const skip = (page - 1) * limit;
  const data = sorted.slice(skip, skip + limit);

  return {
    meta: { page, limit, total, totalPage, ...statusCounts },
    data,
  };
};

const getSingleQuote = async (quoteId: string) => {
  // ObjectIds are globally unique, so at most one collection holds this quote.
  const matches = await Promise.all(
    quoteModels.map(model =>
      model
        .find({ _id: quoteId, status: { $ne: Service_STATUSES.DRAFT } })
        .lean(),
    ),
  );

  const quote = matches.flat()[0];

  if (!quote) {
    throw new AppError(httpStatus.NOT_FOUND, 'Quote not found!');
  }

  return quote;
};

type TUpdateQuoteStatusPayload = {
  status?: string;
  internalNote?: string;
};

const updateQuoteStatus = async (
  quoteId: string,
  payload: TUpdateQuoteStatusPayload,
) => {
  // Build the update from only the fields the admin actually sent.
  const update: Record<string, unknown> = {};
  if (payload.status !== undefined) update.status = payload.status;
  if (payload.internalNote !== undefined) {
    update.internalNote = payload.internalNote;
  }

  if (Object.keys(update).length === 0) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Provide a status or internalNote to update!',
    );
  }

  // ObjectIds are globally unique, so at most one collection holds this quote.
  // Drafts are never exposed/edited through the admin surface.
  const results = await Promise.all(
    quoteModels.map(model =>
      model
        .findOneAndUpdate(
          { _id: quoteId, status: { $ne: Service_STATUSES.DRAFT } },
          update,
          { new: true, runValidators: true },
        )
        .lean(),
    ),
  );

  const updated = results.find(Boolean);

  if (!updated) {
    throw new AppError(httpStatus.NOT_FOUND, 'Quote not found!');
  }

  return updated;
};

const getQouteForUpdate = async (quoteId: string) => {
  // ObjectIds are globally unique, so at most one collection holds this quote.
  const matches = await Promise.all(
    quoteModels.map(model =>
      model
        .find({ _id: quoteId, status: { $ne: Service_STATUSES.DRAFT } })
        .lean(),
    ),
  );

  const quote = matches.flat()[0];

  if (!quote) {
    throw new AppError(httpStatus.NOT_FOUND, 'Quote not found!');
  }

  // Minimal shape for prefilling the status-update form.
  return {
    id: String(quote._id),
    qId: quote.qId,
    currentStatus: quote.status,
  };
};

// ----- Categories (CRUD) -----

type TCategoryPayload = {
  name: string;
  description?: string;
  isActive?: boolean;
};

const createCategory = async (payload: TCategoryPayload) => {
  const exists = await CategoryModel.findOne({ name: payload.name });
  if (exists) {
    throw new AppError(httpStatus.CONFLICT, 'Category name already exists!');
  }

  return CategoryModel.create(payload);
};

const getAllCategories = async () => {
  const [categories, partnerCounts] = await Promise.all([
    CategoryModel.find().sort({ name: 1 }).lean(),
    PartnerModel.aggregate<{ _id: string; count: number }>([
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]),
  ]);

  // Partners reference a category by its (unique) name.
  const countByCategory = new Map(
    partnerCounts.map(item => [item._id, item.count]),
  );

  return categories.map(category => ({
    ...category,
    partnerCount: countByCategory.get(category.name) ?? 0,
  }));
};

const getSingleCategory = async (id: string) => {
  const category = await CategoryModel.findById(id);

  if (!category) {
    throw new AppError(httpStatus.NOT_FOUND, 'Category not found!');
  }

  return category;
};

const updateCategory = async (
  id: string,
  payload: Partial<TCategoryPayload>,
) => {
  // Guard the unique name (returns a clean 409 instead of the global 400).
  if (payload.name !== undefined) {
    const dup = await CategoryModel.findOne({
      name: payload.name,
      _id: { $ne: id },
    });
    if (dup) {
      throw new AppError(httpStatus.CONFLICT, 'Category name already exists!');
    }
  }

  const category = await CategoryModel.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  if (!category) {
    throw new AppError(httpStatus.NOT_FOUND, 'Category not found!');
  }

  return category;
};

const deleteCategory = async (id: string) => {
  const category = await CategoryModel.findByIdAndDelete(id);

  if (!category) {
    throw new AppError(httpStatus.NOT_FOUND, 'Category not found!');
  }

  return category;
};

// ----- Partners (CRUD) -----

type TPartnerPayload = {
  companyName: string;
  category: string;
  description?: string;
  phoneNumber?: string;
  websiteUrl?: string;
  isVerified?: boolean;
  isActive?: boolean;
};

// Partners reference a Category by name — reject names that don't exist.
const assertCategoryExists = async (name: string) => {
  const category = await CategoryModel.findOne({ name });
  if (!category) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Category '${name}' does not exist!`,
    );
  }
};

const createPartner = async (payload: TPartnerPayload) => {
  await assertCategoryExists(payload.category);

  const exists = await PartnerModel.findOne({
    companyName: payload.companyName,
  });
  if (exists) {
    throw new AppError(
      httpStatus.CONFLICT,
      'Partner company name already exists!',
    );
  }

  return PartnerModel.create({
    ...payload,
    lastChange: { changeType: 'created', fields: [] },
  });
};

// Partner fields whose changes are surfaced in the recent-updates feed.
const TRACKED_PARTNER_FIELDS: (keyof TPartnerPayload)[] = [
  'companyName',
  'category',
  'description',
  'phoneNumber',
  'websiteUrl',
  'isVerified',
  'isActive',
];

type TPartnerListFilters = {
  searchQuery?: string;
  category?: string;
  status?: string;
};

const getAllPartner = async (filters: TPartnerListFilters = {}) => {
  const searchQuery = (filters.searchQuery ?? '').trim();
  const category = (filters.category ?? '').trim();
  const status = (filters.status ?? '').trim().toLowerCase();

  // Filters: exact category, and status -> isVerified ('all' = no filter).
  const mongoFilter: Record<string, unknown> = {};
  if (category) {
    mongoFilter.category = category;
  }
  if (status && status !== 'all') {
    if (status !== 'verified' && status !== 'unverified') {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "status must be 'all', 'verified', or 'unverified'!",
      );
    }
    mongoFilter.isVerified = status === 'verified';
  }
  if (searchQuery) {
    const regex = { $regex: escapeRegex(searchQuery), $options: 'i' };
    mongoFilter.$or = [{ companyName: regex }, { category: regex }];
  }

  const partners = await PartnerModel.find(mongoFilter).lean();

  // No search term → filtered list, newest first (the original getAllPartner).
  if (!searchQuery) {
    return partners.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }

  // With a search term → relevance rank: exact (3) > starts-with (2) >
  // contains (1), summed across the two searchable fields; createdAt desc tiebreak.
  const q = searchQuery.toLowerCase();
  const fieldScore = (value?: string) => {
    if (!value) return 0;
    const v = value.toLowerCase();
    if (v === q) return 3;
    if (v.startsWith(q)) return 2;
    if (v.includes(q)) return 1;
    return 0;
  };

  return partners
    .map(partner => ({
      partner,
      score: fieldScore(partner.companyName) + fieldScore(partner.category),
    }))
    .sort(
      (a, b) =>
        b.score - a.score ||
        new Date(b.partner.createdAt).getTime() -
          new Date(a.partner.createdAt).getTime(),
    )
    .map(item => item.partner);
};

const getSinglePartner = async (id: string) => {
  const partner = await PartnerModel.findById(id);

  if (!partner) {
    throw new AppError(httpStatus.NOT_FOUND, 'Partner not found!');
  }

  return partner;
};

const updatePartner = async (id: string, payload: Partial<TPartnerPayload>) => {
  if (payload.category !== undefined) {
    await assertCategoryExists(payload.category);
  }

  const existing = await PartnerModel.findById(id).lean();
  if (!existing) {
    throw new AppError(httpStatus.NOT_FOUND, 'Partner not found!');
  }

  // Guard the unique companyName (returns a clean 409 instead of the global 400).
  if (payload.companyName !== undefined) {
    const dup = await PartnerModel.findOne({
      companyName: payload.companyName,
      _id: { $ne: id },
    });
    if (dup) {
      throw new AppError(
        httpStatus.CONFLICT,
        'Partner company name already exists!',
      );
    }
  }

  // Which tracked fields the payload actually changes (for the recent-updates feed).
  const existingValues = existing as unknown as Record<string, unknown>;
  const changedFields = TRACKED_PARTNER_FIELDS.filter(
    field =>
      payload[field] !== undefined && payload[field] !== existingValues[field],
  );

  const partner = await PartnerModel.findByIdAndUpdate(
    id,
    {
      ...payload,
      lastChange: { changeType: 'updated', fields: changedFields },
    },
    { new: true, runValidators: true },
  );

  if (!partner) {
    throw new AppError(httpStatus.NOT_FOUND, 'Partner not found!');
  }

  return partner;
};

const deletePartner = async (id: string) => {
  const partner = await PartnerModel.findByIdAndDelete(id);

  if (!partner) {
    throw new AppError(httpStatus.NOT_FOUND, 'Partner not found!');
  }

  return partner;
};

const changePassword = async (
  userData: IUser,
  payload: { oldPassword: string; newPassword: string },
) => {
  const { oldPassword, newPassword } = payload;

  // Select password to use the isPasswordMatched method.
  const user = await User.findOne({
    _id: userData._id,
    isActive: true,
  }).select('+password');

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not exists!');
  }

  const isCredentialsCorrect = await user.isPasswordMatched(oldPassword);
  if (!isCredentialsCorrect) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Current password is not correct!',
    );
  }

  if (oldPassword === newPassword) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'New password must be different!',
    );
  }

  user.password = newPassword;
  // Set 5 seconds earlier to avoid the isJWTIssuedBeforePasswordChanged race.
  user.passwordChangedAt = new Date(Date.now() - 5000);
  await user.save(); // pre('save') hook hashes the new password

  const accessTokenPayload = {
    _id: user._id.toString(),
    name: user.name,
    address: user.address,
    phone: user.phone,
    email: user.email,
    image: user.image || defaultUserImage,
    role: user.role,
  };

  return {
    accessToken: createAccessToken(accessTokenPayload),
    refreshToken: createRefreshToken({ email: user.email }),
    user: accessTokenPayload,
  };
};

const getAdminProfile = async (userData: IUser) => {
  const user = await User.findById(userData._id);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not exists!');
  }

  return {
    name: user.name,
    address: user.address,
    phone: user.phone,
    email: user.email,
    image: user.image || defaultUserImage,
    role: user.role,
  };
};

const createAdminUserBySuperAdmin = async (
  payload: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    password: string;
  },
  imageFile?: Express.Multer.File,
) => {
  const exists = await User.findOne({ email: payload.email });
  if (exists) {
    throw new AppError(httpStatus.CONFLICT, 'Email already exists!');
  }

  // Upload the (optional) profile image; fall back to the default avatar.
  let image = defaultUserImage;
  if (imageFile) {
    const { secure_url } = await sendImageToCloudinary(imageFile);
    image = secure_url;
  }

  const user = await User.create({
    firstName: payload.firstName,
    lastName: payload.lastName,
    name: `${payload.firstName} ${payload.lastName}`,
    phone: payload.phone,
    email: payload.email,
    password: payload.password, // pre('save') hook hashes it
    image,
    role: ROLE.ADMIN,
    authProvider: AUTH_PROVIDER.EMAIL,
    isVerifiedByOTP: true,
  });

  return {
    _id: user._id,
    name: user.name,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    email: user.email,
    image: user.image || defaultUserImage,
    role: user.role,
    isSuspended: user.isSuspended,
  };
};

const getAllAdmins = async (status?: string) => {
  const normalized = (status ?? 'all').trim().toLowerCase();

  if (!['all', 'active', 'suspended'].includes(normalized)) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "status must be 'all', 'active', or 'suspended'!",
    );
  }

  const admins = await User.find({
    $or: [{ role: ROLE.ADMIN }, { role: ROLE.SUSPENDED_ADMIN }],
  })
    .select('name email phone createdAt role isSuspended image')
    .sort({ createdAt: -1 })
    .lean();

  const activeAdmin = admins.filter(admin => !admin.isSuspended).length;
  const suspendedAdmin = admins.filter(admin => admin.isSuspended).length;

  const data =
    normalized === 'active'
      ? admins.filter(admin => !admin.isSuspended)
      : normalized === 'suspended'
        ? admins.filter(admin => admin.isSuspended)
        : admins;

  return { meta: { activeAdmin, suspendedAdmin }, data };
};

const getSingleAdmin = async (id: string) => {
  const admin = await User.findById(id)
    .select('name email phone createdAt role isSuspended image')
    .lean();

  if (
    !admin ||
    (admin.role !== ROLE.ADMIN && admin.role !== ROLE.SUSPENDED_ADMIN)
  ) {
    throw new AppError(httpStatus.NOT_FOUND, 'Admin user not found!');
  }

  return admin;
};

const updateAdminUserStatus = async (id: string) => {
  const admin = await User.findById(id);

  if (
    !admin ||
    (admin.role !== ROLE.ADMIN && admin.role !== ROLE.SUSPENDED_ADMIN)
  ) {
    throw new AppError(httpStatus.NOT_FOUND, 'Admin user not found!');
  }

  // Toggle suspension and keep role in sync.
  const nextSuspended = !admin.isSuspended;
  admin.isSuspended = nextSuspended;
  admin.role = nextSuspended ? ROLE.SUSPENDED_ADMIN : ROLE.ADMIN;
  await admin.save();

  return {
    _id: admin._id,
    name: admin.name,
    email: admin.email,
    phone: admin.phone,
    role: admin.role,
    isSuspended: admin.isSuspended,
    image: admin.image || defaultUserImage,
  };
};

const deleteAdminUserBySuperAdmin = async (id: string) => {
  const admin = await User.findById(id);

  if (
    !admin ||
    (admin.role !== ROLE.ADMIN && admin.role !== ROLE.SUSPENDED_ADMIN)
  ) {
    throw new AppError(httpStatus.NOT_FOUND, 'Admin user not found!');
  }

  await admin.deleteOne();

  return { message: 'Admin user deleted successfully!' };
};

const getDashboardStats = async () => {
  // Non-draft status rows across every quote collection.
  const rowsPerModel = await Promise.all(
    quoteModels.map(model =>
      model
        .find({ status: { $ne: Service_STATUSES.DRAFT } })
        .select('status')
        .lean(),
    ),
  );
  const rows = rowsPerModel.flat();

  let pendingQuotes = 0;
  let InReviewQuotes = 0;
  let contacted = 0;
  let closedQuotes = 0;

  rows.forEach(row => {
    if (row.status === Service_STATUSES.PENDING) pendingQuotes += 1;
    else if (row.status === Service_STATUSES.IN_REVIEW) InReviewQuotes += 1;
    else if (row.status === Service_STATUSES.SEND) contacted += 1;
    else if (row.status === Service_STATUSES.CLOSED) closedQuotes += 1;
  });

  const [partnerCategories, totalPartners, verifiedPartners] =
    await Promise.all([
      CategoryModel.countDocuments(),
      PartnerModel.countDocuments(),
      PartnerModel.countDocuments({ isVerified: true }),
    ]);

  return {
    totalQuotes: rows.length,
    pendingQuotes,
    InReviewQuotes,
    contacted,
    closedQuotes,
    partnerCategories,
    totalPartners,
    verifiedPartners,
  };
};

const getQouteStatsOverview = async () => {
  const rowsPerModel = await Promise.all(
    quoteModels.map(model =>
      model
        .find({ status: { $ne: Service_STATUSES.DRAFT } })
        .select('status')
        .lean(),
    ),
  );
  const rows = rowsPerModel.flat();
  const total = rows.length;

  let pending = 0;
  let inReview = 0;
  let contacted = 0;
  let closed = 0;

  rows.forEach(row => {
    if (row.status === Service_STATUSES.PENDING) pending += 1;
    else if (row.status === Service_STATUSES.IN_REVIEW) inReview += 1;
    else if (row.status === Service_STATUSES.SEND) contacted += 1;
    else if (row.status === Service_STATUSES.CLOSED) closed += 1;
  });

  // Each status as a whole-number percentage of all non-draft quotes.
  const pct = (n: number) => (total === 0 ? 0 : Math.round((n / total) * 100));

  return {
    Pending: pct(pending),
    'In Review': pct(inReview),
    Contacted: pct(contacted),
    Closed: pct(closed),
  };
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

const quoteSubmissionTrend = async () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-based
  const monthStart = new Date(year, month, 1);
  const nextMonthStart = new Date(year, month + 1, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const abbr = MONTH_ABBR[month];

  // This month's non-draft quotes across every collection (createdAt only).
  const rowsPerModel = await Promise.all(
    quoteModels.map(model =>
      model
        .find({
          status: { $ne: Service_STATUSES.DRAFT },
          createdAt: { $gte: monthStart, $lt: nextMonthStart },
        })
        .select('createdAt')
        .lean(),
    ),
  );
  const rows = rowsPerModel.flat();

  // Pre-seed every day of the month to 0, in ascending order.
  const trend: Record<string, number> = {};
  for (let day = 1; day <= daysInMonth; day++) {
    trend[`${abbr}-${day}`] = 0;
  }

  rows.forEach(row => {
    if (!row.createdAt) return;
    const day = new Date(row.createdAt).getDate();
    trend[`${abbr}-${day}`] += 1;
  });

  return trend;
};

const serviceTypeDistribution = async () => {
  // Non-draft quotes' serviceType across every collection.
  const rowsPerModel = await Promise.all(
    quoteModels.map(model =>
      model
        .find({ status: { $ne: Service_STATUSES.DRAFT } })
        .select('serviceType')
        .lean(),
    ),
  );
  const rows = rowsPerModel.flat();

  // Tally quotes per serviceType label.
  const counts: Record<string, number> = {};
  rows.forEach(row => {
    if (row.serviceType) {
      counts[row.serviceType] = (counts[row.serviceType] || 0) + 1;
    }
  });

  const total = Object.values(counts).reduce((sum, c) => sum + c, 0);
  if (total === 0) return [];

  // Rank by count desc (name tie-break); keep top 5, fold the rest into "others".
  const ranked = Object.entries(counts).sort(
    (a, b) => b[1] - a[1] || a[0].localeCompare(b[0]),
  );
  const buckets = ranked
    .slice(0, 5)
    .map(([serviceType, count]) => ({ serviceType, count }));
  const othersCount = ranked
    .slice(5)
    .reduce((sum, [, count]) => sum + count, 0);
  if (othersCount > 0) {
    buckets.push({ serviceType: 'others', count: othersCount });
  }

  // Whole-number share of all quotes; the last bucket ("others" when present)
  // absorbs rounding drift so the column totals exactly 100%.
  const result = buckets.map(bucket => ({
    serviceType: bucket.serviceType,
    percentage: Math.round((bucket.count / total) * 100),
  }));
  const drift = 100 - result.reduce((sum, item) => sum + item.percentage, 0);
  if (drift !== 0) {
    result[result.length - 1].percentage += drift;
  }

  return result;
};

const partnerVerificationStats = async () => {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [totalPartners, verifiedPartners, recentlyUpdated] = await Promise.all([
    PartnerModel.countDocuments(),
    PartnerModel.countDocuments({ isVerified: true }),
    PartnerModel.countDocuments({ updatedAt: { $gte: sevenDaysAgo } }),
  ]);

  const unverifiedPartners = totalPartners - verifiedPartners;

  // Verified share of all partners; unverified takes the remainder so they total 100%.
  const percentageOfverifiedPartners =
    totalPartners === 0
      ? 0
      : Math.round((verifiedPartners / totalPartners) * 100);
  const percentageOfunVerifiedPartners =
    totalPartners === 0 ? 0 : 100 - percentageOfverifiedPartners;

  return {
    verifiedPartners,
    percentageOfverifiedPartners,
    unverifiedPartners,
    percentageOfunVerifiedPartners,
    // recentlyUpdated,
  };
};

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

// Friendly label for a single changed partner field (booleans handled separately).
const PARTNER_FIELD_LABELS: Record<string, string> = {
  phoneNumber: 'Phone number updated',
  websiteUrl: 'Website updated',
  description: 'Description updated',
  category: 'Category changed',
  companyName: 'Company name updated',
};

type RecentPartnerRow = {
  companyName: string;
  isVerified: boolean;
  isActive: boolean;
  lastChange?: { changeType?: 'created' | 'updated'; fields?: string[] };
  createdAt: Date;
  updatedAt: Date;
};

// Short, user-friendly summary of a partner's most recent change.
const buildPartnerUpdateMessage = (partner: RecentPartnerRow) => {
  const change = partner.lastChange;

  // Legacy rows (updated before change-tracking existed): infer from timestamps.
  if (!change || !change.changeType) {
    const isNew =
      Math.abs(
        new Date(partner.updatedAt).getTime() -
          new Date(partner.createdAt).getTime(),
      ) < 2000;
    return isNew ? 'Newly added partner' : 'Profile updated';
  }

  if (change.changeType === 'created') {
    return 'Newly added partner';
  }

  const fields = change.fields ?? [];
  if (fields.length === 0) return 'Profile updated';
  if (fields.length > 1) return 'Profile details updated';

  // A single field changed — the current value equals what this update set.
  const field = fields[0];
  if (field === 'isVerified') {
    return partner.isVerified ? 'Marked as verified' : 'Verification removed';
  }
  if (field === 'isActive') {
    return partner.isActive ? 'Partner activated' : 'Partner deactivated';
  }
  return PARTNER_FIELD_LABELS[field] ?? 'Profile updated';
};

const recentPartnersUpdates = async () => {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const partners = await PartnerModel.find({
    updatedAt: { $gte: sevenDaysAgo },
  })
    .select('companyName isVerified isActive lastChange createdAt updatedAt')
    .sort({ updatedAt: -1 })
    .lean<RecentPartnerRow[]>();

  return partners.map(partner => {
    const updated = new Date(partner.updatedAt);
    return {
      companyName: partner.companyName,
      Updated: buildPartnerUpdateMessage(partner),
      updatedAt: `${updated.getDate()}-${MONTH_FULL[updated.getMonth()]}`,
    };
  });
};

const adminActionSummary = async () => {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  // Quotes needing follow-up: every non-draft quote that isn't closed.
  const followUpRowsPerModel = await Promise.all(
    quoteModels.map(model =>
      model
        .find({
          status: { $nin: [Service_STATUSES.DRAFT, Service_STATUSES.CLOSED] },
        })
        .select('status')
        .lean(),
    ),
  );
  const QuotesNeedsFollowUp = followUpRowsPerModel.flat().length;

  const [partnersAwaitingVerification, faqCreated, faqEdited] =
    await Promise.all([
      PartnerModel.countDocuments({ isVerified: false }),
      FAQModel.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      FAQModel.countDocuments({
        updatedAt: { $gte: sevenDaysAgo },
        $expr: { $ne: ['$updatedAt', '$createdAt'] },
      }),
    ]);

  // Each FAQ counts once for a recent creation and once for a recent edit.
  const FAQItemsUpdates = faqCreated + faqEdited;

  return {
    QuotesNeedsFollowUp,
    partnersAwaitingVerification,
    FAQItemsUpdates,
  };
};

export const AdminService = {
  getAllQuotes,
  getSingleQuote,
  updateQuoteStatus,
  getQouteForUpdate,
  getQoutesCount,
  createCategory,
  getAllCategories,
  getSingleCategory,
  updateCategory,
  deleteCategory,
  createPartner,
  getAllPartner,
  getSinglePartner,
  updatePartner,
  deletePartner,
  changePassword,
  getAdminProfile,
  createAdminUserBySuperAdmin,
  getAllAdmins,
  getSingleAdmin,
  updateAdminUserStatus,
  deleteAdminUserBySuperAdmin,
  getDashboardStats,
  getQouteStatsOverview,
  quoteSubmissionTrend,
  serviceTypeDistribution,
  partnerVerificationStats,
  recentPartnersUpdates,
  adminActionSummary,
};
