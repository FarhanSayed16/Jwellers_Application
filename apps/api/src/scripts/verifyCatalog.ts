/**
 * Phase 10 gate: 2 categories, 1 subcategory, 3 items via API; public list/filter.
 */
import bcrypt from 'bcryptjs';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import { createApp } from '../app';
import { connectMongo, disconnectMongo } from '../db/connection';
import { ensureAllModelsLoaded, AdminUserModel } from '../db/models';

async function main() {
  const memory = await MongoMemoryServer.create();
  process.env.MONGODB_URI = memory.getUri();

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
  const login = await request(app)
    .post('/api/v1/auth/admin/login')
    .send({ emailOrPhone: 'owner@demo.local', password: 'ChangeMeOwner1!' });
  const access = login.body.data.accessToken as string;
  const auth = { Authorization: `Bearer ${access}` };

  const gold = await request(app)
    .post('/api/v1/categories')
    .set(auth)
    .send({ name: 'Gold', slug: 'gold' });
  if (gold.status !== 201) throw new Error(`gold cat: ${JSON.stringify(gold.body)}`);
  const goldId = gold.body.data.category.id as string;

  const silver = await request(app)
    .post('/api/v1/categories')
    .set(auth)
    .send({ name: 'Silver', slug: 'silver' });
  if (silver.status !== 201) throw new Error(`silver cat: ${JSON.stringify(silver.body)}`);

  const rings = await request(app)
    .post('/api/v1/categories')
    .set(auth)
    .send({ name: 'Rings', slug: 'gold-rings', parentId: goldId });
  if (rings.status !== 201) throw new Error(`rings sub: ${JSON.stringify(rings.body)}`);
  const ringsId = rings.body.data.category.id as string;
  console.log('[verify:catalog] 2 categories + 1 subcategory OK');

  const dupSlug = await request(app)
    .post('/api/v1/categories')
    .set(auth)
    .send({ name: 'Gold Dup', slug: 'gold' });
  if (dupSlug.status !== 409) throw new Error(`expected SLUG_EXISTS: ${JSON.stringify(dupSlug.body)}`);

  const itemsPayload = [
    {
      sku: 'GR-001',
      title: 'Classic Gold Ring',
      categoryId: goldId,
      subcategoryId: ringsId,
      metal: 'gold',
      purity: '22K',
      makingCharge: { type: 'percent', value: 12 },
      status: 'active',
      isNewArrival: true,
      netWeightGrams: 4.5,
    },
    {
      sku: 'GR-002',
      title: 'Plain Band',
      categoryId: goldId,
      subcategoryId: ringsId,
      metal: 'gold',
      purity: '18K',
      makingCharge: { type: 'inherit' },
      status: 'active',
      isFeatured: true,
      netWeightGrams: 3.2,
      huid: 'HUIDDEMO1',
    },
    {
      sku: 'GS-001',
      title: 'Draft Necklace',
      categoryId: goldId,
      metal: 'gold',
      purity: '22K',
      makingCharge: { type: 'flat', value: 1500 },
      status: 'draft',
    },
  ];

  for (const payload of itemsPayload) {
    const res = await request(app).post('/api/v1/items').set(auth).send(payload);
    if (res.status !== 201) {
      throw new Error(`create item ${payload.sku}: ${JSON.stringify(res.body)}`);
    }
  }
  console.log('[verify:catalog] 3 items created OK');

  const dupSku = await request(app)
    .post('/api/v1/items')
    .set(auth)
    .send({ ...itemsPayload[0], title: 'Dup' });
  if (dupSku.status !== 409 || dupSku.body.error?.code !== 'SKU_EXISTS') {
    throw new Error(`expected SKU_EXISTS: ${JSON.stringify(dupSku.body)}`);
  }
  console.log('[verify:catalog] duplicate SKU 409 OK');

  const publicList = await request(app).get('/api/v1/items');
  if (publicList.status !== 200 || publicList.body.data.total !== 2) {
    throw new Error(`public list should be 2 active: ${JSON.stringify(publicList.body)}`);
  }
  console.log('[verify:catalog] public excludes draft OK');

  const filtered = await request(app).get(
    `/api/v1/items?subcategoryId=${ringsId}&purity=22K&isNewArrival=true`,
  );
  if (filtered.status !== 200 || filtered.body.data.total !== 1) {
    throw new Error(`filter failed: ${JSON.stringify(filtered.body)}`);
  }
  console.log('[verify:catalog] public filter OK');

  const bySku = await request(app).get('/api/v1/items/sku/GR-001');
  if (bySku.status !== 200 || bySku.body.data.item.sku !== 'GR-001') {
    throw new Error(`sku lookup failed: ${JSON.stringify(bySku.body)}`);
  }

  const draftHidden = await request(app).get('/api/v1/items/sku/GS-001');
  if (draftHidden.status !== 404) {
    throw new Error(`draft sku should 404 publicly: ${JSON.stringify(draftHidden.body)}`);
  }

  const adminItems = await request(app).get('/api/v1/admin/items?status=draft').set(auth);
  if (adminItems.status !== 200 || adminItems.body.data.total !== 1) {
    throw new Error(`admin draft list: ${JSON.stringify(adminItems.body)}`);
  }

  const tree = await request(app).get('/api/v1/categories?tree=true');
  if (tree.status !== 200 || !Array.isArray(tree.body.data.tree) || tree.body.data.tree.length < 2) {
    throw new Error(`tree failed: ${JSON.stringify(tree.body)}`);
  }
  const goldNode = tree.body.data.tree.find((c: { slug: string }) => c.slug === 'gold');
  if (!goldNode?.children?.length) {
    throw new Error(`gold should have children: ${JSON.stringify(goldNode)}`);
  }
  console.log('[verify:catalog] category tree OK');

  const dash = await request(app).get('/api/v1/admin/dashboard').set(auth);
  if (dash.status !== 200 || dash.body.data.items.active !== 2) {
    throw new Error(`dashboard failed: ${JSON.stringify(dash.body)}`);
  }
  console.log('[verify:catalog] dashboard stub OK');

  const itemId = bySku.body.data.item.id as string;
  const del = await request(app).delete(`/api/v1/items/${itemId}`).set(auth);
  if (del.status !== 200) throw new Error(`delete failed: ${JSON.stringify(del.body)}`);
  const gone = await request(app).get(`/api/v1/items/${itemId}`);
  if (gone.status !== 404) throw new Error('soft-deleted should hide from public');
  const restored = await request(app).post(`/api/v1/items/${itemId}/restore`).set(auth);
  if (restored.status !== 200) throw new Error(`restore failed: ${JSON.stringify(restored.body)}`);
  console.log('[verify:catalog] soft-delete + restore OK');

  console.log('[verify:catalog] Phase 10 gate PASSED');
  await disconnectMongo();
  await memory.stop();
}

main().catch(async (err) => {
  console.error('[verify:catalog] FAILED', err);
  await disconnectMongo().catch(() => undefined);
  process.exit(1);
});
