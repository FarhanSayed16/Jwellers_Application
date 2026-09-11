import { Router } from 'express';
import { z } from 'zod';
import { requireOwner } from '../../middleware/auth';
import { badRequest } from '../../utils/errors';
import { sendSuccess } from '../../utils/response';
import { createStaff, listStaff, updateStaff } from './staff.service';

export const staffRouter = Router();

staffRouter.get('/admin/staff', requireOwner, async (_req, res, next) => {
  try {
    const data = await listStaff();
    return sendSuccess(res, data);
  } catch (err) {
    return next(err);
  }
});

staffRouter.post('/admin/staff', requireOwner, async (req, res, next) => {
  try {
    const body = z
      .object({
        name: z.string().min(1).max(120),
        email: z.string().email().optional().nullable(),
        phone: z.string().min(8).max(20).optional().nullable(),
        password: z.string().min(10),
      })
      .safeParse(req.body);
    if (!body.success) {
      return next(badRequest('VALIDATION_ERROR', 'Invalid staff payload', body.error.flatten()));
    }
    const admin = await createStaff({
      ...body.data,
      actorId: req.admin!.id,
      ip: req.ip,
    });
    return sendSuccess(res, { admin }, 201);
  } catch (err) {
    return next(err);
  }
});

staffRouter.patch('/admin/staff/:id', requireOwner, async (req, res, next) => {
  try {
    const body = z
      .object({
        name: z.string().min(1).max(120).optional(),
        isActive: z.boolean().optional(),
      })
      .safeParse(req.body);
    if (!body.success) {
      return next(badRequest('VALIDATION_ERROR', 'Invalid patch payload', body.error.flatten()));
    }
    const admin = await updateStaff(req.params.id, body.data, req.admin!.id, req.ip);
    return sendSuccess(res, { admin });
  } catch (err) {
    return next(err);
  }
});
