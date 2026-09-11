import { Schema, model, models, type Model } from 'mongoose';
import { softDeleteField } from './_shared';

const offerSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String },
    bannerImageUrl: { type: String },
    validFrom: { type: Date },
    validTill: { type: Date },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
    ...softDeleteField,
  },
  { timestamps: true },
);

offerSchema.index({ isActive: 1, validFrom: 1, validTill: 1 });

export type OfferDoc = any;

export const OfferModel: Model<OfferDoc> =
  (models.Offer as Model<OfferDoc>) || model('Offer', offerSchema);
