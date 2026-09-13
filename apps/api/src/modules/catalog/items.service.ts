import { Types } from 'mongoose';
import { getMongoConnectionState } from '../../db/connection';
import { CategoryModel } from '../../db/models/Category';
import { ItemModel } from '../../db/models/Item';
import { badRequest, conflict, notFound } from '../../utils/errors';
import { isDuplicateKeyError } from '../../utils/slug';
import { notifyNewArrival } from '../devices/devices.service';

function assertDb() {
  if (getMongoConnectionState().readyState !== 1) {
    throw notFound('DATABASE_UNAVAILABLE', 'Database is not connected');
  }
}

export type MakingCharge = {
  type: 'percent' | 'flat' | 'inherit';
  value: number | null;
};

export type ItemImage = {
  url: string;
  publicId: string | null;
  sortOrder: number;
  isPrimary: boolean;
};

export type ItemDto = {
  id: string;
  sku: string;
  title: string;
  description: string | null;
  categoryId: string;
  subcategoryId: string | null;
  images: ItemImage[];
  metal: string;
  purity: string;
  huid: string | null;
  hallmarkImageUrl: string | null;
  grossWeightGrams: number | null;
  netWeightGrams: number | null;
  makingCharge: MakingCharge;
  stoneDetails: string | null;
  sizeInfo: string | null;
  tags: string[];
  isNewArrival: boolean;
  isFeatured: boolean;
  status: string;
  viewCount: number;
  wishlistCount: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

function toItemDto(doc: any): ItemDto {
  return {
    id: doc._id.toString(),
    sku: doc.sku,
    title: doc.title,
    description: doc.description ?? null,
    categoryId: String(doc.categoryId),
    subcategoryId: doc.subcategoryId ? String(doc.subcategoryId) : null,
    images: (doc.images ?? []).map((img: any) => ({
      url: img.url,
      publicId: img.publicId ?? null,
      sortOrder: img.sortOrder ?? 0,
      isPrimary: Boolean(img.isPrimary),
    })),
    metal: doc.metal,
    purity: doc.purity,
    huid: doc.huid ?? null,
    hallmarkImageUrl: doc.hallmarkImageUrl ?? null,
    grossWeightGrams: doc.grossWeightGrams ?? null,
    netWeightGrams: doc.netWeightGrams ?? null,
    makingCharge: {
      type: doc.makingCharge?.type ?? 'inherit',
      value: doc.makingCharge?.value ?? null,
    },
    stoneDetails: doc.stoneDetails ?? null,
    sizeInfo: doc.sizeInfo ?? null,
    tags: doc.tags ?? [],
    isNewArrival: Boolean(doc.isNewArrival),
    isFeatured: Boolean(doc.isFeatured),
    status: doc.status,
    viewCount: doc.viewCount ?? 0,
    wishlistCount: doc.wishlistCount ?? 0,
    createdAt: new Date(doc.createdAt).toISOString(),
    updatedAt: new Date(doc.updatedAt).toISOString(),
    deletedAt: doc.deletedAt ? new Date(doc.deletedAt).toISOString() : null,
  };
}

function normalizeMakingCharge(input?: {
  type?: 'percent' | 'flat' | 'inherit';
  value?: number | null;
}): MakingCharge {
  const type = input?.type ?? 'inherit';
  if (type === 'inherit') {
    return { type, value: null };
  }
  if (input?.value === undefined || input.value === null || !Number.isFinite(input.value)) {
    throw badRequest('VALIDATION_ERROR', 'makingCharge.value is required for percent/flat');
  }
  if (input.value < 0) {
    throw badRequest('VALIDATION_ERROR', 'makingCharge.value must be non-negative');
  }
  return { type, value: input.value };
}

async function assertCategoryRefs(categoryId: string, subcategoryId?: string | null) {
  if (!Types.ObjectId.isValid(categoryId)) {
    throw badRequest('INVALID_CATEGORY', 'categoryId is invalid');
  }
  const category = await CategoryModel.findOne({
    _id: categoryId,
    deletedAt: null,
    parentId: null,
  }).exec();
  if (!category) {
    throw badRequest('INVALID_CATEGORY', 'categoryId must be an existing root category');
  }

  if (subcategoryId) {
    if (!Types.ObjectId.isValid(subcategoryId)) {
      throw badRequest('INVALID_SUBCATEGORY', 'subcategoryId is invalid');
    }
    const sub = await CategoryModel.findOne({
      _id: subcategoryId,
      deletedAt: null,
      parentId: categoryId,
    }).exec();
    if (!sub) {
      throw badRequest(
        'INVALID_SUBCATEGORY',
        'subcategoryId must be a child of the given categoryId',
      );
    }
  }
}

export type ItemListFilter = {
  categoryId?: string;
  subcategoryId?: string;
  q?: string;
  purity?: string;
  metal?: string;
  isNewArrival?: boolean;
  isFeatured?: boolean;
  status?: string;
  /** Public lists force active + not deleted */
  publicOnly?: boolean;
  includeDeleted?: boolean;
  limit?: number;
  skip?: number;
};

export async function listItems(filter: ItemListFilter) {
  assertDb();
  const query: Record<string, unknown> = {};
  const limit = Math.min(Math.max(filter.limit ?? 50, 1), 100);
  const skip = Math.max(filter.skip ?? 0, 0);

  if (filter.publicOnly) {
    query.deletedAt = null;
    query.status = 'active';
  } else {
    if (!filter.includeDeleted) query.deletedAt = null;
    if (filter.status) query.status = filter.status;
  }

  if (filter.categoryId) query.categoryId = filter.categoryId;
  if (filter.subcategoryId) query.subcategoryId = filter.subcategoryId;
  if (filter.purity) query.purity = filter.purity;
  if (filter.metal) query.metal = filter.metal;
  if (filter.isNewArrival !== undefined) query.isNewArrival = filter.isNewArrival;
  if (filter.isFeatured !== undefined) query.isFeatured = filter.isFeatured;

  if (filter.q?.trim()) {
    const q = filter.q.trim();
    query.$or = [
      { title: { $regex: q, $options: 'i' } },
      { sku: { $regex: q, $options: 'i' } },
      { tags: { $regex: q, $options: 'i' } },
    ];
  }

  const [items, total] = await Promise.all([
    ItemModel.find(query).sort({ updatedAt: -1 }).skip(skip).limit(limit).exec(),
    ItemModel.countDocuments(query).exec(),
  ]);

  return {
    items: items.map(toItemDto),
    total,
    limit,
    skip,
  };
}

export async function getItemById(
  id: string,
  opts?: { publicOnly?: boolean; incrementView?: boolean; includeDeleted?: boolean },
) {
  assertDb();
  if (!Types.ObjectId.isValid(id)) throw notFound('ITEM_NOT_FOUND', 'Item not found');
  const filter: Record<string, unknown> = { _id: id };
  if (opts?.publicOnly) {
    filter.deletedAt = null;
    filter.status = 'active';
  } else if (!opts?.includeDeleted) {
    filter.deletedAt = null;
  }
  let doc = await ItemModel.findOne(filter).exec();
  if (!doc) throw notFound('ITEM_NOT_FOUND', 'Item not found');

  if (opts?.incrementView) {
    doc = await ItemModel.findByIdAndUpdate(
      id,
      { $inc: { viewCount: 1 } },
      { returnDocument: 'after' },
    ).exec();
    const { recordFeatureEventSafe } = await import('../analytics/analytics.service');
    void recordFeatureEventSafe({ type: 'item_view', itemId: id });
  }
  return toItemDto(doc);
}

export async function getItemBySku(sku: string, opts?: { publicOnly?: boolean }) {
  assertDb();
  const filter: Record<string, unknown> = { sku: sku.trim().toUpperCase() };
  if (opts?.publicOnly !== false) {
    filter.deletedAt = null;
    filter.status = 'active';
  }
  const doc = await ItemModel.findOne(filter).exec();
  if (!doc) throw notFound('ITEM_NOT_FOUND', 'Item not found');
  return toItemDto(doc);
}

export async function createItem(input: {
  sku: string;
  title: string;
  description?: string;
  categoryId: string;
  subcategoryId?: string | null;
  images?: ItemImage[];
  metal?: 'gold' | 'silver' | 'other';
  purity?: '24K' | '22K' | '18K' | 'other';
  huid?: string;
  hallmarkImageUrl?: string;
  grossWeightGrams?: number;
  netWeightGrams?: number;
  makingCharge?: { type: 'percent' | 'flat' | 'inherit'; value?: number | null };
  stoneDetails?: string;
  sizeInfo?: string;
  tags?: string[];
  isNewArrival?: boolean;
  isFeatured?: boolean;
  status?: 'draft' | 'active' | 'sold' | 'archived';
  adminId: string;
}) {
  assertDb();
  await assertCategoryRefs(input.categoryId, input.subcategoryId);
  const makingCharge = normalizeMakingCharge(input.makingCharge);

  try {
    const doc = await ItemModel.create({
      sku: input.sku.trim().toUpperCase(),
      title: input.title.trim(),
      description: input.description,
      categoryId: input.categoryId,
      subcategoryId: input.subcategoryId || undefined,
      images: input.images ?? [],
      metal: input.metal ?? 'gold',
      purity: input.purity ?? '22K',
      huid: input.huid,
      hallmarkImageUrl: input.hallmarkImageUrl,
      grossWeightGrams: input.grossWeightGrams,
      netWeightGrams: input.netWeightGrams,
      makingCharge,
      stoneDetails: input.stoneDetails,
      sizeInfo: input.sizeInfo,
      tags: input.tags ?? [],
      isNewArrival: input.isNewArrival ?? false,
      isFeatured: input.isFeatured ?? false,
      status: input.status ?? 'draft',
      createdBy: input.adminId,
      updatedBy: input.adminId,
    });
    const dto = toItemDto(doc);
    if (dto.isNewArrival && dto.status === 'active') {
      try {
        await notifyNewArrival(dto.id);
      } catch {
        /* best-effort */
      }
    }
    return dto;
  } catch (err) {
    if (isDuplicateKeyError(err)) {
      throw conflict('SKU_EXISTS', 'An item with this SKU already exists');
    }
    throw err;
  }
}

export async function updateItem(
  id: string,
  input: Partial<{
    sku: string;
    title: string;
    description: string | null;
    categoryId: string;
    subcategoryId: string | null;
    images: ItemImage[];
    metal: 'gold' | 'silver' | 'other';
    purity: '24K' | '22K' | '18K' | 'other';
    huid: string | null;
    hallmarkImageUrl: string | null;
    grossWeightGrams: number | null;
    netWeightGrams: number | null;
    makingCharge: { type: 'percent' | 'flat' | 'inherit'; value?: number | null };
    stoneDetails: string | null;
    sizeInfo: string | null;
    tags: string[];
    isNewArrival: boolean;
    isFeatured: boolean;
    status: 'draft' | 'active' | 'sold' | 'archived';
  }>,
  adminId: string,
) {
  assertDb();
  if (!Types.ObjectId.isValid(id)) throw notFound('ITEM_NOT_FOUND', 'Item not found');
  const doc = await ItemModel.findOne({ _id: id, deletedAt: null }).exec();
  if (!doc) throw notFound('ITEM_NOT_FOUND', 'Item not found');

  const wasArrival = Boolean(doc.isNewArrival);
  const wasActive = doc.status === 'active';

  const nextCategoryId = input.categoryId ?? String(doc.categoryId);
  const nextSub =
    input.subcategoryId !== undefined
      ? input.subcategoryId
      : doc.subcategoryId
        ? String(doc.subcategoryId)
        : null;
  if (input.categoryId !== undefined || input.subcategoryId !== undefined) {
    await assertCategoryRefs(nextCategoryId, nextSub);
    doc.categoryId = nextCategoryId;
    doc.subcategoryId = nextSub || undefined;
  }

  if (input.sku !== undefined) doc.sku = input.sku.trim().toUpperCase();
  if (input.title !== undefined) doc.title = input.title.trim();
  if (input.description !== undefined) doc.description = input.description;
  if (input.images !== undefined) doc.images = input.images;
  if (input.metal !== undefined) doc.metal = input.metal;
  if (input.purity !== undefined) doc.purity = input.purity;
  if (input.huid !== undefined) doc.huid = input.huid;
  if (input.hallmarkImageUrl !== undefined) doc.hallmarkImageUrl = input.hallmarkImageUrl;
  if (input.grossWeightGrams !== undefined) doc.grossWeightGrams = input.grossWeightGrams;
  if (input.netWeightGrams !== undefined) doc.netWeightGrams = input.netWeightGrams;
  if (input.makingCharge !== undefined) doc.makingCharge = normalizeMakingCharge(input.makingCharge);
  if (input.stoneDetails !== undefined) doc.stoneDetails = input.stoneDetails;
  if (input.sizeInfo !== undefined) doc.sizeInfo = input.sizeInfo;
  if (input.tags !== undefined) doc.tags = input.tags;
  if (input.isNewArrival !== undefined) doc.isNewArrival = input.isNewArrival;
  if (input.isFeatured !== undefined) doc.isFeatured = input.isFeatured;
  if (input.status !== undefined) doc.status = input.status;
  doc.updatedBy = adminId;

  try {
    await doc.save();
    const dto = toItemDto(doc);
    // Notify when newly marked arrival while active, or activated while already arrival
    if (
      dto.isNewArrival &&
      dto.status === 'active' &&
      (!wasArrival || !wasActive) &&
      (input.isNewArrival !== undefined || input.status !== undefined)
    ) {
      try {
        await notifyNewArrival(dto.id);
      } catch {
        /* best-effort */
      }
    }
    return dto;
  } catch (err) {
    if (isDuplicateKeyError(err)) {
      throw conflict('SKU_EXISTS', 'An item with this SKU already exists');
    }
    throw err;
  }
}

export async function softDeleteItem(id: string, adminId: string) {
  assertDb();
  if (!Types.ObjectId.isValid(id)) throw notFound('ITEM_NOT_FOUND', 'Item not found');
  const doc = await ItemModel.findOne({ _id: id, deletedAt: null }).exec();
  if (!doc) throw notFound('ITEM_NOT_FOUND', 'Item not found');
  doc.deletedAt = new Date();
  doc.status = 'archived';
  doc.updatedBy = adminId;
  await doc.save();
  return { ok: true };
}

export async function cloneItem(
  id: string,
  adminId: string,
  input?: { sku?: string },
) {
  assertDb();
  if (!Types.ObjectId.isValid(id)) throw notFound('ITEM_NOT_FOUND', 'Item not found');
  const src = await ItemModel.findOne({ _id: id, deletedAt: null }).exec();
  if (!src) throw notFound('ITEM_NOT_FOUND', 'Item not found');

  const baseSku = (input?.sku?.trim() || `${src.sku}-COPY`).toUpperCase();
  let sku = baseSku;
  let attempt = 0;
  while (attempt < 20) {
    const exists = await ItemModel.findOne({ sku, deletedAt: null }).select({ _id: 1 }).lean();
    if (!exists) break;
    attempt += 1;
    sku = `${baseSku}-${attempt}`;
  }

  const created = await ItemModel.create({
    sku,
    title: `${src.title} (copy)`,
    description: src.description,
    categoryId: src.categoryId,
    subcategoryId: src.subcategoryId,
    images: (src.images ?? []).map((img: any) => ({
      url: img.url,
      publicId: img.publicId,
      sortOrder: img.sortOrder ?? 0,
      isPrimary: Boolean(img.isPrimary),
    })),
    metal: src.metal,
    purity: src.purity,
    huid: src.huid,
    hallmarkImageUrl: src.hallmarkImageUrl,
    grossWeightGrams: src.grossWeightGrams,
    netWeightGrams: src.netWeightGrams,
    makingCharge: src.makingCharge,
    stoneDetails: src.stoneDetails,
    sizeInfo: src.sizeInfo,
    tags: src.tags ?? [],
    isNewArrival: false,
    isFeatured: false,
    status: 'draft',
    createdBy: adminId,
    updatedBy: adminId,
  });
  return toItemDto(created);
}

export type ImportItemRow = {
  sku: string;
  title: string;
  categorySlug: string;
  subcategorySlug?: string;
  metal?: 'gold' | 'silver' | 'other';
  purity?: '24K' | '22K' | '18K' | 'other';
  netWeightGrams?: number;
  grossWeightGrams?: number;
  status?: 'draft' | 'active' | 'sold' | 'archived';
  isNewArrival?: boolean;
  isFeatured?: boolean;
  huid?: string;
  description?: string;
};

export async function importItemsCsv(
  rows: ImportItemRow[],
  adminId: string,
): Promise<{ created: number; skipped: number; errors: Array<{ row: number; message: string }> }> {
  assertDb();
  if (!rows.length) throw badRequest('VALIDATION_ERROR', 'No rows to import');
  if (rows.length > 500) throw badRequest('VALIDATION_ERROR', 'Max 500 rows per import');

  let created = 0;
  let skipped = 0;
  const errors: Array<{ row: number; message: string }> = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]!;
    const rowNum = i + 2; // header is row 1
    try {
      const sku = row.sku?.trim().toUpperCase();
      const title = row.title?.trim();
      const categorySlug = row.categorySlug?.trim().toLowerCase();
      if (!sku || !title || !categorySlug) {
        throw new Error('sku, title, and categorySlug are required');
      }

      const existing = await ItemModel.findOne({ sku, deletedAt: null }).select({ _id: 1 }).lean();
      if (existing) {
        skipped += 1;
        continue;
      }

      const category = await CategoryModel.findOne({
        slug: categorySlug,
        parentId: null,
        deletedAt: null,
      }).exec();
      if (!category) throw new Error(`categorySlug not found: ${categorySlug}`);

      let subcategoryId: string | undefined;
      if (row.subcategorySlug?.trim()) {
        const sub = await CategoryModel.findOne({
          slug: row.subcategorySlug.trim().toLowerCase(),
          parentId: category._id,
          deletedAt: null,
        }).exec();
        if (!sub) throw new Error(`subcategorySlug not found: ${row.subcategorySlug}`);
        subcategoryId = String(sub._id);
      }

      await createItem({
        sku,
        title,
        description: row.description,
        categoryId: String(category._id),
        subcategoryId,
        metal: row.metal ?? 'gold',
        purity: row.purity ?? '22K',
        netWeightGrams: row.netWeightGrams,
        grossWeightGrams: row.grossWeightGrams,
        status: row.status ?? 'draft',
        isNewArrival: row.isNewArrival ?? false,
        isFeatured: row.isFeatured ?? false,
        huid: row.huid,
        makingCharge: { type: 'inherit' },
        adminId,
      });
      created += 1;
    } catch (err) {
      errors.push({
        row: rowNum,
        message: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return { created, skipped, errors };
}

export async function restoreItem(id: string, adminId: string) {
  assertDb();
  if (!Types.ObjectId.isValid(id)) throw notFound('ITEM_NOT_FOUND', 'Item not found');
  const doc = await ItemModel.findById(id).exec();
  if (!doc || !doc.deletedAt) {
    throw notFound('ITEM_NOT_FOUND', 'Deleted item not found');
  }
  doc.deletedAt = null;
  if (doc.status === 'archived') doc.status = 'draft';
  doc.updatedBy = adminId;
  await doc.save();
  return toItemDto(doc);
}
