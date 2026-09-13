/**
 * Phase 28 gate — retailer training + ownership handoff pack present.
 */
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(__dirname, '../../../../');

function mustExist(rel: string) {
  const p = path.join(root, rel);
  if (!fs.existsSync(p)) throw new Error(`missing: ${rel}`);
  return fs.readFileSync(p, 'utf8');
}

function main() {
  const files = [
    'docs/phase28/TRAINING_INDEX.md',
    'docs/phase28/TRAIN_RATES.md',
    'docs/phase28/TRAIN_CATALOG.md',
    'docs/phase28/TRAIN_ENQUIRIES_CHAT.md',
    'docs/phase28/TRAIN_BRANDING.md',
    'docs/phase28/RATE_SOLO_GATE.md',
    'docs/phase28/HANDOFF_CHECKLIST.md',
    'docs/phase28/ACCESS_TRANSFER.md',
    'docs/phase28/SUPPORT_AND_AMC.md',
    'docs/phase28/VERSION_REGISTER.md',
    'docs/phase28/MODULES_VS_INVOICE.md',
    'docs/phase28/28_COMPLETION_RECORD.md',
    'docs/06_LEGAL_AND_COMPLIANCE.md',
    'docs/commercial/AMC_TIERS.md',
    'docs/phase27/SIGNING_HANDOFF.md',
    'docs/phase26/OWNER_HANDOFF.md',
    'clients/ratnaraj/modules.json',
  ];
  for (const f of files) mustExist(f);
  console.log('[verify:phase28] training + handoff docs OK');

  const rates = mustExist('docs/phase28/TRAIN_RATES.md');
  if (!rates.toLowerCase().includes('notify')) {
    throw new Error('TRAIN_RATES.md must cover notify');
  }
  const branding = mustExist('docs/phase28/TRAIN_BRANDING.md');
  if (!branding.toLowerCase().includes('owner')) {
    throw new Error('TRAIN_BRANDING.md must stress owner-only');
  }
  console.log('[verify:phase28] training coverage OK');

  const handoff = mustExist('docs/phase28/HANDOFF_CHECKLIST.md');
  for (const needle of [
    'Play Console',
    'Render',
    'Vercel',
    'Atlas',
    'Cloudinary',
    'MSG91',
    'Firebase',
    'Keystore',
    'AMC',
    'version register',
  ]) {
    if (!handoff.includes(needle)) {
      throw new Error(`HANDOFF_CHECKLIST.md missing: ${needle}`);
    }
  }
  console.log('[verify:phase28] handoff checklist coverage OK');

  const register = mustExist('docs/phase28/VERSION_REGISTER.md');
  if (!register.includes('template@1.0.0') || !register.includes('ratnaraj')) {
    throw new Error('VERSION_REGISTER.md must list Ratnaraj at template@1.0.0');
  }
  console.log('[verify:phase28] version register entry OK');

  const modules = JSON.parse(mustExist('clients/ratnaraj/modules.json')) as {
    features?: Record<string, boolean>;
  };
  if (!modules.features?.FEATURE_CHAT) {
    throw new Error('ratnaraj modules.json unexpected');
  }
  console.log('[verify:phase28] modules.json present for invoice cross-check OK');

  console.log('[verify:phase28] ALL PASSED — training & handoff engineering gate green');
  console.log(
    '[verify:phase28] note: live Loom delivery + access tick-boxes + rate solo are Client-session deferred',
  );
}

try {
  main();
  process.exit(0);
} catch (err) {
  console.error('[verify:phase28] FAILED', err);
  process.exit(1);
}
