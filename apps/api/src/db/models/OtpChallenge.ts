import { Schema, model, models, type Model } from 'mongoose';

const otpChallengeSchema = new Schema(
  {
    phone: { type: String, required: true, trim: true },
    otpHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    attempts: { type: Number, default: 0 },
    consumedAt: { type: Date },
    requestIp: { type: String },
  },
  { timestamps: true },
);

otpChallengeSchema.index({ phone: 1, createdAt: -1 });
otpChallengeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Loose typing — Mongoose 9 InferSchemaType ObjectId conflicts with bson types
export type OtpChallengeDoc = any;

export const OtpChallengeModel: Model<OtpChallengeDoc> =
  (models.OtpChallenge as Model<OtpChallengeDoc>) ||
  model('OtpChallenge', otpChallengeSchema);
