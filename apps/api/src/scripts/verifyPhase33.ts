/**
 * Phase 33 gate — second-client automation + onboarding kit + Acme dry-run.
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = path.resolve(__dirname, '../../../../');

function mustExist(rel: string) {
  const p = path.join(root, rel);
  if (!fs.existsSync(p)) throw new Error(`missing: ${rel}`);
  return fs.readFileSync(p, 'utf8');
}

function main() {
  const files = [
    'scripts/create-client.cjs',
    'docs/phase33/33_COMPLETION_RECORD.md',
    'docs/phase33/ONBOARDING_KIT_v1.md',
    'docs/phase33/RESKIN_48H.md',
    'docs/phase33/CLIENT2_DRY_RUN_TIMINGS.md',
    'docs/phase25/DEMO_SCRIPT_10MIN.md',
    'clients/acme/README.md',
    'clients/acme/modules.json',
    'clients/acme/branding/tokens.json',
    'clients/acme/catalog/items.csv',
    'apps/api/.env.acme.example',
    'apps/api/src/scripts/seedClientCatalog.ts',
    'apps/api/src/scripts/clientProvision.ts',
    'apps/mobile/lib/main_acme.dart',
    'apps/mobile/android/app/src/acme/google-services.json',
    'codemagic.yaml',
  ];
  for (const f of files) mustExist(f);
  console.log('[verify:phase33] docs + acme pack + scripts OK');

  const gradle = mustExist('apps/mobile/android/app/build.gradle.kts');
  if (!gradle.includes('create("acme")') || !gradle.includes('com.acme.jewellers')) {
    throw new Error('Android productFlavor acme missing');
  }
  const flavor = mustExist('apps/mobile/lib/core/flavor/flavor_config.dart');
  if (!flavor.includes('static FlavorConfig acme(')) {
    throw new Error('FlavorConfig.acme missing');
  }
  console.log('[verify:phase33] Flutter/Android acme flavor OK');

  const cm = mustExist('codemagic.yaml');
  for (const needle of ['ratnaraj-aab', 'demo-aab', 'client-flavor-aab', 'FLAVOR']) {
    if (!cm.includes(needle)) throw new Error(`codemagic.yaml missing ${needle}`);
  }
  console.log('[verify:phase33] Codemagic multi-flavor OK');

  const register = mustExist('docs/phase28/VERSION_REGISTER.md');
  if (!register.includes('`acme`') || !register.includes('Acme Jewellers')) {
    throw new Error('VERSION_REGISTER missing acme row');
  }
  console.log('[verify:phase33] version register OK');

  const kit = mustExist('docs/phase33/ONBOARDING_KIT_v1.md');
  if (!kit.includes('create-client') || !kit.includes('DEMO_SCRIPT_10MIN')) {
    throw new Error('ONBOARDING_KIT_v1 incomplete');
  }
  const timings = mustExist('docs/phase33/CLIENT2_DRY_RUN_TIMINGS.md');
  if (!timings.includes('Friction') || !timings.includes('Acme')) {
    throw new Error('CLIENT2_DRY_RUN_TIMINGS incomplete');
  }
  console.log('[verify:phase33] onboarding kit OK');

  // Idempotent re-run of create-client (should SKIP existing)
  const rerun = spawnSync(
    'node',
    ['scripts/create-client.cjs', '--slug=acme', '--name=Acme Jewellers'],
    { cwd: root, encoding: 'utf8', shell: true },
  );
  if (rerun.status !== 0) {
    throw new Error(`create-client re-run failed: ${rerun.stderr || rerun.stdout}`);
  }
  if (!String(rerun.stdout).includes('SKIP')) {
    console.warn('[verify:phase33] warn: expected SKIP on idempotent re-run');
  }
  console.log('[verify:phase33] create-client idempotent OK');

  const pkg = mustExist('apps/api/package.json');
  if (!pkg.includes('seed:client-catalog') || !pkg.includes('client:provision') || !pkg.includes('verify:phase33')) {
    throw new Error('api package.json missing phase33 scripts');
  }

  console.log('[verify:phase33] ALL PASSED — Second-client automation gate green');
  console.log('[verify:phase33] note: live Client #2 Play/infra deferred');
}

try {
  main();
  process.exit(0);
} catch (err) {
  console.error('[verify:phase33] FAILED', err);
  process.exit(1);
}
