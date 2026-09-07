import { env, isProd } from './config/env';
import { createApp } from './app';
import { connectMongo } from './db/connection';
import { ensureAllModelsLoaded } from './db/models';

async function boot() {
  try {
    if (env.MONGODB_URI) {
      await connectMongo();
      await ensureAllModelsLoaded();
    } else if (isProd) {
      throw new Error('[boot] MONGODB_URI required in production');
    } else {
      console.warn('[boot] MONGODB_URI missing — API will run but /ready will be 503');
    }
  } catch (err) {
    if (isProd) {
      console.error('[boot] Mongo connection failed — exiting', err);
      process.exit(1);
    }
    console.warn('[boot] Mongo connection failed — continuing in development', err);
  }

  const app = createApp();
  app.listen(env.PORT, () => {
    console.log(`[api] env=${env.NODE_ENV} client=${env.CLIENT_SLUG}`);
    console.log(`[api] listening on http://localhost:${env.PORT}`);
    console.log(`[api] health  → http://localhost:${env.PORT}/health`);
    console.log(`[api] ready   → http://localhost:${env.PORT}/ready`);
  });
}

boot();
