/**
 * Phase 35 gate — Year-1 closeout & roadmap refresh (docs + hygiene).
 */
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(__dirname, '../../../../');

function mustExist(rel: string) {
  const p = path.join(root, rel);
  if (!fs.existsSync(p)) throw new Error(`missing: ${rel}`);
  return fs.readFileSync(p, 'utf8');
}

function mustInclude(rel: string, needles: string[]) {
  const text = mustExist(rel);
  for (const n of needles) {
    if (!text.includes(n)) throw new Error(`${rel} missing needle: ${n}`);
  }
  return text;
}

async function main() {
  const files = [
    'docs/phase35/35_COMPLETION_RECORD.md',
    'docs/phase35/KEEP_KILL_PROVISIONAL.md',
    'docs/phase35/PACKAGE_RECONCILIATION.md',
    'docs/phase35/DEPENDENCY_AUDIT.md',
    'docs/phase35/SECURITY_AUDIT_2026.md',
    'docs/phase35/CASE_STUDY_DRAFT.md',
    'docs/phase35/V2_PRIORITIES_DRAFT.md',
    'docs/14_MASTER_EXECUTION_PLAN_v2.md',
  ];
  for (const f of files) mustExist(f);
  console.log('[verify:phase35] phase35 + v2 files OK');

  mustInclude('docs/08_ENHANCEMENTS_AND_MONTHLY_PLAN.md', [
    '2026-09-12',
    'KEEP_KILL_PROVISIONAL',
    '14_MASTER_EXECUTION_PLAN_v2',
  ]);
  mustInclude('docs/commercial/AMC_TIERS.md', ['25,000', '45,000', '75,000', 'Published']);
  mustInclude('docs/phase29/AMC_INVOICE_PROCESS.md', ['₹ prices filled in AMC_TIERS']);
  mustInclude('docs/phase35/PACKAGE_RECONCILIATION.md', ['Launch', 'Premium', 'Built']);
  mustInclude('docs/phase35/SECURITY_AUDIT_2026.md', ['Pass for engineering gate']);
  mustInclude('docs/phase35/DEPENDENCY_AUDIT.md', ['mongoose', 'next']);
  mustInclude('docs/14_MASTER_EXECUTION_PLAN_v2.md', ['Y2-01', 'Y2-04', 'DRAFT']);
  mustInclude('docs/03_DATA_MODEL.md', ['wa_broadcasts', 'old_gold_quotes', 'appointments']);
  mustInclude('docs/09_BACKEND_API.md', ['whatsapp-business', 'fetch-suggest']);
  mustInclude('docs/10_ADMIN_WEB_PAGES.md', ['analytics/page.tsx', 'old-gold/page.tsx']);
  mustInclude('docs/README.md', ['14_MASTER_EXECUTION_PLAN_v2', 'phase35']);
  mustInclude('docs/05_BUILD_ROADMAP.md', ['Year-2', '14_MASTER_EXECUTION_PLAN_v2']);
  mustInclude('docs/commercial/QUOTE_TEMPLATE.md', ['FEATURE_ANALYTICS', 'FEATURE_ITEM_QR']);

  const pkg = mustExist('apps/admin/package.json');
  if (!pkg.includes('15.5.')) {
    throw new Error('admin next should be on 15.5.x after Phase 35 bump');
  }
  const apiPkg = mustExist('apps/api/package.json');
  if (!apiPkg.includes('verify:phase35')) {
    throw new Error('apps/api/package.json missing verify:phase35 script');
  }

  const master = mustExist('docs/14_MASTER_EXECUTION_PLAN.md');
  if (!master.includes('[x] Which modules actually sold? Keep/kill list')) {
    throw new Error('Phase 35 keep/kill checkbox not ticked in master plan');
  }
  if (!master.includes('14_MASTER_EXECUTION_PLAN_v2')) {
    throw new Error('master plan should point at v2');
  }

  console.log('[verify:phase35] decision log + commercial + drift needles OK');
  console.log('[verify:phase35] PASSED');
}

main().catch((err) => {
  console.error('[verify:phase35] FAILED', err);
  process.exit(1);
});
