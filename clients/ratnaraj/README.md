# Client: Ratnaraj Jewellers

**Slug:** `ratnaraj`  
**Architecture:** White-Label Multi-Instance  
**Status:** Phase 26 engineering provisioned — Client assets & live hosts deferred  

## Folder layout

```
clients/ratnaraj/
  README.md
  INTAKE.md                 ← Client form (human)
  intake.json               ← Machine seed for shop_config (provisional)
  modules.json              ← Launch feature flags
  branding/
    tokens.json
    ASSETS.md
  catalog/
    SAMPLE_CATALOG.md
    items.csv               ← Import-ready provisional SKUs
  flavor/
    PLACEHOLDER.md
  links.md
```

## Ops (Phase 26–28)

| Task | Command / doc |
|---|---|
| Seed shop + owner | `CLIENT_SLUG=ratnaraj SEED_UPSERT=true npm run seed -w @jwellers/api` |
| Seed catalog + rates | `CLIENT_SLUG=ratnaraj npm run seed:ratnaraj-catalog -w @jwellers/api` |
| Provision gate | `npm run verify:phase26 -w @jwellers/api` |
| Play submit pack | [docs/phase27](../../docs/phase27/27_COMPLETION_RECORD.md) |
| Training + handoff | [docs/phase28](../../docs/phase28/28_COMPLETION_RECORD.md) · `npm run verify:phase28` |
| Provision runbook | [docs/phase26/PROVISION_RATNARAJ.md](../../docs/phase26/PROVISION_RATNARAJ.md) |

## Quick links

- Launch modules: `docs/phase01/01_LAUNCH_MODULES.md`
- Master plan: `docs/14_MASTER_EXECUTION_PLAN.md`
