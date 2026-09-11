import { Router } from 'express';
import { z } from 'zod';
import { requireAdmin, requireCustomer } from '../../middleware/auth';
import { badRequest } from '../../utils/errors';
import { sendSuccess } from '../../utils/response';
import {
  createEnquiry,
  listAdminEnquiries,
  listMyEnquiries,
  updateAdminEnquiry,
} from './enquiries.service';

export const enquiriesRouter = Router();

enquiriesRouter.post('/enquiries', requireCustomer, async (req, res, next) => {
  try {
    const body = z
      .object({
        itemId: z.string().optional().nullable(),
        message: z.string().min(1).max(2000),
        channel: z.enum(['app', 'whatsapp_deeplink']).optional(),
      })
      .safeParse(req.body);
    if (!body.success) {
      return next(badRequest('VALIDATION_ERROR', 'Invalid enquiry payload', body.error.flatten()));
    }
    const enquiry = await createEnquiry({
      customerId: req.customer!.id,
      ...body.data,
    });
    return sendSuccess(res, { enquiry }, 201);
  } catch (err) {
    return next(err);
  }
});

enquiriesRouter.get('/enquiries/me', requireCustomer, async (req, res, next) => {
  try {
    const data = await listMyEnquiries(req.customer!.id);
    return sendSuccess(res, data);
  } catch (err) {
    return next(err);
  }
});

enquiriesRouter.get('/admin/enquiries', requireAdmin, async (req, res, next) => {
  try {
    const query = z
      .object({
        status: z.enum(['new', 'in_progress', 'closed', 'converted']).optional(),
      })
      .safeParse(req.query);
    if (!query.success) {
      return next(badRequest('VALIDATION_ERROR', 'Invalid query', query.error.flatten()));
    }
    const data = await listAdminEnquiries(query.data);
    return sendSuccess(res, data);
  } catch (err) {
    return next(err);
  }
});

enquiriesRouter.patch('/admin/enquiries/:id', requireAdmin, async (req, res, next) => {
  try {
    const body = z
      .object({
        status: z.enum(['new', 'in_progress', 'closed', 'converted']).optional(),
        assignedTo: z.string().nullable().optional(),
      })
      .safeParse(req.body);
    if (!body.success) {
      return next(badRequest('VALIDATION_ERROR', 'Invalid patch payload', body.error.flatten()));
    }
    const enquiry = await updateAdminEnquiry(req.params.id, body.data);
    return sendSuccess(res, { enquiry });
  } catch (err) {
    return next(err);
  }
});
