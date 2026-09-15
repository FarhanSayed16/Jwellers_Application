# Phase 24 — Atlas backup & restore

**Audience:** Ops / engineer on-call  
**Scope:** Dedicated MongoDB Atlas cluster (or dedicated DB) per white-label client — never shared multi-tenant.

## Enable backups (Atlas)

1. Atlas → **Project** → **Cluster** → **Backup** (Cloud Backup / Continuous).
2. For production clients (Ratnaraj): enable **Cloud Backup** with at least daily snapshots + point-in-time if tier allows.
3. Confirm backup retention ≥ 7 days for launch; raise for AMC clients.
4. Note the cluster name + project ID in the client ops sheet (do not put credentials in git).

## Restore drill (document after first successful restore)

1. Atlas → Backup → pick snapshot → **Restore**.
2. Prefer restore to a **new** cluster or temporary DB name (`ratnaraj_jewellers_restore_YYYYMMDD`), not overwrite live.
3. Point a staging API `MONGODB_URI` at the restore target.
4. Run:
   ```bash
   npm run smoke -w @jwellers/api
   # with SMOKE_BASE_URL pointing at staging API
   ```
5. Spot-check: public config, one admin login, one catalog list, one customer OTP (dev bypass on staging only).
6. Tear down temporary restore cluster when done.

## Per-client checklist

| Client | Cluster / DB | Backup on? | Last restore drill |
|---|---|---|---|
| Demo | (TBD on Render deploy) | ☐ | |
| Ratnaraj | `ratnaraj_jewellers` | ☐ confirm in Atlas UI | |

## Notes

- `npm run migrate -w @jwellers/api` only syncs indexes — it is **not** a backup tool.
- Application-level soft-deletes (items, customers) are not a substitute for cluster backup.
