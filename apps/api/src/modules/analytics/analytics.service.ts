import { Types } from 'mongoose';
import { isFeatureEnabled } from '../../config/features';
import { getMongoConnectionState } from '../../db/connection';
import { FeatureEventModel } from '../../db/models/FeatureEvent';
import { ItemModel } from '../../db/models/Item';
import { WishlistModel } from '../../db/models/Wishlist';
import { EnquiryModel } from '../../db/models/Enquiry';
import { badRequest, notFound } from '../../utils/errors';

function assertDb() {
  if (getMongoConnectionState().readyState !== 1) {
    throw notFound('DATABASE_UNAVAILABLE', 'Database is not connected');
  }
}

export type FeatureEventType = 'item_view' | 'wishlist_add' | 'enquiry_create' | 'calculator_use';

/** Fire-and-forget safe: no-op when analytics flag is off. */
export async function recordFeatureEvent(input: {
  type: FeatureEventType;
  customerId?: string | null;
  itemId?: string | null;
  meta?: Record<string, unknown>;
}) {
  if (!isFeatureEnabled('analytics')) return null;
  assertDb();
  const doc = await FeatureEventModel.create({
    type: input.type,
    customerId: input.customerId || undefined,
    itemId: input.itemId || undefined,
    meta: input.meta,
  });
  return { id: String(doc._id), type: doc.type };
}

export async function recordFeatureEventSafe(
  input: Parameters<typeof recordFeatureEvent>[0],
) {
  try {
    return await recordFeatureEvent(input);
  } catch {
    return null;
  }
}

export async function getAnalyticsSummary(days = 30) {
  assertDb();
  const since = new Date(Date.now() - Math.max(1, days) * 86400000);
  const [views, wishlists, enquiries, calc] = await Promise.all([
    FeatureEventModel.countDocuments({ type: 'item_view', createdAt: { $gte: since } }),
    FeatureEventModel.countDocuments({ type: 'wishlist_add', createdAt: { $gte: since } }),
    FeatureEventModel.countDocuments({ type: 'enquiry_create', createdAt: { $gte: since } }),
    FeatureEventModel.countDocuments({ type: 'calculator_use', createdAt: { $gte: since } }),
  ]);

  // Also include live wishlist / enquiry totals for pulse
  const [wishlistTotal, enquiryOpen] = await Promise.all([
    WishlistModel.countDocuments(),
    EnquiryModel.countDocuments({ status: { $in: ['new', 'in_progress'] }, deletedAt: null }),
  ]);

  return {
    windowDays: days,
    since: since.toISOString(),
    events: {
      item_view: views,
      wishlist_add: wishlists,
      enquiry_create: enquiries,
      calculator_use: calc,
    },
    pulse: {
      wishlistTotal,
      enquiryOpen,
    },
  };
}

export async function getMostViewedItems(limit = 10, days = 30) {
  assertDb();
  const since = new Date(Date.now() - Math.max(1, days) * 86400000);
  const rows = await FeatureEventModel.aggregate<{
    _id: Types.ObjectId;
    views: number;
  }>([
    {
      $match: {
        type: 'item_view',
        itemId: { $ne: null },
        createdAt: { $gte: since },
      },
    },
    { $group: { _id: '$itemId', views: { $sum: 1 } } },
    { $sort: { views: -1 } },
    { $limit: Math.min(Math.max(limit, 1), 50) },
  ]);

  if (rows.length === 0) {
    // Fallback: item.viewCount when no events yet
    const items = await ItemModel.find({ deletedAt: null, status: 'active' })
      .sort({ viewCount: -1 })
      .limit(Math.min(Math.max(limit, 1), 50))
      .select({ sku: 1, title: 1, viewCount: 1 })
      .lean();
    return {
      source: 'item_viewCount' as const,
      items: items.map((i) => ({
        itemId: String(i._id),
        sku: i.sku,
        title: i.title,
        views: (i as { viewCount?: number }).viewCount ?? 0,
      })),
    };
  }

  const ids = rows.map((r) => r._id);
  const items = await ItemModel.find({ _id: { $in: ids } })
    .select({ sku: 1, title: 1 })
    .lean();
  const byId = new Map(items.map((i) => [String(i._id), i]));

  return {
    source: 'feature_events' as const,
    items: rows.map((r) => {
      const item = byId.get(String(r._id));
      return {
        itemId: String(r._id),
        sku: item?.sku ?? '—',
        title: item?.title ?? 'Unknown item',
        views: r.views,
      };
    }),
  };
}

export async function postClientEvent(input: {
  type: string;
  itemId?: string | null;
  customerId?: string | null;
  meta?: Record<string, unknown>;
}) {
  const allowed: FeatureEventType[] = [
    'item_view',
    'wishlist_add',
    'enquiry_create',
    'calculator_use',
  ];
  if (!allowed.includes(input.type as FeatureEventType)) {
    throw badRequest('VALIDATION_ERROR', `type must be one of ${allowed.join(', ')}`);
  }
  if (input.itemId && !Types.ObjectId.isValid(input.itemId)) {
    throw badRequest('VALIDATION_ERROR', 'itemId invalid');
  }
  return recordFeatureEvent({
    type: input.type as FeatureEventType,
    itemId: input.itemId,
    customerId: input.customerId,
    meta: input.meta,
  });
}
