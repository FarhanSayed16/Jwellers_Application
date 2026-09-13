import { Schema, model, models, type InferSchemaType, type Model } from 'mongoose';
import { themeTokensSchema } from './_shared';

const shopConfigSchema = new Schema(
  {
    shopName: { type: String, required: true, trim: true },
    logoUrl: { type: String, default: '' },
    faviconUrl: { type: String },
    contactPhone: { type: String, required: true, trim: true },
    contactEmail: { type: String, trim: true },
    address: {
      line1: { type: String, default: '' },
      line2: { type: String },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      pincode: { type: String, default: '' },
      country: { type: String, default: 'India' },
    },
    gstNumber: { type: String },
    bisRegistrationNumber: { type: String },
    socialLinks: {
      instagram: String,
      facebook: String,
      youtube: String,
      website: String,
      whatsapp: String,
    },
    themeLight: { type: themeTokensSchema, required: true },
    themeDark: { type: themeTokensSchema, required: true },
    makingChargeDefault: {
      type: { type: String, enum: ['percent', 'flat'], default: 'percent' },
      value: { type: Number, default: 10 },
    },
    gstPercentDefault: { type: Number, default: 3 },
    /** Deduction applied to old-gold exchange estimates (FEATURE_OLD_GOLD_EXCHANGE). */
    exchangeDeductionPercent: { type: Number, default: 8 },
    /** Retailer margin on metals API spot → published shop rate (FEATURE_RATE_API). */
    rateApi: {
      marginPercentGold: { type: Number, default: 2 },
      marginPercentSilver: { type: Number, default: 3 },
      lastFetchAt: { type: Date },
      lastFetchError: { type: String },
      lastProvider: { type: String },
    },
    currency: { type: String, default: 'INR' },
    timezone: { type: String, default: 'Asia/Kolkata' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

shopConfigSchema.index({ isActive: 1 });

export type ShopConfig = InferSchemaType<typeof shopConfigSchema> & { _id: Schema.Types.ObjectId };

export const ShopConfigModel: Model<ShopConfig> =
  (models.ShopConfig as Model<ShopConfig>) || model<ShopConfig>('ShopConfig', shopConfigSchema);
