import { Schema, model, models, type Model } from 'mongoose';

const rateSchema = new Schema(
  {
    effectiveAt: { type: Date, required: true },
    gold24kPerGram: { type: Number, required: true },
    gold22kPerGram: { type: Number, required: true },
    gold18kPerGram: { type: Number, required: true },
    silverPerGram: { type: Number, required: true },
    note: { type: String },
    source: { type: String, enum: ['manual', 'api'], default: 'manual' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'AdminUser' },
  },
  { timestamps: true },
);

rateSchema.index({ effectiveAt: -1 });
rateSchema.index({ createdAt: -1 });

export type RateDoc = any;

export const RateModel: Model<RateDoc> =
  (models.Rate as Model<RateDoc>) || model('Rate', rateSchema);
