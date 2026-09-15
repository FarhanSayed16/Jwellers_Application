# Data Processing Agreement — Annex (template)

**Status:** Commercial annex — attach to MSA; **not** a public Play URL.  
**Have counsel review before signing.**  
**Related:** [MSA_DRAFT.md](./MSA_DRAFT.md) · [06_LEGAL_AND_COMPLIANCE.md](../06_LEGAL_AND_COMPLIANCE.md)

---

## Parties

| Role | Party |
|---|---|
| **Controller** | Client (the jewellery business / Shop) — determines purposes of customer PII |
| **Processor** | Provider (template implementer) — processes data only to host/operate the Client’s dedicated instance |

---

## 1. Subject matter

Provider processes personal data on Client systems solely to deliver the white-label jewellery app (API, admin, mobile flavor) and optional AMC support.

## 2. Categories of data

Typically: phone numbers, optional names, wishlist/enquiry/chat content, FCM tokens, uploaded images, IP/request logs for security, admin staff credentials.

## 3. Purpose & instructions

Processing only as instructed by Client via configuration and documented APIs. Provider does not sell customer data or use it for other Clients.

## 4. Security

- Dedicated database and deployments per Client (no multi-tenant shared DB).  
- Access limited to authorized Provider staff for support.  
- Secrets stored in Client-owned env/hosting accounts where applicable.  
- Breach notification: Provider notifies Client without undue delay after becoming aware.

## 5. Sub-processors

Client authorizes typical infrastructure used for their instance, e.g.:

- Hosting (Render / similar)  
- Database (MongoDB Atlas)  
- Admin hosting (Vercel)  
- Images (Cloudinary)  
- SMS OTP (MSG91)  
- Push (Firebase / FCM)  
- Payments (Razorpay) when module enabled  

Client owns these vendor accounts under the dedicated-infra model unless otherwise agreed.

## 6. Retention & deletion

On Client request or contract end: Provider assists with data export/deletion from systems under Provider’s temporary access. Client retains ownership of data in Client accounts.

## 7. International transfers

If infrastructure regions imply cross-border transfer, parties document the transfer mechanism (e.g. SCCs / applicable India DPDP compliance advice from counsel).

## 8. Signatures

| | Controller (Client) | Processor (Provider) |
|---|---|---|
| Name | | |
| Title | | |
| Date | | |
| Sign | | |
