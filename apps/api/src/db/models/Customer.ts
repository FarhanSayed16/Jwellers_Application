import { Schema, model, models, type Model } from 'mongoose';
import { softDeleteField } from './_shared';

const customerSchema = new Schema(
  {
    phone: { type: String, required: true, unique: true, trim: true },
    name: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    lastLoginAt: { type: Date },
    /** CRM-lite tags (FEATURE_CRM_LIGHT) */
    tags: { type: [String], default: [] },
    /** Referral code for this customer (FEATURE_REFERRALS) */
    referralCode: { type: String, trim: true, sparse: true, unique: true },
    referredBy: { type: Schema.Types.ObjectId, ref: 'Customer' },
    /** WhatsApp marketing / broadcast opt-in (FEATURE_WHATSAPP_BUSINESS_API) */
    whatsappMarketingOptIn: { type: Boolean, default: false },
    whatsappMarketingOptInAt: { type: Date },
    ...softDeleteField,
  },
  { timestamps: true },
);

customerSchema.index({ createdAt: -1 });
customerSchema.index({ tags: 1 });
customerSchema.index({ whatsappMarketingOptIn: 1 });

export type CustomerDoc = any;

export const CustomerModel: Model<CustomerDoc> =
  (models.Customer as Model<CustomerDoc>) || model('Customer', customerSchema);
