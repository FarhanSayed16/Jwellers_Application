# Phase 14 — Completion Record

**Phase:** 14 — Admin web — rates & catalog  
**Completed:** 2026-09-07  

---

## Checklist

### 14.1 Rates
- [x] Rate entry form + validation
- [x] Confirm on large % change (≥5% / `force`)
- [x] Save → `POST /rates`
- [x] History table
- [x] Notify checkbox wired (no-op toast until Phase 21)

### 14.2 Categories
- [x] List/tree UI
- [x] Create/edit/delete
- [x] Cover image upload (Cloudinary or URL paste)

### 14.3 Items
- [x] Items table + filters
- [x] Create/edit form (core sections)
- [x] Multi-image upload + primary + reorder
- [x] Soft-delete + restore
- [x] Image quality guidance banner
- [x] Status control (draft/active/sold/archived)

### 14.4 Gate
- [x] Create item with 2+ images (`verify:phase14`)
- [x] New rate visible via public GET

---

## Admin routes

| Path | Page |
|---|---|
| `/rates` | Rate form + history |
| `/catalog` | Hub |
| `/catalog/categories` | Category manager |
| `/catalog/items` | Items table |
| `/catalog/items/new` | Create item |
| `/catalog/items/[id]` | Edit item |

Also: `GET /api/v1/admin/items/:id` for draft/edit loads.

## Verify

```bash
npm run verify:phase14 -w @jwellers/api
npm run build -w @jwellers/admin
```

## Next

**Phase 15 — Admin web — branding, enquiries, settings**
