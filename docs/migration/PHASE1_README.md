# Phase 1 — Infrastructure Foundation

**Status:** Complete (scaffolding only)  
**Runtime impact:** None — MongoDB + Mongoose remain unchanged.

## Deliverables

| Artifact | Purpose |
|----------|---------|
| `server/prisma/schema.prisma` | PostgreSQL skeleton, enums, `MigrationCheckpoint` infra table |
| `server/src/lib/prisma.js` | Singleton Prisma client (not wired to app yet) |
| `server/.env.example` | Server environment contract |
| `client/.env.example` | Client environment contract |
| `server/scripts/validate-env.js` | Env validation script |
| `server/scripts/validate-neon-connection.js` | Neon/Postgres connectivity test |
| `docker/Dockerfile.api` | API production image skeleton |
| `docker/Dockerfile.web` | Next.js production image skeleton |
| `docker-compose.yml` | Local Mongo + Postgres + API + Web stack |
| `.dockerignore` | Build context exclusions |
| `docs/migration/*` | ENV contract, Neon setup, account ownership |

## NPM scripts (server)

```bash
npm run prisma:generate
npm run prisma:migrate:dev
npm run prisma:migrate:deploy
npm run prisma:studio
npm run validate:env
npm run validate:neon
```

## Validation checklist

- [ ] `cd server && npm run prisma:generate` succeeds
- [ ] `server/.env` copied from `.env.example`; `MONGODB_URI` and `JWT_SECRET` set
- [ ] `npm run validate:env` passes
- [ ] Neon dev `DATABASE_URL` set → `npm run validate:neon` passes
- [ ] `docker compose build` succeeds (optional local smoke)
- [ ] No changes under `server/src/services`, `routes`, `controllers`, or `models`

## Rollback

Phase 1 is additive. To roll back:

```bash
# Remove Prisma / Docker / docs additions
git checkout -- server/package.json server/package-lock.json
rm -rf server/prisma server/src/lib/prisma.js server/scripts
rm -f server/.env.example client/.env.example
rm -rf docker docs/migration docker-compose.yml .dockerignore
cd server && npm install
```

MongoDB continues to work with zero config changes.

## Next phase (do not start until approved)

**Phase 2:** Cloudflare R2 presign API, client upload flow, Mongo → R2 image migration.
