import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { isDev } from '../config/env';
import { captureException } from '../services/sentry';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';

export function notFoundHandler(_req: Request, _res: Response, next: NextFunction) {
  next(new AppError(404, 'NOT_FOUND', 'Route not found'));
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  const requestId = res.locals.requestId;

  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      logger.error('app_error', { requestId, code: err.code, message: err.message });
      captureException(err, { requestId, code: err.code });
    }
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details ?? {},
      },
      meta: { requestId },
    });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request',
        details: err.flatten(),
      },
      meta: { requestId },
    });
  }

  logger.error('unexpected_error', {
    requestId,
    message: err instanceof Error ? err.message : String(err),
  });
  captureException(err, { requestId });

  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: isDev && err instanceof Error ? err.message : 'Something went wrong',
      details: {},
    },
    meta: { requestId },
  });
}
