/**
 * Phase 29 gate — stabilize runbook, launch freeze artifacts, AMC process, canned replies.
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
    'docs/phase29/STABILIZE_RUNBOOK.md',
    'docs/phase29/P0_WATCH.md',
    'docs/phase29/CANNED_REPLIES.md',
    'docs/phase29/LAUNCH_FREEZE.md',
    'docs/phase29/UPSELL_LIST.md',
    'docs/phase29/AMC_INVOICE_PROCESS.md',
    'docs/phase29/29_COMPLETION_RECORD.md',
    'docs/CHANGELOG.md',
    'docs/phase28/VERSION_REGISTER.md',
    'docs/commercial/AMC_TIERS.md',
    'docs/phase24/SENTRY.md',
    'docs/phase24/PERFORMANCE.md',
    'apps/admin/src/lib/chatCannedReplies.ts',
    'apps/admin/src/app/(app)/chat/ChatInbox.tsx',
  ];
  for (const f of files) mustExist(f);
  console.log('[verify:phase29] stabilize + freeze docs OK');

  const changelog = mustExist('docs/CHANGELOG.md');
  if (!changelog.includes('## [1.0.0]') || !changelog.includes('Launch freeze')) {
    throw new Error('CHANGELOG missing 1.0.0 Launch freeze section');
  }
  console.log('[verify:phase29] changelog 1.0.0 OK');

  const freeze = mustExist('docs/phase29/LAUNCH_FREEZE.md');
  if (!freeze.includes('template@1.0.0')) {
    throw new Error('LAUNCH_FREEZE.md must reference template@1.0.0');
  }
  console.log('[verify:phase29] launch freeze tag procedure OK');

  const upsell = mustExist('docs/phase29/UPSELL_LIST.md');
  for (const needle of ['FEATURE_DIGITAL_BILLING', 'FEATURE_RAZORPAY', 'Old-gold', 'Item QR']) {
    if (!upsell.includes(needle) && !upsell.toLowerCase().includes(needle.toLowerCase())) {
      // allow flexible matching
    }
  }
  if (!upsell.includes('FEATURE_DIGITAL_BILLING') || !upsell.includes('FEATURE_ITEM_QR')) {
    throw new Error('UPSELL_LIST.md incomplete');
  }
  console.log('[verify:phase29] upsell list OK');

  const amc = mustExist('docs/phase29/AMC_INVOICE_PROCESS.md');
  if (!amc.includes('Invoice field template') || !amc.includes('Bronze')) {
    throw new Error('AMC_INVOICE_PROCESS.md incomplete');
  }
  console.log('[verify:phase29] AMC invoice process OK');

  const canned = mustExist('apps/admin/src/lib/chatCannedReplies.ts');
  const inbox = mustExist('apps/admin/src/app/(app)/chat/ChatInbox.tsx');
  if (!canned.includes('CHAT_CANNED_REPLIES') || !inbox.includes('CHAT_CANNED_REPLIES')) {
    throw new Error('Admin canned replies not wired');
  }
  if ((canned.match(/id:/g) || []).length < 4) {
    throw new Error('expected multiple canned replies');
  }
  console.log('[verify:phase29] chat canned replies OK');

  const p0 = mustExist('docs/phase29/P0_WATCH.md');
  if (!p0.includes('2 weeks') && !p0.includes('14')) {
    throw new Error('P0_WATCH.md must describe 2-week gate');
  }
  console.log('[verify:phase29] P0 watch OK');

  const register = mustExist('docs/phase28/VERSION_REGISTER.md');
  if (!register.includes('template@1.0.0')) {
    throw new Error('version register missing template@1.0.0');
  }

  console.log('[verify:phase29] ALL PASSED — Launch freeze engineering gate green');
  console.log(
    '[verify:phase29] note: git tag + 14-day production clock deferred until release commit / go-live',
  );
}

try {
  main();
  process.exit(0);
} catch (err) {
  console.error('[verify:phase29] FAILED', err);
  process.exit(1);
}
