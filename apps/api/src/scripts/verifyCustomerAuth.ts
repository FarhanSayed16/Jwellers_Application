/**
 * Phase 08 gate: OTP request → verify → me, refresh, logout,
 * 429 cooldown, customer token rejected on admin routes.
 * Uses mongodb-memory-server (no Atlas / MSG91 required).
 */
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import { createApp } from '../app';
import { connectMongo, disconnectMongo } from '../db/connection';
import { ensureAllModelsLoaded, AdminUserModel, ShopConfigModel } from '../db/models';
import bcrypt from 'bcryptjs';

async function main() {
  const memory = await MongoMemoryServer.create();
  process.env.MONGODB_URI = memory.getUri();
  // Prefer existing .env JWT/OTP secrets; memory URI used via connectMongo arg

  await connectMongo(memory.getUri());
  await ensureAllModelsLoaded();

  await AdminUserModel.create({
    name: 'Demo Owner',
    email: 'owner@demo.local',
    phone: '9999999999',
    passwordHash: await bcrypt.hash('ChangeMeOwner1!', 12),
    role: 'owner',
  });
  await ShopConfigModel.create({
    shopName: 'Demo Jewellers',
    contactPhone: '9999999999',
    themeLight: {
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
    },
    themeDark: {
      primary: '#5EBFAB',
      secondary: '#3D7A6A',
      accent: '#E0C35A',
      background: '#0E1513',
      surface: '#1A2420',
      textPrimary: '#F3F6F5',
      textSecondary: '#A8B5B0',
      border: '#2A3531',
      success: '#81C784',
      warning: '#FFB74D',
      error: '#EF9A9A',
    },
    makingChargeDefault: { type: 'percent', value: 12 },
    isActive: true,
  });

  const app = createApp();
  const phone = '9876543210';

  const req1 = await request(app).post('/api/v1/auth/customer/otp/request').send({ phone });
  if (req1.status !== 200 || !req1.body.data?.devOtp) {
    throw new Error(
      `otp request failed (need MSG91 empty so devOtp returns): ${req1.status} ${JSON.stringify(req1.body)}`,
    );
  }
  const otp = req1.body.data.devOtp as string;
  console.log('[verify:customer-auth] otp request OK (devOtp present, not logged)');

  const cooldown = await request(app).post('/api/v1/auth/customer/otp/request').send({ phone });
  if (cooldown.status !== 429 || cooldown.body.error?.code !== 'OTP_COOLDOWN') {
    throw new Error(`expected OTP_COOLDOWN 429: ${JSON.stringify(cooldown.body)}`);
  }
  console.log('[verify:customer-auth] cooldown 429 OK');

  const verify = await request(app)
    .post('/api/v1/auth/customer/otp/verify')
    .send({ phone, otp });
  if (verify.status !== 200 || !verify.body.data?.accessToken) {
    throw new Error(`otp verify failed: ${JSON.stringify(verify.body)}`);
  }
  const access = verify.body.data.accessToken as string;
  const refresh = verify.body.data.refreshToken as string;
  console.log('[verify:customer-auth] otp verify OK');

  const me = await request(app)
    .get('/api/v1/auth/customer/me')
    .set('Authorization', `Bearer ${access}`);
  if (me.status !== 200 || me.body.data?.role !== 'customer') {
    throw new Error(`customer me failed: ${JSON.stringify(me.body)}`);
  }
  console.log('[verify:customer-auth] me OK');

  const patch = await request(app)
    .patch('/api/v1/auth/customer/me')
    .set('Authorization', `Bearer ${access}`)
    .send({ name: 'Test Customer' });
  if (patch.status !== 200 || patch.body.data?.name !== 'Test Customer') {
    throw new Error(`customer patch failed: ${JSON.stringify(patch.body)}`);
  }
  console.log('[verify:customer-auth] patch me OK');

  const adminDenied = await request(app)
    .get('/api/v1/admin/shop-config')
    .set('Authorization', `Bearer ${access}`);
  if (adminDenied.status !== 401) {
    throw new Error(`customer token should fail admin route: ${JSON.stringify(adminDenied.body)}`);
  }
  console.log('[verify:customer-auth] customer rejected on admin OK');

  const refreshed = await request(app)
    .post('/api/v1/auth/customer/token/refresh')
    .send({ refreshToken: refresh });
  if (refreshed.status !== 200) {
    throw new Error(`refresh failed: ${JSON.stringify(refreshed.body)}`);
  }
  console.log('[verify:customer-auth] refresh OK');

  const logout = await request(app)
    .post('/api/v1/auth/customer/logout')
    .set('Authorization', `Bearer ${refreshed.body.data.accessToken}`);
  if (logout.status !== 200) {
    throw new Error(`logout failed: ${JSON.stringify(logout.body)}`);
  }
  console.log('[verify:customer-auth] logout OK');

  console.log('[verify:customer-auth] Phase 08 gate PASSED');
  await disconnectMongo();
  await memory.stop();
}

main().catch(async (err) => {
  console.error('[verify:customer-auth] FAILED', err);
  await disconnectMongo().catch(() => undefined);
  process.exit(1);
});
