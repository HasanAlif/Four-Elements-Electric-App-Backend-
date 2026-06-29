import { Schema, model, Document, Types } from 'mongoose';
export interface ISavedGuide extends Document {
  user: Types.ObjectId;
  guide: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const SavedGuideSchema = new Schema<ISavedGuide>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    guide: {
      type: Schema.Types.ObjectId,
      ref: 'Guide',
      required: true,
    },
  },
  { timestamps: true, versionKey: false },
);

SavedGuideSchema.index({ user: 1, guide: 1 }, { unique: true });

const SavedGuideModel = model<ISavedGuide>('SavedGuide', SavedGuideSchema);

export default SavedGuideModel;
