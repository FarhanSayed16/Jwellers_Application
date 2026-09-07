# Jewellery White-Label Application

**Architecture:** White-Label Multi-Instance (one template monorepo → dedicated deploy per jeweller)

## Docs

- Index: [docs/README.md](docs/README.md)
- Execute: [docs/14_MASTER_EXECUTION_PLAN.md](docs/14_MASTER_EXECUTION_PLAN.md)
- Design (Phase 02): [docs/design/README.md](docs/design/README.md)

## Monorepo layout

```
apps/
  api/       # Express + TypeScript
  admin/     # Next.js retailer admin
  mobile/    # Flutter customer app
packages/
  shared-types/
clients/
  demo/
  ratnaraj/
docs/
```

## Prerequisites

- Node.js 20+
- npm 10+
- Flutter stable (for mobile)

## Setup

```bash
npm install
```

## Dev commands

```bash
npm run dev:api      # http://localhost:4000/health
npm run dev:admin    # http://localhost:3000
cd apps/mobile && flutter run
```

## Package manager

**npm workspaces** (locked for this repo).

## Phase status

- ✅ Phase 01 — Kickoff
- ✅ Phase 02 — Design / wireframes
- ✅ Phase 03 — Monorepo skeleton
- ✅ Phase 04 — Backend foundation
- ✅ Phase 05 — Database models
- ✅ Phase 06 — Public config & feature flags
- ☐ Phase 07 — Admin authentication
