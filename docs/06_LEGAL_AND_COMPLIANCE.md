# 06 — Legal, Play Store & Compliance

**Source of truth for:** store listing, privacy, account deletion, billing compliance, ownership handoff.  
**Related:** [01](./01_PRODUCT_AND_ARCHITECTURE.md) · [02](./02_AUTH_AND_SECURITY.md) · [04](./04_FEATURES_AND_MODULES.md)

---

## 1. Ownership model (locked)

| Asset | Owner |
|---|---|
| Google Play Console developer account | **Client** |
| App signing keystore / Play App Signing | **Client** (you may help set up; they retain control) |
| Apple Developer (if any) | **Client** |
| Render / Vercel / Atlas / Cloudinary / MSG91 | **Client** (or temporary agency access with written return date) |
| Master template source code | **You** (license to client per contract — define in MSA) |
| Client branding assets / product photos | **Client** |

Contract should state: running costs (SMS, hosting, MDR) are client’s responsibility; you are not liable for their unpaid third-party bills.

---

## 2. Play Store requirements (Android-first)

Before production release:

| Requirement | Action |
|---|---|
| Privacy policy URL | Host a page (Vercel static or client site) covering phone OTP, FCM, crash logs, Cloudinary, chat content |
| Account deletion | In-app path + web/email path to delete customer account and personal data within a stated window (Play policy) |
| Data safety form | Declare collected data: phone, name, messages, device IDs / FCM tokens |
| Permissions | Only necessary: network, notifications; camera only if chat/custom-request attachments need it |
| Content rating | Complete questionnaire honestly (retail catalogue) |
| Target API | Meet current Play target SDK requirements at submit time |
| Store listing | Client’s name, icon, screenshots, short/long description — no “template” branding |

### Account deletion (implement)

1. Customer: Account → Delete account → confirm OTP or typed CONFIRM  
2. API: soft-delete customer; anonymize phone hash; revoke sessions; deactivate FCM tokens; retain invoices only if legally required (document retention)  
3. Provide `mailto:` or form for “delete my data” from Play listing  

---

## 3. Privacy & terms (minimum content)

Privacy policy must mention:

- Who the data controller is (**the jeweller / client**, not you, for customer PII — confirm with counsel)  
- Phone number for login  
- Chat/enquiry message storage  
- Push tokens  
- Image uploads (custom requests / chat)  
- Third parties: MSG91, Cloudinary, FCM, Render/hosting, Razorpay (if enabled)  
- Retention and deletion  

Terms of use: app is a catalogue / enquiry channel; prices indicative unless invoice issued; gold rates set by retailer; no guarantee of stock.

**You are not a lawyer** — have client review/adapt templates for their jurisdiction (India).

---

## 4. Hallmark / HUID claims

If `FEATURE_HALLMARK=true`:

- Display HUID and BIS registration as **provided by the retailer**  
- Direct customers to official BIS Care verification  
- Do **not** claim the app independently verifies hallmark authenticity via BIS  

---

## 5. Digital billing / GST

If `FEATURE_DIGITAL_BILLING=true`:

- Invoice fields must match what the client’s CA expects (GSTIN, HSN if required, breakup)  
- Clarify whether PDFs are **informal estimates** or **valid tax invoices** — many jewellers need CA-approved formats  
- Retain rate snapshot on invoice date  
- Cancellation/credit notes process = Phase 2+ unless sold  

---

## 6. Payments (Razorpay)

If enabled:

- Client’s Razorpay account (KYC under their business)  
- Clear UX: advance/booking vs full payment  
- Refunds handled per client policy; implement admin “mark refunded” + Razorpay dashboard process  

---

## 7. OTP / TRAI / SMS compliance

- Use MSG91 templates approved for OTP  
- Sender ID as allowed for the client’s entity  
- Do not use OTP SMS for marketing  

---

## 8. Handoff checklist (end of onboarding)

- [ ] Client is owner/admin on Play Console  
- [ ] Client has access to Render, Vercel, Atlas, Cloudinary, MSG91, Firebase  
- [ ] Passwords / invites transferred; your temporary access removed or time-boxed  
- [ ] Keystore / Play App Signing acknowledged by client  
- [ ] Privacy policy & terms URLs live and linked in app + store  
- [ ] Delete-account tested  
- [ ] Module flags match invoice  
- [ ] Support/AMC channel agreed (email/WhatsApp SLA)  

---

## 9. iOS (deferred)

When a client pays:

- Apple Developer under **their** entity  
- Privacy nutrition labels  
- Account deletion parity  
- Extra QA on iOS flavor  

Until then, Android-only is intentional.
