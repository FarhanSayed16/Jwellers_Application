import crypto from 'node:crypto';
import { Types } from 'mongoose';
import { getMongoConnectionState } from '../../db/connection';
import { CustomerModel } from '../../db/models/Customer';
import { badRequest, notFound } from '../../utils/errors';

function assertDb() {
  if (getMongoConnectionState().readyState !== 1) {
    throw notFound('DATABASE_UNAVAILABLE', 'Database is not connected');
  }
}

function makeCode(phone: string) {
  const suffix = crypto.createHash('sha1').update(phone).digest('hex').slice(0, 6).toUpperCase();
  return `RR${suffix}`;
}

export async function ensureReferralCode(customerId: string) {
  assertDb();
  const doc = await CustomerModel.findById(customerId).exec();
  if (!doc) throw notFound('CUSTOMER_NOT_FOUND', 'Customer not found');
  if (doc.referralCode) {
    return { referralCode: doc.referralCode as string };
  }
  let code = makeCode(doc.phone as string);
  // uniqueness retry
  for (let i = 0; i < 5; i++) {
    const clash = await CustomerModel.findOne({ referralCode: code }).lean();
    if (!clash) break;
    code = `RR${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
  }
  doc.referralCode = code;
  await doc.save();
  return { referralCode: code };
}

export async function applyReferralCode(customerId: string, code: string) {
  assertDb();
  const normalized = code.trim().toUpperCase();
  if (!normalized) throw badRequest('VALIDATION_ERROR', 'referral code required');
  const me = await CustomerModel.findById(customerId).exec();
  if (!me) throw notFound('CUSTOMER_NOT_FOUND', 'Customer not found');
  if (me.referredBy) {
    return { applied: false, reason: 'already_referred' as const };
  }
  const referrer = await CustomerModel.findOne({
    referralCode: normalized,
    deletedAt: null,
  }).exec();
  if (!referrer) throw badRequest('INVALID_REFERRAL', 'Referral code not found');
  if (String(referrer._id) === customerId) {
    throw badRequest('INVALID_REFERRAL', 'Cannot use your own code');
  }
  me.referredBy = referrer._id as Types.ObjectId;
  await me.save();
  return { applied: true, referredBy: String(referrer._id) };
}

export async function getReferralStats() {
  assertDb();
  const totalReferred = await CustomerModel.countDocuments({
    referredBy: { $ne: null },
    deletedAt: null,
  });
  const top = await CustomerModel.aggregate<{
    _id: Types.ObjectId;
    count: number;
  }>([
    { $match: { referredBy: { $ne: null }, deletedAt: null } },
    { $group: { _id: '$referredBy', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 },
  ]);
  const ids = top.map((t) => t._id);
  const people = await CustomerModel.find({ _id: { $in: ids } })
    .select({ phone: 1, name: 1, referralCode: 1 })
    .lean();
  const byId = new Map(people.map((p) => [String(p._id), p]));
  return {
    mode: 'tracking_only' as const,
    note: 'No automatic credits — shop grants rewards manually.',
    totalReferred,
    topReferrers: top.map((t) => {
      const p = byId.get(String(t._id));
      return {
        customerId: String(t._id),
        phone: p?.phone ?? '—',
        name: p?.name ?? null,
        referralCode: p?.referralCode ?? null,
        referrals: t.count,
      };
    }),
  };
}
