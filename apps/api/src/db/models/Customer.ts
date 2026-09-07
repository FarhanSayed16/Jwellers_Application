import { Schema, model, models, type Model } from 'mongoose';
import { softDeleteField } from './_shared';

const customerSchema = new Schema(
  {
    phone: { type: String, required: true, unique: true, trim: true },
    name: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    lastLoginAt: { type: Date },
    ...softDeleteField,
  },
  { timestamps: true },
);

customerSchema.index({ createdAt: -1 });

export type CustomerDoc = any;

export const CustomerModel: Model<CustomerDoc> =
  (models.Customer as Model<CustomerDoc>) || model('Customer', customerSchema);
