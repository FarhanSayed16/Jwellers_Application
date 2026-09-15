# Play Console — Data safety draft (Phase 23)

**Not legal advice.** Adapt for each client listing. App collects data to run OTP login, catalogue enquiries, optional chat, and optional push.

## Data collected

| Data type | Collected? | Shared? | Purpose | Optional? |
|---|---|---|---|---|
| Phone number | Yes | With SMS provider (MSG91) when live | Account creation / sign-in | Required for login |
| Name | Yes (optional field) | No (Shop staff only via admin) | Profile | Optional |
| Messages (enquiries / chat / custom requests) | Yes | Shop staff via admin | Customer support | User-generated |
| Photos / images | Yes if user uploads | Cloudinary | Custom requests / chat attachments | Optional |
| Device IDs / push tokens | Yes if notifications enabled | FCM | Push delivery | Optional (user can deny) |
| App activity (views) | Minimal (item view counters) | No | Merchandising | Automatic |
| Approximate location | No | — | — | — |
| Payment info | Only if Razorpay module enabled | Razorpay | Checkout | Feature-flagged |

## Security practices

- Data encrypted in transit (HTTPS)
- Users can request deletion (in-app + web instructions)
- Committed to follow Play Families / children’s policies: app is **not** directed at children under 13

## Data deletion

- In-app: Account → Delete account  
- Web: `/legal/delete-account`  
- Target: complete within 30 days of verified request  

## Third parties to declare

MSG91, Cloudinary, Firebase/FCM, MongoDB Atlas / hosting provider, Razorpay (if enabled).
