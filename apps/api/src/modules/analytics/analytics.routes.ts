import { Router } from 'express';
import { z } from 'zod';
import { requireAdmin, requireCustomer } from '../../middleware/auth';
import { requireFeature } from '../../middleware/featureFlag';
import { badRequest } from '../../utils/errors';
import { sendSuccess } from '../../utils/response';
import {
  getAnalyticsSummary,
  getMostViewedItems,
  postClientEvent,
} from './analytics.service';

export const analyticsRouter = Router();

/** Public/client event ingest (optional auth). */
analyticsRouter.post('/events', requireFeature('analytics'), async (req, res, next) => {
  try {
    const header = req.header('authorization');
    if (header?.startsWith('Bearer ')) {
      await new Promise<void>((resolve, reject) => {
        requireCustomer(req, res, (err?: unknown) => (err ? reject(err) : resolve()));
      }).catch(() => undefined);
    }

    const body = z
      .object({
        type: z.enum(['item_view', 'wishlist_add', 'enquiry_create', 'calculator_use']),
        itemId: z.string().optional().nullable(),
        meta: z.record(z.string(), z.unknown()).optional(),
      })
      .safeParse(req.body);
    if (!body.success) {
      return next(badRequest('VALIDATION_ERROR', 'Invalid event', body.error.flatten()));
    }
    const event = await postClientEvent({
      ...body.data,
      customerId: req.customer?.id,
    });
    return sendSuccess(res, { event }, 201);
  } catch (err) {
    return next(err);
  }
});

analyticsRouter.get(
  '/admin/analytics/summary',
  requireAdmin,
  requireFeature('analytics'),
  async (req, res, next) => {
    try {
      const days = Number(req.query.days ?? 30);
      const summary = await getAnalyticsSummary(days);
      return sendSuccess(res, { summary });
    } catch (err) {
      return next(err);
    }
  },
);

analyticsRouter.get(
  '/admin/analytics/most-viewed',
  requireAdmin,
  requireFeature('analytics'),
  async (req, res, next) => {
    try {
      const limit = Number(req.query.limit ?? 10);
      const days = Number(req.query.days ?? 30);
      const data = await getMostViewedItems(limit, days);
      return sendSuccess(res, data);
    } catch (err) {
      return next(err);
    }
  },
);
