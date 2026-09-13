import { Router } from 'express';
import { z } from 'zod';
import { requireAdmin, requireCustomer } from '../../middleware/auth';
import { requireFeature } from '../../middleware/featureFlag';
import { badRequest, unauthorized } from '../../utils/errors';
import { sendSuccess } from '../../utils/response';
import {
  applyWebhookEvent,
  createPaymentOrder,
  listAdminPayments,
  markPaymentPaid,
  verifyWebhookSignature,
} from './payments.service';

export const paymentsRouter = Router();

paymentsRouter.post(
  '/payments/orders',
  requireCustomer,
  requireFeature('razorpayPayments'),
  async (req, res, next) => {
    try {
      const body = z
        .object({
          amountInPaise: z.number().int().positive(),
          currency: z.string().length(3).optional(),
          enquiryId: z.string().optional().nullable(),
          invoiceId: z.string().optional().nullable(),
          receipt: z.string().max(40).optional(),
        })
        .safeParse(req.body);
      if (!body.success) {
        return next(badRequest('VALIDATION_ERROR', 'Invalid payment order', body.error.flatten()));
      }
      const data = await createPaymentOrder({
        ...body.data,
        customerId: req.customer!.id,
      });
      return sendSuccess(res, data, 201);
    } catch (err) {
      return next(err);
    }
  },
);

/**
 * Webhook — prefers raw body for HMAC. When JSON middleware already parsed,
 * we re-stringify (acceptable for local mock; production must use live keys +
 * prefer a raw-body parser for exact HMAC).
 *
 * Mock signatures (`mock` / `test`) are rejected when NODE_ENV=production.
 */
paymentsRouter.post('/payments/webhook', async (req, res, next) => {
  try {
    const signature =
      (req.header('x-razorpay-signature') as string | undefined) ||
      (req.header('X-Razorpay-Signature') as string | undefined);
    const raw =
      (req as { rawBody?: string }).rawBody ||
      (typeof req.body === 'string' || Buffer.isBuffer(req.body)
        ? String(req.body)
        : JSON.stringify(req.body ?? {}));
    if (!verifyWebhookSignature(raw, signature)) {
      return next(unauthorized('INVALID_SIGNATURE', 'Invalid Razorpay webhook signature'));
    }
    const payload =
      typeof req.body === 'object' && req.body && !Buffer.isBuffer(req.body)
        ? (req.body as Parameters<typeof applyWebhookEvent>[0])
        : (JSON.parse(raw) as Parameters<typeof applyWebhookEvent>[0]);
    const payment = await applyWebhookEvent(payload);
    return sendSuccess(res, { payment });
  } catch (err) {
    return next(err);
  }
});

paymentsRouter.get(
  '/admin/payments',
  requireAdmin,
  requireFeature('razorpayPayments'),
  async (req, res, next) => {
    try {
      const limit = Number(req.query.limit ?? 50);
      const data = await listAdminPayments(limit);
      return sendSuccess(res, data);
    } catch (err) {
      return next(err);
    }
  },
);

paymentsRouter.post(
  '/admin/payments/:id/mark-paid',
  requireAdmin,
  requireFeature('razorpayPayments'),
  async (req, res, next) => {
    try {
      const payment = await markPaymentPaid(req.admin!.id, req.params.id);
      return sendSuccess(res, { payment });
    } catch (err) {
      return next(err);
    }
  },
);
