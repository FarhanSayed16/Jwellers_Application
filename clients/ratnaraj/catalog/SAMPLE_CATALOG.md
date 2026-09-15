## Categories (seeded)

Earrings, Necklaces, Bangles, Rings, Chains, Pendants, Silver — plus subcategories used by `items.csv`.

## Import-ready CSV

`items.csv` — 10 provisional SKUs (`RR-*`). Import via:

```bash
CLIENT_SLUG=ratnaraj npm run seed:ratnaraj-catalog -w @jwellers/api
```

Or Admin → Items → CSV import ([phase22 template](../../docs/phase22/ITEMS_CSV_IMPORT.md)).

**Photos:** rows ship without Cloudinary URLs — upload 2–4 images per SKU in Admin after Client delivery.

## For each Client sample item

| Field | Example |
|---|---|
| SKU | EAR-BAL-031 |
| Title | Bali design 031 |
| Category | Earrings |
| Subcategory | Bali |
| Purity | 22K |
| Gross / net weight (g) | 4.250 / 4.100 |
| Making | 12% or flat |
| Photos | 2–4 angles ~1500×1500+ |
| HUID | if hallmark ON |

**Minimum for production quality:** replace provisional rows with 10–20 real Client items + photos before Play launch (Phase 27).
