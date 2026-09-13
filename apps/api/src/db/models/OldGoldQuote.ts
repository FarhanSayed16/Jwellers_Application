import { Schema, model, models, type InferSchemaType, type Model } from 'mongoose';

const oldGoldQuoteSchema = new Schema(
  {
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer' },
    metal: { type: String, enum: ['gold', 'silver'], required: true },
    purity: { type: String, enum: ['24K', '22K', '18K', 'other'], required: true },
    weightGrams: { type: Number, required: true },
    ratePerGram: { type: Number, required: true },
    deductionPercent: { type: Number, required: true },
    grossValue: { type: Number, required: true },
    estimatedValue: { type: Number, required: true },
    note: { type: String },
  },
  { timestamps: true },
);

oldGoldQuoteSchema.index({ customerId: 1, createdAt: -1 });

export type OldGoldQuote = InferSchemaType<typeof oldGoldQuoteSchema> & {
  _id: Schema.Types.ObjectId;
};

export const OldGoldQuoteModel: Model<OldGoldQuote> =
  (models.OldGoldQuote as Model<OldGoldQuote>) ||
  model<OldGoldQuote>('OldGoldQuote', oldGoldQuoteSchema);
