import { Router } from 'express';
import { requireAdmin } from '../../middleware/auth';
import { requireFeature } from '../../middleware/featureFlag';
import { sendSuccess } from '../../utils/response';
import { buildItemPrintTag, itemDeepLink } from './itemQr.service';

export const itemQrRouter = Router();

itemQrRouter.get(
  '/admin/items/:id/print-tag',
  requireAdmin,
  requireFeature('itemQr'),
  async (req, res, next) => {
    try {
      const tag = await buildItemPrintTag(req.params.id);
      return sendSuccess(res, { tag });
    } catch (err) {
      return next(err);
    }
  },
);

/** Public helper — resolve deep-link string for a SKU (flagged). */
itemQrRouter.get('/items/sku/:sku/deep-link', requireFeature('itemQr'), async (req, res, next) => {
  try {
    const sku = req.params.sku.trim().toUpperCase();
    return sendSuccess(res, { sku, deepLink: itemDeepLink(sku) });
  } catch (err) {
    return next(err);
  }
});
