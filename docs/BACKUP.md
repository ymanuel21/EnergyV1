# Database Backup & Recovery

## Automated Backups (Neon)

Neon PostgreSQL provides point-in-time recovery. Backups are automatic.

**To configure scheduled exports:**

1. Go to Neon Console → Branches → main → Settings
2. Enable "Point-in-time recovery" (7-day history default)
3. For manual exports: `pg_dump $DATABASE_URL > backup.sql`

## Manual Backup

```bash
# Export full database
pg_dump "$DATABASE_URL" --no-owner --no-acl > backup-$(date +%Y%m%d).sql

# Export specific tables
pg_dump "$DATABASE_URL" --table=products --table=brands > catalog-backup.sql
```

## Restore

```bash
# Restore from backup
psql "$DATABASE_URL" < backup-20250101.sql

# Restore specific table
psql "$DATABASE_URL" -c "\copy products FROM 'products-backup.csv' CSV HEADER"
```

## Verification

- Run `GET /api/health` — should return `{"database":"connected"}`
- After restore, run `npx prisma db push` to ensure schema matches
- Verify admin dashboard shows correct record counts

## Schedule

| Frequency | Method | Retention |
|-----------|--------|-----------|
| Continuous | Neon PITR | 7 days |
| Daily | pg_dump to CI artifact | 30 days |
| Weekly | Full export | 90 days |
