# Phase 02 — Flow Review vs Wireframes

**Refs:** [13_END_TO_END_FLOWS.md](../13_END_TO_END_FLOWS.md) · mobile/admin wireframe packs  
**Date:** 2026-09-07  
**Result:** ✅ Pass — no blockers for Phase 03+

---

## Flow walkthrough

| Flow | Title | Wireframe coverage | Gap? |
|---|---|---|---|
| 2 | Customer OTP login | Auth phone + OTP + soft-login sheet | None |
| 3 | Token refresh | Invisible UX (interceptor); 401 → login | None (eng note in mobile pack) |
| 4 | Admin login | Login / forgot / reset | None |
| 5 | Set rate → customer sees | Admin Rates + Mobile Home/Calculator/History | None |
| 6 | Add item → browse | Admin Categories/Items + Mobile Collection/Detail | None |
| 7 | Wishlist | Heart on grid/detail + Wishlist screen + auth gate | None |
| 8 | Enquire | Item detail CTA + Enquiries list (mobile/admin) | None |
| 9 | Chat Phase A | Chat tab/list/thread + Admin chat split + flag hide | None |
| 12 | Account deletion | Delete account screen + Account entry | None |

---

## Feature-flag UX checks

| Rule | Confirmed in wireframes |
|---|---|
| Chat tab hidden when `FEATURE_CHAT=false` | ✅ Mobile global chrome + Admin nav |
| WhatsApp CTA hidden when flag off | ✅ Item detail |
| Hallmark badge only with flag + data | ✅ Item detail / item form |
| Offers / custom requests / size guide gated | ✅ Account + admin nav |
| Invoices / Payments nav hidden when off | ✅ Admin shell |
| Never show empty Chat tab | ✅ Explicit rule |

---

## Open UI questions

| Question | Decision |
|---|---|
| Figma required before Phase 03? | **No** — this markdown pack is the checkpoint; optional Figma polish later |
| Admin dark mode required for v1? | **No** — optional later; customer dark is required |
| Exact Ratnaraj hex? | **⏸** Client confirm; layouts independent of hex |

**No major open UI questions blocking Phase 03+.**

---

## Sign-off

| Role | Name | Agrees wireframes sufficient | Date |
|---|---|---|---|
| Docs / design checkpoint | Auto (Phase 02 pack) | ✅ | 2026-09-07 |
| Backend | _fill when reviewing_ | ☐ | |
| Admin | _fill when reviewing_ | ☐ | |
| Mobile | _fill when reviewing_ | ☐ | |

> Engineering may proceed to Phase 03. Teammates tick sign-off after reading `docs/design/*`.
