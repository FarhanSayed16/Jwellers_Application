import { Router } from 'express';
import { z } from 'zod';
import { requireAdmin, requireCustomer } from '../../middleware/auth';
import { requireFeature } from '../../middleware/featureFlag';
import { badRequest } from '../../utils/errors';
import { sendSuccess } from '../../utils/response';
import {
  createAppointment,
  listAdminAppointments,
  listMyAppointments,
  updateAdminAppointment,
} from './appointments.service';

export const appointmentsRouter = Router();

appointmentsRouter.post('/appointments', requireFeature('appointments'), async (req, res, next) => {
  try {
    // Optional customer auth
    const header = req.header('authorization');
    if (header?.startsWith('Bearer ')) {
      await new Promise<void>((resolve, reject) => {
        requireCustomer(req, res, (err?: unknown) => (err ? reject(err) : resolve()));
      }).catch(() => undefined);
    }

    const body = z
      .object({
        name: z.string().min(1).max(120),
        phone: z.string().min(8).max(20),
        preferredAt: z.string().datetime({ offset: true }).or(z.string().min(8)),
        partySize: z.number().int().min(1).max(20).optional(),
        note: z.string().max(1000).optional(),
      })
      .safeParse(req.body);
    if (!body.success) {
      return next(badRequest('VALIDATION_ERROR', 'Invalid appointment', body.error.flatten()));
    }
    const preferredAt = new Date(body.data.preferredAt);
    if (Number.isNaN(preferredAt.getTime())) {
      return next(badRequest('VALIDATION_ERROR', 'preferredAt must be a valid date'));
    }
    const appointment = await createAppointment({
      ...body.data,
      preferredAt,
      customerId: req.customer?.id,
    });
    return sendSuccess(res, { appointment }, 201);
  } catch (err) {
    return next(err);
  }
});

appointmentsRouter.get(
  '/appointments/me',
  requireCustomer,
  requireFeature('appointments'),
  async (req, res, next) => {
    try {
      const data = await listMyAppointments(req.customer!.id);
      return sendSuccess(res, data);
    } catch (err) {
      return next(err);
    }
  },
);

appointmentsRouter.get(
  '/admin/appointments',
  requireAdmin,
  requireFeature('appointments'),
  async (req, res, next) => {
    try {
      const query = z
        .object({
          status: z.enum(['requested', 'confirmed', 'completed', 'cancelled']).optional(),
          limit: z.coerce.number().int().optional(),
        })
        .safeParse(req.query);
      if (!query.success) {
        return next(badRequest('VALIDATION_ERROR', 'Invalid query', query.error.flatten()));
      }
      const data = await listAdminAppointments(query.data);
      return sendSuccess(res, data);
    } catch (err) {
      return next(err);
    }
  },
);

appointmentsRouter.patch(
  '/admin/appointments/:id',
  requireAdmin,
  requireFeature('appointments'),
  async (req, res, next) => {
    try {
      const body = z
        .object({
          status: z.enum(['requested', 'confirmed', 'completed', 'cancelled']).optional(),
          adminNote: z.string().max(1000).nullable().optional(),
        })
        .safeParse(req.body);
      if (!body.success) {
        return next(badRequest('VALIDATION_ERROR', 'Invalid patch', body.error.flatten()));
      }
      const appointment = await updateAdminAppointment(req.params.id, body.data);
      return sendSuccess(res, { appointment });
    } catch (err) {
      return next(err);
    }
  },
);
