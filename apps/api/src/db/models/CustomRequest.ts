import { Schema, model, models, type Model } from 'mongoose';
import { softDeleteField } from './_shared';

const customRequestSchema = new Schema(
  {
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
    description: { type: String, required: true, trim: true },
    referenceImageUrls: [{ type: String }],
    budgetHint: { type: String },
    status: {
      type: String,
      enum: ['new', 'in_progress', 'quoted', 'closed'],
      default: 'new',
    },
    ...softDeleteField,
  },
  { timestamps: true },
);

customRequestSchema.index({ status: 1, createdAt: -1 });
customRequestSchema.index({ customerId: 1 });

export type CustomRequestDoc = any;

export const CustomRequestModel: Model<CustomRequestDoc> =
  (models.CustomRequest as Model<CustomRequestDoc>) ||
  model('CustomRequest', customRequestSchema);
