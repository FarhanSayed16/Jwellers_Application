import bcrypt from 'bcryptjs';
import { Types } from 'mongoose';
import { getMongoConnectionState } from '../../db/connection';
import { AdminUserModel } from '../../db/models/AdminUser';
import { writeAuditLog } from '../../utils/audit';
import { badRequest, conflict, notFound } from '../../utils/errors';
import { isDuplicateKeyError } from '../../utils/slug';
import { validatePasswordStrength } from '../../utils/password';

function assertDb() {
  if (getMongoConnectionState().readyState !== 1) {
    throw notFound('DATABASE_UNAVAILABLE', 'Database is not connected');
  }
}

function toAdminDto(doc: any) {
  return {
    id: String(doc._id),
    name: doc.name,
    email: doc.email ?? null,
    phone: doc.phone ?? null,
    role: doc.role as 'owner' | 'staff',
    isActive: Boolean(doc.isActive),
    lastLoginAt: doc.lastLoginAt ? new Date(doc.lastLoginAt).toISOString() : null,
    createdAt: new Date(doc.createdAt).toISOString(),
  };
}

export async function listStaff() {
  assertDb();
  const docs = await AdminUserModel.find({ deletedAt: null })
    .sort({ role: 1, createdAt: 1 })
    .exec();
  return { admins: docs.map(toAdminDto) };
}

export async function createStaff(input: {
  name: string;
  email?: string | null;
  phone?: string | null;
  password: string;
  actorId: string;
  ip?: string;
}) {
  assertDb();
  const name = input.name.trim();
  if (!name) throw badRequest('VALIDATION_ERROR', 'name is required');
  if (!input.email && !input.phone) {
    throw badRequest('VALIDATION_ERROR', 'email or phone is required');
  }
  const strength = validatePasswordStrength(input.password);
  if (strength) throw badRequest('WEAK_PASSWORD', strength);

  try {
    const doc = await AdminUserModel.create({
      name,
      email: input.email?.trim().toLowerCase() || undefined,
      phone: input.phone?.trim() || undefined,
      passwordHash: await bcrypt.hash(input.password, 12),
      role: 'staff',
      isActive: true,
    });
    await writeAuditLog({
      actorType: 'admin',
      actorId: input.actorId,
      action: 'staff.create',
      entityType: 'AdminUser',
      entityId: String(doc._id),
      ip: input.ip,
    });
    return toAdminDto(doc);
  } catch (err) {
    if (isDuplicateKeyError(err)) {
      throw conflict('STAFF_EXISTS', 'An admin with this email or phone already exists');
    }
    throw err;
  }
}

export async function updateStaff(
  id: string,
  input: { isActive?: boolean; name?: string },
  actorId: string,
  ip?: string,
) {
  assertDb();
  if (!Types.ObjectId.isValid(id)) throw notFound('STAFF_NOT_FOUND', 'Admin user not found');
  const doc = await AdminUserModel.findOne({ _id: id, deletedAt: null }).exec();
  if (!doc) throw notFound('STAFF_NOT_FOUND', 'Admin user not found');
  if (doc.role === 'owner') {
    throw badRequest('OWNER_IMMUTABLE', 'Cannot deactivate or rename owner via staff API');
  }

  if (input.name !== undefined) doc.name = input.name.trim();
  if (input.isActive !== undefined) doc.isActive = input.isActive;
  await doc.save();

  await writeAuditLog({
    actorType: 'admin',
    actorId,
    action: input.isActive === false ? 'staff.deactivate' : 'staff.update',
    entityType: 'AdminUser',
    entityId: id,
    after: { isActive: doc.isActive, name: doc.name },
    ip,
  });

  return toAdminDto(doc);
}
