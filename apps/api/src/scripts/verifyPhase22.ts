/**
 * Phase 22 gate: offers scheduling, clone, CSV import, hallmark flag behavior.
 */
import bcrypt from 'bcryptjs';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import { createApp } from '../app';
import { env } from '../config/env';
import { connectMongo, disconnectMongo } from '../db/connection';
import { ensureAllModelsLoaded, AdminUserModel, CategoryModel } from '../db/models';

async function main() {
  const memory = await MongoMemoryServer.create();
  process.env.MONGODB_URI = memory.getUri();
  (env as { FEATURE_OFFERS: boolean }).FEATURE_OFFERS = true;
  (env as { FEATURE_HALLMARK: boolean }).FEATURE_HALLMARK = true;

  await connectMongo(memory.getUri());
  await ensureAllModelsLoaded();

  await AdminUserModel.create({
    name: 'Demo Owner',
    email: 'owner@demo.local',
    phone: '9999999999',
    passwordHash: await bcrypt.hash('ChangeMeOwner1!', 12),
    role: 'owner',
  });

  const app = createApp();
  const adminLogin = await request(app)
    .post('/api/v1/auth/admin/login')
    .send({ emailOrPhone: 'owner@demo.local', password: 'ChangeMeOwner1!' });
  const adminToken = adminLogin.body.data.accessToken as string;
  const adminAuth = { Authorization: `Bearer ${adminToken}` };

  const past = new Date(Date.now() - 86400000).toISOString();
  const future = new Date(Date.now() + 86400000 * 7).toISOString();
  const expired = new Date(Date.now() - 86400000 * 7).toISOString();

  await request(app)
    .post('/api/v1/admin/offers')
    .set(adminAuth)
    .send({
      title: 'Live offer',
      validFrom: past,
      validTill: future,
      isActive: true,
    });
  await request(app)
    .post('/api/v1/admin/offers')
    .set(adminAuth)
    .send({
      title: 'Expired offer',
      validFrom: expired,
      validTill: past,
      isActive: true,
    });
  await request(app)
    .post('/api/v1/admin/offers')
    .set(adminAuth)
    .send({ title: 'Inactive offer', isActive: false });

  const pub = await request(app).get('/api/v1/offers');
  if (pub.status !== 200) throw new Error(`public offers: ${JSON.stringify(pub.body)}`);
  const titles = (pub.body.data.offers as Array<{ title: string }>).map((o) => o.title);
  if (!titles.includes('Live offer') || titles.includes('Expired offer') || titles.includes('Inactive offer')) {
    throw new Error(`scheduling broken: ${JSON.stringify(titles)}`);
  }
  console.log('[verify:phase22] offers scheduling OK');

  (env as { FEATURE_OFFERS: boolean }).FEATURE_OFFERS = false;
  const off = await request(app).get('/api/v1/offers');
  if (off.status !== 403) throw new Error(`offers flag off expected 403, got ${off.status}`);
  (env as { FEATURE_OFFERS: boolean }).FEATURE_OFFERS = true;
  console.log('[verify:phase22] FEATURE_OFFERS off → 403 OK');

  await CategoryModel.create({ name: 'Gold', slug: 'gold', sortOrder: 0, isActive: true });
  const cat = await CategoryModel.findOne({ slug: 'gold' });
  const item = await request(app)
    .post('/api/v1/items')
    .set(adminAuth)
    .send({
      sku: 'P22-001',
      title: 'Hallmark Ring',
      categoryId: String(cat!._id),
      status: 'active',
      huid: 'HUID123',
      makingCharge: { type: 'inherit' },
    });
  if (item.status !== 201) throw new Error(`create item: ${JSON.stringify(item.body)}`);
  const itemId = item.body.data.item.id as string;
  if (item.body.data.item.huid !== 'HUID123') throw new Error('huid not saved');

  const cloned = await request(app).post(`/api/v1/items/${itemId}/clone`).set(adminAuth).send({});
  if (cloned.status !== 201) throw new Error(`clone: ${JSON.stringify(cloned.body)}`);
  if (cloned.body.data.item.sku === 'P22-001') throw new Error('clone sku should differ');
  if (cloned.body.data.item.status !== 'draft') throw new Error('clone should be draft');
  console.log('[verify:phase22] clone item OK');

  const csv = [
    'sku,title,categorySlug,metal,purity,status,netWeightGrams',
    'P22-IMP-1,Imported Bangle,gold,gold,22K,draft,4.5',
    'P22-001,Duplicate Skip,gold,gold,22K,draft,1',
  ].join('\n');
  const imp = await request(app).post('/api/v1/items/import').set(adminAuth).send({ csv });
  if (imp.status !== 200) throw new Error(`import: ${JSON.stringify(imp.body)}`);
  if (imp.body.data.created !== 1 || imp.body.data.skipped !== 1) {
    throw new Error(`unexpected import counts: ${JSON.stringify(imp.body.data)}`);
  }
  console.log('[verify:phase22] CSV import OK');

  console.log('[verify:phase22] ALL PASSED');
  await disconnectMongo();
  await memory.stop();
  process.exit(0);
}

main().catch(async (err) => {
  console.error('[verify:phase22] FAILED', err);
  await disconnectMongo().catch(() => undefined);
  process.exit(1);
});
