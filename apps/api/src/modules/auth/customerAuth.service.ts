import { randomInt } from 'node:crypto';
import { env, isProd } from '../../config/env';
import { getMongoConnectionState } from '../../db/connection';
import { CustomerModel } from '../../db/models/Customer';
import { OtpChallengeModel } from '../../db/models/OtpChallenge';
import { SessionModel } from '../../db/models/Session';
import { WishlistModel } from '../../db/models/Wishlist';
import { DeviceModel } from '../../db/models/Device';
import { sendOtpSms } from '../../services/msg91';
import { writeAuditLog } from '../../utils/audit';
import { sha256, randomToken } from '../../utils/cryptoHash';
import { badRequest, notFound, tooManyRequests, unauthorized } from '../../utils/errors';
import {
  signCustomerAccessToken,
  signCustomerRefreshToken,
  ttlToDate,
  verifyCustomerRefreshToken,
} from '../../utils/jwt';
import { maskPhone, normalizeIndiaPhone } from '../../utils/phone';

function assertDb() {
  if (getMongoConnectionState().readyState !== 1) {
    throw notFound('DATABASE_UNAVAILABLE', 'Database is not connected');
  }
}

function otpPepper(): string {
  return env.OTP_PEPPER || 'dev-otp-pepper-unsafe';
}

function hashOtp(phone: string, otp: string): string {
  return sha256(`${otpPepper()}:${phone}:${otp}`);
}

function generateOtp(): string {
  if (!isProd && env.OTP_DEV_BYPASS) {
    return env.OTP_DEV_CODE;
  }
  return String(randomInt(0, 1_000_000)).padStart(6, '0');
}

function publicCustomer(user: {
  _id: { toString(): string };
  phone: string;
  name?: string | null;
}) {
  return {
    id: user._id.toString(),
    phone: user.phone,
    name: user.name ?? null,
    role: 'customer' as const,
  };
}

async function issueTokenPair(
  user: { _id: { toString(): string }; phone: string; name?: string | null },
  deviceInfo?: string,
) {
  const session = await SessionModel.create({
    userType: 'customer',
    userId: user._id,
    refreshTokenHash: sha256(`pending:${randomToken()}`),
    deviceInfo,
    expiresAt: ttlToDate(env.JWT_REFRESH_TTL),
  });

  const sid = String(session._id);
  const sub = user._id.toString();
  const accessToken = signCustomerAccessToken({ sub, sid });
  const refreshToken = signCustomerRefreshToken({ sub, sid });

  session.refreshTokenHash = sha256(refreshToken);
  await session.save();

  return {
    accessToken,
    refreshToken,
    customer: publicCustomer(user),
  };
}

export async function requestCustomerOtp(input: {
  phone: string;
  ip?: string;
}) {
  assertDb();
  const phone = normalizeIndiaPhone(input.phone);
  if (!phone) {
    throw badRequest('INVALID_PHONE', 'Enter a valid Indian mobile number');
  }

  const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const phoneCount = await OtpChallengeModel.countDocuments({
    phone,
    createdAt: { $gte: hourAgo },
  }).exec();
  if (phoneCount >= env.OTP_MAX_PER_PHONE_PER_HOUR) {
    throw tooManyRequests('OTP_RATE_LIMITED', 'Too many OTP requests for this phone. Try later.');
  }

  if (input.ip) {
    const ipCount = await OtpChallengeModel.countDocuments({
      requestIp: input.ip,
      createdAt: { $gte: hourAgo },
    }).exec();
    if (ipCount >= env.OTP_MAX_PER_IP_PER_HOUR) {
      throw tooManyRequests('OTP_RATE_LIMITED', 'Too many OTP requests from this network. Try later.');
    }
  }

  const cooldownMs = env.OTP_COOLDOWN_SECONDS * 1000;
  const latest = await OtpChallengeModel.findOne({ phone }).sort({ createdAt: -1 }).exec();
  if (latest?.createdAt && Date.now() - new Date(latest.createdAt).getTime() < cooldownMs) {
    const retryAfterSeconds = Math.ceil(
      (cooldownMs - (Date.now() - new Date(latest.createdAt).getTime())) / 1000,
    );
    throw tooManyRequests(
      'OTP_COOLDOWN',
      'Please wait before requesting another OTP',
      { retryAfterSeconds },
    );
  }

  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + env.OTP_TTL_SECONDS * 1000);

  await OtpChallengeModel.create({
    phone,
    otpHash: hashOtp(phone, otp),
    expiresAt,
    attempts: 0,
    requestIp: input.ip,
  });

  const smsStatus = await sendOtpSms(phone, otp);

  await writeAuditLog({
    actorType: 'system',
    action: 'customer.otp.request',
    after: { phone: maskPhone(phone), smsStatus },
    ip: input.ip,
  });

  const exposeDevOtp = !isProd && (smsStatus === 'skipped' || env.OTP_DEV_BYPASS);

  return {
    ok: true,
    phone: maskPhone(phone),
    expiresInSeconds: env.OTP_TTL_SECONDS,
    cooldownSeconds: env.OTP_COOLDOWN_SECONDS,
    /** Present only in non-production when SMS was skipped or bypass enabled — never log this. */
    ...(exposeDevOtp ? { devOtp: otp } : {}),
  };
}

export async function verifyCustomerOtp(input: {
  phone: string;
  otp: string;
  ip?: string;
  deviceInfo?: string;
}) {
  assertDb();
  const phone = normalizeIndiaPhone(input.phone);
  if (!phone) {
    throw badRequest('INVALID_PHONE', 'Enter a valid Indian mobile number');
  }
  const otp = input.otp.trim();
  if (!/^\d{6}$/.test(otp)) {
    throw badRequest('INVALID_OTP', 'OTP must be 6 digits');
  }

  const challenge = await OtpChallengeModel.findOne({
    phone,
    consumedAt: null,
    expiresAt: { $gt: new Date() },
  })
    .sort({ createdAt: -1 })
    .exec();

  if (!challenge) {
    await writeAuditLog({
      actorType: 'system',
      action: 'customer.otp.verify.failure',
      after: { phone: maskPhone(phone), reason: 'no_challenge' },
      ip: input.ip,
    });
    throw unauthorized('INVALID_OTP', 'OTP is invalid or expired');
  }

  if ((challenge.attempts ?? 0) >= env.OTP_MAX_VERIFY_ATTEMPTS) {
    throw tooManyRequests('OTP_LOCKED', 'Too many incorrect attempts. Request a new OTP.');
  }

  const ok = challenge.otpHash === hashOtp(phone, otp);
  if (!ok) {
    challenge.attempts = (challenge.attempts ?? 0) + 1;
    await challenge.save();
    await writeAuditLog({
      actorType: 'system',
      action: 'customer.otp.verify.failure',
      after: { phone: maskPhone(phone), attempts: challenge.attempts },
      ip: input.ip,
    });
    throw unauthorized('INVALID_OTP', 'OTP is invalid or expired');
  }

  challenge.consumedAt = new Date();
  await challenge.save();

  let customer = await CustomerModel.findOne({ phone, deletedAt: null }).exec();
  if (!customer) {
    customer = await CustomerModel.create({
      phone,
      isActive: true,
      lastLoginAt: new Date(),
    });
  } else {
    if (!customer.isActive) {
      throw unauthorized('USER_INACTIVE', 'Customer account is inactive');
    }
    customer.lastLoginAt = new Date();
    await customer.save();
  }

  const tokens = await issueTokenPair(customer, input.deviceInfo);
  await writeAuditLog({
    actorType: 'system',
    actorId: String(customer._id),
    action: 'customer.otp.verify.success',
    after: { phone: maskPhone(phone) },
    ip: input.ip,
  });
  return tokens;
}

export async function customerRefresh(refreshToken: string) {
  assertDb();
  const claims = verifyCustomerRefreshToken(refreshToken);
  const session = await SessionModel.findById(claims.sid).exec();
  if (!session || session.userType !== 'customer' || session.revokedAt) {
    throw unauthorized('SESSION_REVOKED', 'Session is invalid or revoked');
  }
  if (session.refreshTokenHash !== sha256(refreshToken)) {
    session.revokedAt = new Date();
    await session.save();
    throw unauthorized('TOKEN_REUSE', 'Refresh token reuse detected');
  }

  const user = await CustomerModel.findById(claims.sub).exec();
  if (!user || !user.isActive || user.deletedAt) {
    throw unauthorized('USER_INACTIVE', 'Customer not found or inactive');
  }

  session.revokedAt = new Date();
  await session.save();
  return issueTokenPair(user, session.deviceInfo ?? undefined);
}

export async function customerLogout(sessionId: string, customerId: string, ip?: string) {
  assertDb();
  await SessionModel.findByIdAndUpdate(sessionId, { $set: { revokedAt: new Date() } }).exec();
  await writeAuditLog({
    actorType: 'system',
    actorId: customerId,
    action: 'customer.logout',
    ip,
  });
}

export async function updateCustomerMe(customerId: string, name: string) {
  assertDb();
  const trimmed = name.trim();
  if (trimmed.length < 1 || trimmed.length > 80) {
    throw badRequest('VALIDATION_ERROR', 'Name must be 1–80 characters');
  }
  const user = await CustomerModel.findByIdAndUpdate(
    customerId,
    { $set: { name: trimmed } },
    { returnDocument: 'after' },
  ).exec();
  if (!user || user.deletedAt) {
    throw notFound('USER_NOT_FOUND', 'Customer not found');
  }
  return publicCustomer(user);
}

/**
 * Soft-delete + anonymize phone (frees number for a fresh profile) +
 * revoke sessions + deactivate FCM devices + clear wishlist.
 * Requires confirm === 'DELETE'.
 */
export async function deleteCustomerMe(
  customerId: string,
  input: { confirm: string },
  ip?: string,
) {
  assertDb();
  if (input.confirm?.trim().toUpperCase() !== 'DELETE') {
    throw badRequest('CONFIRM_REQUIRED', 'Type DELETE to confirm account deletion');
  }

  const user = await CustomerModel.findById(customerId).exec();
  if (!user || user.deletedAt) {
    throw notFound('USER_NOT_FOUND', 'Customer not found');
  }

  const previousPhone = maskPhone(user.phone);
  user.deletedAt = new Date();
  user.isActive = false;
  // Anonymize unique phone so the real number can register again as a new customer
  user.phone = `deleted_${user._id}_${Date.now()}`;
  user.name = undefined;
  await user.save();

  await SessionModel.updateMany(
    { userType: 'customer', userId: user._id, revokedAt: null },
    { $set: { revokedAt: new Date() } },
  ).exec();

  await DeviceModel.updateMany(
    { customerId: user._id, isActive: true },
    { $set: { isActive: false, lastSeenAt: new Date() } },
  ).exec();

  await WishlistModel.deleteMany({ customerId: user._id }).exec();

  await writeAuditLog({
    actorType: 'system',
    actorId: customerId,
    action: 'customer.delete',
    after: { phone: previousPhone, devicesDeactivated: true, wishlistCleared: true },
    ip,
  });

  return {
    ok: true,
    message:
      'Account deleted. You can sign in again later with the same phone to create a new profile.',
  };
}
