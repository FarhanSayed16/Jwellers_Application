/**
 * Phase 26 gate — Ratnaraj provisioning: tokens/intake branding, modules flags,
 * catalog CSV load path, rates, public about/contact, owner login.
 */
import fs from 'node:fs';
import path from 'node:path';
import bcrypt from 'bcryptjs';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import { createApp } from '../app';
import { env } from '../config/env';
import { connectMongo, disconnectMongo } from '../db/connection';
import {
  ensureAllModelsLoaded,
  AdminUserModel,
  ShopConfigModel,
  CategoryModel,
  ItemModel,
  RateModel,
} from '../db/models';
import { importItemsCsv, type ImportItemRow } from '../modules/catalog/items.service';

function loadJson<T>(relParts: string[]): T {
  const candidates = [
    path.resolve(process.cwd(), ...relParts),
    path.resolve(__dirname, '../../../../', ...relParts),
  ];
  const file = candidates.find((p) => fs.existsSync(p));
  if (!file) throw new Error(`Missing ${relParts.join('/')}`);
  return JSON.parse(fs.readFileSync(file, 'utf8')) as T;
}

function loadCsv(): string {
  const candidates = [
    path.resolve(process.cwd(), '../../clients/ratnaraj/catalog/items.csv'),
    path.resolve(__dirname, '../../../../clients/ratnaraj/catalog/items.csv'),
  ];
  const file = candidates.find((p) => fs.existsSync(p));
  if (!file) throw new Error('items.csv missing');
  return fs.readFileSync(file, 'utf8');
}

function parseCsv(csv: string): ImportItemRow[] {
  const lines = csv
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
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

async function main() {
  const memory = await MongoMemoryServer.create();
  process.env.MONGODB_URI = memory.getUri();
  (env as { CLIENT_SLUG: string }).CLIENT_SLUG = 'ratnaraj';

  const modules = loadJson<{ features: Record<string, boolean> }>([
    'clients',
    'ratnaraj',
    'modules.json',
  ]);
  const tokens = loadJson<{ shopName: string; themeLight: Record<string, string> }>([
    'clients',
    'ratnaraj',
    'branding',
    'tokens.json',
  ]);
  const intake = loadJson<{
    displayName: string;
    contactPhone: string;
    contactEmail: string;
    address: { line1: string; city: string };
    gstPercentDefault: number;
  }>(['clients', 'ratnaraj', 'intake.json']);

  // Align feature flags with signed quote modules
  for (const [key, value] of Object.entries(modules.features)) {
    const envKey = key as keyof typeof env;
    (env as Record<string, unknown>)[envKey] = value;
  }
  (env as { FEATURE_HALLMARK: boolean }).FEATURE_HALLMARK = true;

  await connectMongo(memory.getUri());
  await ensureAllModelsLoaded();

  const password = 'ChangeMeOwner1!';
  await AdminUserModel.create({
    name: 'Ratnaraj Owner',
    email: 'owner@ratnaraj.jewellers.local',
    phone: '9999999999',
    passwordHash: await bcrypt.hash(password, 12),
    role: 'owner',
    isActive: true,
  });

  await ShopConfigModel.create({
    shopName: intake.displayName,
    logoUrl: '',
    contactPhone: intake.contactPhone,
    contactEmail: intake.contactEmail,
    address: {
      line1: intake.address.line1,
      city: intake.address.city,
      state: 'MH',
      pincode: '400001',
      country: 'India',
    },
    themeLight: tokens.themeLight,
    themeDark: tokens.themeLight,
    makingChargeDefault: { type: 'percent', value: 12 },
    gstPercentDefault: intake.gstPercentDefault,
    socialLinks: { whatsapp: intake.contactPhone },
    isActive: true,
  });

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

  const owner = await AdminUserModel.findOne({ role: 'owner' });
  const imported = await importItemsCsv(parseCsv(loadCsv()), String(owner!._id));
  if (imported.created < 10) {
    throw new Error(`expected ≥10 items created, got ${JSON.stringify(imported)}`);
  }
  console.log('[verify:phase26] catalog CSV import OK', imported);

  await RateModel.create({
    gold24kPerGram: 7800,
    gold22kPerGram: 7150,
    gold18kPerGram: 5850,
    silverPerGram: 98,
    note: 'Phase26',
    effectiveAt: new Date(),
    source: 'manual',
    createdBy: owner!._id,
  });

  const app = createApp();

  const login = await request(app)
    .post('/api/v1/auth/admin/login')
    .send({ emailOrPhone: 'owner@ratnaraj.jewellers.local', password });
  if (login.status !== 200 || !login.body.data?.accessToken) {
    throw new Error(`owner login failed: ${JSON.stringify(login.body)}`);
  }
  console.log('[verify:phase26] owner admin login OK');

  const pub = await request(app).get('/api/v1/config/public');
  if (pub.status !== 200) throw new Error(`public config: ${JSON.stringify(pub.body)}`);
  if (pub.body.data.clientSlug !== 'ratnaraj') {
    throw new Error(`expected ratnaraj slug, got ${pub.body.data.clientSlug}`);
  }
  if (pub.body.data.shopName !== 'Ratnaraj Jewellers') {
    throw new Error(`shopName: ${pub.body.data.shopName}`);
  }
  if (pub.body.data.themeLight?.primary !== tokens.themeLight.primary) {
    throw new Error(`theme primary mismatch: ${pub.body.data.themeLight?.primary}`);
  }
  if (pub.body.data.contactPhone !== intake.contactPhone) {
    throw new Error('contact phone missing on public config');
  }
  if (pub.body.data.address?.line1 !== intake.address.line1) {
    throw new Error('address missing on public config');
  }
  console.log('[verify:phase26] branding + about/contact on public config OK');

  const features = await request(app).get('/api/v1/config/features');
  if (!features.body.data.chat || !features.body.data.hallmark || !features.body.data.offers) {
    throw new Error(`features mismatch modules.json: ${JSON.stringify(features.body.data)}`);
  }
  console.log('[verify:phase26] feature flags match quote modules OK');

  const rates = await request(app).get('/api/v1/rates/latest');
  if (rates.status !== 200 || !rates.body.data?.rate) {
    throw new Error(`rates: ${JSON.stringify(rates.body)}`);
  }
  console.log('[verify:phase26] opening rates OK');

  const items = await request(app).get('/api/v1/items').query({ limit: 50 });
  const list = (items.body.data?.items ?? []) as Array<{ sku: string }>;
  if (list.length < 10) throw new Error(`public items too few: ${list.length}`);
  if (!list.some((i) => i.sku === 'RR-EAR-001')) {
    throw new Error('RR-EAR-001 missing from public catalog');
  }
  const activeCount = await ItemModel.countDocuments({ status: 'active', deletedAt: null });
  if (activeCount < 10) throw new Error(`active items ${activeCount}`);
  console.log('[verify:phase26] catalog data load OK', { public: list.length, activeCount });

  console.log('[verify:phase26] ALL PASSED — Ratnaraj provisioning engineering gate green');
  await disconnectMongo();
  await memory.stop();
  process.exit(0);
}

main().catch(async (err) => {
  console.error('[verify:phase26] FAILED', err);
  await disconnectMongo().catch(() => undefined);
  process.exit(1);
});
