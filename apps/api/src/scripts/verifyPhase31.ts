/**
 * Phase 31 gate — showroom bridge (QR tags, rate card, appointments, boards, store mode flags).
 */
import bcrypt from 'bcryptjs';
import fs from 'node:fs';
import path from 'node:path';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import { createApp } from '../app';
import { env } from '../config/env';
import { connectMongo, disconnectMongo } from '../db/connection';
import { ensureAllModelsLoaded, AdminUserModel, ShopConfigModel } from '../db/models';

const root = path.resolve(__dirname, '../../../../');

function mustExist(rel: string) {
  const p = path.join(root, rel);
  if (!fs.existsSync(p)) throw new Error(`missing: ${rel}`);
  return fs.readFileSync(p, 'utf8');
}

const theme = {
  primary: '#1F4B3F',
  secondary: '#3D7A6A',
  accent: '#C9A227',
  background: '#F7F5F0',
  surface: '#FFFFFF',
  textPrimary: '#14201C',
  textSecondary: '#5A6B65',
  border: '#D9D3C7',
  success: '#2E7D32',
  warning: '#ED6C02',
  error: '#C62828',
};

async function main() {
  const files = [
    'docs/phase31/31_COMPLETION_RECORD.md',
    'docs/phase31/SHOWROOM_DEMO_SCRIPT.md',
    'docs/phase31/DEEP_LINKS.md',
    'apps/api/src/modules/showroom/itemQr.routes.ts',
    'apps/api/src/modules/showroom/rateCard.routes.ts',
    'apps/api/src/modules/showroom/boards.routes.ts',
    'apps/api/src/modules/appointments/appointments.routes.ts',
    'apps/mobile/lib/features/item/item_by_sku_screen.dart',
    'apps/mobile/lib/core/router/deep_link_listener.dart',
    'apps/mobile/lib/features/appointments/appointment_book_screen.dart',
    'apps/mobile/lib/features/store/store_mode_screen.dart',
    'apps/admin/src/app/(app)/appointments/page.tsx',
    'apps/admin/src/app/(app)/boards/page.tsx',
  ];
  for (const f of files) mustExist(f);
  console.log('[verify:phase31] docs + module files OK');

  const memory = await MongoMemoryServer.create();
  process.env.MONGODB_URI = memory.getUri();
  (env as { CLIENT_SLUG: string }).CLIENT_SLUG = 'demo';
  (env as { APP_DEEP_LINK_SCHEME: string }).APP_DEEP_LINK_SCHEME = 'jwellers';
  (env as { FEATURE_ITEM_QR: boolean }).FEATURE_ITEM_QR = false;
  (env as { FEATURE_SHARE_RATE_CARD: boolean }).FEATURE_SHARE_RATE_CARD = false;
  (env as { FEATURE_APPOINTMENTS: boolean }).FEATURE_APPOINTMENTS = false;
  (env as { FEATURE_CURATED_BOARDS: boolean }).FEATURE_CURATED_BOARDS = false;
  (env as { FEATURE_STORE_MODE: boolean }).FEATURE_STORE_MODE = false;

  await connectMongo(memory.getUri());
  await ensureAllModelsLoaded();

  await AdminUserModel.create({
    name: 'Demo Owner',
    email: 'owner@demo.jewellers.local',
    phone: '9999999999',
    passwordHash: await bcrypt.hash('ChangeMeOwner1!', 12),
    role: 'owner',
    isActive: true,
  });
  await ShopConfigModel.create({
    shopName: 'Demo Jewellers',
    contactPhone: '9999999999',
    contactEmail: 'hello@demojewellers.local',
    themeLight: theme,
    themeDark: { ...theme, primary: '#5EBFAB', background: '#0E1513', surface: '#1A2420' },
    makingChargeDefault: { type: 'percent', value: 12 },
    gstPercentDefault: 3,
    isActive: true,
  });

  const app = createApp();
  const ownerLogin = await request(app)
    .post('/api/v1/auth/admin/login')
    .send({ emailOrPhone: 'owner@demo.jewellers.local', password: 'ChangeMeOwner1!' });
  if (ownerLogin.status !== 200) throw new Error(`admin login: ${JSON.stringify(ownerLogin.body)}`);
  const ownerAuth = { Authorization: `Bearer ${ownerLogin.body.data.accessToken}` };

  // Flags OFF → 403
  const tagOff = await request(app).get('/api/v1/admin/items/000000000000000000000001/print-tag').set(ownerAuth);
  if (tagOff.status !== 403) throw new Error(`itemQr off expected 403 got ${tagOff.status}`);
  const cardOff = await request(app).get('/api/v1/rates/share-card');
  if (cardOff.status !== 403) throw new Error(`shareRateCard off expected 403 got ${cardOff.status}`);
  const apptOff = await request(app)
    .post('/api/v1/appointments')
    .send({
      name: 'A',
      phone: '9876543210',
      preferredAt: new Date(Date.now() + 86400000).toISOString(),
    });
  if (apptOff.status !== 403) throw new Error(`appointments off expected 403 got ${apptOff.status}`);
  const boardsOff = await request(app).get('/api/v1/boards');
  if (boardsOff.status !== 403) throw new Error(`boards off expected 403 got ${boardsOff.status}`);
  console.log('[verify:phase31] flags OFF → 403 OK');

  (env as { FEATURE_ITEM_QR: boolean }).FEATURE_ITEM_QR = true;
  (env as { FEATURE_SHARE_RATE_CARD: boolean }).FEATURE_SHARE_RATE_CARD = true;
  (env as { FEATURE_APPOINTMENTS: boolean }).FEATURE_APPOINTMENTS = true;
  (env as { FEATURE_CURATED_BOARDS: boolean }).FEATURE_CURATED_BOARDS = true;
  (env as { FEATURE_STORE_MODE: boolean }).FEATURE_STORE_MODE = true;

  const rate = await request(app)
    .post('/api/v1/rates')
    .set(ownerAuth)
    .send({
      gold24kPerGram: 7500,
      gold22kPerGram: 6900,
      gold18kPerGram: 5650,
      silverPerGram: 95,
      note: 'Phase31',
      force: true,
    });
  if (rate.status !== 201) throw new Error(`rate: ${JSON.stringify(rate.body)}`);

  const cat = await request(app)
    .post('/api/v1/categories')
    .set(ownerAuth)
    .send({ name: 'Gold', slug: 'gold', sortOrder: 0 });
  if (cat.status !== 201) throw new Error(`category: ${JSON.stringify(cat.body)}`);
  const categoryId = cat.body.data.category.id as string;

  const item = await request(app)
    .post('/api/v1/items')
    .set(ownerAuth)
    .send({
      sku: 'DEMO-QR-001',
      title: 'QR Demo Ring',
      categoryId,
      status: 'active',
      metal: 'gold',
      purity: '22K',
      grossWeightGrams: 4.2,
      netWeightGrams: 4.0,
    });
  if (item.status !== 201) throw new Error(`item: ${JSON.stringify(item.body)}`);
  const itemId = item.body.data.item.id as string;

  const bySku = await request(app).get('/api/v1/items/sku/DEMO-QR-001');
  if (bySku.status !== 200 || bySku.body.data.item.sku !== 'DEMO-QR-001') {
    throw new Error(`sku lookup: ${JSON.stringify(bySku.body)}`);
  }

  const tag = await request(app).get(`/api/v1/admin/items/${itemId}/print-tag`).set(ownerAuth);
  if (tag.status !== 200) throw new Error(`print-tag: ${JSON.stringify(tag.body)}`);
  const t = tag.body.data.tag;
  if (!t.deepLink?.includes('jwellers://items/sku/DEMO-QR-001')) {
    throw new Error(`bad deepLink: ${t.deepLink}`);
  }
  if (!t.qrDataUrl?.startsWith('data:image') || !String(t.tagHtml).includes('DEMO-QR-001')) {
    throw new Error('print tag missing QR or SKU html');
  }
  console.log('[verify:phase31] QR print tag + SKU deep link OK');

  const card = await request(app).get('/api/v1/rates/share-card');
  if (card.status !== 200 || !card.body.data.card?.shareText || !card.body.data.card?.html) {
    throw new Error(`share-card: ${JSON.stringify(card.body)}`);
  }
  console.log('[verify:phase31] share rate card OK');

  const preferredAt = new Date(Date.now() + 2 * 86400000).toISOString();
  const appt = await request(app).post('/api/v1/appointments').send({
    name: 'Walk-in Guest',
    phone: '9123456780',
    preferredAt,
    note: 'Bridal consult',
  });
  if (appt.status !== 201) throw new Error(`appointment: ${JSON.stringify(appt.body)}`);
  const list = await request(app).get('/api/v1/admin/appointments').set(ownerAuth);
  if (list.status !== 200 || !list.body.data.appointments?.length) {
    throw new Error('admin appointments list failed');
  }
  const apptId = appt.body.data.appointment.id as string;
  const patch = await request(app)
    .patch(`/api/v1/admin/appointments/${apptId}`)
    .set(ownerAuth)
    .send({ status: 'confirmed' });
  if (patch.status !== 200 || patch.body.data.appointment.status !== 'confirmed') {
    throw new Error(`appt patch: ${JSON.stringify(patch.body)}`);
  }
  console.log('[verify:phase31] appointments OK');

  const board = await request(app)
    .post('/api/v1/admin/boards')
    .set(ownerAuth)
    .send({ title: 'Bridal picks', itemIds: [itemId], sortOrder: 0 });
  if (board.status !== 201) throw new Error(`board create: ${JSON.stringify(board.body)}`);
  const publicBoards = await request(app).get('/api/v1/boards');
  if (publicBoards.status !== 200 || publicBoards.body.data.boards?.[0]?.items?.length !== 1) {
    throw new Error(`public boards: ${JSON.stringify(publicBoards.body)}`);
  }
  console.log('[verify:phase31] curated boards OK');

  const features = await request(app).get('/api/v1/config/features');
  const f = features.body.data;
  for (const key of ['itemQr', 'shareRateCard', 'appointments', 'storeMode', 'curatedBoards']) {
    if (!f[key]) throw new Error(`public features missing ${key}`);
  }
  if (f.deepLinkScheme !== 'jwellers') throw new Error('deepLinkScheme missing');
  console.log('[verify:phase31] public features OK');

  const manifest = mustExist('apps/mobile/android/app/src/main/AndroidManifest.xml');
  if (!manifest.includes('android:scheme="jwellers"') || !manifest.includes('pathPrefix="/sku"')) {
    throw new Error('AndroidManifest missing jwellers deep-link intent-filter');
  }
  console.log('[verify:phase31] Android deep-link intent-filter OK');

  await disconnectMongo();
  await memory.stop();
  console.log('[verify:phase31] ALL PASSED — Showroom bridge gate green');
}

main().catch(async (err) => {
  console.error('[verify:phase31] FAILED', err);
  await disconnectMongo().catch(() => undefined);
  process.exit(1);
});
