import type { NextFunction, Request, Response } from 'express';
import { env } from '../config/env';

/** Blocks API traffic during maintenance; keeps /health and /ready open for probes. */
export function maintenanceMiddleware(req: Request, res: Response, next: NextFunction) {
  if (!env.MAINTENANCE_MODE) return next();
  const path = req.path || '';
  if (path === '/health' || path === '/ready') return next();
  return res.status(503).json({
    success: false,
    error: {
      code: 'MAINTENANCE',
      message: 'Service is under maintenance. Please try again shortly.',
    },
    meta: { requestId: res.locals.requestId },
  });
}
