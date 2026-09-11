/**
 * Phase 07 gate: admin login, me, refresh, owner-only route, staff denied.
 * Uses mongodb-memory-server (no Atlas required).
 */
import bcrypt from 'bcryptjs';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import { createApp } from '../app';
import { connectMongo, disconnectMongo } from '../db/connection';
import { ensureAllModelsLoaded, AdminUserModel, ShopConfigModel } from '../db/models';

async function main() {
  const memory = await MongoMemoryServer.create();
  process.env.MONGODB_URI = memory.getUri();
  process.env.JWT_ACCESS_SECRET = 'phase07-access-secret-min-32-chars!!';
  process.env.JWT_REFRESH_SECRET = 'phase07-refresh-secret-min-32-chars!';
  process.env.NODE_ENV = 'development';

  // Re-import env is already loaded — connect with memory URI directly
  await connectMongo(memory.getUri());
  await ensureAllModelsLoaded();

  await AdminUserModel.create({
    name: 'Demo Owner',
    email: 'owner@demo.local',
    phone: '9999999999',
    passwordHash: await bcrypt.hash('ChangeMeOwner1!', 12),
    role: 'owner',
  });
  await AdminUserModel.create({
    name: 'Demo Staff',
    email: 'staff@demo.local',
    phone: '9888888888',
    passwordHash: await bcrypt.hash('ChangeMeStaff1!', 12),
    role: 'staff',
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

  const login = await request(app)
    .post('/api/v1/auth/admin/login')
    .send({ emailOrPhone: 'owner@demo.local', password: 'ChangeMeOwner1!' });
  if (login.status !== 200) {
    throw new Error(`owner login failed: ${login.status} ${JSON.stringify(login.body)}`);
  }
  const ownerAccess = login.body.data.accessToken as string;
  const ownerRefresh = login.body.data.refreshToken as string;
  console.log('[verify:admin-auth] owner login OK');

  const me = await request(app)
    .get('/api/v1/auth/admin/me')
    .set('Authorization', `Bearer ${ownerAccess}`);
  if (me.status !== 200 || me.body.data.role !== 'owner') {
    throw new Error(`owner me failed: ${JSON.stringify(me.body)}`);
  }
  console.log('[verify:admin-auth] owner me OK');

  const shop = await request(app)
    .get('/api/v1/admin/shop-config')
    .set('Authorization', `Bearer ${ownerAccess}`);
  if (shop.status !== 200) {
    throw new Error(`owner shop-config failed: ${JSON.stringify(shop.body)}`);
  }
  console.log('[verify:admin-auth] owner shop-config OK');

  const staffLogin = await request(app)
    .post('/api/v1/auth/admin/login')
    .send({ emailOrPhone: 'staff@demo.local', password: 'ChangeMeStaff1!' });
  const staffAccess = staffLogin.body.data.accessToken as string;

  const staffShop = await request(app)
    .get('/api/v1/admin/shop-config')
    .set('Authorization', `Bearer ${staffAccess}`);
  if (staffShop.status !== 403 || staffShop.body.error?.code !== 'OWNER_REQUIRED') {
    throw new Error(`staff should be forbidden: ${JSON.stringify(staffShop.body)}`);
  }
  console.log('[verify:admin-auth] staff denied owner route OK');

  const refreshed = await request(app)
    .post('/api/v1/auth/admin/token/refresh')
    .send({ refreshToken: ownerRefresh });
  if (refreshed.status !== 200) {
    throw new Error(`refresh failed: ${JSON.stringify(refreshed.body)}`);
  }
  console.log('[verify:admin-auth] refresh OK');

  const logout = await request(app)
    .post('/api/v1/auth/admin/logout')
    .set('Authorization', `Bearer ${refreshed.body.data.accessToken}`);
  if (logout.status !== 200) {
    throw new Error(`logout failed: ${JSON.stringify(logout.body)}`);
  }
  console.log('[verify:admin-auth] logout OK');

  console.log('[verify:admin-auth] Phase 07 gate PASSED');
  await disconnectMongo();
  await memory.stop();
}

main().catch(async (err) => {
  console.error('[verify:admin-auth] FAILED', err);
  await disconnectMongo().catch(() => undefined);
  process.exit(1);
});
