# Staging Smoke Test Report

**Generated:** 2026-06-11T08:05:33.545Z
**Staging API:** `http://127.0.0.1:5000/api`
**Staging App:** `http://127.0.0.1:3000`
**Deployed App (Vercel):** `https://credxp-mvp.vercel.app`
**DB_PROVIDER:** `postgres`

## Summary

| Result | Count |
|--------|-------|
| PASS | 26 |
| FAIL | 0 |
| WARN | 3 |

## Results

| Area | Test | Status | Route | Endpoint | Time (ms) | Screenshot | Notes |
|------|------|--------|-------|----------|-----------|------------|-------|
| 1. Homepage | Staging app homepage | **PASS** | / | — | 93 | docs/staging-screenshots/staging_app_homepage.html | — |
| 1. Homepage | Deployed Vercel homepage | **PASS** | / | — | 93 | docs/staging-screenshots/deployed_vercel_homepage.html | — |
| 1. Homepage | API insights feed | **PASS** | / | GET /api/insights?limit=3 | 2 | — | — |
| 2. Property listing | Invest page (staging app) | **PASS** | /invest | — | 61 | docs/staging-screenshots/property_listing_invest.html | — |
| 2. Property listing | Investment properties API | **PASS** | /invest | GET /api/properties?category=investment | 1 | — | 20 properties, cloudinary=true |
| 3. Property detail | Property detail page | **PASS** | /properties/6a1d5d953c0b9929d7032708 | — | 60 | docs/staging-screenshots/property_detail.html | — |
| 3. Property detail | Property detail API | **PASS** | /properties/6a1d5d953c0b9929d7032708 | GET /api/properties/6a1d5d953c0b9929d7032708 | 171 | — | Cloudinary/detail payload OK |
| 4. Comparison page | Compare page (staging app) | **PASS** | /compare | — | 48 | docs/staging-screenshots/comparison_page.html | — |
| 4. Comparison page | Compare page (Vercel deployed) | **WARN** | /compare | — | 415 | — | /compare not yet on Vercel — deploy latest client |
| 5. Coworking | Coworking page | **PASS** | /coworking | — | 44 | docs/staging-screenshots/coworking_list.html | — |
| 5. Coworking | Coworking list API | **PASS** | /coworking | GET /api/coworking | 167 | — | — |
| 5. Coworking | Coworking detail API | **PASS** | — | GET /api/coworking/6a1d5c101c1b768a50bfd0e2 | 162 | — | — |
| 6. Authentication | Login page | **PASS** | /login | — | 42 | docs/staging-screenshots/login_page.html | — |
| 6. Authentication | GET /api/auth/me (JWT) | **PASS** | — | GET /api/auth/me | 246 | — | Password E2E skipped — used signed JWT |
| 6. Authentication | Login API E2E | **WARN** | /login | — | — | — | Set STAGING_TEST_EMAIL/PASSWORD for password login E2E |
| 7. Seller dashboard | Seller dashboard page | **PASS** | /seller/dashboard | — | 43 | docs/staging-screenshots/seller_dashboard.html | — |
| 7. Seller dashboard | Seller my-properties API | **PASS** | /seller/dashboard | GET /api/properties/seller/my-properties | 321 | — | — |
| 8. Admin dashboard | Admin dashboard page | **PASS** | /admin/dashboard | — | 42 | docs/staging-screenshots/admin_dashboard.html | — |
| 8. Admin dashboard | Admin summary API | **PASS** | /admin/dashboard | GET /api/admin/summary | 1034 | — | — |
| 8. Admin dashboard | Admin properties API | **PASS** | — | GET /api/admin/properties | 562 | — | — |
| 9. Proposal preview | Public proposal API | **PASS** | /proposals/6a29352158a871c2bca6f14f | GET /api/proposals/6a29352158a871c2bca6f14f/public | 642 | — | — |
| 9. Proposal preview | Public proposal page | **PASS** | /proposals/6a29352158a871c2bca6f14f | — | 60 | docs/staging-screenshots/proposal_public_page.html | — |
| 9. Proposal preview | Proposal preview API (staff) | **PASS** | /properties/[id]/proposal/preview | GET /api/admin/proposals/6a29352158a871c2bca6f14f | 546 | — | — |
| 9. Proposal preview | Proposal PDF generation | **WARN** | /properties/[id]/proposal/preview | — | — | — | Client-side html2canvas/jspdf — manual browser verification required |
| 11. Image rendering | List thumbnails (Cloudinary) | **PASS** | /invest | GET /api/properties?category=investment | 221 | — | 17/20 items with Cloudinary thumbnail |
| 11. Image rendering | Detail gallery images | **PASS** | — | GET /api/properties/6a1d5d953c0b9929d7032708 | — | — | 3/3 Cloudinary gallery URLs |
| 12. Upload flows | Property image upload | **PASS** | — | POST /api/uploads/image | 3051 | — | publicId=credxp/properties/ysw2pq8rxuqdqdmudilm |
| 12. Upload flows | Avatar upload | **PASS** | — | POST /api/uploads/image | 1088 | — | publicId=credxp/avatars/xsnfxw91glqf6wjppb3j |
| 12. Upload flows | Coworking image upload | **PASS** | — | POST /api/uploads/image | 1266 | — | publicId=credxp/coworking/wbziaw9bttgtrcfi1igf |

## Remaining Blockers

- Redeploy Vercel frontend with latest client (e.g. /compare route)
- Configure STAGING_TEST_EMAIL/PASSWORD for login E2E
- Manual proposal PDF download verification in browser

## Page captures

HTML snapshots saved to `docs/staging-screenshots/` (open in browser to preview).