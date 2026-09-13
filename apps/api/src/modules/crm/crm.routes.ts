import { Router } from 'express';
import { z } from 'zod';
import { requireAdmin } from '../../middleware/auth';
import { requireFeature } from '../../middleware/featureFlag';
import { badRequest } from '../../utils/errors';
import { sendSuccess } from '../../utils/response';
import {
  listCustomersCrm,
  listFollowUpEnquiries,
  setEnquiryFollowUp,
  updateCustomerTags,
} from './crm.service';

export const crmRouter = Router();

crmRouter.get(
  '/admin/crm/customers',
  requireAdmin,
  requireFeature('crmLight'),
  async (req, res, next) => {
    try {
      const tag = typeof req.query.tag === 'string' ? req.query.tag : undefined;
      const data = await listCustomersCrm({ tag });
      return sendSuccess(res, data);
    } catch (err) {
      return next(err);
    }
  },
);

crmRouter.patch(
  '/admin/crm/customers/:id/tags',
  requireAdmin,
  requireFeature('crmLight'),
  async (req, res, next) => {
    try {
      const body = z.object({ tags: z.array(z.string().max(40)).max(20) }).safeParse(req.body);
      if (!body.success) {
        return next(badRequest('VALIDATION_ERROR', 'Invalid tags', body.error.flatten()));
      }
      const customer = await updateCustomerTags(req.params.id, body.data.tags);
      return sendSuccess(res, { customer });
    } catch (err) {
      return next(err);
    }
  },
);

crmRouter.get(
  '/admin/crm/follow-ups',
  requireAdmin,
  requireFeature('crmLight'),
  async (_req, res, next) => {
    try {
      const data = await listFollowUpEnquiries();
      return sendSuccess(res, data);
    } catch (err) {
      return next(err);
    }
  },
);

crmRouter.patch(
  '/admin/enquiries/:id/follow-up',
  requireAdmin,
  requireFeature('crmLight'),
  async (req, res, next) => {
    try {
      const body = z
        .object({
          followUpAt: z.string().nullable().optional(),
          followUpNote: z.string().max(500).nullable().optional(),
        })
        .safeParse(req.body);
      if (!body.success) {
        return next(badRequest('VALIDATION_ERROR', 'Invalid follow-up', body.error.flatten()));
      }
      const enquiry = await setEnquiryFollowUp(req.params.id, body.data);
      return sendSuccess(res, { enquiry });
    } catch (err) {
      return next(err);
    }
  },
);
