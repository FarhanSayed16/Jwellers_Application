import { Schema, model, models, type Model } from 'mongoose';
import { softDeleteField } from './_shared';

const enquirySchema = new Schema(
  {
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
    itemId: { type: Schema.Types.ObjectId, ref: 'Item' },
    message: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['new', 'in_progress', 'closed', 'converted'],
      default: 'new',
    },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'AdminUser' },
    channel: { type: String, enum: ['app', 'whatsapp_deeplink'], default: 'app' },
    /** CRM-lite follow-up reminder (FEATURE_CRM_LIGHT) */
    followUpAt: { type: Date },
    followUpNote: { type: String },
    ...softDeleteField,
  },
  { timestamps: true },
);

enquirySchema.index({ status: 1, createdAt: -1 });
enquirySchema.index({ customerId: 1, createdAt: -1 });
enquirySchema.index({ itemId: 1 });
enquirySchema.index({ followUpAt: 1, status: 1 });

export type EnquiryDoc = any;

export const EnquiryModel: Model<EnquiryDoc> =
  (models.Enquiry as Model<EnquiryDoc>) || model('Enquiry', enquirySchema);
