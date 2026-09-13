/**
 * Seed Ratnaraj categories + CSV items + opening rates.
 * Idempotent: skips existing category slugs / SKUs / rates.
 *
 *   CLIENT_SLUG=ratnaraj npm run seed:ratnaraj-catalog -w @jwellers/api
 */
import fs from 'node:fs';
import path from 'node:path';
import bcrypt from 'bcryptjs';
import { connectMongo, disconnectMongo } from '../db/connection';
import {
  ensureAllModelsLoaded,
  CategoryModel,
  ItemModel,
  RateModel,
  AdminUserModel,
} from '../db/models';
import { env } from '../config/env';
import { importItemsCsv, type ImportItemRow } from '../modules/catalog/items.service';

function resolveCatalogCsv(): string {
  const candidates = [
    path.resolve(process.cwd(), '../../clients/ratnaraj/catalog/items.csv'),
    path.resolve(__dirname, '../../../../clients/ratnaraj/catalog/items.csv'),
  ];
  const file = candidates.find((p) => fs.existsSync(p));
  if (!file) throw new Error('clients/ratnaraj/catalog/items.csv not found');
  return file;
}

function parseCsv(csv: string): ImportItemRow[] {
  const lines = csv
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length < 2) return [];
  const headers = lines[0]!.split(',').map((h) => h.trim().toLowerCase());
  const idx = (name: string) => headers.indexOf(name);
  const rows: ImportItemRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i]!.split(',').map((c) => c.trim());
    const get = (name: string) => {
      const j = idx(name);
      return j >= 0 ? (cols[j] ?? '') : '';
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
      categorySlug: get('categoryslug'),
      subcategorySlug: get('subcategoryslug') || undefined,
      metal: (['gold', 'silver', 'other'].includes(metal)
        ? metal
        : undefined) as ImportItemRow['metal'],
      purity: (['24K', '22K', '18K', 'other'].includes(purity)
        ? purity
        : undefined) as ImportItemRow['purity'],
      netWeightGrams: num('netweightgrams'),
      grossWeightGrams: num('grossweightgrams'),
      status: (['draft', 'active', 'sold', 'archived'].includes(status)
        ? status
        : undefined) as ImportItemRow['status'],
      isNewArrival: bool('isnewarrival'),
      isFeatured: bool('isfeatured'),
      huid: get('huid') || undefined,
      description: get('description') || undefined,
    });
  }
  return rows;
}

async function upsertCategory(input: {
  name: string;
  slug: string;
  parentId?: string | null;
  sortOrder: number;
}) {
  const existing = await CategoryModel.findOne({ slug: input.slug, deletedAt: null });
  if (existing) return existing;
  return CategoryModel.create({
    name: input.name,
    slug: input.slug,
    parentId: input.parentId || null,
    sortOrder: input.sortOrder,
    isActive: true,
  });
}

async function ensureAdminId(): Promise<string> {
  const owner =
    (await AdminUserModel.findOne({ role: 'owner', isActive: true })) ||
    (await AdminUserModel.create({
      name: 'Ratnaraj Owner',
      email: process.env.SEED_OWNER_EMAIL ?? 'owner@ratnaraj.jewellers.local',
      phone: process.env.SEED_OWNER_PHONE ?? '9999999999',
      passwordHash: await bcrypt.hash(process.env.SEED_OWNER_PASSWORD ?? 'ChangeMeOwner1!', 12),
      role: 'owner',
      isActive: true,
    }));
  return String(owner._id);
}

async function main() {
  if (env.CLIENT_SLUG !== 'ratnaraj') {
    console.warn(
      `[seed:ratnaraj-catalog] CLIENT_SLUG=${env.CLIENT_SLUG} — expected ratnaraj. Continuing.`,
    );
  }

  await connectMongo();
  await ensureAllModelsLoaded();

  const earrings = await upsertCategory({ name: 'Earrings', slug: 'earrings', sortOrder: 0 });
  const necklaces = await upsertCategory({ name: 'Necklaces', slug: 'necklaces', sortOrder: 1 });
  const bangles = await upsertCategory({ name: 'Bangles', slug: 'bangles', sortOrder: 2 });
  const rings = await upsertCategory({ name: 'Rings', slug: 'rings', sortOrder: 3 });
  const chains = await upsertCategory({ name: 'Chains', slug: 'chains', sortOrder: 4 });
  const pendants = await upsertCategory({ name: 'Pendants', slug: 'pendants', sortOrder: 5 });
  const silver = await upsertCategory({ name: 'Silver', slug: 'silver', sortOrder: 6 });

  await upsertCategory({ name: 'Bali', slug: 'bali', parentId: String(earrings._id), sortOrder: 0 });
  await upsertCategory({
    name: 'Jhumka',
    slug: 'jhumka',
    parentId: String(earrings._id),
    sortOrder: 1,
  });
  await upsertCategory({ name: 'Sets', slug: 'sets', parentId: String(necklaces._id), sortOrder: 0 });
  await upsertCategory({
    name: 'Plain',
    slug: 'bangle-plain',
    parentId: String(bangles._id),
    sortOrder: 0,
  });
  await upsertCategory({
    name: 'Plain',
    slug: 'ring-plain',
    parentId: String(rings._id),
    sortOrder: 0,
  });
  await upsertCategory({ name: 'Stone', slug: 'stone', parentId: String(rings._id), sortOrder: 1 });
  await upsertCategory({ name: 'Rope', slug: 'rope', parentId: String(chains._id), sortOrder: 0 });
  await upsertCategory({
    name: 'Plain',
    slug: 'pendant-plain',
    parentId: String(pendants._id),
    sortOrder: 0,
  });
  await upsertCategory({ name: 'Rakhi', slug: 'rakhi', parentId: String(silver._id), sortOrder: 0 });
  await upsertCategory({ name: 'Coins', slug: 'coins', parentId: String(silver._id), sortOrder: 1 });

  const csvPath = resolveCatalogCsv();
  const rows = parseCsv(fs.readFileSync(csvPath, 'utf8'));
  const adminId = await ensureAdminId();
  const result = await importItemsCsv(rows, adminId);

  const latestRate = await RateModel.findOne().sort({ effectiveAt: -1 }).exec();
  if (!latestRate) {
    await RateModel.create({
      gold24kPerGram: 7800,
      gold22kPerGram: 7150,
      gold18kPerGram: 5850,
      silverPerGram: 98,
      note: 'Ratnaraj opening rate (provisional)',
      effectiveAt: new Date(),
      source: 'manual',
      createdBy: adminId,
    });
    console.log('[seed:ratnaraj-catalog] created opening rates');
  } else {
    console.log('[seed:ratnaraj-catalog] rates already present — skip');
  }

  const itemCount = await ItemModel.countDocuments({ deletedAt: null });
  console.log('[seed:ratnaraj-catalog] done', {
    clientSlug: env.CLIENT_SLUG,
    import: result,
    itemCount,
    csv: csvPath,
  });

  await disconnectMongo();
}

main().catch(async (err) => {
  console.error('[seed:ratnaraj-catalog] failed', err);
  await disconnectMongo().catch(() => undefined);
  process.exit(1);
});
