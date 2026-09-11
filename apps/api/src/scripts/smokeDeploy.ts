/**
 * Post-deploy smoke — health, public config, optional admin login.
 *
 * Usage:
 *   SMOKE_BASE_URL=https://api.example.com npm run smoke -w @jwellers/api
 *   SMOKE_ADMIN_EMAIL=... SMOKE_ADMIN_PASSWORD=... npm run smoke -w @jwellers/api
 *
 * Defaults to http://localhost:4000. Exits 1 on failure. Never prints secrets.
 */
const base = (process.env.SMOKE_BASE_URL || 'http://localhost:4000').replace(/\/$/, '');

type Step = { name: string; ok: boolean; detail: string };

async function getJson(path: string): Promise<{ status: number; body: unknown }> {
  const res = await fetch(`${base}${path}`, {
    headers: { Accept: 'application/json' },
  });
  const body = await res.json().catch(() => ({}));
  return { status: res.status, body };
}

async function postJson(path: string, payload: unknown): Promise<{ status: number; body: unknown }> {
  const res = await fetch(`${base}${path}`, {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const body = await res.json().catch(() => ({}));
  return { status: res.status, body };
}

async function main() {
  const steps: Step[] = [];

  const health = await getJson('/health');
  steps.push({
    name: 'health',
    ok: health.status === 200,
    detail: `HTTP ${health.status}`,
  });

  const ready = await getJson('/ready');
  steps.push({
    name: 'ready',
    ok: ready.status === 200,
    detail: `HTTP ${ready.status}`,
  });

  const cfg = await getJson('/api/v1/config/public');
  const cfgBody = cfg.body as {
    success?: boolean;
    data?: { shopName?: string; appUpdate?: { minVersion?: string }; clientSlug?: string };
    meta?: { requestId?: string };
  };
  const hasUpdate = Boolean(cfgBody?.data?.appUpdate?.minVersion);
  const hasRequestId = Boolean(cfgBody?.meta?.requestId);
  steps.push({
    name: 'config/public',
    ok: cfg.status === 200 && cfgBody.success === true && hasUpdate,
    detail: `HTTP ${cfg.status} shop=${cfgBody?.data?.shopName ?? '?'} slug=${cfgBody?.data?.clientSlug ?? '?'} appUpdate=${hasUpdate} requestId=${hasRequestId}`,
  });

  const email = process.env.SMOKE_ADMIN_EMAIL?.trim();
  const password = process.env.SMOKE_ADMIN_PASSWORD?.trim();
  if (email && password) {
    const login = await postJson('/api/v1/auth/admin/login', {
      emailOrPhone: email,
      password,
      deviceInfo: 'smoke-script',
    });
    const loginBody = login.body as { success?: boolean; data?: { accessToken?: string } };
    const tokenOk = Boolean(loginBody?.data?.accessToken);
    steps.push({
      name: 'admin/login',
      ok: login.status === 200 && loginBody.success === true && tokenOk,
      detail: `HTTP ${login.status} token=${tokenOk ? 'yes' : 'no'}`,
    });
  } else {
    steps.push({
      name: 'admin/login',
      ok: true,
      detail: 'skipped (set SMOKE_ADMIN_EMAIL + SMOKE_ADMIN_PASSWORD to exercise)',
    });
  }

  console.log(`[smoke] base=${base}`);
  for (const s of steps) {
    console.log(`[smoke] ${s.ok ? 'OK' : 'FAIL'} ${s.name} — ${s.detail}`);
  }

  if (steps.some((s) => !s.ok)) {
    process.exit(1);
  }
  console.log('[smoke] ALL PASSED');
}

main().catch((err) => {
  console.error('[smoke] FAILED', err instanceof Error ? err.message : err);
  process.exit(1);
});
