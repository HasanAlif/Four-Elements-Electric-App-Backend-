import httpStatus from 'http-status';
import { Service_STATUSES } from '../../constants';
import { AppError } from '../../utils';
import AccessoryBuildingPowerModel from '../AccessoryBuildingPower/AccessoryBuildingPower.model';
import CellingFansModel from '../CellingFans/CellingFans.model';
import DedicatedCircuitModel from '../DedicatedCircuit/DedicatedCircuit.model';
import DockPowerModel from '../DockPower/DockPower.model';
import ElectricModel from '../Electric/Electric.model';
import EVChargerInstallationModel from '../EVChargerInstallation/EVChargerInstallation.model';
import ExhaustFansModel from '../ExhaustFans/ExhaustFans.model';
import GenaratorModel from '../Genarator/Genarator.model';
import HomeSurgeProtectionModel from '../HomeSurgeProtection/HomeSurgeProtection.model';
import HotTubModel from '../HotTub/HotTub.model';
import LightingModel from '../Lighting/Lighting.model';
import NewConstructionModel from '../NewConstruction/NewConstruction.model';
import OutletsModel from '../Outlets/Outlets.model';
import PanelUpgradeReplacementModel from '../PanelUpgradeReplacement/PanelUpgradeReplacement.model';
import RemodelingModel from '../Remodeling/Remodeling.model';
import ServiceCallModel from '../ServiceCall/ServiceCall.model';
import StarlinkModel from '../Starlink/Starlink.model';
import SwitchesModel from '../Switches/Switches.model';

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

// Every submitted-quote collection across all service modules (mirrors Draft.service.ts).
const quoteModels: QuoteModel[] = [
  AccessoryBuildingPowerModel,
  CellingFansModel,
  DedicatedCircuitModel,
  DockPowerModel,
  ElectricModel,
  EVChargerInstallationModel,
  ExhaustFansModel,
  GenaratorModel,
  HomeSurgeProtectionModel,
  HotTubModel,
  LightingModel,
  NewConstructionModel,
  OutletsModel,
  PanelUpgradeReplacementModel,
  RemodelingModel,
  ServiceCallModel,
  StarlinkModel,
  SwitchesModel,
].map(model => model as unknown as QuoteModel);

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
  page?: number;
  limit?: number;
};

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

  const page = Number(filters.page) || 1;
  const limit = Number(filters.limit) || 10;

  // Base set: all non-draft quotes (optionally narrowed by serviceType). Drafts
  // are internal-only and never exposed through this endpoint.
  const baseQuery: Record<string, unknown> = {
    status: { $ne: Service_STATUSES.DRAFT },
  };

  if (serviceType) {
    baseQuery.serviceType = serviceType;
  }

  const quotesPerModel = await Promise.all(
    quoteModels.map(model => model.find(baseQuery).select(QUOTE_FIELDS).lean()),
  );

  const allQuotes = quotesPerModel.flat();

  // Counts are independent of the status filter so every badge always shows.
  const statusCounts = buildStatusCounts(allQuotes);

  // The status filter only narrows the rows actually returned in `data`.
  const filtered = (
    status ? allQuotes.filter(q => q.status === status) : allQuotes
  ).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const total = filtered.length;
  const totalPage = Math.ceil(total / limit);
  const skip = (page - 1) * limit;
  const data = filtered.slice(skip, skip + limit);

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

export const AdminService = {
  getAllQuotes,
  getSingleQuote,
  updateQuoteStatus,
  getQouteForUpdate,
  getQoutesCount,
};
