import { Router } from 'express';
import { z } from 'zod';
import { requireCustomer } from '../../middleware/auth';
import { badRequest } from '../../utils/errors';
import { sendSuccess } from '../../utils/response';
import { addToWishlist, listWishlist, removeFromWishlist } from './wishlist.service';

export const wishlistRouter = Router();

wishlistRouter.get('/wishlist', requireCustomer, async (req, res, next) => {
  try {
    const data = await listWishlist(req.customer!.id);
    return sendSuccess(res, data);
  } catch (err) {
    return next(err);
  }
});

wishlistRouter.post('/wishlist', requireCustomer, async (req, res, next) => {
  try {
    const body = z.object({ itemId: z.string().min(1) }).safeParse(req.body);
    if (!body.success) {
      return next(badRequest('VALIDATION_ERROR', 'itemId is required', body.error.flatten()));
    }
    const data = await addToWishlist(req.customer!.id, body.data.itemId);
    return sendSuccess(res, data, data.created ? 201 : 200);
  } catch (err) {
    return next(err);
  }
});

wishlistRouter.delete('/wishlist/:itemId', requireCustomer, async (req, res, next) => {
  try {
    const data = await removeFromWishlist(req.customer!.id, req.params.itemId);
    return sendSuccess(res, data);
  } catch (err) {
    return next(err);
  }
});
