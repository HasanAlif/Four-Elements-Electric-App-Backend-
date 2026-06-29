import { Document, model, Schema, Types } from 'mongoose';

export interface IFavorite extends Document {
  user: Types.ObjectId;
  partner: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const FavoriteSchema = new Schema<IFavorite>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    partner: {
      type: Schema.Types.ObjectId,
      ref: 'Partner',
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

FavoriteSchema.index({ user: 1, partner: 1 }, { unique: true });

export const FavoriteModel = model<IFavorite>('Favorite', FavoriteSchema);

export default FavoriteModel;
