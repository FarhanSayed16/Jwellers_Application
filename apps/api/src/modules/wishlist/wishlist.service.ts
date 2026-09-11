import { Types } from 'mongoose';
import { getMongoConnectionState } from '../../db/connection';
import { ItemModel } from '../../db/models/Item';
import { WishlistModel } from '../../db/models/Wishlist';
import { badRequest, notFound } from '../../utils/errors';
import { isDuplicateKeyError } from '../../utils/slug';

function assertDb() {
  if (getMongoConnectionState().readyState !== 1) {
    throw notFound('DATABASE_UNAVAILABLE', 'Database is not connected');
  }
}

function itemSummary(item: any) {
  if (!item) return null;
  return {
    id: String(item._id),
    sku: item.sku,
    title: item.title,
    status: item.status,
    metal: item.metal,
    purity: item.purity,
    primaryImageUrl: item.images?.find((i: any) => i.isPrimary)?.url ?? item.images?.[0]?.url ?? null,
  };
}

export async function listWishlist(customerId: string) {
  assertDb();
  const rows = await WishlistModel.find({ customerId })
    .sort({ createdAt: -1 })
    .populate('itemId')
    .exec();

  return {
    items: rows
      .filter((r) => r.itemId && !(r.itemId as any).deletedAt)
      .map((r) => ({
        id: String(r._id),
        itemId: String((r.itemId as any)._id),
        addedAt: new Date(r.createdAt).toISOString(),
        item: itemSummary(r.itemId),
      })),
  };
}

/** Idempotent add — duplicate unique key returns existing entry. */
export async function addToWishlist(customerId: string, itemId: string) {
  assertDb();
  if (!Types.ObjectId.isValid(itemId)) {
    throw badRequest('INVALID_ITEM', 'itemId is invalid');
  }

  const item = await ItemModel.findOne({
    _id: itemId,
    deletedAt: null,
    status: 'active',
  }).exec();
  if (!item) throw notFound('ITEM_NOT_FOUND', 'Item not found or not available');

  const existing = await WishlistModel.findOne({ customerId, itemId }).exec();
  if (existing) {
    return { wishlistId: String(existing._id), itemId, created: false };
  }

  try {
    const row = await WishlistModel.create({ customerId, itemId });
    await ItemModel.findByIdAndUpdate(itemId, { $inc: { wishlistCount: 1 } }).exec();
    return { wishlistId: String(row._id), itemId, created: true };
  } catch (err) {
    if (isDuplicateKeyError(err)) {
      const again = await WishlistModel.findOne({ customerId, itemId }).exec();
      return { wishlistId: again ? String(again._id) : null, itemId, created: false };
    }
    throw err;
  }
}

/** Idempotent remove — missing entry is still success. */
export async function removeFromWishlist(customerId: string, itemId: string) {
  assertDb();
  if (!Types.ObjectId.isValid(itemId)) {
    throw badRequest('INVALID_ITEM', 'itemId is invalid');
  }

  const removed = await WishlistModel.findOneAndDelete({ customerId, itemId }).exec();
  if (removed) {
    await ItemModel.findByIdAndUpdate(itemId, { $inc: { wishlistCount: -1 } }).exec();
  }
  return { ok: true, removed: Boolean(removed) };
}
