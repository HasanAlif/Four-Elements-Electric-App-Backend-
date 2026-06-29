import { Types } from 'mongoose';
import RecentActivityModel from './RecentActivity.model';
import { resolveQuoteActivityAt } from './RecentActivity.constant';

type TId = Types.ObjectId | string;

type TRecordQuoteInput = {
  user: TId;
  refId: TId;
  refModel: string;
  title?: string;
  status?: string;
  createdAt: Date;
  statusChangedAt?: Date;
};

const recordQuoteActivity = async (input: TRecordQuoteInput): Promise<void> => {
  try {
    const activityAt = resolveQuoteActivityAt(
      input.status,
      input.createdAt,
      input.statusChangedAt,
    );

    await RecentActivityModel.updateOne(
      { user: input.user, type: 'quote', refId: input.refId },
      {
        $set: {
          refModel: input.refModel,
          title: input.title ?? '',
          status: input.status ?? null,
          activityAt,
        },
      },
      { upsert: true },
    );
  } catch (err) {
    console.error('[recent-activity] recordQuoteActivity failed:', err);
  }
};

type TRecordGuideInput = {
  user: TId;
  refId: TId;
  title?: string;
  activityAt: Date;
};

const recordGuideActivity = async (input: TRecordGuideInput): Promise<void> => {
  try {
    await RecentActivityModel.updateOne(
      { user: input.user, type: 'guide', refId: input.refId },
      {
        $set: {
          refModel: 'Guide',
          title: input.title ?? '',
          status: null,
          activityAt: input.activityAt,
        },
      },
      { upsert: true },
    );
  } catch (err) {
    console.error('[recent-activity] recordGuideActivity failed:', err);
  }
};

const removeGuideActivity = async (input: {
  user: TId;
  refId: TId;
}): Promise<void> => {
  try {
    await RecentActivityModel.deleteOne({
      user: input.user,
      type: 'guide',
      refId: input.refId,
    });
  } catch (err) {
    console.error('[recent-activity] removeGuideActivity failed:', err);
  }
};

export const RecentActivityService = {
  recordQuoteActivity,
  recordGuideActivity,
  removeGuideActivity,
};
