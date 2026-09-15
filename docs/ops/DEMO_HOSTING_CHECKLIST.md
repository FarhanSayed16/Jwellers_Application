# Demo hosting checklist

**Purpose:** Bring up a credible Demo Jewellers stack for external sales demos.  
**Status:** Ops checklist — items are unchecked until a human completes them against live vendors.  
**Related:** `docs/15_EXTERNAL_GAPS_AND_SETUP_GUIDE.md` · Phase 25 deferred demo host

## Accounts & projects

- [ ] Demo MongoDB Atlas cluster (or shared non-prod) created; connection string in Render env
- [ ] Demo API on Render (or equivalent) with `CLIENT_SLUG=demo` and Demo feature flags
- [ ] Demo Admin on Vercel pointed at Demo API `NEXT_PUBLIC_API_BASE_URL`
- [ ] Cloudinary Demo cloud (or folder) for media sign uploads
- [ ] MSG91 (or OTP provider) Demo credentials — or accept `devOtp` only on non-prod
- [ ] Firebase project for Demo flavor (`google-services.json` / dart-defines) — not Ratnaraj project
- [ ] Optional: Razorpay test keys for Checkout demos; leave unset for mock orders

## Smoke (after host is up)

- [ ] `GET /api/v1/health` (or smoke script) against Demo API URL
- [ ] Admin login + publish rates
- [ ] Mobile Demo flavor hits Demo API; OTP + catalog browse
- [ ] One media sign upload (custom request or chat) succeeds
- [ ] Feature flags for sold demo modules match quote sheet

## Honesty gates before showing a customer

- [ ] Do not demo live Razorpay Capture without test mode keys
- [ ] Rate API: leave `RATE_API_DRY_RUN=true` unless metals key is paid and configured
- [ ] WA Business: leave BSP dry-run unless Meta/BSP credentials + opt-in flow verified
- [ ] Referrals presented as tracking-only

## Notes

Hosting is **not** complete when only local `verify:phase*` passes. Tick boxes only after URLs work from an external network.
