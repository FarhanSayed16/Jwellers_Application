import { Schema, model, models, type InferSchemaType, type Model } from 'mongoose';

/** Optional media registry — Cloudinary URLs also live on items/offers. */
const mediaAssetSchema = new Schema(
  {
    publicId: { type: String, required: true },
    url: { type: String, required: true },
    folder: { type: String },
    resourceType: { type: String, default: 'image' },
    uploadedByType: { type: String, enum: ['admin', 'customer', 'system'] },
    uploadedById: { type: Schema.Types.ObjectId },
  },
  { timestamps: true },
);

mediaAssetSchema.index({ publicId: 1 }, { unique: true });

export type MediaAsset = InferSchemaType<typeof mediaAssetSchema> & {
  _id: Schema.Types.ObjectId;
};

export const MediaAssetModel: Model<MediaAsset> =
  (models.MediaAsset as Model<MediaAsset>) || model<MediaAsset>('MediaAsset', mediaAssetSchema);
