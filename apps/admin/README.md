# Retailer Admin (`@jwellers/admin`)

Phase 13 shell: login, layout, dashboard against the Demo API.

## Run

```bash
# Terminal 1 — API (seeded Mongo / memory as available)
npm run dev:api

# Terminal 2 — Admin
npm run dev:admin
```

Open http://localhost:3000 → redirects to `/login` when signed out.

Env: copy `.env.example` → `.env.local` (`NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api/v1`).

## Auth note (MVP)

Access + refresh tokens are stored in **localStorage**; a `jwellers_admin_session` cookie drives middleware redirects. Prefer httpOnly cookies before production hardening.

## Verify

```bash
npm run verify:admin-web -w @jwellers/admin
```
