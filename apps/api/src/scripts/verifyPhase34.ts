/**
 * Phase 34 gate — premium messaging (WA Business) + rate API.
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
    'docs/phase34/34_COMPLETION_RECORD.md',
    'docs/phase34/BSP_SETUP_GUIDE.md',
    'docs/phase34/PREMIUM_DEMO_SCRIPT.md',
    'docs/phase34/RATE_API_COST_DISCLOSURE.md',
    'apps/api/src/modules/rates/rateApi.service.ts',
    'apps/api/src/modules/whatsappBusiness/whatsappBusiness.routes.ts',
    'apps/api/src/modules/whatsappBusiness/whatsappBusiness.service.ts',
    'apps/api/src/db/models/WaBroadcast.ts',
  ];
  for (const f of files) mustExist(f);

  const rateForm = mustExist('apps/admin/src/components/rates/RateForm.tsx');
  if (!rateForm.includes('fetch-suggest') || !rateForm.includes('whatsapp-business/broadcast/rates')) {
    throw new Error('RateForm missing premium rate API / WA broadcast hooks');
  }
  const offersAdmin = mustExist('apps/admin/src/components/offers/OffersAdmin.tsx');
  if (!offersAdmin.includes('whatsapp-business/broadcast/offer')) {
    throw new Error('OffersAdmin missing WA offer broadcast');
  }

  const demoModules = JSON.parse(mustExist('clients/demo/modules.json')) as {
    features: Record<string, boolean>;
  };
  if (!demoModules.features.FEATURE_RATE_API) {
    throw new Error('Demo modules.json must enable FEATURE_RATE_API');
  }
  if (!demoModules.features.FEATURE_WHATSAPP_BUSINESS_API) {
    throw new Error('Demo modules.json must enable FEATURE_WHATSAPP_BUSINESS_API');
  }

  const quote = mustExist('docs/commercial/QUOTE_TEMPLATE.md');
  if (!quote.includes('FEATURE_RATE_API') || !quote.includes('FEATURE_WHATSAPP_BUSINESS_API')) {
    throw new Error('QUOTE_TEMPLATE missing premium module flags');
  }
  if (!quote.includes('25,000') || !quote.includes('35,000')) {
    throw new Error('QUOTE_TEMPLATE missing premium module ₹ prices');
  }
  const costs = mustExist('docs/commercial/RUNNING_COSTS.md');
  if (!costs.includes('WhatsApp Business') && !costs.includes('BSP')) {
    throw new Error('RUNNING_COSTS missing BSP / WA Business line');
  }
  const amc = mustExist('docs/commercial/AMC_TIERS.md');
  if (!amc.includes('25,000') || !amc.includes('45,000') || !amc.includes('75,000')) {
    throw new Error('AMC_TIERS missing suggested ₹ prices');
  }

  console.log('[verify:phase34] docs + demo flags + pricing OK');

  const memory = await MongoMemoryServer.create();
  process.env.MONGODB_URI = memory.getUri();
  (env as { CLIENT_SLUG: string }).CLIENT_SLUG = 'demo';
  (env as { FEATURE_RATE_API: boolean }).FEATURE_RATE_API = false;
  (env as { FEATURE_WHATSAPP_BUSINESS_API: boolean }).FEATURE_WHATSAPP_BUSINESS_API = false;
  (env as { RATE_API_PROVIDER: string }).RATE_API_PROVIDER = 'mock';
  (env as { WA_BSP_DRY_RUN: boolean }).WA_BSP_DRY_RUN = true;

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
    rateApi: { marginPercentGold: 2, marginPercentSilver: 3 },
    isActive: true,
  });

  const app = createApp();
  const ownerLogin = await request(app)
    .post('/api/v1/auth/admin/login')
    .send({ emailOrPhone: 'owner@demo.jewellers.local', password: 'ChangeMeOwner1!' });
  if (ownerLogin.status !== 200) throw new Error(`admin login failed`);
  const ownerAuth = { Authorization: `Bearer ${ownerLogin.body.data.accessToken}` };

  const off1 = await request(app).post('/api/v1/admin/rates/fetch-suggest').set(ownerAuth);
  if (off1.status !== 403) throw new Error(`rateApi off expected 403 got ${off1.status}`);
  const off2 = await request(app)
    .post('/api/v1/admin/whatsapp-business/broadcast/rates')
    .set(ownerAuth);
  if (off2.status !== 403) throw new Error(`wa business off expected 403 got ${off2.status}`);
  console.log('[verify:phase34] flags OFF → 403 OK');

  (env as { FEATURE_RATE_API: boolean }).FEATURE_RATE_API = true;
  (env as { FEATURE_WHATSAPP_BUSINESS_API: boolean }).FEATURE_WHATSAPP_BUSINESS_API = true;

  const settings = await request(app).get('/api/v1/admin/rates/api-settings').set(ownerAuth);
  if (settings.status !== 200) throw new Error(`api-settings ${settings.status}`);
  if (!String(settings.body.data.settings.costDisclosure || '').includes('Client')) {
    throw new Error('api-settings missing cost disclosure');
  }

  const suggest = await request(app).post('/api/v1/admin/rates/fetch-suggest').set(ownerAuth);
  if (suggest.status !== 200) throw new Error(`fetch-suggest ${suggest.status} ${JSON.stringify(suggest.body)}`);
  const suggested = suggest.body.data.suggestion.suggested;
  const expected22 = Math.round(6840 * 1.02 * 100) / 100;
  if (Math.abs(suggested.gold22kPerGram - expected22) > 0.05) {
    throw new Error(`expected margin on 22k got ${suggested.gold22kPerGram} want ~${expected22}`);
  }

  const published = await request(app)
    .post('/api/v1/admin/rates/publish-from-api')
    .set(ownerAuth)
    .send({ ...suggested, force: true });
  if (published.status !== 201) {
    throw new Error(`publish-from-api ${published.status} ${JSON.stringify(published.body)}`);
  }
  if (published.body.data.rate.source !== 'api') {
    throw new Error('published rate source should be api');
  }

  // Fallback path
  (env as { RATE_API_PROVIDER: string }).RATE_API_PROVIDER = 'fail';
  const fallback = await request(app).post('/api/v1/admin/rates/fetch-suggest').set(ownerAuth);
  if (fallback.status !== 200) throw new Error(`fallback suggest ${fallback.status}`);
  if (!fallback.body.data.suggestion.fallbackUsed) {
    throw new Error('expected fallbackUsed=true when provider=fail');
  }
  (env as { RATE_API_PROVIDER: string }).RATE_API_PROVIDER = 'mock';

  const offer = await request(app)
    .post('/api/v1/admin/offers')
    .set(ownerAuth)
    .send({ title: 'Diwali special', description: 'Making charge offer', isActive: true });
  if (offer.status !== 201 && offer.status !== 200) {
    // offers path may be /admin/offers
  }
  let offerId = offer.body?.data?.offer?.id as string | undefined;
  if (!offerId) {
    const alt = await request(app)
      .post('/api/v1/admin/offers')
      .set(ownerAuth)
      .send({ title: 'Diwali special', isActive: true });
    offerId = alt.body?.data?.offer?.id;
    if (!offerId) {
      // try list after create via different shape
      const listed = await request(app).get('/api/v1/admin/offers').set(ownerAuth);
      offerId = listed.body?.data?.offers?.[0]?.id;
    }
  }

  const rateBc = await request(app)
    .post('/api/v1/admin/whatsapp-business/broadcast/rates')
    .set(ownerAuth);
  if (rateBc.status !== 201) {
    throw new Error(`broadcast rates ${rateBc.status} ${JSON.stringify(rateBc.body)}`);
  }
  if (rateBc.body.data.broadcast.status !== 'dry_run') {
    throw new Error('expected dry_run broadcast without BSP keys');
  }

  if (offerId) {
    const offerBc = await request(app)
      .post('/api/v1/admin/whatsapp-business/broadcast/offer')
      .set(ownerAuth)
      .send({ offerId });
    if (offerBc.status !== 201) {
      throw new Error(`broadcast offer ${offerBc.status} ${JSON.stringify(offerBc.body)}`);
    }
  } else {
    throw new Error('could not create offer for broadcast test');
  }

  const history = await request(app).get('/api/v1/admin/whatsapp-business/broadcasts').set(ownerAuth);
  if (history.status !== 200 || (history.body.data.broadcasts?.length ?? 0) < 2) {
    throw new Error('expected at least 2 broadcast log rows');
  }

  // Manual path still works
  const manual = await request(app)
    .post('/api/v1/rates')
    .set(ownerAuth)
    .send({
      gold24kPerGram: 7500,
      gold22kPerGram: 6900,
      gold18kPerGram: 5650,
      silverPerGram: 95,
      force: true,
    });
  if (manual.status !== 201) throw new Error(`manual rates ${manual.status}`);
  if (manual.body.data.rate.source !== 'manual') throw new Error('manual source expected');

  console.log('[verify:phase34] rate API + WA Business dry-run OK');

  await disconnectMongo();
  await memory.stop();
  console.log('[verify:phase34] PASSED');
}

main().catch(async (err) => {
  console.error('[verify:phase34] FAILED', err);
  try {
    await disconnectMongo();
  } catch {
    /* ignore */
  }
  process.exit(1);
});
