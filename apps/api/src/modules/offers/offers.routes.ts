import { Router } from 'express';
import { z } from 'zod';
import { requireAdmin } from '../../middleware/auth';
import { requireFeature } from '../../middleware/featureFlag';
import { badRequest } from '../../utils/errors';
import { sendSuccess } from '../../utils/response';
import {
  createOffer,
  listAdminOffers,
  listPublicOffers,
  softDeleteOffer,
  updateOffer,
} from './offers.service';

export const offersRouter = Router();

offersRouter.get('/offers', requireFeature('offers'), async (_req, res, next) => {
  try {
    const data = await listPublicOffers();
    return sendSuccess(res, data);
  } catch (err) {
    return next(err);
  }
});

offersRouter.get('/admin/offers', requireFeature('offers'), requireAdmin, async (_req, res, next) => {
  try {
    const data = await listAdminOffers();
    return sendSuccess(res, data);
  } catch (err) {
    return next(err);
  }
});

offersRouter.post('/admin/offers', requireFeature('offers'), requireAdmin, async (req, res, next) => {
  try {
    const body = z
      .object({
        title: z.string().min(1).max(200),
        description: z.string().max(5000).optional(),
        bannerImageUrl: z.string().url().optional(),
        validFrom: z.string().datetime().nullable().optional(),
        validTill: z.string().datetime().nullable().optional(),
        isActive: z.boolean().optional(),
        sortOrder: z.number().int().optional(),
      })
      .safeParse(req.body);
    if (!body.success) {
      return next(badRequest('VALIDATION_ERROR', 'Invalid offer payload', body.error.flatten()));
    }
    const offer = await createOffer({
      ...body.data,
      validFrom: body.data.validFrom ? new Date(body.data.validFrom) : undefined,
      validTill: body.data.validTill ? new Date(body.data.validTill) : undefined,
    });
    return sendSuccess(res, { offer }, 201);
  } catch (err) {
    return next(err);
  }
});

offersRouter.patch(
  '/admin/offers/:id',
  requireFeature('offers'),
  requireAdmin,
  async (req, res, next) => {
    try {
      const body = z
        .object({
          title: z.string().min(1).max(200).optional(),
          description: z.string().max(5000).nullable().optional(),
          bannerImageUrl: z.string().url().nullable().optional(),
          validFrom: z.string().datetime().nullable().optional(),
          validTill: z.string().datetime().nullable().optional(),
          isActive: z.boolean().optional(),
          sortOrder: z.number().int().optional(),
        })
        .safeParse(req.body);
      if (!body.success) {
        return next(badRequest('VALIDATION_ERROR', 'Invalid offer payload', body.error.flatten()));
      }
      const offer = await updateOffer(req.params.id, {
        ...body.data,
        validFrom:
          body.data.validFrom === undefined
            ? undefined
            : body.data.validFrom
              ? new Date(body.data.validFrom)
              : null,
        validTill:
          body.data.validTill === undefined
            ? undefined
            : body.data.validTill
              ? new Date(body.data.validTill)
              : null,
      });
      return sendSuccess(res, { offer });
    } catch (err) {
      return next(err);
    }
  },
);

offersRouter.delete(
  '/admin/offers/:id',
  requireFeature('offers'),
  requireAdmin,
  async (req, res, next) => {
    try {
      const data = await softDeleteOffer(req.params.id);
      return sendSuccess(res, data);
    } catch (err) {
      return next(err);
    }
  },
);
