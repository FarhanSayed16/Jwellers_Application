import { Router } from 'express';
import { env } from '../config/env';
import { getMongoConnectionState, pingMongo } from '../db/connection';
import { AppError } from '../utils/errors';
import { sendSuccess } from '../utils/response';

export const systemRouter = Router();

systemRouter.get('/health', (_req, res) => {
  sendSuccess(res, {
    status: 'ok',
    service: 'jwellers-api',
    clientSlug: env.CLIENT_SLUG,
    env: env.NODE_ENV,
  });
});

systemRouter.get('/ready', async (_req, res) => {
  const state = getMongoConnectionState();
  let dbOk = false;
  try {
    dbOk = await pingMongo();
  } catch {
    dbOk = false;
  }

  const payload = {
    ready: dbOk,
    checks: {
      database: dbOk
        ? 'ok'
        : state.readyState === 0
          ? 'disconnected'
          : `readyState_${state.readyState}`,
    },
  };

  if (!payload.ready) {
    return res.status(503).json({
      success: false,
      error: {
        code: 'NOT_READY',
        message: 'Service not ready',
        details: payload.checks,
      },
      meta: { requestId: res.locals.requestId },
    });
  }

  return sendSuccess(res, payload);
});

systemRouter.get('/api/v1', (_req, res) => {
  sendSuccess(res, {
    name: 'jwellers-api',
    version: '0.1.0',
    phase: '15-admin-branding-leads',
    clientSlug: env.CLIENT_SLUG,
  });
});

systemRouter.get('/api/v1/__debug/error-sample', (_req, _res, next) => {
  if (env.NODE_ENV === 'production') {
    return next(new AppError(404, 'NOT_FOUND', 'Route not found'));
  }
  return next(
    new AppError(400, 'OTP_RATE_LIMITED', 'Too many OTP requests. Try again later.', {
      retryAfterSeconds: 60,
    }),
  );
});
