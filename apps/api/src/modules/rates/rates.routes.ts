import { Router } from 'express';
import { z } from 'zod';
import { requireAdmin } from '../../middleware/auth';
import { requireFeature } from '../../middleware/featureFlag';
import { badRequest } from '../../utils/errors';
import { sendSuccess } from '../../utils/response';
import {
  calculateQuote,
  createRate,
  getLatestRate,
  getRateHistory,
} from './rates.service';
import {
  fetchRateSuggestion,
  getRateApiSettings,
  publishFromApiSuggestion,
  updateRateApiSettings,
} from './rateApi.service';
import { notifyRatesUpdated } from '../devices/devices.service';

export const ratesRouter = Router();

const positiveMoney = z.number().finite().nonnegative();

ratesRouter.get('/rates/latest', async (_req, res, next) => {
  try {
    const latest = await getLatestRate();
    return sendSuccess(res, { rate: latest });
  } catch (err) {
    return next(err);
  }
});

ratesRouter.get('/rates/history', requireFeature('rateHistory'), async (req, res, next) => {
  try {
    const query = z
      .object({
        from: z.string().datetime().optional(),
        to: z.string().datetime().optional(),
        limit: z.coerce.number().int().positive().max(365).optional(),
      })
      .safeParse(req.query);
    if (!query.success) {
      return next(badRequest('VALIDATION_ERROR', 'Invalid history query', query.error.flatten()));
    }
    const points = await getRateHistory({
      from: query.data.from ? new Date(query.data.from) : undefined,
      to: query.data.to ? new Date(query.data.to) : undefined,
      limit: query.data.limit,
    });
    return sendSuccess(res, { points });
  } catch (err) {
    return next(err);
  }
});

ratesRouter.post('/rates', requireAdmin, async (req, res, next) => {
  try {
    const body = z
      .object({
        gold24kPerGram: positiveMoney,
        gold22kPerGram: positiveMoney,
        gold18kPerGram: positiveMoney,
        silverPerGram: positiveMoney,
        note: z.string().max(500).optional(),
        effectiveAt: z.string().datetime().optional(),
        force: z.boolean().optional(),
      })
      .safeParse(req.body);
    if (!body.success) {
      return next(badRequest('VALIDATION_ERROR', 'Invalid rate payload', body.error.flatten()));
    }
    const rate = await createRate({
      ...body.data,
      effectiveAt: body.data.effectiveAt ? new Date(body.data.effectiveAt) : undefined,
      adminId: req.admin!.id,
      ip: req.ip,
    });
    return sendSuccess(res, { rate }, 201);
  } catch (err) {
    return next(err);
  }
});

ratesRouter.post('/rates/notify', requireAdmin, async (req, res, next) => {
  try {
    const result = await notifyRatesUpdated();
    return sendSuccess(res, {
      notify: {
        type: 'rates_updated',
        ...result,
      },
    });
  } catch (err) {
    return next(err);
  }
});

ratesRouter.get(
  '/admin/rates/api-settings',
  requireAdmin,
  requireFeature('rateApi'),
  async (_req, res, next) => {
    try {
      return sendSuccess(res, { settings: await getRateApiSettings() });
    } catch (err) {
      return next(err);
    }
  },
);

ratesRouter.patch(
  '/admin/rates/api-settings',
  requireAdmin,
  requireFeature('rateApi'),
  async (req, res, next) => {
    try {
      const body = z
        .object({
          marginPercentGold: z.number().finite().min(0).max(25).optional(),
          marginPercentSilver: z.number().finite().min(0).max(25).optional(),
        })
        .safeParse(req.body);
      if (!body.success) {
        return next(badRequest('VALIDATION_ERROR', 'Invalid settings', body.error.flatten()));
      }
      const settings = await updateRateApiSettings(body.data);
      return sendSuccess(res, { settings });
    } catch (err) {
      return next(err);
    }
  },
);

ratesRouter.post(
  '/admin/rates/fetch-suggest',
  requireAdmin,
  requireFeature('rateApi'),
  async (_req, res, next) => {
    try {
      const suggestion = await fetchRateSuggestion();
      return sendSuccess(res, { suggestion });
    } catch (err) {
      return next(err);
    }
  },
);

ratesRouter.post(
  '/admin/rates/publish-from-api',
  requireAdmin,
  requireFeature('rateApi'),
  async (req, res, next) => {
    try {
      const body = z
        .object({
          gold24kPerGram: positiveMoney,
          gold22kPerGram: positiveMoney,
          gold18kPerGram: positiveMoney,
          silverPerGram: positiveMoney,
          note: z.string().max(500).optional(),
          force: z.boolean().optional(),
        })
        .safeParse(req.body);
      if (!body.success) {
        return next(badRequest('VALIDATION_ERROR', 'Invalid rate payload', body.error.flatten()));
      }
      const rate = await publishFromApiSuggestion({
        ...body.data,
        adminId: req.admin!.id,
        ip: req.ip,
      });
      return sendSuccess(res, { rate }, 201);
    } catch (err) {
      return next(err);
    }
  },
);

ratesRouter.post('/calculator/quote', async (req, res, next) => {
  try {
    const body = z
      .object({
        purity: z.enum(['24k', '22k', '18k', 'silver']),
        weightGrams: z.number().finite().positive(),
        makingType: z.enum(['percent', 'flat']),
        makingValue: z.number().finite().nonnegative(),
        gstPercent: z.number().finite().nonnegative().optional(),
      })
      .safeParse(req.body);
    if (!body.success) {
      return next(badRequest('VALIDATION_ERROR', 'Invalid quote payload', body.error.flatten()));
    }
    const quote = await calculateQuote(body.data);
    return sendSuccess(res, quote);
  } catch (err) {
    return next(err);
  }
});
