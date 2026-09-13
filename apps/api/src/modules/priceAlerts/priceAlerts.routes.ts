import { Router } from 'express';
import { z } from 'zod';
import { requireAdmin, requireCustomer } from '../../middleware/auth';
import { requireFeature } from '../../middleware/featureFlag';
import { badRequest } from '../../utils/errors';
import { sendSuccess } from '../../utils/response';
import {
  cancelPriceAlert,
  createPriceAlert,
  listAdminPriceAlerts,
  listMyPriceAlerts,
} from './priceAlerts.service';

export const priceAlertsRouter = Router();

priceAlertsRouter.post(
  '/price-alerts',
  requireCustomer,
  requireFeature('priceAlerts'),
  async (req, res, next) => {
    try {
      const body = z
        .object({
          purity: z.enum(['24K', '22K', '18K', 'silver']),
          belowAmount: z.number().finite().positive(),
        })
        .safeParse(req.body);
      if (!body.success) {
        return next(badRequest('VALIDATION_ERROR', 'Invalid alert', body.error.flatten()));
      }
      const alert = await createPriceAlert({
        ...body.data,
        customerId: req.customer!.id,
      });
      return sendSuccess(res, { alert }, 201);
    } catch (err) {
      return next(err);
    }
  },
);

priceAlertsRouter.get(
  '/price-alerts/me',
  requireCustomer,
  requireFeature('priceAlerts'),
  async (req, res, next) => {
    try {
      const data = await listMyPriceAlerts(req.customer!.id);
      return sendSuccess(res, data);
    } catch (err) {
      return next(err);
    }
  },
);

priceAlertsRouter.post(
  '/price-alerts/:id/cancel',
  requireCustomer,
  requireFeature('priceAlerts'),
  async (req, res, next) => {
    try {
      const alert = await cancelPriceAlert(req.customer!.id, req.params.id);
      return sendSuccess(res, { alert });
    } catch (err) {
      return next(err);
    }
  },
);

priceAlertsRouter.get(
  '/admin/price-alerts',
  requireAdmin,
  requireFeature('priceAlerts'),
  async (req, res, next) => {
    try {
      const status = typeof req.query.status === 'string' ? req.query.status : undefined;
      const data = await listAdminPriceAlerts(status);
      return sendSuccess(res, data);
    } catch (err) {
      return next(err);
    }
  },
);
