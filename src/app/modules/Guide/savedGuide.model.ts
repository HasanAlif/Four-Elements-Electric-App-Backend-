import { Schema, model, Document, Types } from 'mongoose';

// Join collection between a user and a guide they've saved/bookmarked. Kept separate
// from the User document so the list scales, carries a `savedAt` (createdAt), and can be
// paginated. The unique compound index makes "save" idempotent at the DB level.
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

// One save per (user, guide) — also serves the "my saved guides" lookup by user.
SavedGuideSchema.index({ user: 1, guide: 1 }, { unique: true });

const SavedGuideModel = model<ISavedGuide>('SavedGuide', SavedGuideSchema);

export default SavedGuideModel;
