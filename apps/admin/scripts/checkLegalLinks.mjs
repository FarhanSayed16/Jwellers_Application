#!/usr/bin/env node
/**
 * Check public legal routes return 200.
 * Usage: ADMIN_ORIGIN=http://localhost:3000 node apps/admin/scripts/checkLegalLinks.mjs
 */
const origin = (process.env.ADMIN_ORIGIN || 'http://localhost:3000').replace(/\/$/, '');
const paths = [
  '/legal/privacy',
  '/legal/terms',
  '/legal/delete-account',
  '/legal/support',
  '/legal/cookies',
  '/legal/cookie-preferences',
  '/legal/faq',
  '/robots.txt',
  '/sitemap.xml',
  '/forbidden',
  '/maintenance',
];

async function main() {
  let failed = 0;
  for (const p of paths) {
    const url = `${origin}${p}`;
    try {
      const res = await fetch(url, { redirect: 'manual' });
      const ok = res.status >= 200 && res.status < 400;
      console.log(`${ok ? 'OK' : 'FAIL'} ${res.status} ${url}`);
      if (!ok) failed += 1;
    } catch (err) {
      console.log(`FAIL 000 ${url} (${err instanceof Error ? err.message : err})`);
      failed += 1;
    }
  }
  if (failed) {
    console.error(`[checkLegalLinks] ${failed} failure(s)`);
    process.exit(1);
  }
  console.log('[checkLegalLinks] PASSED');
}

main();
