# Legal production URLs — runbook

**Engineering template ready.** Each Client must set live hosts before Play production.

## Env keys (API)

| Key | Example (local) | Production |
|---|---|---|
| `LEGAL_PRIVACY_URL` | `http://localhost:3000/legal/privacy` | `https://admin.<client>.example/legal/privacy` |
| `LEGAL_TERMS_URL` | `http://localhost:3000/legal/terms` | same host `/legal/terms` |
| `LEGAL_DELETE_ACCOUNT_URL` | `http://localhost:3000/legal/delete-account` | `/legal/delete-account` |
| `LEGAL_SUPPORT_EMAIL` | `support@demo.jewellers.local` | Shop’s public support inbox |

Also set admin:

| Key | Purpose |
|---|---|
| `NEXT_PUBLIC_ADMIN_ORIGIN` | Canonical + sitemap absolute URLs |
| `NEXT_PUBLIC_MAINTENANCE_MODE` | `true` only during admin maintenance window |
| API `MAINTENANCE_MODE` | `true` only during API maintenance (keeps `/health` `/ready`) |

## Checklist per Client

- [ ] Admin deployed on Vercel (or Client host)  
- [ ] Four `LEGAL_*` URLs return **200** logged-out  
- [ ] Play Console Data safety → privacy URL pasted  
- [ ] Support email matches Play listing  
- [ ] Counsel reviewed privacy/terms (see [CLIENT_LEGAL_REVIEW.md](./CLIENT_LEGAL_REVIEW.md))  
- [ ] DPA annex signed with MSA ([DPA_ANNEX.md](../commercial/DPA_ANNEX.md))  

## Verify

```bash
npm run verify:readiness -w @jwellers/api
# Optional live link check (admin must be running):
ADMIN_ORIGIN=http://localhost:3000 node apps/admin/scripts/checkLegalLinks.mjs
```
