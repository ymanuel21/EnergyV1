# CMS Data Recovery Guide

## Seed Restore

Run the seed system to restore all CMS foundation data:

```bash
npx tsx prisma/seed/index.ts
```

Individual modules:
```bash
npx tsx prisma/seed/catalog.ts    # Brands, categories, badges
npx tsx prisma/seed/homepage.ts   # Homepage sections + versions
npx tsx prisma/seed/admin.ts      # Admin user
```

All seeds are **idempotent** — uses `upsert()`, safe to run repeatedly.

## Integrity Check

```bash
npx tsx scripts/check-data-integrity.ts
```

Verifies:
- Products have valid brand/category
- Reviews don't reference deleted entities
- Homepage sections have versions
- Empty tables are flagged

## Before Migration Checklist

1. Run integrity check: `npx tsx scripts/check-data-integrity.ts`
2. Record current counts: `npx tsx scripts/audit-data.ts`
3. Run migration
4. Run integrity check again
5. If counts decreased → STOP and restore from backup

## Required Record Counts

| Table | Minimum |
|-------|---------|
| brands | 10 |
| categories | 39 |
| badges | 3 |
| homepage_sections | 5 |
| homepage_section_versions | 5 |
| admin_users | 1 |

## Quick Restore

If tables are empty after migration:

```bash
npx tsx scripts/restore-catalog.ts   # Products from static data
npx tsx prisma/seed/homepage.ts      # Homepage sections
npx tsx prisma/seed/admin.ts         # Admin user
npx tsx scripts/check-data-integrity.ts
```

## Backup

```bash
# Export full database
pg_dump "$DATABASE_URL" > backup-$(date +%Y%m%d).sql

# Export specific tables
pg_dump "$DATABASE_URL" -t products -t categories -t brands -t badges -t homepage_sections -t homepage_section_versions > catalog-backup.sql
```
