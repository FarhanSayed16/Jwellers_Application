import { Schema, model, models, type Model } from 'mongoose';

const waBroadcastSchema = new Schema(
  {
    kind: { type: String, enum: ['rates', 'offer'], required: true },
    status: {
      type: String,
      enum: ['queued', 'dry_run', 'sent', 'failed'],
      default: 'queued',
    },
    templateName: { type: String, default: '' },
    offerId: { type: Schema.Types.ObjectId, ref: 'Offer' },
    recipientCount: { type: Number, default: 0 },
    dryRun: { type: Boolean, default: true },
    provider: { type: String, default: 'stub' },
    payloadPreview: { type: String, default: '' },
    error: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'AdminUser' },
  },
  { timestamps: true },
);

waBroadcastSchema.index({ createdAt: -1 });
waBroadcastSchema.index({ kind: 1, createdAt: -1 });

export type WaBroadcastDoc = any;

export const WaBroadcastModel: Model<WaBroadcastDoc> =
  (models.WaBroadcast as Model<WaBroadcastDoc>) ||
  model('WaBroadcast', waBroadcastSchema);
