import { Schema, model, models, type InferSchemaType, type Model } from 'mongoose';

const priceAlertSchema = new Schema(
  {
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
    purity: { type: String, enum: ['24K', '22K', '18K', 'silver'], required: true },
    belowAmount: { type: Number, required: true },
    status: { type: String, enum: ['active', 'triggered', 'cancelled'], default: 'active' },
    triggeredAt: { type: Date },
    triggeredRate: { type: Number },
  },
  { timestamps: true },
);

priceAlertSchema.index({ customerId: 1, status: 1 });
priceAlertSchema.index({ status: 1, purity: 1 });

export type PriceAlert = InferSchemaType<typeof priceAlertSchema> & {
  _id: Schema.Types.ObjectId;
};

export const PriceAlertModel: Model<PriceAlert> =
  (models.PriceAlert as Model<PriceAlert>) || model<PriceAlert>('PriceAlert', priceAlertSchema);
