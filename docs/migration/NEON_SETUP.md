# Neon PostgreSQL — Phase 1 Setup Guide

Phase 1 prepares Neon connectivity without changing application database behavior.
MongoDB remains the sole runtime database until Phase 4–5.

## Prerequisites

- Neon account and empty `credxp` project (or dev branch on existing project)
- `server` dependencies installed (`npm install` in `server/`)

## Steps

### 1. Create Neon branch

1. Open [Neon Console](https://console.neon.tech) → your project.
2. Create a **dev** branch (fork from `main` or empty).
3. Copy the **pooled** connection string (`postgresql://...?sslmode=require`).

### 2. Configure local environment

```bash
cd server
cp .env.example .env
# Set DATABASE_URL to your Neon dev branch string
# Keep MONGODB_URI pointing at your current Mongo instance
```

### 3. Generate Prisma client

```bash
npm run prisma:generate
```

### 4. Apply skeleton schema (optional for connectivity-only test)

```bash
npm run prisma:migrate:dev -- --name phase1_init
```

This creates only `migration_checkpoints` and enum types — no business tables yet.

### 5. Validate

```bash
npm run validate:env
npm run validate:neon
```

Expected output:

```
[validate-env] OK
[validate-neon] OK — PostgreSQL reachable
```

## Local Postgres (Docker alternative)

If you prefer local Postgres instead of Neon for dev:

```bash
docker compose up -d postgres
```

Use:

```
DATABASE_URL=postgresql://credxp:credxp_local@localhost:5432/credxp?sslmode=disable
```

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `SSL connection required` | Add `?sslmode=require` for Neon |
| `Can't reach database` | Check IP allowlist / Neon project status |
| `prisma generate` fails | Run from `server/`; ensure `prisma/schema.prisma` exists |
| Migrate hangs on pooled URL | Use Neon **direct** connection for migrations |

## Phase 3A — Apply full schema

```bash
npm run prisma:migrate:deploy
npm run migrate:mongo-to-postgres:dry-run
npm run migrate:mongo-to-postgres
npm run validate:migration
```

See `PHASE3A_README.md` and `POSTGRES_SCHEMA.md`.

## What Phase 1 does NOT do

- No service or route changes
- No Mongoose model changes
- No data import from Mongo
- No dual-write activation (`DB_DUAL_WRITE` stays `false`)

See `PHASE1_README.md` for full scope and rollback.
