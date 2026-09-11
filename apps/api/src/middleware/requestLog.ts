import type { NextFunction, Request, Response } from 'express';
import { logger } from '../utils/logger';

/** Access log with requestId + duration (no bodies/secrets). */
export function requestLogMiddleware(req: Request, res: Response, next: NextFunction) {
  const started = Date.now();
  res.on('finish', () => {
    const path = req.originalUrl?.split('?')[0] ?? req.path;
    // Skip noisy health probes in prod logs? Keep them — useful for uptime.
    logger.info('http_request', {
      requestId: res.locals.requestId,
      method: req.method,
      path,
      status: res.statusCode,
      durationMs: Date.now() - started,
      clientSlug: process.env.CLIENT_SLUG,
    });
  });
  next();
}
