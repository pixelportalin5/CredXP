# Production Hardening Report

**Generated:** 2026-06-11T07:53:04.755Z
**DB_PROVIDER:** `postgres`

## Summary

| Result | Count |
|--------|-------|
| PASS | 15 |
| FAIL | 0 |
| WARN | 4 |

## Results

| Area | Test | Status | Notes |
|------|------|--------|-------|
| Admin Property List | Service listProperties payload | **PASS** | count=28, base64=false, images[]=false |
| Admin Property List | HTTP GET /api/admin/properties | **PASS** | — |
| Cloudinary Image Migration | PostgreSQL base64 image inventory | **WARN** | 81 base64 image field(s) remain in PostgreSQL |
| Cloudinary Image Migration | coverImagePublicId coverage (properties) | **WARN** | No Cloudinary public IDs — list thumbnails rely on empty covers until migrate:images + re-sync |
| Cloudinary Image Migration | Mongo migrate:images:dry-run tooling | **PASS** | scanned=40 wouldMigrate=20 skipped=20 |
| Authentication (Prisma) | register | **PASS** | — |
| Authentication (Prisma) | register duplicate rejection | **PASS** | — |
| Authentication (Prisma) | login | **PASS** | — |
| Authentication (Prisma) | login invalid password | **PASS** | — |
| Authentication (Prisma) | getMe | **PASS** | — |
| Authentication (Prisma) | JWT role claim | **PASS** | token role=buyer |
| Authentication (Prisma) | admin role token | **PASS** | Role checks for admin routes rely on JWT middleware |
| Authentication (Prisma) | logout | **PASS** | Client-side token removal; no server session invalidation required |
| Authentication (Prisma) | HTTP login E2E | **WARN** | Set PHASE5A_TEST_EMAIL and PHASE5A_TEST_PASSWORD for password login E2E |
| Proposal PDF | Proposal record structure | **PASS** | propertyTitle, agent, propertySnapshot present |
| Proposal PDF | Proposal cover image | **PASS** | Cloudinary URL |
| Proposal PDF | Public proposal page | **PASS** | — |
| Proposal PDF | Proposal preview (staff) | **PASS** | — |
| Proposal PDF | PDF generation | **WARN** | Client-side html2canvas/jspdf — requires manual browser verification; lab() CSS fix in html2canvasSafeClone.ts |

## Image Migration Inventory (PostgreSQL)

### properties

```json
{
  "total": 28,
  "coverBase64": 20,
  "coverCloudinary": 0,
  "coverEmpty": 5,
  "coverPublicId": 0,
  "imagesBase64": 60,
  "imagesCloudinary": 0,
  "imagesEmpty": 0,
  "avatarBase64": 0,
  "avatarCloudinary": 0,
  "avatarEmpty": 0,
  "sampleBase64Ids": [
    "6a1d5d953c0b9929d703270b",
    "6a1d5d953c0b9929d7032703",
    "6a1d5d953c0b9929d7032708",
    "6a1d5d953c0b9929d70326fc",
    "6a1d5d953c0b9929d7032705"
  ]
}
```

### coworking

```json
{
  "total": 2,
  "coverBase64": 0,
  "coverCloudinary": 0,
  "coverEmpty": 0,
  "coverPublicId": 0,
  "imagesBase64": 0,
  "imagesCloudinary": 0,
  "imagesEmpty": 0,
  "avatarBase64": 0,
  "avatarCloudinary": 0,
  "avatarEmpty": 0,
  "sampleBase64Ids": []
}
```

### users

```json
{
  "total": 6,
  "coverBase64": 0,
  "coverCloudinary": 0,
  "coverEmpty": 6,
  "coverPublicId": 0,
  "imagesBase64": 0,
  "imagesCloudinary": 0,
  "imagesEmpty": 0,
  "avatarBase64": 0,
  "avatarCloudinary": 0,
  "avatarEmpty": 6,
  "sampleBase64Ids": []
}
```

### proposals

```json
{
  "total": 7,
  "coverBase64": 1,
  "coverCloudinary": 2,
  "coverEmpty": 4,
  "coverPublicId": 0,
  "imagesBase64": 0,
  "imagesCloudinary": 0,
  "imagesEmpty": 0,
  "avatarBase64": 0,
  "avatarCloudinary": 0,
  "avatarEmpty": 0,
  "sampleBase64Ids": [
    "6a2931feb354a8779d4dd94a"
  ]
}
```

## Mongo migrate:images:dry-run

```json
{
  "scanned": 40,
  "migrated": 20,
  "skipped": 20,
  "failed": 0
}
```

## Remaining Blockers

- Run npm run migrate:images on MongoDB, then re-sync images to PostgreSQL
- Configure PHASE5A_TEST_EMAIL/PASSWORD for login E2E against running API
- Manual proposal PDF download verification in browser
- Migrate remaining base64 images to Cloudinary