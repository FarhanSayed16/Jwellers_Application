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
import { invoicesRouter } from './modules/billing/invoices.routes';
import { paymentsRouter } from './modules/payments/payments.routes';
import { oldGoldRouter } from './modules/oldGold/oldGold.routes';
import { itemQrRouter } from './modules/showroom/itemQr.routes';
import { rateCardRouter } from './modules/showroom/rateCard.routes';
import { boardsRouter } from './modules/showroom/boards.routes';
import { appointmentsRouter } from './modules/appointments/appointments.routes';
import { analyticsRouter } from './modules/analytics/analytics.routes';
import { crmRouter } from './modules/crm/crm.routes';
import { schemesRouter } from './modules/schemes/schemes.routes';
import { referralsRouter } from './modules/referrals/referrals.routes';
import { priceAlertsRouter } from './modules/priceAlerts/priceAlerts.routes';
import { whatsappBusinessRouter } from './modules/whatsappBusiness/whatsappBusiness.routes';
import { systemRouter } from './routes/system';
import { maintenanceMiddleware } from './middleware/maintenance';

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
  // Razorpay webhook needs raw body for HMAC when live keys are set
  app.use(
    '/api/v1/payments/webhook',
    express.raw({ type: 'application/json' }),
    (req, _res, next) => {
      if (Buffer.isBuffer(req.body)) {
        (req as { rawBody?: string }).rawBody = req.body.toString('utf8');
        try {
          req.body = JSON.parse((req as { rawBody?: string }).rawBody || '{}');
        } catch {
          req.body = {};
        }
      }
      next();
    },
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(globalRateLimiter);
  app.use(maintenanceMiddleware);

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
  app.use('/api/v1', invoicesRouter);
  app.use('/api/v1', paymentsRouter);
  app.use('/api/v1', oldGoldRouter);
  app.use('/api/v1', itemQrRouter);
  app.use('/api/v1', rateCardRouter);
  app.use('/api/v1', boardsRouter);
  app.use('/api/v1', appointmentsRouter);
  app.use('/api/v1', analyticsRouter);
  app.use('/api/v1', crmRouter);
  app.use('/api/v1', schemesRouter);
  app.use('/api/v1', referralsRouter);
  app.use('/api/v1', priceAlertsRouter);
  app.use('/api/v1', whatsappBusinessRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
