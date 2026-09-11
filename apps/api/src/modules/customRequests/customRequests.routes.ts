import { Router } from 'express';
import { z } from 'zod';
import { requireAdmin, requireCustomer } from '../../middleware/auth';
import { requireFeature } from '../../middleware/featureFlag';
import { badRequest } from '../../utils/errors';
import { sendSuccess } from '../../utils/response';
import {
  createCustomRequest,
  listAdminCustomRequests,
  listMyCustomRequests,
  updateAdminCustomRequest,
} from './customRequests.service';

export const customRequestsRouter = Router();

customRequestsRouter.post(
  '/custom-requests',
  requireFeature('customRequests'),
  requireCustomer,
  async (req, res, next) => {
    try {
      const body = z
        .object({
          description: z.string().min(1).max(5000),
          referenceImageUrls: z.array(z.string().url()).max(10).optional(),
          budgetHint: z.string().max(200).optional(),
        })
        .safeParse(req.body);
      if (!body.success) {
        return next(
          badRequest('VALIDATION_ERROR', 'Invalid custom request payload', body.error.flatten()),
        );
      }
      const customRequest = await createCustomRequest({
        customerId: req.customer!.id,
        ...body.data,
      });
      return sendSuccess(res, { customRequest }, 201);
    } catch (err) {
      return next(err);
    }
  },
);

customRequestsRouter.get(
  '/custom-requests/me',
  requireFeature('customRequests'),
  requireCustomer,
  async (req, res, next) => {
    try {
      const data = await listMyCustomRequests(req.customer!.id);
      return sendSuccess(res, data);
    } catch (err) {
      return next(err);
    }
  },
);

customRequestsRouter.get(
  '/admin/custom-requests',
  requireFeature('customRequests'),
  requireAdmin,
  async (req, res, next) => {
    try {
      const query = z
        .object({
          status: z.enum(['new', 'in_progress', 'quoted', 'closed']).optional(),
        })
        .safeParse(req.query);
      if (!query.success) {
        return next(badRequest('VALIDATION_ERROR', 'Invalid query', query.error.flatten()));
      }
      const data = await listAdminCustomRequests(query.data);
      return sendSuccess(res, data);
    } catch (err) {
      return next(err);
    }
  },
);

customRequestsRouter.patch(
  '/admin/custom-requests/:id',
  requireFeature('customRequests'),
  requireAdmin,
  async (req, res, next) => {
    try {
      const body = z
        .object({
          status: z.enum(['new', 'in_progress', 'quoted', 'closed']).optional(),
        })
        .safeParse(req.body);
      if (!body.success) {
        return next(badRequest('VALIDATION_ERROR', 'Invalid patch payload', body.error.flatten()));
      }
      const customRequest = await updateAdminCustomRequest(req.params.id, body.data);
      return sendSuccess(res, { customRequest });
    } catch (err) {
      return next(err);
    }
  },
);
