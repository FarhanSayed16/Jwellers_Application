import { Schema, model, models, type Model } from 'mongoose';

const sessionSchema = new Schema(
  {
    userType: { type: String, enum: ['customer', 'admin'], required: true },
    userId: { type: Schema.Types.ObjectId, required: true },
    refreshTokenHash: { type: String, required: true, unique: true },
    deviceInfo: { type: String },
    expiresAt: { type: Date, required: true },
    revokedAt: { type: Date },
  },
  { timestamps: true },
);

sessionSchema.index({ userType: 1, userId: 1 });
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Loose typing — Mongoose 9 InferSchemaType ObjectId conflicts with bson types
export type SessionDoc = any;

export const SessionModel: Model<SessionDoc> =
  (models.Session as Model<SessionDoc>) || model('Session', sessionSchema);
