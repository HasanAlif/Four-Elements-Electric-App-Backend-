import { Schema, model, Document, Types } from 'mongoose';

export type TRecentActivityType = 'quote' | 'guide';

export interface IRecentActivity extends Document {
  user: Types.ObjectId;
  type: TRecentActivityType;
  refId: Types.ObjectId;
  refModel: string;
  title: string;
  status: string | null;
  activityAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const RecentActivitySchema = new Schema<IRecentActivity>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['quote', 'guide'],
      required: true,
    },
    refId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    refModel: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      default: null,
    },
    activityAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true, versionKey: false },
);

RecentActivitySchema.index({ user: 1, activityAt: -1 });
RecentActivitySchema.index({ user: 1, type: 1, refId: 1 }, { unique: true });

const RecentActivityModel = model<IRecentActivity>(
  'RecentActivity',
  RecentActivitySchema,
);

export default RecentActivityModel;
