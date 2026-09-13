/**
 * Per-client provision helper: migrate → seed shop/owner → seed catalog.
 * Requires MONGODB_URI + CLIENT_SLUG in env (or .env).
 *
 *   CLIENT_SLUG=acme npm run client:provision -w @jwellers/api
 *
 * Smoke is separate (needs live URL):
 *   SMOKE_BASE_URL=https://… npm run smoke -w @jwellers/api
 */
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { env } from '../config/env';

function run(script: string) {
  const cwd = path.resolve(__dirname, '../..');
  console.log(`[client:provision] npm run ${script}`);
  const res = spawnSync('npm', ['run', script], {
    cwd,
    stdio: 'inherit',
    shell: true,
    env: process.env,
  });
  if (res.status !== 0) {
    throw new Error(`step failed: ${script} (exit ${res.status})`);
  }
}

async function main() {
  const slug = env.CLIENT_SLUG || process.env.CLIENT_SLUG || 'demo';
  console.log(`[client:provision] CLIENT_SLUG=${slug}`);
  if (!process.env.MONGODB_URI && !env.MONGODB_URI) {
    throw new Error('MONGODB_URI required');
  }
  run('migrate');
  run('seed');
  run('seed:client-catalog');
  console.log('[client:provision] done — optional: npm run smoke -w @jwellers/api');
}

main().catch((err) => {
  console.error('[client:provision] FAILED', err);
  process.exit(1);
});
