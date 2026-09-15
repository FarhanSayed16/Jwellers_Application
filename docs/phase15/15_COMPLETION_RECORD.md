# Phase 15 — Completion Record

**Phase:** 15 — Admin web — branding, enquiries, settings  
**Completed:** 2026-09-07  

---

## Checklist

### 15.1 Branding (owner)
- [x] Shop identity fields
- [x] Light/dark token pickers + preview
- [x] Logo upload (Cloudinary or URL)
- [x] Making/GST defaults
- [x] Social links
- [x] Save `PATCH /admin/shop-config`

### 15.2 Enquiries & custom requests
- [x] Enquiries inbox + detail + status/assign
- [x] Custom requests inbox (feature-gated)

### 15.3 Offers admin
- [x] List + form + scheduling fields (feature-gated)

### 15.4 Staff (owner)
- [x] List admins · create staff · deactivate
- [x] Nav + `OwnerGuard` hide branding/staff for staff role

### 15.5 Settings
- [x] Profile / password change
- [x] Read-only feature module list
- [x] Logout

### 15.6 Gate
- [x] Branding change reflected in `/config/public`
- [x] Staff blocked from branding (`OWNER_REQUIRED` + UI guard)

---

## New API

| Method | Path |
|---|---|
| GET/POST/PATCH | `/admin/staff` |
| POST | `/auth/admin/password/change` |

## Verify

```bash
npm run verify:phase15 -w @jwellers/api
npm run build -w @jwellers/admin
```

## Next

**Phase 16 — Mobile foundation, flavors, theme, router**
