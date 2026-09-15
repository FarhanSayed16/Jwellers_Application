# Items CSV import template

Upload via Admin → Catalog → Items → **CSV import**, or `POST /api/v1/items/import` with `{ "csv": "..." }`.

## Required columns

| Column | Notes |
|---|---|
| `sku` | Unique; duplicates are skipped |
| `title` | Display name |
| `categorySlug` | Existing **root** category slug |

## Optional columns

`subcategorySlug`, `metal` (`gold`/`silver`/`other`), `purity` (`24K`/`22K`/`18K`/`other`), `netWeightGrams`, `grossWeightGrams`, `status` (`draft`/`active`/…), `isNewArrival`, `isFeatured`, `huid`, `description`

## Example

```csv
sku,title,categorySlug,subcategorySlug,metal,purity,netWeightGrams,grossWeightGrams,status,isNewArrival,isFeatured,huid,description
RR-RING-001,Classic Gold Ring,gold,rings,gold,22K,3.2,3.5,draft,true,false,,Sample import row
```

Max **500** rows per request. New items default to shop making-charge inherit.
