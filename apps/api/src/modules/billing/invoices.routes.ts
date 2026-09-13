import { Router } from 'express';
import { z } from 'zod';
import { requireAdmin, requireAdminOrCustomer, requireCustomer } from '../../middleware/auth';
import { requireFeature } from '../../middleware/featureFlag';
import { badRequest } from '../../utils/errors';
import { sendSuccess } from '../../utils/response';
import {
  createInvoice,
  getInvoiceForActor,
  listAdminInvoices,
  listCustomerInvoices,
} from './invoices.service';

export const invoicesRouter = Router();

const lineSchema = z.object({
  description: z.string().min(1).max(500),
  sku: z.string().max(64).optional(),
  purity: z.string().max(16).optional(),
  weightGrams: z.number().finite().nonnegative().optional(),
  ratePerGram: z.number().finite().nonnegative().optional(),
  makingChargeAmount: z.number().finite().nonnegative().optional(),
  gstAmount: z.number().finite().nonnegative().optional().default(0),
  lineTotal: z.number().finite().positive(),
});

invoicesRouter.post(
  '/admin/invoices',
  requireAdmin,
  requireFeature('digitalBilling'),
  async (req, res, next) => {
    try {
      const body = z
        .object({
          customerId: z.string().optional().nullable(),
          enquiryId: z.string().optional().nullable(),
          itemId: z.string().optional().nullable(),
          lineItems: z.array(lineSchema).min(1),
          status: z.enum(['draft', 'issued']).optional(),
        })
        .safeParse(req.body);
      if (!body.success) {
        return next(badRequest('VALIDATION_ERROR', 'Invalid invoice', body.error.flatten()));
      }
      const invoice = await createInvoice({ ...body.data, adminId: req.admin!.id });
      return sendSuccess(res, { invoice }, 201);
    } catch (err) {
      return next(err);
    }
  },
);

invoicesRouter.get(
  '/admin/invoices',
  requireAdmin,
  requireFeature('digitalBilling'),
  async (req, res, next) => {
    try {
      const limit = Number(req.query.limit ?? 50);
      const data = await listAdminInvoices(limit);
      return sendSuccess(res, data);
    } catch (err) {
      return next(err);
    }
  },
);

invoicesRouter.get(
  '/me/invoices',
  requireCustomer,
  requireFeature('digitalBilling'),
  async (req, res, next) => {
    try {
      const limit = Number(req.query.limit ?? 50);
      const data = await listCustomerInvoices(req.customer!.id, limit);
      return sendSuccess(res, data);
    } catch (err) {
      return next(err);
    }
  },
);

invoicesRouter.get(
  '/invoices/:id',
  requireAdminOrCustomer,
  requireFeature('digitalBilling'),
  async (req, res, next) => {
    try {
      const invoice = await getInvoiceForActor(req.params.id, {
        adminId: req.admin?.id,
        customerId: req.customer?.id,
      });
      return sendSuccess(res, { invoice });
    } catch (err) {
      return next(err);
    }
  },
);
