import httpStatus from 'http-status';
import { isValidObjectId, Types } from 'mongoose';
import { AppError } from '../../utils';
import QueryBuilder from '../../builder/QueryBuilder';
import GuideModel, { IGuide } from './Guide.model';
import SavedGuideModel, { ISavedGuide } from './savedGuide.model';
import { TCreateGuidePayload, TGuideQuery } from './Guide.interface';
import { RecentActivityService } from '../RecentActivity/RecentActivity.service';

type TSavedGuideLean = {
  _id: Types.ObjectId;
  guide: IGuide | null;
  createdAt: Date;
};

const assertObjectId = (id: string) => {
  if (!isValidObjectId(id)) {
    throw new AppError(httpStatus.NOT_FOUND, 'Guide not found!');
  }
};

const createGuideIntoDB = async (payload: TCreateGuidePayload) => {
  return GuideModel.create(payload);
};

const getAllGuidesFromDB = async (userId: string, query: TGuideQuery = {}) => {
  const guideQuery = new QueryBuilder<IGuide>(
    GuideModel.find(),
    query as Record<string, unknown>,
  )
    .search(['name'])
    .sort()
    .paginate()
    .fields();

  const [guides, meta] = await Promise.all([
    guideQuery.modelQuery.lean(),
    guideQuery.countTotal(),
  ]);

  const ids = guides.map(g => g._id);
  const saved = await SavedGuideModel.find({
    user: userId,
    guide: { $in: ids },
  })
    .select('guide')
    .lean();
  const savedSet = new Set(saved.map(s => String(s.guide)));

  const data = guides.map(g => ({
    ...g,
    isSaved: savedSet.has(String(g._id)),
  }));

  return { data, meta };
};

const getSingleGuideFromDB = async (userId: string, id: string) => {
  assertObjectId(id);

  const guide = await GuideModel.findById(id).lean();
  if (!guide) {
    throw new AppError(httpStatus.NOT_FOUND, 'Guide not found!');
  }

  const isSaved = !!(await SavedGuideModel.exists({ user: userId, guide: id }));

  return { ...guide, isSaved };
};

const saveGuideIntoDB = async (userId: string, guideId: string) => {
  assertObjectId(guideId);

  const guide = await GuideModel.findById(guideId).select('_id name');
  if (!guide) {
    throw new AppError(httpStatus.NOT_FOUND, 'Guide not found!');
  }

  await SavedGuideModel.updateOne(
    { user: userId, guide: guideId },
    { $setOnInsert: { user: userId, guide: guideId } },
    { upsert: true },
  );

  await RecentActivityService.recordGuideActivity({
    user: userId,
    refId: guideId,
    title: guide.name,
    activityAt: new Date(),
  });

  return { guideId, isSaved: true };
};

const unsaveGuideFromDB = async (userId: string, guideId: string) => {
  assertObjectId(guideId);

  await SavedGuideModel.deleteOne({ user: userId, guide: guideId });

  await RecentActivityService.removeGuideActivity({
    user: userId,
    refId: guideId,
  });

  return { guideId, isSaved: false };
};

const getMySavedGuidesFromDB = async (
  userId: string,
  query: TGuideQuery = {},
) => {
  const savedQuery = new QueryBuilder<ISavedGuide>(
    SavedGuideModel.find({ user: userId }).populate('guide'),
    query as Record<string, unknown>,
  )
    .sort()
    .paginate();

  const [saved, meta] = await Promise.all([
    savedQuery.modelQuery.lean<TSavedGuideLean[]>(),
    savedQuery.countTotal(),
  ]);

  const data = saved
    .filter((s): s is TSavedGuideLean & { guide: IGuide } => s.guide !== null)
    .map(s => ({
      ...s.guide,
      isSaved: true,
      savedAt: s.createdAt,
    }));

  return { data, meta };
};

export const GuideService = {
  createGuideIntoDB,
  getAllGuidesFromDB,
  getSingleGuideFromDB,
  saveGuideIntoDB,
  unsaveGuideFromDB,
  getMySavedGuidesFromDB,
};
