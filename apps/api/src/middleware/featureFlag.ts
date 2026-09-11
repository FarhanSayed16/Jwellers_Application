import type { NextFunction, Request, Response } from 'express';
import { FeatureKey, isFeatureEnabled } from '../config/features';
import { forbidden } from '../utils/errors';

export function requireFeature(key: FeatureKey) {
  return (_req: Request, _res: Response, next: NextFunction) => {
    if (!isFeatureEnabled(key)) {
      return next(forbidden('FEATURE_DISABLED', `Feature "${key}" is disabled for this client`));
    }
    return next();
  };
}
