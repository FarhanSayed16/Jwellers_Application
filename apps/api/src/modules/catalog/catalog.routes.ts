import { Router } from 'express';
import { z } from 'zod';
import { requireAdmin } from '../../middleware/auth';
import { badRequest } from '../../utils/errors';
import { sendSuccess } from '../../utils/response';
import {
  createCategory,
  getCategoryById,
  listCategories,
  softDeleteCategory,
  updateCategory,
} from './categories.service';
import { getAdminDashboard } from './dashboard.service';
import {
  cloneItem,
  createItem,
  getItemById,
  getItemBySku,
  importItemsCsv,
  listItems,
  restoreItem,
  softDeleteItem,
  updateItem,
  type ImportItemRow,
} from './items.service';

export const catalogRouter = Router();

const makingChargeSchema = z.object({
  type: z.enum(['percent', 'flat', 'inherit']),
  value: z.number().finite().nonnegative().nullable().optional(),
});

const imageSchema = z.object({
  url: z.string().url(),
  publicId: z.string().optional().nullable(),
  sortOrder: z.number().int().optional(),
  isPrimary: z.boolean().optional(),
});

function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]!;
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (ch === ',' && !inQuotes) {
      out.push(cur.trim());
      cur = '';
      continue;
    }
    cur += ch;
  }
  out.push(cur.trim());
  return out;
}

function parseItemsCsv(csv: string): ImportItemRow[] {
  const lines = csv
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length < 2) return [];
  const headers = parseCsvLine(lines[0]!).map((h) => h.toLowerCase());
  const idx = (name: string) => headers.indexOf(name);

  const rows: ImportItemRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i]!);
    const get = (name: string) => {
      const j = idx(name);
      return j >= 0 ? (cols[j] ?? '').trim() : '';
    };
    const bool = (name: string) => {
      const v = get(name).toLowerCase();
      if (!v) return undefined;
      return ['1', 'true', 'yes', 'y'].includes(v);
    };
    const num = (name: string) => {
      const v = get(name);
      if (!v) return undefined;
      const n = Number(v);
      return Number.isFinite(n) ? n : undefined;
    };
    const metal = get('metal').toLowerCase();
    const purityRaw = get('purity').toUpperCase();
    const purity = purityRaw === 'OTHER' ? 'other' : purityRaw;
    const status = get('status').toLowerCase();
    rows.push({
      sku: get('sku'),
      title: get('title'),
      categorySlug: get('categoryslug') || get('category_slug'),
      subcategorySlug: get('subcategoryslug') || get('subcategory_slug') || undefined,
      metal: (['gold', 'silver', 'other'].includes(metal)
        ? metal
        : undefined) as ImportItemRow['metal'],
      purity: (['24K', '22K', '18K', 'other'].includes(purity)
        ? purity
        : undefined) as ImportItemRow['purity'],
      netWeightGrams: num('netweightgrams') ?? num('net_weight_grams'),
      grossWeightGrams: num('grossweightgrams') ?? num('gross_weight_grams'),
      status: (['draft', 'active', 'sold', 'archived'].includes(status)
        ? status
        : undefined) as ImportItemRow['status'],
      isNewArrival: bool('isnewarrival') ?? bool('is_new_arrival'),
      isFeatured: bool('isfeatured') ?? bool('is_featured'),
      huid: get('huid') || undefined,
      description: get('description') || undefined,
    });
  }
  return rows;
}

const boolQuery = z
  .union([z.boolean(), z.enum(['true', 'false', '1', '0'])])
  .transform((v) => v === true || v === 'true' || v === '1')
  .optional();

// --- Categories ---

catalogRouter.get('/categories', async (req, res, next) => {
  try {
    const query = z
      .object({
        parentId: z.string().optional(),
        tree: boolQuery,
        includeInactive: boolQuery,
      })
      .safeParse(req.query);
    if (!query.success) {
      return next(badRequest('VALIDATION_ERROR', 'Invalid categories query', query.error.flatten()));
    }
    const data = await listCategories({
      parentId: query.data.parentId,
      tree: query.data.tree,
      includeInactive: query.data.includeInactive,
    });
    return sendSuccess(res, data);
  } catch (err) {
    return next(err);
  }
});

catalogRouter.get('/categories/:id', async (req, res, next) => {
  try {
    const data = await getCategoryById(req.params.id);
    return sendSuccess(res, { category: data });
  } catch (err) {
    return next(err);
  }
});

catalogRouter.post('/categories', requireAdmin, async (req, res, next) => {
  try {
    const body = z
      .object({
        name: z.string().min(1).max(120),
        slug: z.string().min(1).max(120).optional(),
        coverImageUrl: z.string().url().optional(),
        parentId: z.string().nullable().optional(),
        sortOrder: z.number().int().optional(),
        isActive: z.boolean().optional(),
      })
      .safeParse(req.body);
    if (!body.success) {
      return next(badRequest('VALIDATION_ERROR', 'Invalid category payload', body.error.flatten()));
    }
    const category = await createCategory(body.data);
    return sendSuccess(res, { category }, 201);
  } catch (err) {
    return next(err);
  }
});

catalogRouter.patch('/categories/:id', requireAdmin, async (req, res, next) => {
  try {
    const body = z
      .object({
        name: z.string().min(1).max(120).optional(),
        slug: z.string().min(1).max(120).optional(),
        coverImageUrl: z.string().url().nullable().optional(),
        parentId: z.string().nullable().optional(),
        sortOrder: z.number().int().optional(),
        isActive: z.boolean().optional(),
      })
      .safeParse(req.body);
    if (!body.success) {
      return next(badRequest('VALIDATION_ERROR', 'Invalid category payload', body.error.flatten()));
    }
    const category = await updateCategory(req.params.id, body.data);
    return sendSuccess(res, { category });
  } catch (err) {
    return next(err);
  }
});

catalogRouter.delete('/categories/:id', requireAdmin, async (req, res, next) => {
  try {
    const data = await softDeleteCategory(req.params.id);
    return sendSuccess(res, data);
  } catch (err) {
    return next(err);
  }
});

// --- Items (public) ---

catalogRouter.get('/items', async (req, res, next) => {
  try {
    const query = z
      .object({
        categoryId: z.string().optional(),
        subcategoryId: z.string().optional(),
        q: z.string().optional(),
        purity: z.enum(['24K', '22K', '18K', 'other']).optional(),
        metal: z.enum(['gold', 'silver', 'other']).optional(),
        isNewArrival: boolQuery,
        isFeatured: boolQuery,
        limit: z.coerce.number().int().positive().max(100).optional(),
        skip: z.coerce.number().int().nonnegative().optional(),
      })
      .safeParse(req.query);
    if (!query.success) {
      return next(badRequest('VALIDATION_ERROR', 'Invalid items query', query.error.flatten()));
    }
    const data = await listItems({ ...query.data, publicOnly: true });
    return sendSuccess(res, data);
  } catch (err) {
    return next(err);
  }
});

catalogRouter.get('/items/sku/:sku', async (req, res, next) => {
  try {
    const item = await getItemBySku(req.params.sku, { publicOnly: true });
    return sendSuccess(res, { item });
  } catch (err) {
    return next(err);
  }
});

catalogRouter.get('/items/:id', async (req, res, next) => {
  try {
    const item = await getItemById(req.params.id, { publicOnly: true, incrementView: true });
    return sendSuccess(res, { item });
  } catch (err) {
    return next(err);
  }
});

// --- Items (admin) ---

catalogRouter.get('/admin/items', requireAdmin, async (req, res, next) => {
  try {
    const query = z
      .object({
        categoryId: z.string().optional(),
        subcategoryId: z.string().optional(),
        q: z.string().optional(),
        purity: z.enum(['24K', '22K', '18K', 'other']).optional(),
        metal: z.enum(['gold', 'silver', 'other']).optional(),
        isNewArrival: boolQuery,
        isFeatured: boolQuery,
        status: z.enum(['draft', 'active', 'sold', 'archived']).optional(),
        includeDeleted: boolQuery,
        limit: z.coerce.number().int().positive().max(100).optional(),
        skip: z.coerce.number().int().nonnegative().optional(),
      })
      .safeParse(req.query);
    if (!query.success) {
      return next(badRequest('VALIDATION_ERROR', 'Invalid admin items query', query.error.flatten()));
    }
    const data = await listItems({ ...query.data, publicOnly: false });
    return sendSuccess(res, data);
  } catch (err) {
    return next(err);
  }
});

catalogRouter.get('/admin/items/:id', requireAdmin, async (req, res, next) => {
  try {
    const item = await getItemById(req.params.id, { publicOnly: false, incrementView: false });
    return sendSuccess(res, { item });
  } catch (err) {
    return next(err);
  }
});

catalogRouter.post('/items', requireAdmin, async (req, res, next) => {
  try {
    const body = z
      .object({
        sku: z.string().min(1).max(64),
        title: z.string().min(1).max(200),
        description: z.string().max(5000).optional(),
        categoryId: z.string().min(1),
        subcategoryId: z.string().nullable().optional(),
        images: z.array(imageSchema).optional(),
        metal: z.enum(['gold', 'silver', 'other']).optional(),
        purity: z.enum(['24K', '22K', '18K', 'other']).optional(),
        huid: z.string().max(64).optional(),
        hallmarkImageUrl: z.string().url().optional(),
        grossWeightGrams: z.number().finite().nonnegative().optional(),
        netWeightGrams: z.number().finite().nonnegative().optional(),
        makingCharge: makingChargeSchema.optional(),
        stoneDetails: z.string().max(2000).optional(),
        sizeInfo: z.string().max(500).optional(),
        tags: z.array(z.string().max(40)).optional(),
        isNewArrival: z.boolean().optional(),
        isFeatured: z.boolean().optional(),
        status: z.enum(['draft', 'active', 'sold', 'archived']).optional(),
      })
      .safeParse(req.body);
    if (!body.success) {
      return next(badRequest('VALIDATION_ERROR', 'Invalid item payload', body.error.flatten()));
    }
    const item = await createItem({
      ...body.data,
      images: body.data.images?.map((img) => ({
        url: img.url,
        publicId: img.publicId ?? null,
        sortOrder: img.sortOrder ?? 0,
        isPrimary: img.isPrimary ?? false,
      })),
      adminId: req.admin!.id,
    });
    return sendSuccess(res, { item }, 201);
  } catch (err) {
    return next(err);
  }
});

catalogRouter.patch('/items/:id', requireAdmin, async (req, res, next) => {
  try {
    const body = z
      .object({
        sku: z.string().min(1).max(64).optional(),
        title: z.string().min(1).max(200).optional(),
        description: z.string().max(5000).nullable().optional(),
        categoryId: z.string().min(1).optional(),
        subcategoryId: z.string().nullable().optional(),
        images: z.array(imageSchema).optional(),
        metal: z.enum(['gold', 'silver', 'other']).optional(),
        purity: z.enum(['24K', '22K', '18K', 'other']).optional(),
        huid: z.string().max(64).nullable().optional(),
        hallmarkImageUrl: z.string().url().nullable().optional(),
        grossWeightGrams: z.number().finite().nonnegative().nullable().optional(),
        netWeightGrams: z.number().finite().nonnegative().nullable().optional(),
        makingCharge: makingChargeSchema.optional(),
        stoneDetails: z.string().max(2000).nullable().optional(),
        sizeInfo: z.string().max(500).nullable().optional(),
        tags: z.array(z.string().max(40)).optional(),
        isNewArrival: z.boolean().optional(),
        isFeatured: z.boolean().optional(),
        status: z.enum(['draft', 'active', 'sold', 'archived']).optional(),
      })
      .safeParse(req.body);
    if (!body.success) {
      return next(badRequest('VALIDATION_ERROR', 'Invalid item payload', body.error.flatten()));
    }
    const item = await updateItem(
      req.params.id,
      {
        ...body.data,
        images: body.data.images?.map((img) => ({
          url: img.url,
          publicId: img.publicId ?? null,
          sortOrder: img.sortOrder ?? 0,
          isPrimary: img.isPrimary ?? false,
        })),
      },
      req.admin!.id,
    );
    return sendSuccess(res, { item });
  } catch (err) {
    return next(err);
  }
});

catalogRouter.delete('/items/:id', requireAdmin, async (req, res, next) => {
  try {
    const data = await softDeleteItem(req.params.id, req.admin!.id);
    return sendSuccess(res, data);
  } catch (err) {
    return next(err);
  }
});

catalogRouter.post('/items/:id/clone', requireAdmin, async (req, res, next) => {
  try {
    const body = z
      .object({ sku: z.string().min(1).max(64).optional() })
      .safeParse(req.body ?? {});
    if (!body.success) {
      return next(badRequest('VALIDATION_ERROR', 'Invalid clone payload', body.error.flatten()));
    }
    const item = await cloneItem(req.params.id, req.admin!.id, body.data);
    return sendSuccess(res, { item }, 201);
  } catch (err) {
    return next(err);
  }
});

catalogRouter.post('/items/import', requireAdmin, async (req, res, next) => {
  try {
    const body = z
      .object({
        csv: z.string().min(1).max(2_000_000).optional(),
        rows: z
          .array(
            z.object({
              sku: z.string().min(1),
              title: z.string().min(1),
              categorySlug: z.string().min(1),
              subcategorySlug: z.string().optional(),
              metal: z.enum(['gold', 'silver', 'other']).optional(),
              purity: z.enum(['24K', '22K', '18K', 'other']).optional(),
              netWeightGrams: z.number().finite().nonnegative().optional(),
              grossWeightGrams: z.number().finite().nonnegative().optional(),
              status: z.enum(['draft', 'active', 'sold', 'archived']).optional(),
              isNewArrival: z.boolean().optional(),
              isFeatured: z.boolean().optional(),
              huid: z.string().optional(),
              description: z.string().optional(),
            }),
          )
          .optional(),
      })
      .safeParse(req.body);
    if (!body.success) {
      return next(badRequest('VALIDATION_ERROR', 'Invalid import payload', body.error.flatten()));
    }

    let rows: ImportItemRow[] = body.data.rows ?? [];
    if ((!rows.length) && body.data.csv) {
      rows = parseItemsCsv(body.data.csv);
    }
    const result = await importItemsCsv(rows, req.admin!.id);
    return sendSuccess(res, result);
  } catch (err) {
    return next(err);
  }
});

catalogRouter.post('/items/:id/restore', requireAdmin, async (req, res, next) => {
  try {
    const item = await restoreItem(req.params.id, req.admin!.id);
    return sendSuccess(res, { item });
  } catch (err) {
    return next(err);
  }
});

catalogRouter.get('/admin/dashboard', requireAdmin, async (_req, res, next) => {
  try {
    const data = await getAdminDashboard();
    return sendSuccess(res, data);
  } catch (err) {
    return next(err);
  }
});
