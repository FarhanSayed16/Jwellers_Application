import bcrypt from 'bcryptjs';
import { env } from '../../config/env';
import { getMongoConnectionState } from '../../db/connection';
import { AdminUserModel } from '../../db/models/AdminUser';
import { PasswordResetModel } from '../../db/models/PasswordReset';
import { SessionModel } from '../../db/models/Session';
import { writeAuditLog } from '../../utils/audit';
import { randomToken, sha256 } from '../../utils/cryptoHash';
import {
  badRequest,
  forbidden,
  notFound,
  tooManyRequests,
  unauthorized,
} from '../../utils/errors';
import {
  signAdminAccessToken,
  signAdminRefreshToken,
  ttlToDate,
  verifyAdminRefreshToken,
} from '../../utils/jwt';
import { validatePasswordStrength } from '../../utils/password';

const MAX_FAILED = 10;
const LOCK_MS = 15 * 60 * 1000;

type AdminIdentity = {
  _id: { toString(): string };
  role: 'owner' | 'staff';
  name: string;
  email?: string | null;
  phone?: string | null;
};

function assertDb() {
  if (getMongoConnectionState().readyState !== 1) {
    throw notFound('DATABASE_UNAVAILABLE', 'Database is not connected');
  }
}

function publicAdmin(user: AdminIdentity) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email ?? null,
    phone: user.phone ?? null,
    role: user.role,
  };
}

async function issueTokenPair(user: AdminIdentity, deviceInfo?: string) {
  const session = await SessionModel.create({
    userType: 'admin',
    userId: user._id,
    refreshTokenHash: sha256(`pending:${randomToken()}`),
    deviceInfo,
    expiresAt: ttlToDate(env.JWT_REFRESH_TTL),
  });

  const sid = String(session._id);
  const sub = user._id.toString();
  const accessToken = signAdminAccessToken({
    sub,
    role: user.role,
    sid,
  });
  const refreshToken = signAdminRefreshToken({
    sub,
    role: user.role,
    sid,
  });

  session.refreshTokenHash = sha256(refreshToken);
  await session.save();

  return {
    accessToken,
    refreshToken,
    admin: publicAdmin(user),
  };
}

export async function adminLogin(input: {
  emailOrPhone: string;
  password: string;
  ip?: string;
  deviceInfo?: string;
}) {
  assertDb();
  const identity = input.emailOrPhone.trim().toLowerCase();
  const user = await AdminUserModel.findOne({
    deletedAt: null,
    $or: [{ email: identity }, { phone: input.emailOrPhone.trim() }],
  }).exec();

  if (!user || !user.isActive) {
    await writeAuditLog({
      actorType: 'system',
      action: 'admin.login.failure',
      after: { reason: 'not_found', identity },
      ip: input.ip,
    });
    throw unauthorized('INVALID_CREDENTIALS', 'Invalid email/phone or password');
  }

  if (user.lockUntil && user.lockUntil.getTime() > Date.now()) {
    await writeAuditLog({
      actorType: 'admin',
      actorId: String(user._id),
      action: 'admin.login.locked',
      ip: input.ip,
    });
    throw tooManyRequests('ACCOUNT_LOCKED', 'Account temporarily locked. Try again later.');
  }

  const ok = await bcrypt.compare(input.password, user.passwordHash);
  if (!ok) {
    user.failedLoginCount = (user.failedLoginCount ?? 0) + 1;
    if (user.failedLoginCount >= MAX_FAILED) {
      user.lockUntil = new Date(Date.now() + LOCK_MS);
      user.failedLoginCount = 0;
    }
    await user.save();
    await writeAuditLog({
      actorType: 'admin',
      actorId: String(user._id),
      action: 'admin.login.failure',
      after: { failedLoginCount: user.failedLoginCount, lockUntil: user.lockUntil },
      ip: input.ip,
    });
    throw unauthorized('INVALID_CREDENTIALS', 'Invalid email/phone or password');
  }

  user.failedLoginCount = 0;
  user.lockUntil = undefined;
  user.lastLoginAt = new Date();
  await user.save();

  const tokens = await issueTokenPair(user, input.deviceInfo);
  await writeAuditLog({
    actorType: 'admin',
    actorId: String(user._id),
    action: 'admin.login.success',
    ip: input.ip,
  });
  return tokens;
}

export async function adminRefresh(refreshToken: string) {
  assertDb();
  const claims = verifyAdminRefreshToken(refreshToken);
  const session = await SessionModel.findById(claims.sid).exec();
  if (!session || session.userType !== 'admin' || session.revokedAt) {
    throw unauthorized('SESSION_REVOKED', 'Session is invalid or revoked');
  }
  if (session.refreshTokenHash !== sha256(refreshToken)) {
    session.revokedAt = new Date();
    await session.save();
    throw unauthorized('TOKEN_REUSE', 'Refresh token reuse detected');
  }

  const user = await AdminUserModel.findById(claims.sub).exec();
  if (!user || !user.isActive || user.deletedAt) {
    throw unauthorized('USER_INACTIVE', 'Admin user not found or inactive');
  }

  session.revokedAt = new Date();
  await session.save();
  return issueTokenPair(user, session.deviceInfo ?? undefined);
}

export async function adminLogout(sessionId: string, adminId: string, ip?: string) {
  assertDb();
  await SessionModel.findByIdAndUpdate(sessionId, { $set: { revokedAt: new Date() } }).exec();
  await writeAuditLog({
    actorType: 'admin',
    actorId: adminId,
    action: 'admin.logout',
    ip,
  });
}

export async function requestPasswordReset(emailOrPhone: string, ip?: string) {
  assertDb();
  const identity = emailOrPhone.trim().toLowerCase();
  const user = await AdminUserModel.findOne({
    deletedAt: null,
    isActive: true,
    $or: [{ email: identity }, { phone: emailOrPhone.trim() }],
  }).exec();

  const generic = {
    message: 'If an account exists, a reset token has been issued.',
  };

  if (!user || user.role !== 'owner') {
    await writeAuditLog({
      actorType: 'system',
      action: 'admin.password_reset.request',
      after: { found: false, identity },
      ip,
    });
    return { ...generic, resetToken: null as string | null };
  }

  const rawToken = randomToken(24);
  await PasswordResetModel.create({
    adminUserId: user._id,
    tokenHash: sha256(rawToken),
    expiresAt: new Date(Date.now() + 30 * 60 * 1000),
    requestIp: ip,
  });

  await writeAuditLog({
    actorType: 'admin',
    actorId: String(user._id),
    action: 'admin.password_reset.request',
    ip,
  });

  return {
    ...generic,
    resetToken: env.NODE_ENV === 'production' ? null : rawToken,
  };
}

export async function resetPassword(token: string, newPassword: string, ip?: string) {
  assertDb();
  const strengthError = validatePasswordStrength(newPassword);
  if (strengthError) {
    throw badRequest('WEAK_PASSWORD', strengthError);
  }

  const record = await PasswordResetModel.findOne({
    tokenHash: sha256(token),
    usedAt: null,
    expiresAt: { $gt: new Date() },
  }).exec();
  if (!record) {
    throw badRequest('INVALID_RESET_TOKEN', 'Reset token is invalid or expired');
  }

  const user = await AdminUserModel.findById(record.adminUserId).exec();
  if (!user || !user.isActive || user.role !== 'owner') {
    throw forbidden('RESET_FORBIDDEN', 'Password reset not allowed for this account');
  }

  user.passwordHash = await bcrypt.hash(newPassword, 12);
  user.failedLoginCount = 0;
  user.lockUntil = undefined;
  await user.save();

  record.usedAt = new Date();
  await record.save();

  await SessionModel.updateMany(
    { userType: 'admin', userId: user._id, revokedAt: null },
    { $set: { revokedAt: new Date() } },
  ).exec();

  await writeAuditLog({
    actorType: 'admin',
    actorId: String(user._id),
    action: 'admin.password_reset.success',
    ip,
  });

  return { ok: true };
}

export async function changePassword(input: {
  adminId: string;
  currentPassword: string;
  newPassword: string;
  ip?: string;
}) {
  assertDb();
  const strengthError = validatePasswordStrength(input.newPassword);
  if (strengthError) {
    throw badRequest('WEAK_PASSWORD', strengthError);
  }

  const user = await AdminUserModel.findById(input.adminId).exec();
  if (!user || !user.isActive || user.deletedAt) {
    throw unauthorized('USER_INACTIVE', 'Admin user not found or inactive');
  }

  const ok = await bcrypt.compare(input.currentPassword, user.passwordHash);
  if (!ok) {
    throw unauthorized('INVALID_CREDENTIALS', 'Current password is incorrect');
  }

  user.passwordHash = await bcrypt.hash(input.newPassword, 12);
  user.failedLoginCount = 0;
  user.lockUntil = undefined;
  await user.save();

  await SessionModel.updateMany(
    { userType: 'admin', userId: user._id, revokedAt: null },
    { $set: { revokedAt: new Date() } },
  ).exec();

  await writeAuditLog({
    actorType: 'admin',
    actorId: String(user._id),
    action: 'admin.password_change',
    ip: input.ip,
  });

  return { ok: true, sessionsRevoked: true };
}
