/**
 * Phase 15 gate: branding PATCH reflected in /config/public; staff blocked from shop-config.
 */
import bcrypt from 'bcryptjs';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import { createApp } from '../app';
import { connectMongo, disconnectMongo } from '../db/connection';
import { ensureAllModelsLoaded, AdminUserModel, ShopConfigModel } from '../db/models';

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
    themeLight: theme,
    themeDark: { ...theme, primary: '#5EBFAB', background: '#0E1513', surface: '#1A2420' },
    makingChargeDefault: { type: 'percent', value: 12 },
    isActive: true,
  });

  const app = createApp();

  const ownerLogin = await request(app)
    .post('/api/v1/auth/admin/login')
    .send({ emailOrPhone: 'owner@demo.local', password: 'ChangeMeOwner1!' });
  const ownerToken = ownerLogin.body.data.accessToken as string;

  const patch = await request(app)
    .patch('/api/v1/admin/shop-config')
    .set('Authorization', `Bearer ${ownerToken}`)
    .send({ shopName: 'Phase15 Brand Shop', contactPhone: '9000000000' });
  if (patch.status !== 200) throw new Error(`patch failed: ${JSON.stringify(patch.body)}`);

  const pub = await request(app).get('/api/v1/config/public');
  if (pub.status !== 200 || pub.body.data.shopName !== 'Phase15 Brand Shop') {
    throw new Error(`public config not updated: ${JSON.stringify(pub.body)}`);
  }
  console.log('[verify:phase15] branding reflected in /config/public OK');

  const staffLogin = await request(app)
    .post('/api/v1/auth/admin/login')
    .send({ emailOrPhone: 'staff@demo.local', password: 'ChangeMeStaff1!' });
  const staffToken = staffLogin.body.data.accessToken as string;

  const staffBrand = await request(app)
    .get('/api/v1/admin/shop-config')
    .set('Authorization', `Bearer ${staffToken}`);
  if (staffBrand.status !== 403 || staffBrand.body.error?.code !== 'OWNER_REQUIRED') {
    throw new Error(`staff should be blocked from branding: ${JSON.stringify(staffBrand.body)}`);
  }
  console.log('[verify:phase15] staff blocked from branding OK');

  const staffCreate = await request(app)
    .post('/api/v1/admin/staff')
    .set('Authorization', `Bearer ${ownerToken}`)
    .send({
      name: 'New Staff',
      email: 'newstaff@demo.local',
      password: 'TempStaffPass1!',
    });
  if (staffCreate.status !== 201) throw new Error(`create staff: ${JSON.stringify(staffCreate.body)}`);

  const list = await request(app)
    .get('/api/v1/admin/staff')
    .set('Authorization', `Bearer ${ownerToken}`);
  if (list.status !== 200 || list.body.data.admins.length < 3) {
    throw new Error(`staff list: ${JSON.stringify(list.body)}`);
  }
  console.log('[verify:phase15] staff CRUD OK');

  console.log('[verify:phase15] Phase 15 gate PASSED');
  await disconnectMongo();
  await memory.stop();
}

main().catch(async (err) => {
  console.error('[verify:phase15] FAILED', err);
  await disconnectMongo().catch(() => undefined);
  process.exit(1);
});
