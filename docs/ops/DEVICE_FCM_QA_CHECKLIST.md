# Device FCM QA checklist

**Purpose:** Confirm real push delivery on physical Android devices per flavor.  
**Status:** Ops / device QA — not satisfied by unit tests or memory-DB verify scripts.  
**Related:** Phase 21 FCM · `apps/mobile` flavors · audit **P-16**

## Preconditions

- [ ] Per-flavor Firebase options / `google-services.json` (no shared hardcoded project in release)
- [ ] API has Firebase Admin credentials for that client slug
- [ ] Device registered via app (`POST` device / FCM token path used by `push_service.dart`)

## Mid-range Android pass (per flavor)

| Flavor | Device model | OS | Rates push | Chat push | Price alert | Notes |
|---|---|---|---|---|---|---|
| Demo | | | [ ] | [ ] | [ ] | |
| Ratnaraj | | | [ ] | [ ] | [ ] | |
| Acme (if live) | | | [ ] | [ ] | [ ] | |

## Scenarios

- [ ] App backgrounded: tap notification opens correct route (`rates_updated` → home, `chat_message` → thread, `price_alert` → `/price-alerts`)
- [ ] App killed: cold start from notification still routes
- [ ] Token refresh after reinstall still receives pushes
- [ ] Opt-out / logout stops further customer pushes (if product requires)

## Failures to log

Record date, flavor, device, payload `type`, and whether Admin console / Firebase console showed delivery. Do not mark this checklist complete without at least one mid-range Android success per shipping flavor.
