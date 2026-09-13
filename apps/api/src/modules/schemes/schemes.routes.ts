import { Router } from 'express';
import { z } from 'zod';
import { requireAdmin } from '../../middleware/auth';
import { requireFeature } from '../../middleware/featureFlag';
import { badRequest } from '../../utils/errors';
import { sendSuccess } from '../../utils/response';
import { createScheme, listActiveSchemes, listAdminSchemes } from './schemes.service';

export const schemesRouter = Router();

schemesRouter.get('/schemes/active', requireFeature('schemes'), async (_req, res, next) => {
  try {
    const data = await listActiveSchemes();
    return sendSuccess(res, data);
  } catch (err) {
    return next(err);
  }
});

schemesRouter.get(
  '/admin/schemes',
  requireAdmin,
  requireFeature('schemes'),
  async (_req, res, next) => {
    try {
      const data = await listAdminSchemes();
      return sendSuccess(res, data);
    } catch (err) {
      return next(err);
    }
  },
);

schemesRouter.post(
  '/admin/schemes',
  requireAdmin,
  requireFeature('schemes'),
  async (req, res, next) => {
    try {
      const body = z
        .object({
          title: z.string().min(1).max(120),
          description: z.string().max(500).optional(),
          makingPercentOverride: z.number().finite().min(0).max(100).optional(),
          startAt: z.string(),
          endAt: z.string(),
          isActive: z.boolean().optional(),
        })
        .safeParse(req.body);
      if (!body.success) {
        return next(badRequest('VALIDATION_ERROR', 'Invalid scheme', body.error.flatten()));
      }
      const startAt = new Date(body.data.startAt);
      const endAt = new Date(body.data.endAt);
      if (Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime())) {
        return next(badRequest('VALIDATION_ERROR', 'Invalid dates'));
      }
      const scheme = await createScheme({ ...body.data, startAt, endAt });
      return sendSuccess(res, { scheme }, 201);
    } catch (err) {
      return next(err);
    }
  },
);
