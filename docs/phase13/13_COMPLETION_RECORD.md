# Phase 13 — Completion Record

**Phase:** 13 — Admin web — shell, auth, dashboard  
**Completed:** 2026-09-07  

---

## Checklist

### 13.1 Foundation
- [x] Next.js App Router wired to `NEXT_PUBLIC_API_BASE_URL`
- [x] Tailwind + Demo token CSS variables (Fraunces / Source Sans 3)
- [x] API client (Bearer + refresh-once)
- [x] Auth provider + middleware cookie redirect protecting app routes

### 13.2 Pages
- [x] Login
- [x] Forgot / reset (minimum viable; uses API `resetToken` in non-prod)
- [x] App layout: Sidebar + Topbar
- [x] Dashboard with rates card + stats + quick actions
- [x] FeatureGate + OwnerOnly nav hiding
- [x] Empty/error/loading states on dashboard

### 13.3 Gate
- [x] Admin production build succeeds
- [x] Unauthenticated users redirected to `/login` (middleware + AppShell)
- [x] Owner login → dashboard against Demo API (manual / when API seeded)

---

## Run

```bash
npm run dev:api
npm run dev:admin
# http://localhost:3000/login
```

Seed owner (typical verify credentials): `owner@demo.local` / `ChangeMeOwner1!`

## Auth MVP note

Tokens in `localStorage` + `jwellers_admin_session` cookie for middleware. Prefer httpOnly refresh before production hardening.

## Verify

```bash
npm run verify:admin-web -w @jwellers/admin
```

## Next

**Phase 14 — Admin web — rates & catalog**
