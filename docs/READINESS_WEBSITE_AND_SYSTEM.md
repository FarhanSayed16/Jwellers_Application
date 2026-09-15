# Website & System Readiness Plan

**Date:** 2026-09-12  
**System:** Jwellers white-label — Flutter customer app · Next.js retailer admin · Express API · MongoDB  
**Prompt source:** `Website & System Readiness Checklist Prompt.md`  
**Related:** [06_LEGAL_AND_COMPLIANCE.md](./06_LEGAL_AND_COMPLIANCE.md) · [phase23](./phase23/23_COMPLETION_RECORD.md)

---

## System context (what “website” means here)

| Surface | Audience | Public web? |
|---|---|---|
| **Flutter mobile app** | Customers | No (store listing + in-app) |
| **Next.js admin** (`apps/admin`) | Retailer staff | Mostly private; **`/legal/*` is public** for Play policy URLs |
| **Express API** | Apps only | JSON API — no marketing pages |
| **Marketing / brand site** | Visitors | **Not in this repo** — Client’s own site (optional) |

**Implication:** Full marketing SEO (sitemap of product pages, social OG for every SKU, public FAQ marketing site) is **not required** of this codebase unless a Client hosts a separate site. Play Store + admin legal URLs + in-app UX **are** required.

---

## 1. Legal & Support — required analysis

| Item | Required? | Where | What content | How it works | System connection |
|---|---|---|---|---|---|
| **Privacy Policy** | **Required** | Admin `/legal/privacy` (public) · Mobile Account → Privacy · Play listing URL | Controller = Shop; OTP phone; chat; FCM; Cloudinary; MSG91; retention/deletion | Static page; URL via `LEGAL_PRIVACY_URL` | Play Data Safety · `GET /config/public` |
| **Terms & Conditions** | **Required** | `/legal/terms` · Mobile Terms | Catalogue/enquiry channel; rates indicative; stock not guaranteed | Static page · `LEGAL_TERMS_URL` | Same as privacy |
| **Delete account** | **Required** (Play) | `/legal/delete-account` · In-app delete | How to request deletion + in-app path | Already shipped (Phase 23) | `LEGAL_DELETE_ACCOUNT_URL` |
| **Support** | **Required** | `/legal/support` + `LEGAL_SUPPORT_EMAIL` in config · Play “support email” | How to reach Shop (email/phone from shop config) | Page + mailto · mobile Account link | ShopConfig contact · env support email |
| **Cookie Policy** | **Required** (admin web) | `/legal/cookies` | Session cookie `jwellers_admin_session`; no ad trackers by default | Static disclosure | Admin middleware session |
| **Cookie Consent** | **Recommended** (admin) | Banner on admin login/legal only if non-essential cookies added | Essential session = disclose; analytics cookies = opt-in | Banner + preference storage | Only if GA/marketing cookies added |
| **Cookie Preferences** | **Recommended** | Linked from Cookie Policy / banner | Toggle non-essential cookies | LocalStorage + reload | Same as consent |
| **FAQ** | **Recommended** | `/legal/faq` · optional mobile FAQ | OTP, rates, delete account, payments (if on) | Static | Reduces support load |
| **Help Center** | **Not required** (v1) | — | Full knowledge base | Out of scope — Support + FAQ enough | Use Support |
| **Data Processing Agreement** | **Required commercially** | Contract annex (`docs/commercial/`), not a public app page | Processor (Provider) vs Controller (Shop) | Signed with MSA — not Play URL | `MSA_DRAFT.md` §9 |

---

## 2. UX States — required analysis

| State | Where required | When | User sees | CTA / recovery |
|---|---|---|---|---|
| **404** | **Admin web** Required · Mobile N/A (router) | Unknown admin URL | Branded “Page not found” | Home / Dashboard |
| **403** | **Admin** Recommended · API JSON exists | Staff hits owner-only route / feature off | “Not allowed” or FEATURE_DISABLED toast | Back / contact owner |
| **500** | **Admin** Required · API JSON exists | Uncaught render/API failure | “Something went wrong” + request id if any | Retry / Dashboard |
| **Maintenance** | **Recommended** | Deploy / DB outage | “We’ll be back” | Retry · API `/ready` already 503s |
| **No Search Results** | **Mobile** Required (exists) · Admin Recommended | Empty catalog/search | Empty illustration + clear filters | Clear filters / Browse |
| **Loading** | **Both** Required (mobile skeletons exist; admin ad hoc) | Fetch in progress | Skeleton / spinner — never blank forever | Auto when data arrives |
| **Error State** | **Both** Required (mobile `AppErrorRetry`; admin inline) | Failed fetch | Message + Retry | Retry / soft login |
| **Success State** | **Both** Recommended | Save rate, send enquiry, etc. | Toast / snackbar | Dismiss |
| **Session Expired** | **Both** Required | Refresh token fails / 401 after refresh | Explicit “Session expired — sign in again” | Login / soft login sheet |

---

## 3. Website & SEO — required analysis

| # | Item | Required? | Fits where | Create / data | Function | Test | Priority |
|---|---|---|---|---|---|---|---|
| 1 | Privacy Policy | **Required** | `/legal/privacy` | Exists — keep counsel-reviewed | Public URL for Play | Open URL logged-out | P0 |
| 2 | Terms Page | **Required** | `/legal/terms` | Exists | Public | Same | P0 |
| 3 | Clear CTA | **Required** (mobile) | Home enquire / WA / rates | Primary buttons already | One job per screen | Flow 13 docs | P0 |
| 4 | FAQ | **Recommended** | `/legal/faq` | New page | Reduce support | Link from Account | P1 |
| 5 | robots.txt | **Required** (admin host) | `app/robots.ts` | Allow `/legal/*`; Disallow private app | Protect admin from indexing | curl `/robots.txt` | P0 |
| 6 | sitemap.xml | **Recommended** | `app/sitemap.ts` | Only public legal URLs | Help indexing of policies | curl `/sitemap.xml` | P1 |
| 7 | Custom 404 | **Required** | `app/not-found.tsx` | Branded | Recover to login/home | Hit `/nope` | P0 |
| 8 | Alt text | **Required** (a11y) | Catalog thumbs, banners | Non-empty `alt` from title/SKU | Screen readers | Axe / manual | P1 |
| 9 | Analytics | **Not required** as marketing GA | Product analytics = `FEATURE_ANALYTICS` | Do **not** add GA without cookie consent | Optional Plausible later | — | P2 |
| 10 | Meta Titles | **Required** (legal pages) | Per-route `metadata` | “Privacy · {Shop}” | Tab / SERP | View source | P0 |
| 11 | Meta Descriptions | **Required** (legal) | Same | 1–2 sentence summary | SERP | View source | P0 |
| 12 | Social Sharing | **Recommended** | OG on legal pages | Shop name + logo | WhatsApp/Telegram previews of privacy URL | Share link | P1 |
| 13 | Favicon | **Required** | `app/icon` or `public/favicon.ico` · shop `faviconUrl` | Brand mark | Browser tab | Load admin | P0 |
| 14 | Canonical URIs | **Recommended** | Legal page metadata | Absolute legal URLs | Avoid duplicate hosts | View source | P1 |
| 15 | Cookie Consents | **Recommended** | See Legal § | Banner if non-essential cookies | Opt-in | Clear cookies test | P1 |
| 16 | Mobile Version | **Required** | Flutter app | Exists | Customer product | Device QA | P0 |
| 17 | Accessibility | **Recommended** | Admin + mobile | Labels, contrast, focus | WCAG-ish for admin forms | Keyboard tab | P1 |
| 18 | Test Forms | **Required** (product) | OTP, enquire, login | Smoke checklist | Submit → API success | verify scripts + manual | P0 |
| 19 | Check Broken Links | **Recommended** | Legal nav, Play URLs | Script or manual | All `LEGAL_*` URLs 200 | Pre-Play | P1 |
| 20 | Optimize Performance | **Recommended** | Mobile images + admin | Cloudinary transforms; Next defaults | Lighthouse / feel | phase24 PERFORMANCE | P1 |

---

## Classification summary

### Required (ship for Play / production admin)

1. Privacy, Terms, Delete-account (done) — keep URLs live  
2. Support page + support email wired  
3. Cookie Policy (admin session disclosure)  
4. Admin custom 404 + error boundary  
5. Session expired UX (admin + mobile copy)  
6. robots.txt (allow legal, disallow app)  
7. Favicon  
8. Per-legal-page meta title/description  
9. Mobile empty / error / loading (mostly done)  
10. Form smoke (login, OTP, enquire)  

### Recommended (quality / support / SEO of legal URLs)

1. FAQ page  
2. sitemap.xml (legal only)  
3. Cookie consent banner **only if** adding analytics cookies  
4. Cookie preferences UI (with consent)  
5. OG/social meta on legal pages  
6. Canonical URIs  
7. Alt text pass on admin catalog  
8. Accessibility pass (keyboard, labels)  
9. Broken-link check before Play  
10. Performance pass  
11. Maintenance page + optional `MAINTENANCE_MODE` flag  
12. Admin 403 page for feature-disabled  

### Not required (for this system as built)

1. **Help Center** product (Support + FAQ enough)  
2. **Public marketing SEO** for catalogue (catalog is in-app, not a public website)  
3. **Marketing analytics (GA)** by default  
4. **DPA as a public web page** — keep as signed commercial annex  
5. **Cookie CMP** for the Flutter app (no web cookies in customer app)  
6. **Sitemap of SKUs** until a public web storefront exists  

---

## Implementation checkpoint checklist

Use this as the live punch-list. Mark items as you ship them.

### A. Legal & Support — Required

- [x] Privacy Policy page (`/legal/privacy`) + mobile screen  
- [x] Terms page (`/legal/terms`) + mobile screen  
- [x] Delete-account page + in-app delete  
- [x] Support page (`/legal/support`) with shop contact + `LEGAL_SUPPORT_EMAIL`  
- [x] Cookie Policy page (`/legal/cookies`) documenting `jwellers_admin_session`  
- [x] Wire Support + Cookies into `LegalShell` nav  
- [x] Production `LEGAL_*` env templates + runbook ([READINESS_LEGAL_URLS_RUNBOOK.md](./READINESS_LEGAL_URLS_RUNBOOK.md)) — Client pastes live host at deploy  
- [x] Counsel review pack ready ([READINESS_CLIENT_LEGAL_REVIEW.md](./READINESS_CLIENT_LEGAL_REVIEW.md)) — human sign-off at Play  

### B. Legal & Support — Recommended / Commercial

- [x] FAQ page (`/legal/faq`)  
- [x] Mobile Account → Support (mailto/tel from config)  
- [x] Cookie consent banner (admin) — essential-first; analytics opt-in ready  
- [x] Cookie preferences panel (`/legal/cookie-preferences`)  
- [x] DPA annex ([commercial/DPA_ANNEX.md](./commercial/DPA_ANNEX.md)) attached to MSA  
- [x] Help Center — **skip** unless sold as concierge  

### C. UX States — Required

- [x] Admin `not-found.tsx` (404)  
- [x] Admin `error.tsx` (500 recovery)  
- [x] Admin session-expired message on login (`?reason=session`)  
- [x] Mobile session-expired copy when refresh fails  
- [x] Mobile empty / no-search-results (`AppEmptyState`)  
- [x] Mobile error + retry (`AppErrorRetry`)  
- [x] Mobile loading skeletons  
- [x] API JSON 404/500 (`errorHandler`)  
- [x] Shared admin success toast (`ToastHost` / `showToast`)  

### D. UX States — Recommended

- [x] Admin 403 page (`/forbidden`) + FeatureGate fallback  
- [x] Maintenance page + `MAINTENANCE_MODE` / `NEXT_PUBLIC_MAINTENANCE_MODE`  
- [x] Admin catalog “no search results” empty state + clear filters  

### E. Website & SEO — Required

- [x] `robots.ts` — Allow `/legal/`; Disallow private app routes  
- [x] Favicon for admin (`app/icon.tsx`)  
- [x] Metadata title + description on each `/legal/*` page  
- [x] Mobile app as customer “mobile version”  
- [x] Pre-Play form smoke: admin login, customer OTP, enquire (`npm run verify:readiness`)  

### F. Website & SEO — Recommended

- [x] `sitemap.ts` listing legal URLs  
- [x] Open Graph tags on legal pages (`legalPageMetadata`)  
- [x] Canonical URLs on legal pages  
- [x] Alt text on admin item thumbnails / upload previews / custom-request refs  
- [x] Keyboard accessibility — skip link + labelled icon buttons  
- [x] Broken-link check script (`npm run check:legal-links -w @jwellers/admin`)  
- [x] Performance notes extended ([phase24/PERFORMANCE.md](./phase24/PERFORMANCE.md))  
- [x] Marketing analytics — **do not** add without consent + Cookie Policy update  

### G. Not required (explicitly out of scope)

- [x] ~~Public Help Center CMS~~ — deferred  
- [x] ~~SKU sitemap / public catalogue SEO~~ — no public storefront  
- [x] ~~GA by default~~ — not required  
- [x] ~~Customer-app cookie banner~~ — N/A  
- [x] ~~Public DPA HTML page~~ — commercial annex only  

---

## Verify

```bash
npm run verify:readiness -w @jwellers/api
# With admin running:
npm run check:legal-links -w @jwellers/admin
```

## Suggested build order

1. ~~P0 legal gaps~~ ✅  
2. ~~P1 FAQ, sitemap, OG/canonical, alt text, a11y, broken links~~ ✅  
3. ~~P2 Maintenance, cookie CMP, DPA annex~~ ✅  

## Ownership

| Area | Owner |
|---|---|
| Page copy / counsel | Client + Provider template |
| Play listing URLs | Client (Provider assists) — runbook ready |
| Admin/mobile implementation | Engineering ✅ |
| DPA / MSA | Commercial — annex template ready |

---

*This plan is specific to the Jwellers white-label stack. It does not invent a public marketing website that is not part of the product. Human gates remaining: live host URLs per Client, counsel signatures, Play Console paste.*
