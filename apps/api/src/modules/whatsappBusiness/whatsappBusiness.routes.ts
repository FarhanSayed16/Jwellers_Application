import { Router } from 'express';
import { z } from 'zod';
import { requireAdmin, requireCustomer } from '../../middleware/auth';
import { requireFeature } from '../../middleware/featureFlag';
import { badRequest } from '../../utils/errors';
import { sendSuccess } from '../../utils/response';
import {
  broadcastMorningRates,
  broadcastOffer,
  getWhatsappBusinessStatus,
  getWhatsappMarketingOptIn,
  listBroadcasts,
  setWhatsappMarketingOptIn,
} from './whatsappBusiness.service';

export const whatsappBusinessRouter = Router();

whatsappBusinessRouter.get(
  '/admin/whatsapp-business/status',
  requireAdmin,
  requireFeature('whatsappBusinessApi'),
  async (_req, res, next) => {
    try {
      return sendSuccess(res, { status: await getWhatsappBusinessStatus() });
    } catch (err) {
      return next(err);
    }
  },
);

whatsappBusinessRouter.get(
  '/admin/whatsapp-business/broadcasts',
  requireAdmin,
  requireFeature('whatsappBusinessApi'),
  async (req, res, next) => {
    try {
      const query = z
        .object({ limit: z.coerce.number().int().positive().max(100).optional() })
        .safeParse(req.query);
      if (!query.success) {
        return next(badRequest('VALIDATION_ERROR', 'Invalid query', query.error.flatten()));
      }
      const data = await listBroadcasts(query.data.limit);
      return sendSuccess(res, data);
    } catch (err) {
      return next(err);
    }
  },
);

whatsappBusinessRouter.post(
  '/admin/whatsapp-business/broadcast/rates',
  requireAdmin,
  requireFeature('whatsappBusinessApi'),
  async (req, res, next) => {
    try {
      const result = await broadcastMorningRates({
        adminId: req.admin!.id,
        ip: req.ip,
      });
      return sendSuccess(res, result, 201);
    } catch (err) {
      return next(err);
    }
  },
);

whatsappBusinessRouter.post(
  '/admin/whatsapp-business/broadcast/offer',
  requireAdmin,
  requireFeature('whatsappBusinessApi'),
  async (req, res, next) => {
    try {
      const body = z.object({ offerId: z.string().min(1) }).safeParse(req.body);
      if (!body.success) {
        return next(badRequest('VALIDATION_ERROR', 'offerId required', body.error.flatten()));
      }
      const result = await broadcastOffer({
        offerId: body.data.offerId,
        adminId: req.admin!.id,
        ip: req.ip,
      });
      return sendSuccess(res, result, 201);
    } catch (err) {
      return next(err);
    }
  },
);

whatsappBusinessRouter.get(
  '/me/whatsapp-marketing-opt-in',
  requireCustomer,
  async (req, res, next) => {
    try {
      const data = await getWhatsappMarketingOptIn(req.customer!.id);
      return sendSuccess(res, data);
    } catch (err) {
      return next(err);
    }
  },
);

whatsappBusinessRouter.put(
  '/me/whatsapp-marketing-opt-in',
  requireCustomer,
  async (req, res, next) => {
    try {
      const body = z.object({ optIn: z.boolean() }).safeParse(req.body);
      if (!body.success) {
        return next(badRequest('VALIDATION_ERROR', 'optIn boolean required', body.error.flatten()));
      }
      const data = await setWhatsappMarketingOptIn(req.customer!.id, body.data.optIn);
      return sendSuccess(res, data);
    } catch (err) {
      return next(err);
    }
  },
);
