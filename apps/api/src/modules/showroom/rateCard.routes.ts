import { Router } from 'express';
import { requireFeature } from '../../middleware/featureFlag';
import { sendSuccess } from '../../utils/response';
import { buildRateShareCard } from './rateCard.service';

export const rateCardRouter = Router();

rateCardRouter.get('/rates/share-card', requireFeature('shareRateCard'), async (_req, res, next) => {
  try {
    const card = await buildRateShareCard();
    return sendSuccess(res, { card });
  } catch (err) {
    return next(err);
  }
});
