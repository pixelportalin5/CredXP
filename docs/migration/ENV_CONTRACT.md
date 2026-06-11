# CredXP Environment Contract (Phase 1)

This document defines environment variables for the Mongo → Neon PostgreSQL migration.
Phase 1 establishes the contract only; runtime still uses MongoDB exclusively.

## Server (`server/.env`)

| Variable | Required | Phase | Description |
|----------|----------|-------|-------------|
| `NODE_ENV` | No | 1 | `development` \| `production` \| `test` |
| `PORT` | Yes | 1 | API listen port (default `5000`) |
| `MONGODB_URI` | Yes | 1 | Current primary database (unchanged) |
| `DATABASE_URL` | Conditional | 1+ | Neon PostgreSQL URL; required when `DB_PRIMARY=postgres` or `DB_DUAL_WRITE=true` |
| `DB_PRIMARY` | No | 3+ | `mongo` (default) or `postgres` |
| `DB_DUAL_WRITE` | No | 3+ | `true` to shadow-write Postgres during dual-run |
| `PRISMA_LOG_QUERIES` | No | 1+ | `true` for verbose Prisma logs in dev |
| `JWT_SECRET` | Yes | 1 | Signing secret for auth tokens |
| `JWT_EXPIRES_IN` | No | 1 | Token TTL (e.g. `7d`) |
| `CLIENT_URL` | No | 1 | Frontend origin for CORS |
| `API_PUBLIC_URL` | No | 1 | Public API base URL |
| `CLOUDINARY_CLOUD_NAME` | Yes (uploads) | 2 | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Yes (uploads) | 2 | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Yes (uploads) | 2 | Cloudinary API secret |

### `DATABASE_URL` format (Neon)

```
postgresql://USER:PASSWORD@ep-XXXX.region.aws.neon.tech/credxp?sslmode=require
```

Use the **pooled** connection string from the Neon dashboard for production/VPS.
Use a **direct** connection for `prisma migrate` if pooling causes migration issues.

## Client (`client/.env.local`)

| Variable | Required | Phase | Description |
|----------|----------|-------|-------------|
| `NEXT_PUBLIC_API_URL` | Yes | 1 | Express API base (e.g. `http://localhost:5000/api`) |
| `NEXT_PUBLIC_APP_URL` | No | 1 | Public site URL for links/QR |
| `NEXT_PUBLIC_USE_CLOUDINARY_UPLOADS` | No | 2 | `true` (default) — uploads via `/api/uploads/image` |

## Validation

```bash
cd server
cp .env.example .env   # then edit
npm run validate:env
npm run validate:neon  # requires real DATABASE_URL
```

## Security

- Never commit `.env` or `.env.local`
- Commit only `.env.example` templates
- Rotate `JWT_SECRET` and database passwords on cutover
