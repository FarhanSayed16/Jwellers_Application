/**
 * Phase 20 gate: two-way chat, no cross-customer access, FEATURE_CHAT off → 403.
 */
import bcrypt from 'bcryptjs';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import { createApp } from '../app';
import { env } from '../config/env';
import { connectMongo, disconnectMongo } from '../db/connection';
import { ensureAllModelsLoaded, AdminUserModel } from '../db/models';

async function customerToken(app: ReturnType<typeof createApp>, phone: string) {
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
  (env as { FEATURE_CHAT: boolean }).FEATURE_CHAT = true;

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
      sku: 'CHAT-001',
      title: 'Chat Ring',
      categoryId,
      status: 'active',
      makingCharge: { type: 'inherit' },
    });
  const itemId = item.body.data.item.id as string;

  const c1Token = await customerToken(app, '9876501111');
  const c2Token = await customerToken(app, '9876502222');
  const c1Auth = { Authorization: `Bearer ${c1Token}` };
  const c2Auth = { Authorization: `Bearer ${c2Token}` };

  const t1 = await request(app).post('/api/v1/chat/threads').set(c1Auth).send({ itemId });
  if (t1.status !== 201) throw new Error(`create thread: ${JSON.stringify(t1.body)}`);
  const threadId = t1.body.data.thread.id as string;

  const t2 = await request(app).post('/api/v1/chat/threads').set(c1Auth).send({ itemId });
  if (t2.status !== 200 || t2.body.data.thread.id !== threadId || t2.body.data.created !== false) {
    throw new Error(`reuse thread failed: ${JSON.stringify(t2.body)}`);
  }
  console.log('[verify:chat] thread create/reuse OK');

  const clientMessageId = 'client-msg-abc-001';
  const m1 = await request(app)
    .post(`/api/v1/chat/threads/${threadId}/messages`)
    .set(c1Auth)
    .send({ body: 'Hi, is this available?', clientMessageId });
  if (m1.status !== 201) throw new Error(`send msg: ${JSON.stringify(m1.body)}`);
  const m1b = await request(app)
    .post(`/api/v1/chat/threads/${threadId}/messages`)
    .set(c1Auth)
    .send({ body: 'Hi, is this available?', clientMessageId });
  if (m1b.status !== 200 || m1b.body.data.created !== false) {
    throw new Error(`idempotent send failed: ${JSON.stringify(m1b.body)}`);
  }
  console.log('[verify:chat] clientMessageId idempotency OK');

  const inbox = await request(app).get('/api/v1/admin/chat/threads').set(adminAuth);
  if (inbox.status !== 200) throw new Error(`admin inbox: ${JSON.stringify(inbox.body)}`);
  const found = inbox.body.data.threads.find((t: { id: string }) => t.id === threadId);
  if (!found || found.unreadStaff < 1) {
    throw new Error(`admin unreadStaff: ${JSON.stringify(found)}`);
  }

  const reply = await request(app)
    .post(`/api/v1/chat/threads/${threadId}/messages`)
    .set(adminAuth)
    .send({ body: 'Yes, size 16 is available.', clientMessageId: 'staff-msg-001' });
  if (reply.status !== 201) throw new Error(`staff reply: ${JSON.stringify(reply.body)}`);

  const msgs = await request(app).get(`/api/v1/chat/threads/${threadId}/messages`).set(c1Auth);
  if (msgs.status !== 200 || msgs.body.data.messages.length < 2) {
    throw new Error(`messages list: ${JSON.stringify(msgs.body)}`);
  }
  console.log('[verify:chat] two-way messages OK');

  const read = await request(app).post(`/api/v1/chat/threads/${threadId}/read`).set(c1Auth);
  if (read.status !== 200 || read.body.data.thread.unreadCustomer !== 0) {
    throw new Error(`customer read: ${JSON.stringify(read.body)}`);
  }
  const staffRead = await request(app).post(`/api/v1/chat/threads/${threadId}/read`).set(adminAuth);
  if (staffRead.status !== 200 || staffRead.body.data.thread.unreadStaff !== 0) {
    throw new Error(`staff read: ${JSON.stringify(staffRead.body)}`);
  }
  console.log('[verify:chat] read receipts OK');

  const patched = await request(app)
    .patch(`/api/v1/chat/threads/${threadId}`)
    .set(adminAuth)
    .send({ status: 'closed' });
  if (patched.status !== 200 || patched.body.data.thread.status !== 'closed') {
    throw new Error(`status patch: ${JSON.stringify(patched.body)}`);
  }
  console.log('[verify:chat] status patch OK');

  const leak = await request(app)
    .get(`/api/v1/chat/threads/${threadId}/messages`)
    .set(c2Auth);
  if (leak.status !== 403) {
    throw new Error(`expected 403 cross-customer, got ${leak.status}: ${JSON.stringify(leak.body)}`);
  }
  console.log('[verify:chat] cross-customer blocked OK');

  (env as { FEATURE_CHAT: boolean }).FEATURE_CHAT = false;
  const disabled = await request(app).post('/api/v1/chat/threads').set(c1Auth).send({});
  if (disabled.status !== 403 || disabled.body.error?.code !== 'FEATURE_DISABLED') {
    throw new Error(`feature off expected 403: ${JSON.stringify(disabled.body)}`);
  }
  console.log('[verify:chat] FEATURE_CHAT=false → 403 OK');

  (env as { FEATURE_CHAT: boolean }).FEATURE_CHAT = true;
  await disconnectMongo();
  await memory.stop();
  console.log('[verify:chat] Phase 20 API gate OK');
}

main().catch(async (err) => {
  console.error('[verify:chat] failed', err);
  try {
    await disconnectMongo();
  } catch {
    /* ignore */
  }
  process.exit(1);
});
