import { env, isProd } from './config/env';
import { createApp } from './app';
import { connectMongo } from './db/connection';
import { ensureAllModelsLoaded } from './db/models';
import { initSentry } from './services/sentry';
import { logger } from './utils/logger';

async function boot() {
  initSentry();

  try {
    if (env.MONGODB_URI) {
      await connectMongo();
      await ensureAllModelsLoaded();
    } else if (isProd) {
      throw new Error('[boot] MONGODB_URI required in production');
    } else {
      logger.warn('mongodb_uri_missing');
    }
  } catch (err) {
    if (isProd) {
      logger.error('mongo_boot_failed', { message: err instanceof Error ? err.message : String(err) });
      process.exit(1);
    }
    logger.warn('mongo_boot_failed_continuing', {
      message: err instanceof Error ? err.message : String(err),
    });
  }

  const app = createApp();
  app.listen(env.PORT, () => {
    logger.info('api_listening', {
      env: env.NODE_ENV,
      clientSlug: env.CLIENT_SLUG,
      port: env.PORT,
    });
  });
}

boot();
