import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { env } from './config/env';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { globalRateLimiter } from './middleware/rateLimit';
import { requestIdMiddleware } from './middleware/requestId';
import { requestLogMiddleware } from './middleware/requestLog';
import { configRouter } from './modules/config/config.routes';
import { adminAuthRouter } from './modules/auth/adminAuth.routes';
import { customerAuthRouter } from './modules/auth/customerAuth.routes';
import { ratesRouter } from './modules/rates/rates.routes';
import { catalogRouter } from './modules/catalog/catalog.routes';
import { mediaRouter } from './modules/media/media.routes';
import { wishlistRouter } from './modules/wishlist/wishlist.routes';
import { enquiriesRouter } from './modules/enquiries/enquiries.routes';
import { customRequestsRouter } from './modules/customRequests/customRequests.routes';
import { offersRouter } from './modules/offers/offers.routes';
import { staffRouter } from './modules/staff/staff.routes';
import { chatRouter } from './modules/chat/chat.routes';
import { devicesRouter } from './modules/devices/devices.routes';
import { systemRouter } from './routes/system';

export function createApp() {
  const app = express();

  app.disable('x-powered-by');

  app.use(requestIdMiddleware);
  app.use(requestLogMiddleware);
  app.use(helmet());
  app.use(
    cors({
      origin: env.ADMIN_CORS_ORIGIN.split(',')
        .map((o) => o.trim())
        .filter(Boolean),
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(globalRateLimiter);

  app.use(systemRouter);
  app.use('/api/v1', adminAuthRouter);
  app.use('/api/v1', customerAuthRouter);
  app.use('/api/v1', configRouter);
  app.use('/api/v1', ratesRouter);
  app.use('/api/v1', catalogRouter);
  app.use('/api/v1', mediaRouter);
  app.use('/api/v1', wishlistRouter);
  app.use('/api/v1', enquiriesRouter);
  app.use('/api/v1', customRequestsRouter);
  app.use('/api/v1', offersRouter);
  app.use('/api/v1', staffRouter);
  app.use('/api/v1', chatRouter);
  app.use('/api/v1', devicesRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
