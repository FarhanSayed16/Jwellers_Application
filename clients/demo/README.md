# Client: Demo Jewellers

**Slug:** `demo`  
**Purpose:** Permanent staging + sales demo instance (Provider-owned OK)  
**Hosting intent:** Render free for API demo; not a paying jeweller

## Layout

```
clients/demo/
  README.md
  modules.json
  branding/tokens.json
  flavor/PLACEHOLDER.md
```

## Ops (Phase 25)

| Task | Command / doc |
|---|---|
| Seed shop + owner | `CLIENT_SLUG=demo npm run seed -w @jwellers/api` |
| Seed sample catalog + rates | `CLIENT_SLUG=demo npm run seed:demo-catalog -w @jwellers/api` |
| Dogfood API (Flow 18) | `npm run verify:phase25 -w @jwellers/api` |
| Deploy runbook | [docs/phase25/DEPLOY_DEMO.md](../../docs/phase25/DEPLOY_DEMO.md) |
| 10-min sales script | [docs/phase25/DEMO_SCRIPT_10MIN.md](../../docs/phase25/DEMO_SCRIPT_10MIN.md) |

Used from Phase 03 onward as the default development target before Ratnaraj production (Phase 26).
