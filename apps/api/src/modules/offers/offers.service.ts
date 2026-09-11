import { Types } from 'mongoose';
import { getMongoConnectionState } from '../../db/connection';
import { OfferModel } from '../../db/models/Offer';
import { badRequest, notFound } from '../../utils/errors';

function assertDb() {
  if (getMongoConnectionState().readyState !== 1) {
    throw notFound('DATABASE_UNAVAILABLE', 'Database is not connected');
  }
}

function toDto(doc: any) {
  return {
    id: String(doc._id),
    title: doc.title,
    description: doc.description ?? null,
    bannerImageUrl: doc.bannerImageUrl ?? null,
    validFrom: doc.validFrom ? new Date(doc.validFrom).toISOString() : null,
    validTill: doc.validTill ? new Date(doc.validTill).toISOString() : null,
    isActive: Boolean(doc.isActive),
    sortOrder: doc.sortOrder ?? 0,
    createdAt: new Date(doc.createdAt).toISOString(),
    updatedAt: new Date(doc.updatedAt).toISOString(),
  };
}

/** Public: active, not deleted, within optional date window. */
export async function listPublicOffers() {
  assertDb();
  const now = new Date();
  const docs = await OfferModel.find({
    deletedAt: null,
    isActive: true,
    $and: [
      { $or: [{ validFrom: null }, { validFrom: { $exists: false } }, { validFrom: { $lte: now } }] },
      { $or: [{ validTill: null }, { validTill: { $exists: false } }, { validTill: { $gte: now } }] },
    ],
  })
    .sort({ sortOrder: 1, createdAt: -1 })
    .exec();
  return { offers: docs.map(toDto) };
}

export async function listAdminOffers() {
  assertDb();
  const docs = await OfferModel.find({ deletedAt: null }).sort({ sortOrder: 1, createdAt: -1 }).exec();
  return { offers: docs.map(toDto) };
}

export async function createOffer(input: {
  title: string;
  description?: string;
  bannerImageUrl?: string;
  validFrom?: Date | null;
  validTill?: Date | null;
  isActive?: boolean;
  sortOrder?: number;
}) {
  assertDb();
  const title = input.title.trim();
  if (!title) throw badRequest('VALIDATION_ERROR', 'title is required');

  const doc = await OfferModel.create({
    title,
    description: input.description,
    bannerImageUrl: input.bannerImageUrl,
    validFrom: input.validFrom ?? undefined,
    validTill: input.validTill ?? undefined,
    isActive: input.isActive ?? true,
    sortOrder: input.sortOrder ?? 0,
  });
  return toDto(doc);
}

export async function updateOffer(
  id: string,
  input: Partial<{
    title: string;
    description: string | null;
    bannerImageUrl: string | null;
    validFrom: Date | null;
    validTill: Date | null;
    isActive: boolean;
    sortOrder: number;
  }>,
) {
  assertDb();
  if (!Types.ObjectId.isValid(id)) throw notFound('OFFER_NOT_FOUND', 'Offer not found');
  const doc = await OfferModel.findOne({ _id: id, deletedAt: null }).exec();
  if (!doc) throw notFound('OFFER_NOT_FOUND', 'Offer not found');

  if (input.title !== undefined) doc.title = input.title.trim();
  if (input.description !== undefined) doc.description = input.description;
  if (input.bannerImageUrl !== undefined) doc.bannerImageUrl = input.bannerImageUrl;
  if (input.validFrom !== undefined) doc.validFrom = input.validFrom;
  if (input.validTill !== undefined) doc.validTill = input.validTill;
  if (input.isActive !== undefined) doc.isActive = input.isActive;
  if (input.sortOrder !== undefined) doc.sortOrder = input.sortOrder;

  await doc.save();
  return toDto(doc);
}

export async function softDeleteOffer(id: string) {
  assertDb();
  if (!Types.ObjectId.isValid(id)) throw notFound('OFFER_NOT_FOUND', 'Offer not found');
  const doc = await OfferModel.findOne({ _id: id, deletedAt: null }).exec();
  if (!doc) throw notFound('OFFER_NOT_FOUND', 'Offer not found');
  doc.deletedAt = new Date();
  doc.isActive = false;
  await doc.save();
  return { ok: true };
}
