import { Router } from 'express';
import { z } from 'zod';
import { requireAdmin, requireCustomer } from '../../middleware/auth';
import { requireFeature } from '../../middleware/featureFlag';
import { badRequest } from '../../utils/errors';
import { sendSuccess } from '../../utils/response';
import {
  getExchangeConfig,
  listAdminOldGoldQuotes,
  listCustomerOldGoldHistory,
  quoteOldGold,
  updateExchangeDeductionPercent,
} from './oldGold.service';

export const oldGoldRouter = Router();

oldGoldRouter.get('/old-gold/config', requireFeature('oldGoldExchange'), async (_req, res, next) => {
  try {
    const data = await getExchangeConfig();
    return sendSuccess(res, data);
  } catch (err) {
    return next(err);
  }
});

oldGoldRouter.post('/old-gold/quote', requireFeature('oldGoldExchange'), async (req, res, next) => {
  try {
    // Optional bearer: if present, attach customer for save
    const header = req.header('authorization');
    if (header?.startsWith('Bearer ')) {
      await new Promise<void>((resolve, reject) => {
        requireCustomer(req, res, (err?: unknown) => (err ? reject(err) : resolve()));
      }).catch(() => undefined);
    }

    const body = z
      .object({
        metal: z.enum(['gold', 'silver']),
        purity: z.enum(['24K', '22K', '18K', 'other']),
        weightGrams: z.number().finite().positive(),
        save: z.boolean().optional(),
        note: z.string().max(500).optional(),
      })
      .safeParse(req.body);
    if (!body.success) {
      return next(badRequest('VALIDATION_ERROR', 'Invalid quote', body.error.flatten()));
    }
    if (body.data.save && !req.customer?.id) {
      return next(badRequest('AUTH_REQUIRED', 'Login required to save quote history'));
    }
    const data = await quoteOldGold({
      ...body.data,
      customerId: req.customer?.id,
    });
    return sendSuccess(res, data);
  } catch (err) {
    return next(err);
  }
});

oldGoldRouter.get(
  '/old-gold/history',
  requireCustomer,
  requireFeature('oldGoldExchange'),
  async (req, res, next) => {
    try {
      const data = await listCustomerOldGoldHistory(req.customer!.id);
      return sendSuccess(res, data);
    } catch (err) {
      return next(err);
    }
  },
);

oldGoldRouter.patch(
  '/admin/old-gold/config',
  requireAdmin,
  requireFeature('oldGoldExchange'),
  async (req, res, next) => {
    try {
      const body = z
        .object({ exchangeDeductionPercent: z.number().finite().min(0).max(50) })
        .safeParse(req.body);
      if (!body.success) {
        return next(badRequest('VALIDATION_ERROR', 'Invalid config', body.error.flatten()));
      }
      const data = await updateExchangeDeductionPercent(body.data.exchangeDeductionPercent);
      return sendSuccess(res, data);
    } catch (err) {
      return next(err);
    }
  },
);

oldGoldRouter.get(
  '/admin/old-gold/quotes',
  requireAdmin,
  requireFeature('oldGoldExchange'),
  async (req, res, next) => {
    try {
      const limit = Number(req.query.limit ?? 50);
      const data = await listAdminOldGoldQuotes(limit);
      return sendSuccess(res, data);
    } catch (err) {
      return next(err);
    }
  },
);
