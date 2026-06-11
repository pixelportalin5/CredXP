# Phase 2 — Cloudinary Image Migration

**Status:** Complete  
**Database:** MongoDB remains primary (unchanged)

## Setup

```bash
cd server
# Add to .env:
# CLOUDINARY_CLOUD_NAME=
# CLOUDINARY_API_KEY=
# CLOUDINARY_API_SECRET=

npm run validate:cloudinary
```

## New API

`POST /api/uploads/image` (authenticated, multipart)

| Field | Type | Required |
|-------|------|----------|
| `image` | file | Yes |
| `category` | `property` \| `coworking` \| `avatar` \| `proposal` | No (default `property`) |
| `replacePublicId` | string | No |

Response:

```json
{ "success": true, "imageUrl": "https://res.cloudinary.com/...", "publicId": "credxp/properties/..." }
```

## Migrate existing base64 data

```bash
npm run migrate:images:dry-run   # preview
npm run migrate:images           # execute
```

Report: `server/scripts/migrate-images-report.json`

## Validation checklist

- [ ] Cloudinary env vars set in `server/.env`
- [ ] `npm run validate:cloudinary` passes
- [ ] Property listing upload returns Cloudinary URL
- [ ] Coworking listing upload works
- [ ] Avatar upload on `/user/credentials` works
- [ ] Legacy listings with `data:image/...` still render
- [ ] `npm run migrate:images:dry-run` reports expected counts
- [ ] Prisma / PostgreSQL files untouched

## Rollback

1. Revert Phase 2 git changes
2. Client forms fall back to base64 if old code restored
3. MongoDB URLs remain valid (Cloudinary URLs still work if you keep Cloudinary account)
4. Optional: re-run migration is idempotent — no need to undo DB if keeping Cloudinary URLs
