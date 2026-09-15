# Phase 01 — Accounts Checklist

**Rule:** Prefer **Client-owned** accounts from day one. Provider may use temporary collaborator access with a written return date.

**First client:** Ratnaraj Jewellers  
**Also needed for template:** Demo / Provider accounts for staging (can be Provider-owned).

---

## A. Demo / template (Provider-owned OK)

| Service | Purpose | Status | Account email / project name | Notes |
|---|---|---|---|---|
| MongoDB Atlas | Demo DB | ☐ Not opened | | Separate from Ratnaraj |
| Render | Demo API | ☐ | | Free tier OK for demo |
| Vercel | Demo admin | ☐ | | Hobby OK |
| Cloudinary | Demo media | ☐ | | Folder `demo/` |
| MSG91 | Demo OTP | ☐ | | Test numbers |
| Firebase | Demo FCM | ☐ | | |
| GitHub | Monorepo | ☐ / ✅ if exists | | |

---

## B. Ratnaraj (Client-owned preferred)

| Service | Purpose | Who owns | Status | Login / project ID | Handoff done |
|---|---|---|---|---|---|
| Google account | Play + Firebase | Client | ☐ | | ☐ |
| Google Play Console | App listing ($25) | Client | ☐ | | ☐ |
| MongoDB Atlas | Production DB | Client | ☐ | | ☐ |
| Render | Production API (Starter ~$7) | Client | ☐ | | ☐ |
| Vercel | Production admin | Client | ☐ | | ☐ |
| Cloudinary | Product images | Client | ☐ | | ☐ |
| MSG91 | OTP SMS | Client | ☐ | | ☐ |
| Firebase | FCM for their flavor | Client | ☐ | | ☐ |
| Razorpay | Only if module sold | Client | ☐ N/A yet | | ☐ |

---

## C. Opening order (recommended)

1. Google account (Client)  
2. Atlas + Cloudinary + MSG91  
3. Render + Vercel  
4. Firebase  
5. Play Console (can wait until first AAB — but start early; verification takes time)

---

## D. Secrets handling

- Never commit API keys.  
- Share first credentials via password manager / secure channel only.  
- Log access grants in handoff (Phase 28).

---

## Status summary

| Block | State |
|---|---|
| Checklist created | ✅ |
| Demo accounts opened | ☐ Pending (can start Phase 03–25 with Provider demo accounts) |
| Ratnaraj accounts opened | ☐ Pending Client — tracked for Phase 26 |

**Phase 01 note:** Opening live vendor accounts is **not** a blocker for Phases 02–03 (wireframes + monorepo). Production Client accounts are required before Phase 26.
