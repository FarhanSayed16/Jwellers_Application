import { Router } from 'express';
import { z } from 'zod';
import { requireAdminOrCustomer } from '../../middleware/auth';
import { badRequest } from '../../utils/errors';
import { sendSuccess } from '../../utils/response';
import { createUploadSignature, getMediaPolicyPublic } from './media.service';

export const mediaRouter = Router();

/** Public policy (no secrets) — mime/size/folder conventions for clients. */
mediaRouter.get('/media/policy', (_req, res) => {
  return sendSuccess(res, getMediaPolicyPublic());
});

mediaRouter.post('/media/sign', requireAdminOrCustomer, async (req, res, next) => {
  try {
    const body = z
      .object({
        purpose: z.string().min(1),
        resourceType: z.enum(['image']).optional(),
        /** Rejected — signed uploads only */
        uploadPreset: z.string().optional().nullable(),
        unsigned: z.boolean().optional(),
      })
      .safeParse(req.body);
    if (!body.success) {
      return next(badRequest('VALIDATION_ERROR', 'Invalid sign payload', body.error.flatten()));
    }

    const actor = req.admin ? 'admin' : 'customer';
    const data = createUploadSignature({
      purpose: body.data.purpose,
      resourceType: body.data.resourceType,
      uploadPreset: body.data.uploadPreset,
      unsigned: body.data.unsigned,
      actor,
    });
    return sendSuccess(res, data);
  } catch (err) {
    return next(err);
  }
});
