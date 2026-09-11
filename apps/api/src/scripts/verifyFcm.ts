/**
 * Phase 21 gate: device register/delete, rates notify fan-out, chat FCM nudge (opaque payload).
 * Uses FCM_DRY_RUN so CI needs no live Firebase delivery.
 */
import bcrypt from 'bcryptjs';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import { createApp } from '../app';
import { env } from '../config/env';
import { connectMongo, disconnectMongo } from '../db/connection';
import { ensureAllModelsLoaded, AdminUserModel, DeviceModel } from '../db/models';
import { __drainFcmDryRunLog, __setFcmMessagingForTests } from '../services/fcm';

async function customerToken(app: ReturnType<typeof createApp>, phone: string) {
  const otpReq = await request(app).post('/api/v1/auth/customer/otp/request').send({ phone });
  const otp = otpReq.body.data.devOtp as string;
  const verify = await request(app)
    .post('/api/v1/auth/customer/otp/verify')
    .send({ phone, otp });
  if (verify.status !== 200) throw new Error(`customer auth failed: ${JSON.stringify(verify.body)}`);
  return {
    token: verify.body.data.accessToken as string,
    customerId: verify.body.data.customer.id as string,
  };
}

async function main() {
  const memory = await MongoMemoryServer.create();
  process.env.MONGODB_URI = memory.getUri();
  (env as { FCM_DRY_RUN: boolean }).FCM_DRY_RUN = true;
  (env as { FEATURE_CHAT: boolean }).FEATURE_CHAT = true;
  __setFcmMessagingForTests(null);
  __drainFcmDryRunLog();

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

  const { token: c1Token, customerId } = await customerToken(app, '9876503333');
  const c1Auth = { Authorization: `Bearer ${c1Token}` };

  const fakeToken = `fcm-test-token-${'x'.repeat(40)}`;
  const reg = await request(app)
    .post('/api/v1/devices')
    .set(c1Auth)
    .send({ fcmToken: fakeToken, platform: 'android' });
  if (reg.status !== 201) throw new Error(`device register: ${JSON.stringify(reg.body)}`);
  console.log('[verify:fcm] POST /devices OK');

  const reg2 = await request(app)
    .post('/api/v1/devices')
    .set(c1Auth)
    .send({ fcmToken: fakeToken, platform: 'android' });
  if (reg2.status !== 201) throw new Error(`device upsert: ${JSON.stringify(reg2.body)}`);
  const count = await DeviceModel.countDocuments({ fcmToken: fakeToken, isActive: true });
  if (count !== 1) throw new Error(`expected 1 active device, got ${count}`);
  console.log('[verify:fcm] device upsert unique OK');

  await request(app)
    .post('/api/v1/rates')
    .set(adminAuth)
    .send({
      gold24kPerGram: 7000,
      gold22kPerGram: 6400,
      gold18kPerGram: 5200,
      silverPerGram: 90,
    });

  __drainFcmDryRunLog();
  const notify = await request(app).post('/api/v1/rates/notify').set(adminAuth).send({});
  if (notify.status !== 200) throw new Error(`rates notify: ${JSON.stringify(notify.body)}`);
  const n = notify.body.data.notify;
  if (!n || n.attempted !== 1 || n.successCount !== 1 || n.dryRun !== true) {
    throw new Error(`unexpected notify result: ${JSON.stringify(n)}`);
  }
  const rateLogs = __drainFcmDryRunLog();
  if (rateLogs.length !== 1 || rateLogs[0]?.type !== 'rates_updated') {
    throw new Error(`expected rates_updated dry-run log, got ${JSON.stringify(rateLogs)}`);
  }
  if (rateLogs[0]?.data && Object.values(rateLogs[0].data).some((v) => /98765|phone|@/.test(v))) {
    throw new Error('PII leaked into FCM data payload');
  }
  console.log('[verify:fcm] POST /rates/notify fan-out OK');

  const cat = await request(app)
    .post('/api/v1/categories')
    .set(adminAuth)
    .send({ name: 'Gold', slug: 'gold-fcm' });
  const categoryId = cat.body.data.category.id as string;
  const item = await request(app)
    .post('/api/v1/items')
    .set(adminAuth)
    .send({
      sku: 'FCM-001',
      title: 'Arrival Ring',
      categoryId,
      status: 'active',
      isNewArrival: true,
      makingCharge: { type: 'inherit' },
    });
  if (item.status !== 201) throw new Error(`create item: ${JSON.stringify(item.body)}`);
  const arrivalLogs = __drainFcmDryRunLog();
  if (arrivalLogs.length !== 1 || arrivalLogs[0]?.type !== 'new_arrival') {
    throw new Error(`expected new_arrival, got ${JSON.stringify(arrivalLogs)}`);
  }
  if (!arrivalLogs[0]?.data?.itemId) throw new Error('new_arrival missing opaque itemId');
  console.log('[verify:fcm] new_arrival notify OK');

  const thread = await request(app).post('/api/v1/chat/threads').set(c1Auth).send({
    itemId: item.body.data.item.id,
  });
  const threadId = thread.body.data.thread.id as string;
  __drainFcmDryRunLog();
  const staffMsg = await request(app)
    .post(`/api/v1/chat/threads/${threadId}/messages`)
    .set(adminAuth)
    .send({ body: 'Hello from staff' });
  if (staffMsg.status !== 201 && staffMsg.status !== 200) {
    throw new Error(`staff message: ${JSON.stringify(staffMsg.body)}`);
  }
  const chatLogs = __drainFcmDryRunLog();
  if (chatLogs.length !== 1 || chatLogs[0]?.type !== 'chat_message') {
    throw new Error(`expected chat_message, got ${JSON.stringify(chatLogs)}`);
  }
  if (chatLogs[0]?.data?.threadId !== threadId) {
    throw new Error(`chat payload threadId mismatch: ${JSON.stringify(chatLogs[0])}`);
  }
  if (JSON.stringify(chatLogs[0]).includes('Hello from staff')) {
    throw new Error('chat body leaked into FCM payload');
  }
  console.log('[verify:fcm] chat_message nudge OK (opaque)');

  const del = await request(app)
    .delete('/api/v1/devices')
    .set(c1Auth)
    .send({ fcmToken: fakeToken });
  if (del.status !== 200 || del.body.data.deactivated < 1) {
    throw new Error(`device delete: ${JSON.stringify(del.body)}`);
  }
  const stillActive = await DeviceModel.countDocuments({
    customerId,
    fcmToken: fakeToken,
    isActive: true,
  });
  if (stillActive !== 0) throw new Error('device still active after delete');
  console.log('[verify:fcm] DELETE /devices OK');

  console.log('[verify:fcm] ALL PASSED');
  await disconnectMongo();
  await memory.stop();
  process.exit(0);
}

main().catch(async (err) => {
  console.error('[verify:fcm] FAILED', err);
  await disconnectMongo().catch(() => undefined);
  process.exit(1);
});
