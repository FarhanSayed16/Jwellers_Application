/**
 * Migration runner stub — Phase 05.
 * Later: versioned migrate-mongo (or custom) applied per client Atlas URI.
 */
import { connectMongo, disconnectMongo } from '../db/connection';
import { ensureAllModelsLoaded } from '../db/models';
import mongoose from 'mongoose';

async function main() {
  const direction = process.argv[2] ?? 'up';
  console.log(`[migrate] stub runner direction=${direction}`);

  await connectMongo();
  await ensureAllModelsLoaded();

  // Ensure indexes match schemas for all registered models
  const modelNames = mongoose.modelNames();
  for (const name of modelNames) {
    await mongoose.model(name).syncIndexes();
    console.log(`[migrate] syncIndexes → ${name}`);
  }

  console.log('[migrate] done (stub: syncIndexes only). Add versioned migrations as schema evolves.');
  await disconnectMongo();
}

main().catch(async (err) => {
  console.error('[migrate] failed', err);
  await disconnectMongo().catch(() => undefined);
  process.exit(1);
});
