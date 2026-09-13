import crypto from 'node:crypto';
import { Types } from 'mongoose';
import { env, isProd } from '../../config/env';
import { getMongoConnectionState } from '../../db/connection';
import { PaymentModel } from '../../db/models/Payment';
import { writeAuditLog } from '../../utils/audit';
import { badRequest, notFound, serviceUnavailable } from '../../utils/errors';

function assertDb() {
  if (getMongoConnectionState().readyState !== 1) {
    throw notFound('DATABASE_UNAVAILABLE', 'Database is not connected');
  }
}

/** Mock Razorpay allowed only outside production (verify scripts / local demo). */
export function allowRazorpayMock() {
  return !isProd;
}

function toDto(doc: {
  _id: { toString(): string };
  customerId?: { toString(): string } | null;
  enquiryId?: { toString(): string } | null;
  invoiceId?: { toString(): string } | null;
  razorpayOrderId: string;
  razorpayPaymentId?: string | null;
  amountInPaise: number;
  currency?: string | null;
  status: string;
  createdAt: Date;
}) {
  return {
    id: String(doc._id),
    customerId: doc.customerId ? String(doc.customerId) : null,
    enquiryId: doc.enquiryId ? String(doc.enquiryId) : null,
    invoiceId: doc.invoiceId ? String(doc.invoiceId) : null,
    razorpayOrderId: doc.razorpayOrderId,
    razorpayPaymentId: doc.razorpayPaymentId ?? null,
    amountInPaise: doc.amountInPaise,
    amountRupees: doc.amountInPaise / 100,
    currency: doc.currency ?? 'INR',
    status: doc.status,
    createdAt: new Date(doc.createdAt).toISOString(),
  };
}

export function razorpayConfigured() {
  const id = (process.env.RAZORPAY_KEY_ID || env.RAZORPAY_KEY_ID || '').trim();
  const secret = (process.env.RAZORPAY_KEY_SECRET || env.RAZORPAY_KEY_SECRET || '').trim();
  return Boolean(id && secret);
}

/**
 * Create Razorpay order.
 * Mock order ids only when keys are missing **and** NODE_ENV is development/test.
 * Production always requires live keys (see assertProductionSecrets).
 */
export async function createPaymentOrder(input: {
  customerId: string;
  amountInPaise: number;
  currency?: string;
  enquiryId?: string | null;
  invoiceId?: string | null;
  receipt?: string;
}) {
  assertDb();
  if (!Number.isFinite(input.amountInPaise) || input.amountInPaise < 100) {
    throw badRequest('VALIDATION_ERROR', 'amountInPaise must be ≥ 100 (₹1)');
  }

  const keyId = (process.env.RAZORPAY_KEY_ID || env.RAZORPAY_KEY_ID || '').trim();
  const keySecret = (process.env.RAZORPAY_KEY_SECRET || env.RAZORPAY_KEY_SECRET || '').trim();
  const currency = input.currency ?? 'INR';
  let razorpayOrderId: string;
  let mock = false;

  if (keyId && keySecret) {
    const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
    const res = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: input.amountInPaise,
        currency,
        receipt: input.receipt ?? `rcpt_${Date.now()}`,
        notes: {
          customerId: input.customerId,
          enquiryId: input.enquiryId ?? '',
          invoiceId: input.invoiceId ?? '',
        },
      }),
    });
    const body = (await res.json().catch(() => ({}))) as { id?: string; error?: { description?: string } };
    if (!res.ok || !body.id) {
      throw badRequest('RAZORPAY_ORDER_FAILED', body.error?.description ?? 'Razorpay order failed');
    }
    razorpayOrderId = body.id;
  } else if (allowRazorpayMock()) {
    mock = true;
    razorpayOrderId = `order_mock_${crypto.randomBytes(8).toString('hex')}`;
  } else {
    throw serviceUnavailable(
      'RAZORPAY_NOT_CONFIGURED',
      'Razorpay keys are required when payments are enabled in production',
    );
  }

  const doc = await PaymentModel.create({
    customerId: input.customerId,
    enquiryId: input.enquiryId || undefined,
    invoiceId: input.invoiceId || undefined,
    razorpayOrderId,
    amountInPaise: input.amountInPaise,
    currency,
    status: 'created',
  });

  return {
    payment: toDto(doc),
    razorpayKeyId: keyId || null,
    mock,
  };
}

export function verifyWebhookSignature(rawBody: string, signature: string | undefined) {
  const secret = (process.env.RAZORPAY_KEY_SECRET || env.RAZORPAY_KEY_SECRET || '').trim();
  if (!secret) {
    // Never accept forgeable signatures in production — even if keys were cleared at runtime.
    if (!allowRazorpayMock()) return false;
    return signature === 'mock' || signature === 'test';
  }
  if (!signature) return false;
  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}

export async function applyWebhookEvent(payload: {
  event?: string;
  payload?: {
    payment?: {
      entity?: {
        id?: string;
        order_id?: string;
        status?: string;
      };
    };
  };
}) {
  assertDb();
  const entity = payload.payload?.payment?.entity;
  const orderId = entity?.order_id;
  if (!orderId) throw badRequest('VALIDATION_ERROR', 'Missing order_id in webhook');

  const doc = await PaymentModel.findOne({ razorpayOrderId: orderId }).exec();
  if (!doc) throw notFound('PAYMENT_NOT_FOUND', 'Payment for order not found');

  doc.rawWebhook = payload;
  if (entity?.id) doc.razorpayPaymentId = entity.id;
  const st = entity?.status;
  if (st === 'captured' || st === 'authorized' || payload.event === 'payment.captured') {
    doc.status = 'paid';
  } else if (st === 'failed' || payload.event === 'payment.failed') {
    doc.status = 'failed';
  }
  await doc.save();
  return toDto(doc);
}

export async function listAdminPayments(limit = 50) {
  assertDb();
  const rows = await PaymentModel.find()
    .sort({ createdAt: -1 })
    .limit(Math.min(Math.max(limit, 1), 100))
    .exec();
  return { payments: rows.map(toDto) };
}

/** Manual reconcile when webhook missed or mock/demo — admin marks paid. */
export async function markPaymentPaid(adminId: string, paymentId: string) {
  assertDb();
  if (!Types.ObjectId.isValid(paymentId)) {
    throw notFound('PAYMENT_NOT_FOUND', 'Payment not found');
  }
  const doc = await PaymentModel.findById(paymentId).exec();
  if (!doc) throw notFound('PAYMENT_NOT_FOUND', 'Payment not found');

  const before = doc.status;
  if (doc.status === 'paid') {
    return toDto(doc);
  }
  if (doc.status !== 'created') {
    throw badRequest('INVALID_STATUS', `Cannot mark ${doc.status} payment as paid`);
  }

  doc.status = 'paid';
  await doc.save();

  await writeAuditLog({
    actorType: 'admin',
    actorId: adminId,
    action: 'payment.mark_paid',
    entityType: 'Payment',
    entityId: String(doc._id),
    before: { status: before },
    after: { status: 'paid' },
  });

  return toDto(doc);
}
