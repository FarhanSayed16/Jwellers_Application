import { Types } from 'mongoose';
import { getMongoConnectionState } from '../../db/connection';
import { CustomerModel } from '../../db/models/Customer';
import { EnquiryModel } from '../../db/models/Enquiry';
import { badRequest, notFound } from '../../utils/errors';

function assertDb() {
  if (getMongoConnectionState().readyState !== 1) {
    throw notFound('DATABASE_UNAVAILABLE', 'Database is not connected');
  }
}

export async function listCustomersCrm(opts?: { tag?: string; limit?: number }) {
  assertDb();
  const filter: Record<string, unknown> = { deletedAt: null };
  if (opts?.tag) filter.tags = opts.tag;
  const rows = await CustomerModel.find(filter)
    .sort({ lastLoginAt: -1, createdAt: -1 })
    .limit(Math.min(Math.max(opts?.limit ?? 50, 1), 100))
    .lean();
  return {
    customers: rows.map((c) => ({
      id: String(c._id),
      phone: c.phone,
      name: c.name ?? null,
      tags: (c.tags as string[] | undefined) ?? [],
      lastLoginAt: c.lastLoginAt ? new Date(c.lastLoginAt).toISOString() : null,
      referralCode: c.referralCode ?? null,
    })),
  };
}

export async function updateCustomerTags(customerId: string, tags: string[]) {
  assertDb();
  if (!Types.ObjectId.isValid(customerId)) {
    throw notFound('CUSTOMER_NOT_FOUND', 'Customer not found');
  }
  const cleaned = [...new Set(tags.map((t) => t.trim()).filter(Boolean))].slice(0, 20);
  const doc = await CustomerModel.findOneAndUpdate(
    { _id: customerId, deletedAt: null },
    { $set: { tags: cleaned } },
    { returnDocument: 'after' },
  ).exec();
  if (!doc) throw notFound('CUSTOMER_NOT_FOUND', 'Customer not found');
  return {
    id: String(doc._id),
    tags: (doc.tags as string[]) ?? [],
  };
}

export async function listFollowUpEnquiries() {
  assertDb();
  const now = new Date();
  const staleCutoff = new Date(Date.now() - 3 * 86400000);
  const rows = await EnquiryModel.find({
    deletedAt: null,
    status: { $in: ['new', 'in_progress'] },
    $or: [
      { followUpAt: { $lte: now } },
      { followUpAt: { $exists: false }, createdAt: { $lte: staleCutoff } },
      { followUpAt: null, createdAt: { $lte: staleCutoff } },
    ],
  })
    .sort({ followUpAt: 1, createdAt: 1 })
    .limit(100)
    .lean();

  return {
    enquiries: rows.map((e) => ({
      id: String(e._id),
      customerId: String(e.customerId),
      itemId: e.itemId ? String(e.itemId) : null,
      message: e.message,
      status: e.status,
      followUpAt: e.followUpAt ? new Date(e.followUpAt).toISOString() : null,
      followUpNote: e.followUpNote ?? null,
      createdAt: new Date(e.createdAt).toISOString(),
      overdue: e.followUpAt
        ? new Date(e.followUpAt) <= now
        : new Date(e.createdAt) <= staleCutoff,
    })),
  };
}

export async function setEnquiryFollowUp(
  id: string,
  patch: { followUpAt?: string | null; followUpNote?: string | null },
) {
  assertDb();
  if (!Types.ObjectId.isValid(id)) throw notFound('ENQUIRY_NOT_FOUND', 'Enquiry not found');
  const doc = await EnquiryModel.findById(id).exec();
  if (!doc || doc.deletedAt) throw notFound('ENQUIRY_NOT_FOUND', 'Enquiry not found');
  if (patch.followUpAt === null) {
    doc.followUpAt = undefined;
  } else if (patch.followUpAt) {
    const d = new Date(patch.followUpAt);
    if (Number.isNaN(d.getTime())) throw badRequest('VALIDATION_ERROR', 'Invalid followUpAt');
    doc.followUpAt = d;
  }
  if (patch.followUpNote !== undefined) {
    doc.followUpNote = patch.followUpNote || undefined;
  }
  await doc.save();
  return {
    id: String(doc._id),
    followUpAt: doc.followUpAt ? new Date(doc.followUpAt).toISOString() : null,
    followUpNote: doc.followUpNote ?? null,
  };
}
