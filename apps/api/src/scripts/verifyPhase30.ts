/**
 * Phase 30 gate — monetization modules behind feature flags.
 * Flag OFF → 403; flag ON → invoice, mock Razorpay order+webhook, old-gold quote.
 */
import bcrypt from 'bcryptjs';
import fs from 'node:fs';
import path from 'node:path';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import { createApp } from '../app';
import { env } from '../config/env';
import { connectMongo, disconnectMongo } from '../db/connection';
import { ensureAllModelsLoaded, AdminUserModel, ShopConfigModel } from '../db/models';

const root = path.resolve(__dirname, '../../../../');

function mustExist(rel: string) {
  const p = path.join(root, rel);
  if (!fs.existsSync(p)) throw new Error(`missing: ${rel}`);
  return fs.readFileSync(p, 'utf8');
}

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

async function customerAuth(app: ReturnType<typeof createApp>, phone: string) {
  const otpReq = await request(app).post('/api/v1/auth/customer/otp/request').send({ phone });
  if (otpReq.status !== 200) throw new Error(`otp request: ${JSON.stringify(otpReq.body)}`);
  const otp = otpReq.body.data.devOtp as string;
  const verify = await request(app)
    .post('/api/v1/auth/customer/otp/verify')
    .send({ phone, otp });
  if (verify.status !== 200) throw new Error(`otp verify: ${JSON.stringify(verify.body)}`);
  return { token: verify.body.data.accessToken as string };
}

async function main() {
  const docs = [
    'docs/phase30/CA_GST_NOTE.md',
    'docs/phase30/SOCKETIO_DEFERRED.md',
    'docs/phase30/QUOTE_SHEET_MODULES.md',
    'docs/phase30/30_COMPLETION_RECORD.md',
    'apps/api/src/modules/billing/invoices.routes.ts',
    'apps/api/src/modules/payments/payments.routes.ts',
    'apps/api/src/modules/oldGold/oldGold.routes.ts',
    'apps/admin/src/components/billing/InvoicesAdmin.tsx',
    'apps/admin/src/components/payments/PaymentsAdmin.tsx',
    'apps/admin/src/components/oldGold/OldGoldAdmin.tsx',
    'apps/mobile/lib/features/old_gold/old_gold_screen.dart',
    'apps/mobile/lib/features/payments/pay_advance_screen.dart',
  ];
  for (const f of docs) mustExist(f);
  console.log('[verify:phase30] docs + module files OK');

  const memory = await MongoMemoryServer.create();
  process.env.MONGODB_URI = memory.getUri();
  (env as { CLIENT_SLUG: string }).CLIENT_SLUG = 'demo';
  (env as { FEATURE_DIGITAL_BILLING: boolean }).FEATURE_DIGITAL_BILLING = false;
  (env as { FEATURE_RAZORPAY_PAYMENTS: boolean }).FEATURE_RAZORPAY_PAYMENTS = false;
  (env as { FEATURE_OLD_GOLD_EXCHANGE: boolean }).FEATURE_OLD_GOLD_EXCHANGE = false;
  (env as { RAZORPAY_KEY_ID: string }).RAZORPAY_KEY_ID = '';
  (env as { RAZORPAY_KEY_SECRET: string }).RAZORPAY_KEY_SECRET = '';

  await connectMongo(memory.getUri());
  await ensureAllModelsLoaded();

  await AdminUserModel.create({
    name: 'Demo Owner',
    email: 'owner@demo.jewellers.local',
    phone: '9999999999',
    passwordHash: await bcrypt.hash('ChangeMeOwner1!', 12),
    role: 'owner',
    isActive: true,
  });
  await ShopConfigModel.create({
    shopName: 'Demo Jewellers',
    contactPhone: '9999999999',
    contactEmail: 'hello@demojewellers.local',
    gstNumber: '27AAAAA0000A1Z5',
    themeLight: theme,
    themeDark: { ...theme, primary: '#5EBFAB', background: '#0E1513', surface: '#1A2420' },
    makingChargeDefault: { type: 'percent', value: 12 },
    gstPercentDefault: 3,
    exchangeDeductionPercent: 8,
    socialLinks: { whatsapp: '9999999999' },
    isActive: true,
  });

  const app = createApp();

  const ownerLogin = await request(app)
    .post('/api/v1/auth/admin/login')
    .send({ emailOrPhone: 'owner@demo.jewellers.local', password: 'ChangeMeOwner1!' });
  if (ownerLogin.status !== 200) throw new Error(`admin login: ${JSON.stringify(ownerLogin.body)}`);
  const ownerAuth = { Authorization: `Bearer ${ownerLogin.body.data.accessToken}` };
  const customer = await customerAuth(app, '9876543210');
  const custAuth = { Authorization: `Bearer ${customer.token}` };

  // --- Flags OFF → 403 ---
  const invOff = await request(app)
    .post('/api/v1/admin/invoices')
    .set(ownerAuth)
    .send({
      lineItems: [{ description: 'x', lineTotal: 100, gstAmount: 0 }],
      status: 'issued',
    });
  if (invOff.status !== 403) throw new Error(`billing off expected 403 got ${invOff.status}`);

  const payOff = await request(app)
    .post('/api/v1/payments/orders')
    .set(custAuth)
    .send({ amountInPaise: 10000 });
  if (payOff.status !== 403) throw new Error(`razorpay off expected 403 got ${payOff.status}`);

  const ogOff = await request(app).get('/api/v1/old-gold/config');
  if (ogOff.status !== 403) throw new Error(`old-gold off expected 403 got ${ogOff.status}`);
  console.log('[verify:phase30] flags OFF → 403 OK');

  // --- Enable flags ---
  (env as { FEATURE_DIGITAL_BILLING: boolean }).FEATURE_DIGITAL_BILLING = true;
  (env as { FEATURE_RAZORPAY_PAYMENTS: boolean }).FEATURE_RAZORPAY_PAYMENTS = true;
  (env as { FEATURE_OLD_GOLD_EXCHANGE: boolean }).FEATURE_OLD_GOLD_EXCHANGE = true;

  // Rate for old-gold
  const rate = await request(app)
    .post('/api/v1/rates')
    .set(ownerAuth)
    .send({
      gold24kPerGram: 7500,
      gold22kPerGram: 6900,
      gold18kPerGram: 5650,
      silverPerGram: 95,
      note: 'Phase30',
      force: true,
    });
  if (rate.status !== 201) throw new Error(`rate: ${JSON.stringify(rate.body)}`);

  // Invoice create
  const inv = await request(app)
    .post('/api/v1/admin/invoices')
    .set(ownerAuth)
    .send({
      status: 'issued',
      lineItems: [
        {
          description: '22K ring estimate',
          purity: '22K',
          weightGrams: 4,
          ratePerGram: 6900,
          gstAmount: 300,
          lineTotal: 10300,
        },
      ],
    });
  if (inv.status !== 201) throw new Error(`invoice create: ${JSON.stringify(inv.body)}`);
  const invoice = inv.body.data.invoice;
  if (!invoice?.invoiceNumber?.startsWith('INV-') || invoice.grandTotal !== 10300) {
    throw new Error(`bad invoice payload: ${JSON.stringify(invoice)}`);
  }
  if (!String(invoice.shareText || '').includes(invoice.invoiceNumber)) {
    throw new Error('invoice missing shareText');
  }
  const listInv = await request(app).get('/api/v1/admin/invoices').set(ownerAuth);
  if (listInv.status !== 200 || !listInv.body.data.invoices?.length) {
    throw new Error('invoice list failed');
  }
  console.log('[verify:phase30] digital billing OK');

  // Mock Razorpay order + webhook
  const order = await request(app)
    .post('/api/v1/payments/orders')
    .set(custAuth)
    .send({ amountInPaise: 50000, invoiceId: invoice.id });
  if (order.status !== 201) throw new Error(`payment order: ${JSON.stringify(order.body)}`);
  if (!order.body.data.mock) throw new Error('expected mock payment order without Razorpay keys');
  const orderId = order.body.data.payment.razorpayOrderId as string;
  if (!orderId.startsWith('order_mock_')) throw new Error(`unexpected order id ${orderId}`);

  const webhookBody = {
    event: 'payment.captured',
    payload: {
      payment: {
        entity: {
          id: 'pay_mock_1',
          order_id: orderId,
          status: 'captured',
        },
      },
    },
  };
  const wh = await request(app)
    .post('/api/v1/payments/webhook')
    .set('x-razorpay-signature', 'mock')
    .send(webhookBody);
  if (wh.status !== 200) throw new Error(`webhook: ${JSON.stringify(wh.body)}`);
  if (wh.body.data.payment.status !== 'paid') {
    throw new Error(`expected paid got ${wh.body.data.payment.status}`);
  }
  const payList = await request(app).get('/api/v1/admin/payments').set(ownerAuth);
  if (payList.status !== 200 || !payList.body.data.payments?.length) {
    throw new Error('admin payments list failed');
  }
  console.log('[verify:phase30] razorpay mock order + webhook OK');

  // Old-gold
  const cfg = await request(app).get('/api/v1/old-gold/config');
  if (cfg.status !== 200 || cfg.body.data.exchangeDeductionPercent !== 8) {
    throw new Error(`old-gold config: ${JSON.stringify(cfg.body)}`);
  }
  const quote = await request(app)
    .post('/api/v1/old-gold/quote')
    .set(custAuth)
    .send({ metal: 'gold', purity: '22K', weightGrams: 10, save: true });
  if (quote.status !== 200) throw new Error(`old-gold quote: ${JSON.stringify(quote.body)}`);
  const q = quote.body.data.quote;
  // 6900*10 = 69000; 8% off → 63480
  if (q.grossValue !== 69000 || q.estimatedValue !== 63480 || !q.saved) {
    throw new Error(`bad quote math: ${JSON.stringify(q)}`);
  }
  const hist = await request(app).get('/api/v1/old-gold/history').set(custAuth);
  if (hist.status !== 200 || !hist.body.data.quotes?.length) {
    throw new Error('old-gold history failed');
  }
  const patch = await request(app)
    .patch('/api/v1/admin/old-gold/config')
    .set(ownerAuth)
    .send({ exchangeDeductionPercent: 10 });
  if (patch.status !== 200 || patch.body.data.exchangeDeductionPercent !== 10) {
    throw new Error(`deduction patch: ${JSON.stringify(patch.body)}`);
  }
  console.log('[verify:phase30] old-gold OK');

  const features = await request(app).get('/api/v1/config/features');
  if (
    !features.body.data.digitalBilling ||
    !features.body.data.razorpayPayments ||
    !features.body.data.oldGoldExchange
  ) {
    throw new Error('public features missing monetization flags');
  }
  console.log('[verify:phase30] public features OK');

  await disconnectMongo();
  await memory.stop();
  console.log('[verify:phase30] ALL PASSED — Monetization modules gate green');
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('[verify:phase30] FAILED', err);
    process.exit(1);
  });

