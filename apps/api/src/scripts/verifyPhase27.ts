/**
 * Phase 27 gate — Play submit engineering pack present:
 * signing path, CI stubs, versioning, listing copy, tracks docs.
 */
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(__dirname, '../../../../');

function mustExist(rel: string) {
  const p = path.join(root, rel);
  if (!fs.existsSync(p)) throw new Error(`missing: ${rel}`);
  return p;
}

function main() {
  const docs = [
    'docs/phase27/VERSIONING.md',
    'docs/phase27/SIGNING_HANDOFF.md',
    'docs/phase27/CI_STUB.md',
    'docs/phase27/STORE_LISTING.md',
    'docs/phase27/STORE_ASSETS.md',
    'docs/phase27/PLAY_FORM_FILL.md',
    'docs/phase27/TRACKS.md',
    'docs/phase27/INTERNAL_TESTING_CHECKLIST.md',
    'docs/phase27/27_COMPLETION_RECORD.md',
    'docs/phase23/PLAY_DATA_SAFETY.md',
    'docs/phase23/PERMISSIONS_AUDIT.md',
    'codemagic.yaml',
    '.github/workflows/mobile-aab.yml',
    'apps/mobile/android/key.properties.example',
    'apps/admin/src/app/legal/privacy/page.tsx',
    'apps/admin/src/app/legal/delete-account/page.tsx',
    'clients/ratnaraj/store/README.md',
  ];
  for (const d of docs) mustExist(d);
  console.log('[verify:phase27] docs + CI + legal pages OK');

  const gradle = fs.readFileSync(
    mustExist('apps/mobile/android/app/build.gradle.kts'),
    'utf8',
  );
  if (!gradle.includes('key.properties') || !gradle.includes('hasReleaseKeystore')) {
    throw new Error('build.gradle.kts missing release keystore wiring');
  }
  if (!gradle.includes('com.ratnaraj.jewellers')) {
    throw new Error('ratnaraj applicationId missing');
  }
  console.log('[verify:phase27] gradle release signing path OK');

  const pubspec = fs.readFileSync(mustExist('apps/mobile/pubspec.yaml'), 'utf8');
  const ver = pubspec.match(/^version:\s*(\d+\.\d+\.\d+)\+(\d+)\s*$/m);
  if (!ver) throw new Error('pubspec version must be name+code e.g. 1.0.0+1');
  console.log(`[verify:phase27] version scheme OK (${ver[1]}+${ver[2]})`);

  const listing = fs.readFileSync(mustExist('docs/phase27/STORE_LISTING.md'), 'utf8');
  if (!listing.includes('Ratnaraj Jewellers') || !listing.includes('Short description')) {
    throw new Error('STORE_LISTING.md incomplete');
  }
  if (listing.length < 400) throw new Error('STORE_LISTING.md too short');
  console.log('[verify:phase27] store listing copy OK');

  const mainRatnaraj = mustExist('apps/mobile/lib/main_ratnaraj.dart');
  if (!fs.existsSync(mainRatnaraj)) throw new Error('main_ratnaraj.dart missing');
  console.log('[verify:phase27] ratnaraj flavor entrypoint OK');

  console.log('[verify:phase27] ALL PASSED — Play submit engineering gate green');
  console.log(
    '[verify:phase27] note: live Play Console upload + owner install deferred until Client keystore/Console',
  );
}

try {
  main();
  process.exit(0);
} catch (err) {
  console.error('[verify:phase27] FAILED', err);
  process.exit(1);
}
