# Future Hostinger Migration Checklist

**Status:** Deferred — temporary production uses Vercel + Render until Hostinger access is available.

Do not execute until Hostinger VPS access is granted and Vercel + Render production is stable.

---

## Pre-migration

- [ ] Export Render environment variables (document `DB_PROVIDER`, `DATABASE_URL`, JWT, Cloudinary)
- [ ] Confirm Neon PostgreSQL is production source of truth (no Mongo fallback needed)
- [ ] Snapshot Neon database (branch backup or `pg_dump`)
- [ ] Record current Vercel `NEXT_PUBLIC_API_URL` and traffic baseline
- [ ] Run `npm run validate:production-deployment` — all PASS

## Hostinger VPS setup

- [ ] Provision VPS (Node 22 LTS, PM2 or systemd, Nginx reverse proxy, SSL via Let's Encrypt)
- [ ] Clone repository; set root to `server/` for API
- [ ] Install dependencies: `npm ci && npx prisma generate`
- [ ] Apply migrations: `npx prisma migrate deploy`
- [ ] Configure `.env` on VPS (mirror Render env contract)

### Required VPS environment

| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |
| `PORT` | `5000` (internal; Nginx proxies 443 → 5000) |
| `DB_PROVIDER` | `postgres` |
| `DATABASE_URL` | Neon pooled connection string |
| `JWT_SECRET` | Same as Render (or rotate with forced re-login) |
| `CLIENT_URL` | Production frontend URL |
| `CLOUDINARY_*` | Same Cloudinary account |

## DNS and routing

- [ ] Point API subdomain (e.g. `api.credxp.com`) to Hostinger VPS IP
- [ ] Nginx: `proxy_pass http://127.0.0.1:5000` for `/api/*`
- [ ] Update `CLIENT_URL` and CORS in `server/src/app.js` for new frontend domain if changed
- [ ] Update Vercel `NEXT_PUBLIC_API_URL` → `https://api.credxp.com/api` (or Hostinger URL)

## Frontend options (pick one)

- [ ] **Option A:** Keep Vercel frontend; only move API to Hostinger
- [ ] **Option B:** Build Next.js on Hostinger (`client/`) or serve static export behind Nginx

## Validation on Hostinger

- [ ] `GET /api/health` → 200
- [ ] Property list < 50 KB, Cloudinary thumbnails, no base64
- [ ] Login, seller dashboard, admin dashboard, proposals
- [ ] Upload flow → Cloudinary
- [ ] Run full staging smoke against new API URL

## Cutover

- [ ] Lower DNS TTL 24h before switch
- [ ] Deploy API to Hostinger; smoke test on staging subdomain first
- [ ] Update Vercel env `NEXT_PUBLIC_API_URL`
- [ ] Monitor 48h: error rates, response times, image 404s
- [ ] Decommission Render web service after soak period

## Rollback

- [ ] Revert `NEXT_PUBLIC_API_URL` to `https://credxp-mvp.onrender.com/api`
- [ ] Re-enable Render service (keep env vars until Hostinger proven)

---

*Architecture unchanged: Express + Prisma + Neon + Cloudinary. Hostinger replaces Render as API host only.*
