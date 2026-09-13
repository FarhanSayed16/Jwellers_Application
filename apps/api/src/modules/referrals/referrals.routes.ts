import { Router } from 'express';
import { z } from 'zod';
import { requireAdmin, requireCustomer } from '../../middleware/auth';
import { requireFeature } from '../../middleware/featureFlag';
import { badRequest } from '../../utils/errors';
import { sendSuccess } from '../../utils/response';
import {
  applyReferralCode,
  ensureReferralCode,
  getReferralStats,
} from './referrals.service';

export const referralsRouter = Router();

referralsRouter.get(
  '/referrals/me',
  requireCustomer,
  requireFeature('referrals'),
  async (req, res, next) => {
    try {
      const data = await ensureReferralCode(req.customer!.id);
      return sendSuccess(res, data);
    } catch (err) {
      return next(err);
    }
  },
);

referralsRouter.post(
  '/referrals/apply',
  requireCustomer,
  requireFeature('referrals'),
  async (req, res, next) => {
    try {
      const body = z.object({ code: z.string().min(3).max(32) }).safeParse(req.body);
      if (!body.success) {
        return next(badRequest('VALIDATION_ERROR', 'Invalid code', body.error.flatten()));
      }
      const data = await applyReferralCode(req.customer!.id, body.data.code);
      return sendSuccess(res, data);
    } catch (err) {
      return next(err);
    }
  },
);

referralsRouter.get(
  '/admin/referrals/stats',
  requireAdmin,
  requireFeature('referrals'),
  async (_req, res, next) => {
    try {
      const data = await getReferralStats();
      return sendSuccess(res, data);
    } catch (err) {
      return next(err);
    }
  },
);
