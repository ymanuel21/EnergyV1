# Catalog Recovery Log

## What happened

During CMS migration, the catalog database was emptied. Products, categories, brands, and badges were all at 0 records.

## Recovery sources

| Data | Source | Count |
|------|--------|-------|
| Products | `src/lib/data/products.ts` | 8 |
| Categories | `src/lib/data/categories.ts` | 39 (9 top + 30 sub) |
| Brands | `src/lib/data/brands.ts` | 10 |
| Badges | Recreated from product usage | 3 (clearance, promo, cheapest) |

## Recovery steps

1. **Restore from static data**: `npx tsx scripts/restore-catalog.ts`
   - Created all brands, categories, badges, products with relations
   - Products created as `status=draft, isActive=false`

2. **Verify**: Checked `/admin/products` — all 8 products visible in admin

3. **Publish**: `npx tsx scripts/publish-restored-products.ts`
   - Validated all products have required fields
   - Set `status=published, isActive=true`

## How to repeat

```bash
# Full restore from scratch
npx tsx scripts/restore-catalog.ts
npx tsx scripts/publish-restored-products.ts

# Or use permanent seed (idempotent, upsert-based)
npx tsx prisma/seed/catalog.ts
```

## Integrity check

```bash
npx tsx scripts/check-data-integrity.ts
```

## Products recovered

| # | Name | Brand | Category |
|---|------|-------|----------|
| 1 | Mitsubishi 275Wp Mono | Mitsubishi Electric | Panel Surya |
| 2 | Canadian Solar HiKu 440Wp | Canadian Solar | Panel Surya |
| 3 | Lithium Battery 12.8V 60Ah | Rekasurya | Baterai |
| 4 | LONGi Hi-MO 5 540Wp Bifacial | Longi | Panel Surya |
| 5 | Panel Bekas 50-100Wp | Rekasurya | Panel Surya |
| 6 | BEZVOLT Power Wall 5.12kWh | Bezvolt | Baterai |
| 7 | BEZVOLT Hybrid Inverter 6kW | Bezvolt | Inverter |
| 8 | BLUETTI AC50P 504Wh | Bluetti | Baterai |

Date recovered: 29 July 2026
