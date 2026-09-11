/**
 * Phase 09 gate: POST rates → latest updates, history chronological, quote formula.
 * Uses mongodb-memory-server (no Atlas required).
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
  if (login.status !== 200) {
    throw new Error(`login failed: ${JSON.stringify(login.body)}`);
  }
  const access = login.body.data.accessToken as string;

  const empty = await request(app).get('/api/v1/rates/latest');
  if (empty.status !== 200 || empty.body.data.rate !== null) {
    throw new Error(`expected null latest: ${JSON.stringify(empty.body)}`);
  }
  console.log('[verify:rates] empty latest OK');

  const t1 = '2026-09-01T10:00:00.000Z';
  const create1 = await request(app)
    .post('/api/v1/rates')
    .set('Authorization', `Bearer ${access}`)
    .send({
      gold24kPerGram: 10000,
      gold22kPerGram: 9167,
      gold18kPerGram: 7500,
      silverPerGram: 100,
      effectiveAt: t1,
      note: 'day1',
    });
  if (create1.status !== 201) {
    throw new Error(`create1 failed: ${JSON.stringify(create1.body)}`);
  }
  console.log('[verify:rates] create1 OK');

  const t2 = '2026-09-07T10:00:00.000Z';
  const create2 = await request(app)
    .post('/api/v1/rates')
    .set('Authorization', `Bearer ${access}`)
    .send({
      gold24kPerGram: 10100,
      gold22kPerGram: 9258,
      gold18kPerGram: 7575,
      silverPerGram: 102,
      effectiveAt: t2,
      note: 'day2',
    });
  if (create2.status !== 201) {
    throw new Error(`create2 failed: ${JSON.stringify(create2.body)}`);
  }
  console.log('[verify:rates] create2 OK');

  const large = await request(app)
    .post('/api/v1/rates')
    .set('Authorization', `Bearer ${access}`)
    .send({
      gold24kPerGram: 20000,
      gold22kPerGram: 18000,
      gold18kPerGram: 15000,
      silverPerGram: 200,
    });
  if (large.status !== 409 || large.body.error?.code !== 'LARGE_RATE_CHANGE') {
    throw new Error(`expected LARGE_RATE_CHANGE: ${JSON.stringify(large.body)}`);
  }
  console.log('[verify:rates] large-change guard OK');

  const latest = await request(app).get('/api/v1/rates/latest');
  if (latest.status !== 200 || latest.body.data.rate?.gold24kPerGram !== 10100) {
    throw new Error(`latest not updated: ${JSON.stringify(latest.body)}`);
  }
  if (latest.body.data.rate.effectiveAt !== t2) {
    throw new Error(`latest effectiveAt wrong: ${latest.body.data.rate.effectiveAt}`);
  }
  console.log('[verify:rates] latest after POST OK');

  const history = await request(app).get('/api/v1/rates/history?limit=10');
  if (history.status !== 200) {
    throw new Error(`history failed: ${JSON.stringify(history.body)}`);
  }
  const points = history.body.data.points as Array<{ effectiveAt: string; gold24kPerGram: number }>;
  if (points.length !== 2) {
    throw new Error(`expected 2 history points: ${JSON.stringify(points)}`);
  }
  if (points[0].effectiveAt !== t1 || points[1].effectiveAt !== t2) {
    throw new Error(`history not chronological: ${JSON.stringify(points)}`);
  }
  console.log('[verify:rates] history chronological OK');

  // Formula: metal=10*10100=101000; making 12%=12120; taxable=113120; gst 3%=3393.6; total=116513.6
  const quote = await request(app).post('/api/v1/calculator/quote').send({
    purity: '24k',
    weightGrams: 10,
    makingType: 'percent',
    makingValue: 12,
    gstPercent: 3,
  });
  if (quote.status !== 200) {
    throw new Error(`quote failed: ${JSON.stringify(quote.body)}`);
  }
  const b = quote.body.data.breakup;
  if (
    b.metalValue !== 101000 ||
    b.making !== 12120 ||
    b.taxable !== 113120 ||
    b.gst !== 3393.6 ||
    b.total !== 116513.6
  ) {
    throw new Error(`quote formula mismatch: ${JSON.stringify(b)}`);
  }
  console.log('[verify:rates] quote formula OK');

  const flatQuote = await request(app).post('/api/v1/calculator/quote').send({
    purity: 'silver',
    weightGrams: 50,
    makingType: 'flat',
    makingValue: 500,
    gstPercent: 3,
  });
  // metal=50*102=5100; making=500; taxable=5600; gst=168; total=5768
  const fb = flatQuote.body.data.breakup;
  if (
    fb.metalValue !== 5100 ||
    fb.making !== 500 ||
    fb.taxable !== 5600 ||
    fb.gst !== 168 ||
    fb.total !== 5768
  ) {
    throw new Error(`flat quote mismatch: ${JSON.stringify(fb)}`);
  }
  console.log('[verify:rates] flat quote OK');

  console.log('[verify:rates] Phase 09 gate PASSED');
  await disconnectMongo();
  await memory.stop();
}

main().catch(async (err) => {
  console.error('[verify:rates] FAILED', err);
  await disconnectMongo().catch(() => undefined);
  process.exit(1);
});
