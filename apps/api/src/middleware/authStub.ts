import type { NextFunction, Request, Response } from 'express';
import { unauthorized } from '../utils/errors';

/**
 * Phase 06 stub — admin routes exist but reject until Phase 07 JWT auth.
 * Replace with requireAdmin / requireOwner.
 */
export function requireAdminAuthStub(_req: Request, _res: Response, next: NextFunction) {
  return next(
    unauthorized(
      'AUTH_REQUIRED',
      'Admin authentication is required. Available in Phase 07.',
    ),
  );
}
