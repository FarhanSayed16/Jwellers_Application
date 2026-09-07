import { Schema, model, models, type Model } from 'mongoose';
import { softDeleteField } from './_shared';

const adminUserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true, sparse: true, unique: true },
    phone: { type: String, trim: true, sparse: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['owner', 'staff'], required: true },
    permissions: [{ type: String }],
    isActive: { type: Boolean, default: true },
    lastLoginAt: { type: Date },
    failedLoginCount: { type: Number, default: 0 },
    lockUntil: { type: Date },
    ...softDeleteField,
  },
  { timestamps: true },
);

adminUserSchema.index({ role: 1, isActive: 1 });

export type AdminUserDoc = any;

export const AdminUserModel: Model<AdminUserDoc> =
  (models.AdminUser as Model<AdminUserDoc>) || model('AdminUser', adminUserSchema);
