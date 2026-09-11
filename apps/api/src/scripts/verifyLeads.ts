/**
 * Phase 12 gate: enquiry in admin list after customer POST; wishlist toggle idempotent.
 * Also smoke-tests custom requests + offers.
 */
import bcrypt from 'bcryptjs';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import { createApp } from '../app';
import { connectMongo, disconnectMongo } from '../db/connection';
import { ensureAllModelsLoaded, AdminUserModel } from '../db/models';

async function customerToken(app: ReturnType<typeof createApp>, phone = '9876501234') {
  const otpReq = await request(app).post('/api/v1/auth/customer/otp/request').send({ phone });
  const otp = otpReq.body.data.devOtp as string;
  const verify = await request(app)
    .post('/api/v1/auth/customer/otp/verify')
    .send({ phone, otp });
  if (verify.status !== 200) throw new Error(`customer auth failed: ${JSON.stringify(verify.body)}`);
  return verify.body.data.accessToken as string;
}

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
  const adminLogin = await request(app)
    .post('/api/v1/auth/admin/login')
    .send({ emailOrPhone: 'owner@demo.local', password: 'ChangeMeOwner1!' });
  const adminToken = adminLogin.body.data.accessToken as string;
  const adminAuth = { Authorization: `Bearer ${adminToken}` };

  const cat = await request(app)
    .post('/api/v1/categories')
    .set(adminAuth)
    .send({ name: 'Gold', slug: 'gold' });
  const categoryId = cat.body.data.category.id as string;
  const item = await request(app)
    .post('/api/v1/items')
    .set(adminAuth)
    .send({
      sku: 'WL-001',
      title: 'Wishlist Ring',
      categoryId,
      status: 'active',
      makingCharge: { type: 'inherit' },
    });
  const itemId = item.body.data.item.id as string;

  const cToken = await customerToken(app);
  const cAuth = { Authorization: `Bearer ${cToken}` };

  // Wishlist idempotent add
  const add1 = await request(app).post('/api/v1/wishlist').set(cAuth).send({ itemId });
  if (add1.status !== 201 || !add1.body.data.created) {
    throw new Error(`wishlist add1: ${JSON.stringify(add1.body)}`);
  }
  const add2 = await request(app).post('/api/v1/wishlist').set(cAuth).send({ itemId });
  if (add2.status !== 200 || add2.body.data.created !== false) {
    throw new Error(`wishlist add2 should be idempotent: ${JSON.stringify(add2.body)}`);
  }
  const list = await request(app).get('/api/v1/wishlist').set(cAuth);
  if (list.status !== 200 || list.body.data.items.length !== 1) {
    throw new Error(`wishlist list: ${JSON.stringify(list.body)}`);
  }
  const del1 = await request(app).delete(`/api/v1/wishlist/${itemId}`).set(cAuth);
  const del2 = await request(app).delete(`/api/v1/wishlist/${itemId}`).set(cAuth);
  if (del1.status !== 200 || del2.status !== 200 || del2.body.data.removed !== false) {
    throw new Error(`wishlist delete idempotent failed: ${JSON.stringify(del2.body)}`);
  }
  console.log('[verify:leads] wishlist toggle idempotent OK');

  // Enquiry → admin list
  const enq = await request(app)
    .post('/api/v1/enquiries')
    .set(cAuth)
    .send({ itemId, message: 'Is this available in size 16?', channel: 'app' });
  if (enq.status !== 201) throw new Error(`enquiry create: ${JSON.stringify(enq.body)}`);
  const enquiryId = enq.body.data.enquiry.id as string;

  const adminList = await request(app).get('/api/v1/admin/enquiries').set(adminAuth);
  if (adminList.status !== 200) throw new Error(`admin enquiries: ${JSON.stringify(adminList.body)}`);
  const found = adminList.body.data.enquiries.find((e: { id: string }) => e.id === enquiryId);
  if (!found || found.status !== 'new') {
    throw new Error(`enquiry not in admin list: ${JSON.stringify(adminList.body)}`);
  }

  const patched = await request(app)
    .patch(`/api/v1/admin/enquiries/${enquiryId}`)
    .set(adminAuth)
    .send({ status: 'in_progress' });
  if (patched.status !== 200 || patched.body.data.enquiry.status !== 'in_progress') {
    throw new Error(`enquiry patch: ${JSON.stringify(patched.body)}`);
  }
  console.log('[verify:leads] enquiry admin list OK');

  // Custom request
  const cr = await request(app)
    .post('/api/v1/custom-requests')
    .set(cAuth)
    .send({
      description: 'Custom necklace with peacock motif',
      referenceImageUrls: ['https://res.cloudinary.com/demo/image/upload/sample.jpg'],
      budgetHint: '50-80k',
    });
  if (cr.status !== 201) throw new Error(`custom request: ${JSON.stringify(cr.body)}`);
  const adminCr = await request(app).get('/api/v1/admin/custom-requests').set(adminAuth);
  if (adminCr.status !== 200 || adminCr.body.data.customRequests.length < 1) {
    throw new Error(`admin custom requests: ${JSON.stringify(adminCr.body)}`);
  }
  console.log('[verify:leads] custom requests OK');

  // Offers
  const offer = await request(app)
    .post('/api/v1/admin/offers')
    .set(adminAuth)
    .send({
      title: 'Akshaya Tritiya Special',
      description: 'Making charge waiver on select items',
      isActive: true,
    });
  if (offer.status !== 201) throw new Error(`offer create: ${JSON.stringify(offer.body)}`);
  const publicOffers = await request(app).get('/api/v1/offers');
  if (publicOffers.status !== 200 || publicOffers.body.data.offers.length < 1) {
    throw new Error(`public offers: ${JSON.stringify(publicOffers.body)}`);
  }
  console.log('[verify:leads] offers OK');

  console.log('[verify:leads] Phase 12 gate PASSED');
  await disconnectMongo();
  await memory.stop();
}

main().catch(async (err) => {
  console.error('[verify:leads] FAILED', err);
  await disconnectMongo().catch(() => undefined);
  process.exit(1);
});
