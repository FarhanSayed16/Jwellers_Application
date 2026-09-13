# Acme Jewellers

White-label client pack (scaffold from `npm run create-client`).

## Quick start

```bash
# API (copy env, then seed)
cp apps/api/.env.acme.example apps/api/.env.local.acme
# set MONGODB_URI → .../acme_jewellers
CLIENT_SLUG=acme npm run migrate -w @jwellers/api
CLIENT_SLUG=acme npm run seed -w @jwellers/api
CLIENT_SLUG=acme npm run seed:client-catalog -w @jwellers/api

# Mobile
cd apps/mobile
flutter run --flavor acme -t lib/main_acme.dart
```

## Ownership

See `modules.json`. Dry-run defaults: provider-owned Play/infra until live handoff.
