# CredXP Migration — Account Ownership (Phase 1)

Track who owns each external service before cutover. Fill in owners and access paths.

## Neon PostgreSQL

| Item | Owner | Notes |
|------|-------|-------|
| Organization | _TBD_ | |
| Project name | `credxp` (recommended) | |
| Dev branch | _TBD_ | Used for Phase 1–3 validation |
| Staging branch | _TBD_ | Optional; mirror prod schema |
| Production branch | _TBD_ | Cutover target (Phase 5) |
| Connection strings | _TBD_ | Store in password manager, not git |

### Recommended Neon setup

1. Create project `credxp` in [Neon Console](https://console.neon.tech).
2. Create branches: `dev`, `staging` (optional), `main` (production).
3. Copy pooled `DATABASE_URL` into `server/.env` per branch.
4. Run `npm run validate:neon` from `server/`.

## Cloudinary (Phase 2)

| Item | Owner | Notes |
|------|-------|-------|
| Cloudinary account | _TBD_ | |
| Cloud name | _TBD_ | `CLOUDINARY_CLOUD_NAME` |
| API key / secret | _TBD_ | Server-only; never in client bundle |
| Folders | `credxp/properties`, `credxp/coworking`, `credxp/avatars`, `credxp/proposals` | |

## Hostinger VPS (Phase 5)

| Item | Owner | Notes |
|------|-------|-------|
| VPS hostname / IP | _TBD_ | |
| SSH access | _TBD_ | |
| Domain / DNS | _TBD_ | |
| PM2 process owner | _TBD_ | |
| Nginx config | _TBD_ | Reverse proxy to API + static web |

## MongoDB Atlas (current — retire Phase 5)

| Item | Owner | Notes |
|------|-------|-------|
| Cluster | _TBD_ | Remains primary until cutover |
| Backup policy | _TBD_ | Export before final switch |

## Secrets handling

- Development: `server/.env`, `client/.env.local` (gitignored)
- Production: Hostinger env files or Neon/Cloudflare dashboards — never in repository
- CI/CD: GitHub Actions secrets (Phase 5)
