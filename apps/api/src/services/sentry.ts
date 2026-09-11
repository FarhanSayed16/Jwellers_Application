import * as Sentry from '@sentry/node';
import { env, isProd } from '../config/env';
import { logger } from '../utils/logger';

let initialized = false;

export function initSentry() {
  const dsn = env.SENTRY_DSN?.trim();
  if (!dsn) {
    logger.info('sentry_skipped', { reason: 'SENTRY_DSN empty' });
    return;
  }
  if (initialized) return;

  Sentry.init({
    dsn,
    environment: env.NODE_ENV,
    release: env.SENTRY_RELEASE || undefined,
    tracesSampleRate: isProd ? 0.1 : 1.0,
    sendDefaultPii: false,
  });
  initialized = true;
  logger.info('sentry_initialized', { environment: env.NODE_ENV });
}

export function captureException(err: unknown, context?: Record<string, unknown>) {
  if (!initialized) return;
  Sentry.withScope((scope) => {
    if (context) {
      for (const [k, v] of Object.entries(context)) {
        scope.setExtra(k, v);
      }
    }
    Sentry.captureException(err);
  });
}

export function isSentryEnabled() {
  return initialized;
}
