# Phase 5A — Staged PostgreSQL Cutover Validation

Validation-only phase. **Does not change production.**

## Enable PostgreSQL locally / staging

```bash
# In server/.env (local or staging only — NOT production)
DB_PROVIDER=postgres
```

See `server/.env.staging.example` for the full staging contract.

Prerequisites:

1. `DATABASE_URL` points to Neon with schema deployed (`npm run prisma:migrate:deploy`)
2. Historical data migrated (`npm run migrate:mongo-to-postgres`)
3. `npm run validate:migration` passed

## Run validation

```bash
cd server
npm run validate:phase5a
```

The script forces `DB_PROVIDER=postgres` at runtime. Reports:

- `server/scripts/validate-phase5a-report.json`
- `docs/migration/PHASE5A_VALIDATION_REPORT.md` (repo root)

Optional login check:

```bash
PHASE5A_TEST_EMAIL=... PHASE5A_TEST_PASSWORD=... npm run validate:phase5a
```

## Fixes delivered in Phase 5A

| Area | Change |
|------|--------|
| Auth middleware | `resolveAuthUser()` loads users from PostgreSQL when `DB_PROVIDER=postgres` |
| Admin service | Factory pattern: `adminService.mongo.js` + `adminService.prisma.js` |

MongoDB, Mongoose, migration scripts, and `legacy_mongo_id` are unchanged.

## Production

Keep `DB_PROVIDER=mongo` in production until Phase 5B+ cutover is explicitly approved.
