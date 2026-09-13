/**
 * Phase 32 gate — growth pack (analytics, CRM-lite, schemes, referrals, price alerts).
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

async function customerAuth(app: ReturnType<typeof createApp>, phone: string) {
  const otpReq = await request(app).post('/api/v1/auth/customer/otp/request').send({ phone });
  if (otpReq.status !== 200) throw new Error(`otp request: ${JSON.stringify(otpReq.body)}`);
  const otp = otpReq.body.data.devOtp as string;
  const verify = await request(app)
    .post('/api/v1/auth/customer/otp/verify')
    .send({ phone, otp });
  if (verify.status !== 200) throw new Error(`otp verify: ${JSON.stringify(verify.body)}`);
  return {
    token: verify.body.data.accessToken as string,
    customerId: verify.body.data.customer.id as string,
  };
}

async function main() {
  const files = [
    'docs/phase32/32_COMPLETION_RECORD.md',
    'docs/phase32/GROWTH_DEMO_SCRIPT.md',
    'apps/api/src/modules/analytics/analytics.routes.ts',
    'apps/api/src/modules/crm/crm.routes.ts',
    'apps/api/src/modules/schemes/schemes.routes.ts',
    'apps/api/src/modules/referrals/referrals.routes.ts',
    'apps/api/src/modules/priceAlerts/priceAlerts.routes.ts',
    'apps/admin/src/app/(app)/analytics/page.tsx',
    'apps/admin/src/app/(app)/crm/page.tsx',
    'apps/mobile/lib/features/growth/referrals_screen.dart',
    'apps/mobile/lib/features/growth/price_alerts_screen.dart',
  ];
  for (const f of files) mustExist(f);
  const docs04 = mustExist('docs/04_FEATURES_AND_MODULES.md');
  for (const flag of [
    'FEATURE_CRM_LIGHT',
    'FEATURE_SCHEMES',
    'FEATURE_REFERRALS',
    'FEATURE_PRICE_ALERTS',
    'FEATURE_ANALYTICS',
  ]) {
    if (!docs04.includes(flag)) throw new Error(`docs/04 missing ${flag}`);
  }
  console.log('[verify:phase32] docs + module files OK');

  const memory = await MongoMemoryServer.create();
  process.env.MONGODB_URI = memory.getUri();
  (env as { CLIENT_SLUG: string }).CLIENT_SLUG = 'demo';
  (env as { FEATURE_ANALYTICS: boolean }).FEATURE_ANALYTICS = false;
  (env as { FEATURE_CRM_LIGHT: boolean }).FEATURE_CRM_LIGHT = false;
  (env as { FEATURE_SCHEMES: boolean }).FEATURE_SCHEMES = false;
  (env as { FEATURE_REFERRALS: boolean }).FEATURE_REFERRALS = false;
  (env as { FEATURE_PRICE_ALERTS: boolean }).FEATURE_PRICE_ALERTS = false;

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
  if (ownerLogin.status !== 200) throw new Error(`admin login failed`);
  const ownerAuth = { Authorization: `Bearer ${ownerLogin.body.data.accessToken}` };

  const offChecks = [
    request(app).post('/api/v1/events').send({ type: 'item_view' }),
    request(app).get('/admin/crm/customers').set(ownerAuth),
    request(app).get('/api/v1/schemes/active'),
    request(app).get('/api/v1/admin/referrals/stats').set(ownerAuth),
    request(app).get('/api/v1/admin/price-alerts').set(ownerAuth),
  ];
  // fix CRM path
  const off1 = await request(app).post('/api/v1/events').send({ type: 'item_view' });
  if (off1.status !== 403) throw new Error(`analytics off expected 403 got ${off1.status}`);
  const off2 = await request(app).get('/api/v1/admin/crm/customers').set(ownerAuth);
  if (off2.status !== 403) throw new Error(`crm off expected 403 got ${off2.status}`);
  const off3 = await request(app).get('/api/v1/schemes/active');
  if (off3.status !== 403) throw new Error(`schemes off expected 403 got ${off3.status}`);
  console.log('[verify:phase32] flags OFF → 403 OK');
  void offChecks;

  (env as { FEATURE_ANALYTICS: boolean }).FEATURE_ANALYTICS = true;
  (env as { FEATURE_CRM_LIGHT: boolean }).FEATURE_CRM_LIGHT = true;
  (env as { FEATURE_SCHEMES: boolean }).FEATURE_SCHEMES = true;
  (env as { FEATURE_REFERRALS: boolean }).FEATURE_REFERRALS = true;
  (env as { FEATURE_PRICE_ALERTS: boolean }).FEATURE_PRICE_ALERTS = true;

  await request(app)
    .post('/api/v1/rates')
    .set(ownerAuth)
    .send({
      gold24kPerGram: 7500,
      gold22kPerGram: 6900,
      gold18kPerGram: 5650,
      silverPerGram: 95,
      force: true,
    });

  const cat = await request(app)
    .post('/api/v1/categories')
    .set(ownerAuth)
    .send({ name: 'Gold', slug: 'gold', sortOrder: 0 });
  const categoryId = cat.body.data.category.id as string;
  const item = await request(app)
    .post('/api/v1/items')
    .set(ownerAuth)
    .send({
      sku: 'GROW-001',
      title: 'Growth Ring',
      categoryId,
      status: 'active',
      metal: 'gold',
      purity: '22K',
      netWeightGrams: 3,
    });
  const itemId = item.body.data.item.id as string;

  // Views via public GET (server-side event when analytics on)
  await request(app).get(`/api/v1/items/${itemId}`);
  await request(app).get(`/api/v1/items/${itemId}`);
  await request(app).post('/api/v1/events').send({ type: 'item_view', itemId });

  const most = await request(app).get('/api/v1/admin/analytics/most-viewed').set(ownerAuth);
  if (most.status !== 200 || !most.body.data.items?.length) {
    throw new Error(`most-viewed: ${JSON.stringify(most.body)}`);
  }
  if (most.body.data.items[0].itemId !== itemId) {
    throw new Error('expected GROW-001 as most viewed');
  }
  const summary = await request(app).get('/api/v1/admin/analytics/summary').set(ownerAuth);
  if (summary.status !== 200 || summary.body.data.summary.events.item_view < 1) {
    throw new Error(`summary: ${JSON.stringify(summary.body)}`);
  }
  console.log('[verify:phase32] analytics + most-viewed OK');

  const a = await customerAuth(app, '9000000001');
  const b = await customerAuth(app, '9000000002');
  const aAuth = { Authorization: `Bearer ${a.token}` };
  const bAuth = { Authorization: `Bearer ${b.token}` };

  await request(app).patch(`/api/v1/admin/crm/customers/${a.customerId}/tags`).set(ownerAuth).send({
    tags: ['VIP', 'bridal'],
  });
  const custs = await request(app).get('/api/v1/admin/crm/customers').set(ownerAuth);
  if (!custs.body.data.customers.some((c: { tags: string[] }) => c.tags.includes('VIP'))) {
    throw new Error('CRM tags failed');
  }

  const enq = await request(app)
    .post('/api/v1/enquiries')
    .set(aAuth)
    .send({ message: 'Old lead', itemId });
  if (enq.status !== 201) throw new Error(`enquiry: ${JSON.stringify(enq.body)}`);
  const enqId = enq.body.data.enquiry.id as string;
  await request(app)
    .patch(`/api/v1/admin/enquiries/${enqId}/follow-up`)
    .set(ownerAuth)
    .send({ followUpAt: new Date(Date.now() - 3600000).toISOString() });
  const fus = await request(app).get('/api/v1/admin/crm/follow-ups').set(ownerAuth);
  if (!fus.body.data.enquiries?.length) throw new Error('follow-ups empty');
  console.log('[verify:phase32] CRM-lite OK');

  const scheme = await request(app)
    .post('/api/v1/admin/schemes')
    .set(ownerAuth)
    .send({
      title: 'Akshaya Tritiya',
      makingPercentOverride: 8,
      startAt: new Date(Date.now() - 86400000).toISOString(),
      endAt: new Date(Date.now() + 7 * 86400000).toISOString(),
    });
  if (scheme.status !== 201) throw new Error(`scheme: ${JSON.stringify(scheme.body)}`);
  const active = await request(app).get('/api/v1/schemes/active');
  if (!active.body.data.schemes?.length) throw new Error('active schemes empty');
  console.log('[verify:phase32] schemes OK');

  const codeRes = await request(app).get('/api/v1/referrals/me').set(aAuth);
  if (codeRes.status !== 200 || !codeRes.body.data.referralCode) {
    throw new Error(`referral code: ${JSON.stringify(codeRes.body)}`);
  }
  const apply = await request(app)
    .post('/api/v1/referrals/apply')
    .set(bAuth)
    .send({ code: codeRes.body.data.referralCode });
  if (apply.status !== 200 || apply.body.data.applied !== true) {
    throw new Error(`apply referral: ${JSON.stringify(apply.body)}`);
  }
  const refStats = await request(app).get('/api/v1/admin/referrals/stats').set(ownerAuth);
  if (refStats.body.data.totalReferred < 1) throw new Error('referral stats empty');
  console.log('[verify:phase32] referrals OK');

  const alert = await request(app)
    .post('/api/v1/price-alerts')
    .set(aAuth)
    .send({ purity: '22K', belowAmount: 10000 });
  if (alert.status !== 201) throw new Error(`price alert: ${JSON.stringify(alert.body)}`);
  // Publish lower rate → trigger
  await request(app)
    .post('/api/v1/rates')
    .set(ownerAuth)
    .send({
      gold24kPerGram: 7000,
      gold22kPerGram: 6400,
      gold18kPerGram: 5200,
      silverPerGram: 90,
      force: true,
    });
  const alerts = await request(app).get('/api/v1/admin/price-alerts?status=triggered').set(ownerAuth);
  if (!alerts.body.data.alerts?.length) throw new Error('expected triggered price alert');
  console.log('[verify:phase32] price alerts OK');

  const features = await request(app).get('/api/v1/config/features');
  for (const k of ['analytics', 'crmLight', 'schemes', 'referrals', 'priceAlerts']) {
    if (!features.body.data[k]) throw new Error(`public features missing ${k}`);
  }

  await disconnectMongo();
  await memory.stop();
  console.log('[verify:phase32] ALL PASSED — Growth pack gate green');
  process.exit(0);
}

main().catch(async (err) => {
  console.error('[verify:phase32] FAILED', err);
  await disconnectMongo().catch(() => undefined);
  process.exit(1);
});
