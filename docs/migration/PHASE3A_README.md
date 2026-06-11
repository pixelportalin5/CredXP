# Phase 3A — PostgreSQL Infrastructure & Migration Tooling

**Status:** Complete (infrastructure only)  
**Runtime:** MongoDB + Mongoose remain production source of truth. No API, frontend, or service changes.

## What was delivered

1. Full `prisma/schema.prisma` from all 8 Mongoose models
2. PostgreSQL migration SQL (`20250609120000_phase3a_init`)
3. Neon-ready `DATABASE_URL` contract (unchanged from Phase 1)
4. Historical migration script (`migrate-mongo-to-postgres.js`)
5. Validation suite (`validate-migration.js`)
6. UUID + `legacy_mongo_id` strategy

## What was NOT delivered (Phase 3B+)

- Service rewrites to Prisma
- Dual-write logic
- `DB_PRIMARY` flip
- API / frontend changes
- Production cutover

## Setup (Neon)

```bash
cd server
# Add to .env:
# DATABASE_URL=postgresql://...@ep-xxx.neon.tech/credxp?sslmode=require

npm run validate:neon
npm run prisma:migrate:deploy   # apply schema to Neon
npm run prisma:generate
```

For local Postgres (Docker):

```bash
docker compose up -d postgres
# DATABASE_URL=postgresql://credxp:credxp_local@localhost:5432/credxp?sslmode=disable
npm run prisma:migrate:deploy
```

## Historical data migration

```bash
# Preview transforms (connects to Mongo + Postgres; no PG writes)
npm run migrate:mongo-to-postgres:dry-run

# Execute idempotent upsert by legacy_mongo_id
npm run migrate:mongo-to-postgres
```

Report: `server/scripts/migrate-mongo-report.json`

## Validation

```bash
npm run validate:migration
```

Checks:
- Expected tables exist in PostgreSQL
- Row counts: Mongo vs Postgres per collection
- `legacy_mongo_id` populated on all rows
- FK integrity (no orphan references)

Report: `server/scripts/validate-migration-report.json`

## Migration order

```
users → properties → coworking_spaces → enquiries → proposals
     → saved_properties → contact_messages → audit_logs
```

## UUID strategy

- Each migrated row receives a **new random UUID** as `id`
- `legacy_mongo_id` stores `ObjectId.toString()` with a **unique index**
- FK columns use UUID `id` values resolved via in-memory maps during migration
- Re-running migration upserts by `legacy_mongo_id` (idempotent)

## Rollback

| Layer | Action |
|-------|--------|
| PostgreSQL schema | `npx prisma migrate reset` on dev branch only — **never on prod without backup** |
| Migrated data | Truncate tables or drop Neon branch |
| Application | No rollback needed — Mongo still serves all traffic |
| Scripts | Remove `scripts/migrate-mongo-to-postgres.js` usage; Mongo unaffected |

MongoDB production is untouched by rollback. PostgreSQL is a parallel copy until Phase 3B/4 approval.

## Next step

**Wait for approval before Phase 3B** (dual-run / service migration planning).
