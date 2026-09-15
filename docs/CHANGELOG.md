# Changelog

All notable changes to the **Jwellers white-label template** are recorded here.  
Client stacks pin a row via [phase28/VERSION_REGISTER.md](./phase28/VERSION_REGISTER.md).

Format based on [Keep a Changelog](https://keepachangelog.com/). Versioning: template semver + Android `versionName+versionCode`.

## [1.0.0] — 2026-09-11 — Launch freeze

### Added

- White-label stack: Flutter flavors, Express API, Next.js admin, MongoDB Atlas
- Customer OTP auth, rates, catalog, wishlist, enquiries, custom requests, chat
- FCM push (devices + rate notify), offers, hallmark trust, CSV import, legal pages
- Production hardening: request logging, optional Sentry, smoke script, soft/force update
- Demo dogfood + Ratnaraj provisioning seeds
- Play submit pack (listing, signing, Codemagic stub)
- Retailer training + ownership handoff pack
- Admin chat canned-reply chips

### Notes

- Tag: `template@1.0.0` (create after committing this freeze — see [phase29/LAUNCH_FREEZE.md](./phase29/LAUNCH_FREEZE.md))
- Paid modules (billing, Razorpay, old-gold, QR, …) remain **flagged off** — Phase 30+

## [Unreleased]

### Added

- Phase 35 Year-1 closeout: provisional keep/kill, package reconciliation, decision-log refresh, AMC published prices, docs drift pass, dependency/security audits, Year-2 master plan draft
- Website & system readiness complete: cookie consent/preferences, OG/canonical, 403/maintenance, DPA annex, form smoke (`verify:readiness`), legal link checker
- Website & system readiness plan + P0 legal/UX/SEO: Support/Cookies/FAQ pages, admin 404/error, robots/sitemap/favicon, session-expired UX
- Phase 34 premium messaging & rate API: mock metals feed + margin, WA Business dry-run broadcasts, Demo flags ON, BSP/rate-API cost docs, commercial ₹ list prices
- Phase 33 second-client automation: `create-client`, multi-flavor Codemagic, `client:provision` / `seed:client-catalog`, Acme dry-run pack, onboarding kit
- Phase 32 growth pack (flagged off): analytics + most-viewed, CRM-lite tags/follow-ups, schemes, referrals, price alerts
- Phase 31 showroom bridge (flagged off by default): item QR print tags, rate-card share, appointments, store mode, curated Home boards
- Phase 30 monetization modules (flagged off by default): digital billing, Razorpay advances (mock without keys), old-gold exchange

### Planned

- Year-2 Y2-01 Ratnaraj live DoD · hosted Demo sales path ([14 v2](./14_MASTER_EXECUTION_PLAN_v2.md))
- Socket.IO chat upgrade (deferred from 30.4)
- Live Client #2 infra (deferred from 33.4)
- Live Meta/BSP + live metals vendor HTTP (deferred from 34; dry-run/mock demoable)
- Optional-if-sold: offline catalog, i18n, multi-branch, savings tracker (34.3)
- Team v2 priority sign-off + Ratnaraj case study permission
