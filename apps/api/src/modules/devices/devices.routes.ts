import { Router } from 'express';
import { z } from 'zod';
import { requireCustomer } from '../../middleware/auth';
import { badRequest } from '../../utils/errors';
import { sendSuccess } from '../../utils/response';
import { deactivateDevice, upsertDevice } from './devices.service';

export const devicesRouter = Router();

devicesRouter.post('/devices', requireCustomer, async (req, res, next) => {
  try {
    const body = z
      .object({
        fcmToken: z.string().min(20).max(4096),
        platform: z.enum(['android', 'ios']),
      })
      .safeParse(req.body);
    if (!body.success) {
      return next(badRequest('VALIDATION_ERROR', 'Invalid device payload', body.error.flatten()));
    }
    const device = await upsertDevice({
      customerId: req.customer!.id,
      fcmToken: body.data.fcmToken,
      platform: body.data.platform,
    });
    return sendSuccess(res, { device }, 201);
  } catch (err) {
    return next(err);
  }
});

devicesRouter.delete('/devices', requireCustomer, async (req, res, next) => {
  try {
    const body = z
      .object({
        fcmToken: z.string().min(20).max(4096).optional(),
        deviceId: z.string().optional(),
      })
      .safeParse(req.body ?? {});
    if (!body.success) {
      return next(badRequest('VALIDATION_ERROR', 'Invalid device delete payload', body.error.flatten()));
    }
    const result = await deactivateDevice({
      customerId: req.customer!.id,
      fcmToken: body.data.fcmToken,
      deviceId: body.data.deviceId,
    });
    return sendSuccess(res, result);
  } catch (err) {
    return next(err);
  }
});
