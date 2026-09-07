/**
 * Phase 13 gate: admin Next.js build + optional Demo API owner login.
 */
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const adminRoot = path.resolve(__dirname, '..');

async function checkApiLogin() {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api/v1';
  const email = process.env.ADMIN_VERIFY_EMAIL || 'owner@demo.local';
  const password = process.env.ADMIN_VERIFY_PASSWORD || 'ChangeMeOwner1!';

  try {
    const res = await fetch(`${base}/auth/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emailOrPhone: email, password }),
    });
    const json = await res.json();
    if (!res.ok || !json.success || !json.data?.accessToken) {
      console.warn(
        `[verify:admin-web] API login unavailable (${res.status}). Start seeded API for live login check.`,
      );
      return false;
    }
    if (json.data.admin?.role !== 'owner') {
      throw new Error('Expected owner role from Demo login');
    }
    console.log('[verify:admin-web] owner login against API OK');
    return true;
  } catch (err) {
    console.warn('[verify:admin-web] API not reachable — build gate only.', String(err));
    return false;
  }
}

function checkBuild() {
  console.log('[verify:admin-web] building admin…');
  const result = spawnSync('npm', ['run', 'build'], {
    cwd: adminRoot,
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, NEXT_TELEMETRY_DISABLED: '1' },
  });
  if (result.status !== 0) {
    throw new Error('Admin build failed');
  }
  console.log('[verify:admin-web] admin build OK');
}

async function main() {
  checkBuild();
  await checkApiLogin();
  console.log('[verify:admin-web] Phase 13 gate PASSED');
}

main().catch((err) => {
  console.error('[verify:admin-web] FAILED', err);
  process.exit(1);
});
