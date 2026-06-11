# Phase 2 — Image Storage Impact Analysis (Cloudinary)

MongoDB remains primary. Only image storage and upload paths changed.

## Collections & fields

| Collection | Image fields | publicId fields (new) |
|------------|--------------|------------------------|
| Property | `images[]`, `coverImage` | `imagePublicIds[]`, `coverImagePublicId` |
| CoworkingSpace | `images[]`, `coverImage` | `imagePublicIds[]`, `coverImagePublicId` |
| User | `avatar` | `avatarPublicId` |
| Proposal | `coverImage`, `agent.avatar` | `coverImagePublicId`, `agent.avatarPublicId` |

## Server — created

| File | Role |
|------|------|
| `server/src/config/cloudinary.js` | SDK config |
| `server/src/services/imageUploadService.js` | Upload, delete, replace, validation |
| `server/src/controllers/uploadController.js` | `POST /api/uploads/image` handler |
| `server/src/routes/uploadRoutes.js` | Multer + auth route |
| `server/scripts/migrate-images-to-cloudinary.js` | Historical base64 → Cloudinary |
| `server/scripts/validate-cloudinary.js` | Connectivity + upload/delete test |

## Server — modified (image-related only)

| File | Change |
|------|--------|
| `server/src/app.js` | Mount `/api/uploads` |
| `server/src/models/Property.js` | Optional `imagePublicIds`, `coverImagePublicId` |
| `server/src/models/CoworkingSpace.js` | Same |
| `server/src/models/User.js` | `avatarPublicId` |
| `server/src/models/Proposal.js` | `coverImagePublicId`, `agent.avatarPublicId` |
| `server/src/utils/imageThumbnail.js` | Pass-through Cloudinary URLs; derive publicId |
| `server/src/services/authService.js` | Accept Cloudinary avatar URLs + `avatarPublicId` |
| `server/src/services/bulkPropertyService.js` | ZIP images → Cloudinary (not base64) |
| `server/src/middleware/errorHandler.js` | Multer / image type errors → 400 |
| `server/package.json` | `cloudinary` dep + scripts |
| `server/.env.example` | Cloudinary vars (replaces R2 placeholders) |

## Client — created

| File | Role |
|------|------|
| `client/src/services/upload.service.ts` | Multipart upload to API |
| `client/src/utils/imageUrl.ts` | `data:` / Cloudinary URL helpers |

## Client — modified

| File | Change |
|------|--------|
| `client/src/utils/compressImage.ts` | `compressImageToBlob` for upload pipeline |
| `client/src/components/property/PropertyListingForm.tsx` | Upload → URL (not base64) |
| `client/src/components/coworking/CoworkingListingForm.tsx` | Same |
| `client/src/app/user/credentials/page.tsx` | Avatar upload via API |
| `client/src/components/property/PropertyGallery.tsx` | Backward-compat rendering |
| `client/src/components/property/PropertyCard.tsx` | Same |
| `client/src/components/coworking/CoworkingSpaceCard.tsx` | Same |
| `client/src/components/layout/Navbar.tsx` | Avatar rendering |
| `client/src/types/property.ts` | `imagePublicIds`, `coverImagePublicId` |
| `client/src/types/coworking.ts` | Same |
| `client/src/services/auth.service.ts` | `avatarPublicId` in `updateMe` |
| `client/next.config.mjs` | `res.cloudinary.com` remote pattern |
| `client/.env.example` | Cloudinary upload flag |

## Feature flows

### Property creation / editing
- **Before:** `compressImageFile` → base64 in JSON → `POST/PUT /api/properties`
- **After:** compress → `POST /api/uploads/image` → Cloudinary URL in JSON
- **Files:** `PropertyListingForm.tsx`, `propertyService` (unchanged), `imageThumbnail.js`

### Coworking creation / editing
- **Files:** `CoworkingListingForm.tsx`, `coworkingService` (unchanged)

### Bulk upload
- **Before:** ZIP → base64 in `bulkPropertyService`
- **After:** ZIP → Cloudinary in `buildImageMap`
- **Files:** `bulkPropertyService.js`, `list-property/bulk-upload/page.tsx` (unchanged UI)

### User avatars
- **Files:** `credentials/page.tsx`, `authService.updateMe`, `Navbar.tsx`

### Proposal generation
- **No direct upload** — copies `coverImage` / `agent.avatar` from property/user at create
- **Rendering:** `ProposalDocument.tsx` uses raw `<img>` — supports `data:` and `https://res.cloudinary.com/`
- **Migration:** `migrate-images-to-cloudinary.js` updates snapshotted proposal images

## Backward compatibility

Renderers use `shouldUseUnoptimizedImage()` — `unoptimized` only for legacy `data:image/...`.
Cloudinary HTTPS URLs use Next.js image optimization where configured.

Legacy MongoDB records with base64 continue to display until `npm run migrate:images` is run.

## Not changed (per Phase 2 scope)

- Prisma schema / PostgreSQL / Neon
- Property, coworking, enquiry business rules (except image storage path)
- Proposal form field logic
- Routes other than `/api/uploads`
