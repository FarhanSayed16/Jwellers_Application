# @jwellers/api

Express + TypeScript backend (White-Label Multi-Instance).

## Phase 04 — Foundation

- Zod-validated env (`src/config/env.ts`) with **production fail-fast**
- Feature flags (`src/config/features.ts`)
- Middleware: requestId · helmet · CORS · JSON · global rate limit · error handler
- Success/error JSON shapes per `docs/09_BACKEND_API.md`
- `GET /health`, `GET /ready` (DB stub until Phase 05), `GET /api/v1`

```bash
cp apps/api/.env.example apps/api/.env   # if needed
npm run dev:api
curl http://localhost:4000/health
curl http://localhost:4000/api/v1/__debug/error-sample
```

Auth + models begin Phase 05–08.

## Phase 05 — Data models

```bash
npm run verify:db -w @jwellers/api   # memory server if no Mongo
npm run migrate -w @jwellers/api     # syncIndexes (needs real URI)
npm run seed -w @jwellers/api        # shop_config + owner (needs real URI)
```
