import { Schema, model, models, type Model } from 'mongoose';

const passwordResetSchema = new Schema(
  {
    adminUserId: { type: Schema.Types.ObjectId, ref: 'AdminUser', required: true },
    tokenHash: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
    usedAt: { type: Date },
    requestIp: { type: String },
  },
  { timestamps: true },
);

passwordResetSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
passwordResetSchema.index({ adminUserId: 1, createdAt: -1 });

export type PasswordResetDoc = any;

export const PasswordResetModel: Model<PasswordResetDoc> =
  (models.PasswordReset as Model<PasswordResetDoc>) ||
  model('PasswordReset', passwordResetSchema);
