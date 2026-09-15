# MSA / Engagement Agreement — Draft Template

**Status:** Internal draft for Phase 01 — have a lawyer review before signing with any client.  
**Product:** White-Label Multi-Instance Jewellery Retail App  
**Parties (fill per deal):** Provider (you) ↔ Client (jeweller business)

---

## 1. What Provider delivers

1. Branding and configuration of the master **template** to Client’s identity (name, logo, theme tokens, shop details).  
2. Deployment of a **dedicated** instance: backend, database, admin panel, mobile app flavor.  
3. Assistance publishing the Android app to **Client’s** Google Play Console (unless otherwise agreed).  
4. Modules explicitly listed in the signed **Module Annex / Quote** only.  
5. Optional AMC (Annual Maintenance) if purchased — see AMC schedule.

## 2. What stays Provider’s property

- Master template source code, architecture, documentation, and future improvements to the template.  
- Client receives a **license to use** their deployed instance for their jewellery business, not ownership of the global template IP (unless a separate IP assignment is signed).

## 3. What stays Client’s property

- Business data (catalog, customers, rates, chats, enquiries).  
- Branding assets (logo, photos).  
- Client-owned accounts: Play Console, hosting, SMS, Cloudinary, Firebase, payment gateway, etc.

## 4. Infrastructure & running costs

Client is responsible for all third-party running costs for their instance (hosting, database, SMS OTP, image storage, app store fees, payment MDR, optional APIs).  
Provider is not liable for service interruption caused by Client’s unpaid third-party bills or misconfigured Client accounts.

## 5. Dedicated infrastructure

Each Client instance is isolated (separate database and deployments). Provider does not mix Client data with other jewellers’ data in a shared multi-tenant database.

## 6. Scope control

Features not listed in the signed Module Annex are out of scope. New work = change order or new quote.  
Provider may reuse template improvements across other clients; Client-specific custom forks (if any) are quoted separately.

## 7. Acceptance

Client accepts delivery when: admin login works, rates/catalog operable, customer app installable on agreed track (internal/closed/production), and launch modules match the annex. Minor polish bugs may remain under AMC.

## 8. Support

Without AMC: bug fixes only within an agreed warranty window after go-live (e.g. 14–30 days) for defects vs signed scope.  
With AMC: per chosen tier (Bronze / Silver / Gold).

## 9. Confidentiality & data

Each party keeps the other’s confidential information private. Provider processes customer PII only as needed to run/support the Client instance; Controller of customer data is typically the **Client** (confirm with counsel).

Attach and sign the **Data Processing Agreement** annex: [DPA_ANNEX.md](./DPA_ANNEX.md).

## 10. Termination

On termination: Provider assists reasonable handoff of Client accounts and data export; Provider may decommission access it still holds. Template code remains Provider’s.

## 11. Liability (placeholder)

Cap liability at fees paid in the prior 12 months, excluding willful misconduct. No liability for gold-price business decisions, stock accuracy entered by Client, or third-party outages.

---

**Signatures**

| | Provider | Client |
|---|---|---|
| Name | | |
| Role | | |
| Date | | |
| Sign | | |

**Attached:** Module Annex / Quote · Running-cost sheet · Launch module list · [DPA_ANNEX.md](./DPA_ANNEX.md)
