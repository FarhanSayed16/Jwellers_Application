/**
 * Phase 11 gate: signed upload params + store Cloudinary URL on item via catalog API.
 * Uses synthetic Cloudinary credentials (signature math verified); no live Cloudinary account required.
 */
import bcrypt from 'bcryptjs';
import { createHash } from 'node:crypto';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import { createApp } from '../app';
import { connectMongo, disconnectMongo } from '../db/connection';
import { ensureAllModelsLoaded, AdminUserModel, CustomerModel } from '../db/models';

function expectedSignature(
  params: Record<string, string | number>,
  apiSecret: string,
): string {
  const toSign = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join('&');
  return createHash('sha1').update(toSign + apiSecret).digest('hex');
}

async function main() {
  const memory = await MongoMemoryServer.create();
  process.env.MONGODB_URI = memory.getUri();
  process.env.CLOUDINARY_CLOUD_NAME = 'jwellers_test_cloud';
  process.env.CLOUDINARY_API_KEY = '123456789012345';
  process.env.CLOUDINARY_API_SECRET = 'phase11-cloudinary-secret-key';
  process.env.CLIENT_SLUG = process.env.CLIENT_SLUG || 'demo';

  await connectMongo(memory.getUri());
  await ensureAllModelsLoaded();

  await AdminUserModel.create({
    name: 'Demo Owner',
    email: 'owner@demo.local',
    phone: '9999999999',
    passwordHash: await bcrypt.hash('ChangeMeOwner1!', 12),
    role: 'owner',
  });
  await CustomerModel.create({
    phone: '+919876543210',
    name: 'Test Customer',
    isActive: true,
  });

  const app = createApp();

  const policy = await request(app).get('/api/v1/media/policy');
  if (policy.status !== 200 || !policy.body.data.allowedMimeTypes?.includes('image/jpeg')) {
    throw new Error(`policy failed: ${JSON.stringify(policy.body)}`);
  }
  if (policy.body.data.unsignedPresetsAllowed !== false) {
    throw new Error('unsigned presets must be disallowed');
  }
  console.log('[verify:media] policy OK');

  const login = await request(app)
    .post('/api/v1/auth/admin/login')
    .send({ emailOrPhone: 'owner@demo.local', password: 'ChangeMeOwner1!' });
  const adminToken = login.body.data.accessToken as string;

  const unsigned = await request(app)
    .post('/api/v1/media/sign')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ purpose: 'items', uploadPreset: 'public_unsigned' });
  if (unsigned.status !== 403 || unsigned.body.error?.code !== 'UNSIGNED_PRESET_FORBIDDEN') {
    throw new Error(`expected UNSIGNED_PRESET_FORBIDDEN: ${JSON.stringify(unsigned.body)}`);
  }
  console.log('[verify:media] unsigned preset rejected OK');

  const badPurpose = await request(app)
    .post('/api/v1/media/sign')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ purpose: 'chat' });
  if (badPurpose.status !== 400) {
    throw new Error(`admin should not sign chat: ${JSON.stringify(badPurpose.body)}`);
  }

  const signed = await request(app)
    .post('/api/v1/media/sign')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ purpose: 'items', resourceType: 'image' });
  if (signed.status !== 200) {
    throw new Error(`admin sign failed: ${JSON.stringify(signed.body)}`);
  }
  const s = signed.body.data;
  if (s.folder !== 'clients/demo/items') {
    throw new Error(`unexpected folder: ${s.folder}`);
  }
  if (s.maxBytes !== 10 * 1024 * 1024) {
    throw new Error(`admin maxBytes wrong: ${s.maxBytes}`);
  }
  const expectSig = expectedSignature(
    { folder: s.folder, timestamp: s.timestamp },
    process.env.CLOUDINARY_API_SECRET!,
  );
  if (s.signature !== expectSig) {
    throw new Error(`signature mismatch: got ${s.signature} want ${expectSig}`);
  }
  console.log('[verify:media] admin signed params OK');

  // Customer OTP path (devOtp when MSG91 empty)
  const otpReq = await request(app)
    .post('/api/v1/auth/customer/otp/request')
    .send({ phone: '9876543210' });
  const otp = otpReq.body.data.devOtp as string;
  const verify = await request(app)
    .post('/api/v1/auth/customer/otp/verify')
    .send({ phone: '9876543210', otp });
  const customerToken = verify.body.data.accessToken as string;

  const custBad = await request(app)
    .post('/api/v1/media/sign')
    .set('Authorization', `Bearer ${customerToken}`)
    .send({ purpose: 'items' });
  if (custBad.status !== 400) {
    throw new Error(`customer should not sign items: ${JSON.stringify(custBad.body)}`);
  }

  const custSign = await request(app)
    .post('/api/v1/media/sign')
    .set('Authorization', `Bearer ${customerToken}`)
    .send({ purpose: 'chat' });
  if (custSign.status !== 200 || custSign.body.data.folder !== 'clients/demo/chat') {
    throw new Error(`customer sign failed: ${JSON.stringify(custSign.body)}`);
  }
  if (custSign.body.data.maxBytes !== 5 * 1024 * 1024) {
    throw new Error(`customer maxBytes wrong: ${custSign.body.data.maxBytes}`);
  }
  console.log('[verify:media] customer signed params (tighter) OK');

  // Gate: URL stored on item via Phase 10 APIs
  const cat = await request(app)
    .post('/api/v1/categories')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ name: 'Gold', slug: 'gold' });
  const categoryId = cat.body.data.category.id as string;
  const imageUrl = `https://res.cloudinary.com/${s.cloudName}/image/upload/v${s.timestamp}/${s.folder}/ring_demo.jpg`;
  const item = await request(app)
    .post('/api/v1/items')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      sku: 'MEDIA-001',
      title: 'Signed Upload Ring',
      categoryId,
      status: 'active',
      makingCharge: { type: 'inherit' },
      images: [
        {
          url: imageUrl,
          publicId: `${s.folder}/ring_demo`,
          sortOrder: 0,
          isPrimary: true,
        },
      ],
    });
  if (item.status !== 201 || item.body.data.item.images?.[0]?.url !== imageUrl) {
    throw new Error(`item image store failed: ${JSON.stringify(item.body)}`);
  }
  console.log('[verify:media] URL stored on item OK');

  console.log('[verify:media] Phase 11 gate PASSED');
  await disconnectMongo();
  await memory.stop();
}

main().catch(async (err) => {
  console.error('[verify:media] FAILED', err);
  await disconnectMongo().catch(() => undefined);
  process.exit(1);
});
