/**
 * Phase 14 API gate: POST rate → public latest; create item with 2+ images.
 * (Admin UI is covered by Next build.)
 */
import bcrypt from 'bcryptjs';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import { createApp } from '../app';
import { connectMongo, disconnectMongo } from '../db/connection';
import { ensureAllModelsLoaded, AdminUserModel } from '../db/models';

async function main() {
  const memory = await MongoMemoryServer.create();
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

  const rate = await request(app)
    .post('/api/v1/rates')
    .set(auth)
    .send({
      gold24kPerGram: 11000,
      gold22kPerGram: 10000,
      gold18kPerGram: 8200,
      silverPerGram: 120,
      note: 'phase14',
    });
  if (rate.status !== 201) throw new Error(`rate create: ${JSON.stringify(rate.body)}`);

  const latest = await request(app).get('/api/v1/rates/latest');
  if (latest.status !== 200 || latest.body.data.rate?.gold22kPerGram !== 10000) {
    throw new Error(`public latest missing new rate: ${JSON.stringify(latest.body)}`);
  }
  console.log('[verify:phase14] new rate visible via public GET OK');

  const cat = await request(app).post('/api/v1/categories').set(auth).send({ name: 'Gold', slug: 'gold' });
  const categoryId = cat.body.data.category.id as string;

  const item = await request(app)
    .post('/api/v1/items')
    .set(auth)
    .send({
      sku: 'P14-001',
      title: 'Phase 14 Ring',
      categoryId,
      status: 'active',
      makingCharge: { type: 'inherit' },
      images: [
        {
          url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
          publicId: 'demo/sample',
          sortOrder: 0,
          isPrimary: true,
        },
        {
          url: 'https://res.cloudinary.com/demo/image/upload/docs/models.jpg',
          publicId: 'demo/docs/models',
          sortOrder: 1,
          isPrimary: false,
        },
      ],
    });
  if (item.status !== 201 || (item.body.data.item.images?.length ?? 0) < 2) {
    throw new Error(`item with 2 images failed: ${JSON.stringify(item.body)}`);
  }

  const adminGet = await request(app)
    .get(`/api/v1/admin/items/${item.body.data.item.id}`)
    .set(auth);
  if (adminGet.status !== 200) throw new Error(`admin get item: ${JSON.stringify(adminGet.body)}`);

  console.log('[verify:phase14] item with 2+ images OK');
  console.log('[verify:phase14] Phase 14 gate PASSED');
  await disconnectMongo();
  await memory.stop();
}

main().catch(async (err) => {
  console.error('[verify:phase14] FAILED', err);
  await disconnectMongo().catch(() => undefined);
  process.exit(1);
});
