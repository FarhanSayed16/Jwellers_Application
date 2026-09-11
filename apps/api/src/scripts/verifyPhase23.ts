/**
 * Phase 23 gate: delete account Flow 12 — confirm required, devices off,
 * phone reuse as new customer, legal URLs on public config.
 */
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import { createApp } from '../app';
import { env } from '../config/env';
import { connectMongo, disconnectMongo } from '../db/connection';
import {
  ensureAllModelsLoaded,
  CustomerModel,
  DeviceModel,
  SessionModel,
  WishlistModel,
  OtpChallengeModel,
} from '../db/models';
import { Types } from 'mongoose';

async function customerAuth(app: ReturnType<typeof createApp>, phone: string) {
  const otpReq = await request(app).post('/api/v1/auth/customer/otp/request').send({ phone });
  const otp = otpReq.body.data.devOtp as string;
  const verify = await request(app)
    .post('/api/v1/auth/customer/otp/verify')
    .send({ phone, otp });
  if (verify.status !== 200) throw new Error(`auth failed: ${JSON.stringify(verify.body)}`);
  return {
    token: verify.body.data.accessToken as string,
    customerId: verify.body.data.customer.id as string,
  };
}

async function main() {
  const memory = await MongoMemoryServer.create();
  process.env.MONGODB_URI = memory.getUri();
  (env as { LEGAL_PRIVACY_URL: string }).LEGAL_PRIVACY_URL = 'http://localhost:3000/legal/privacy';
  (env as { LEGAL_TERMS_URL: string }).LEGAL_TERMS_URL = 'http://localhost:3000/legal/terms';
  (env as { LEGAL_DELETE_ACCOUNT_URL: string }).LEGAL_DELETE_ACCOUNT_URL =
    'http://localhost:3000/legal/delete-account';
  (env as { LEGAL_SUPPORT_EMAIL: string }).LEGAL_SUPPORT_EMAIL = 'support@example.com';

  await connectMongo(memory.getUri());
  await ensureAllModelsLoaded();

  const app = createApp();
  const phone = '9876502323';
  const { token, customerId } = await customerAuth(app, phone);
  const auth = { Authorization: `Bearer ${token}` };

  await DeviceModel.create({
    customerId,
    fcmToken: `fcm-phase23-${'y'.repeat(40)}`,
    platform: 'android',
    isActive: true,
  });
  await WishlistModel.create({
    customerId,
    itemId: new Types.ObjectId(),
  });

  const cfg = await request(app).get('/api/v1/config/public');
  if (cfg.status !== 200) throw new Error(`config: ${JSON.stringify(cfg.body)}`);
  if (cfg.body.data.privacyPolicyUrl !== 'http://localhost:3000/legal/privacy') {
    throw new Error(`privacy URL missing: ${JSON.stringify(cfg.body.data)}`);
  }
  if (cfg.body.data.termsOfUseUrl !== 'http://localhost:3000/legal/terms') {
    throw new Error(`terms URL missing`);
  }
  console.log('[verify:phase23] legal URLs on public config OK');

  const noConfirm = await request(app).delete('/api/v1/auth/customer/me').set(auth).send({});
  if (noConfirm.status !== 400) {
    throw new Error(`expected CONFIRM_REQUIRED, got ${noConfirm.status} ${JSON.stringify(noConfirm.body)}`);
  }
  console.log('[verify:phase23] delete without confirm rejected OK');

  const del = await request(app)
    .delete('/api/v1/auth/customer/me')
    .set(auth)
    .send({ confirm: 'DELETE' });
  if (del.status !== 200 || !del.body.data?.ok) {
    throw new Error(`delete failed: ${JSON.stringify(del.body)}`);
  }

  const customer = await CustomerModel.findById(customerId);
  if (!customer?.deletedAt || customer.isActive) throw new Error('customer not soft-deleted');
  if (!String(customer.phone).startsWith('deleted_')) throw new Error('phone not anonymized');

  const sessions = await SessionModel.countDocuments({
    userType: 'customer',
    userId: customerId,
    revokedAt: null,
  });
  if (sessions !== 0) throw new Error('sessions still active');

  const devices = await DeviceModel.countDocuments({ customerId, isActive: true });
  if (devices !== 0) throw new Error('devices still active');

  const wishes = await WishlistModel.countDocuments({ customerId });
  if (wishes !== 0) throw new Error('wishlist not cleared');
  console.log('[verify:phase23] delete anonymize + revoke + devices + wishlist OK');

  // Clear OTP cooldown so the same phone can request again immediately
  await OtpChallengeModel.deleteMany({ phone: `+91${phone}`.replace(/^\+91\+91/, '+91') }).catch(() => undefined);
  await OtpChallengeModel.deleteMany({}).exec();

  const again = await customerAuth(app, phone);
  if (again.customerId === customerId) {
    throw new Error('expected a fresh customer id after phone reuse');
  }
  console.log('[verify:phase23] same phone creates fresh profile OK');

  console.log('[verify:phase23] ALL PASSED');
  await disconnectMongo();
  await memory.stop();
  process.exit(0);
}

main().catch(async (err) => {
  console.error('[verify:phase23] FAILED', err);
  await disconnectMongo().catch(() => undefined);
  process.exit(1);
});
