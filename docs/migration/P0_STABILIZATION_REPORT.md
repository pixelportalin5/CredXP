# Phase 5A P0 Stabilization Report

**Generated:** 2026-06-11T07:17:33.265Z
**DB_PROVIDER:** `postgres`

## Summary

| Result | Count |
|--------|-------|
| PASS | 24 |
| FAIL | 0 |
| WARN | 2 |

## Results by Area

### Homepage

| Test | Status | Route | Endpoint | Notes |
|------|--------|-------|----------|-------|
| Investment tab properties | **PASS** | / | GET /api/properties?category=investment | — |
| Lease tab properties | **PASS** | / | GET /api/properties?category=lease | — |
| Featured properties | **PASS** | / | GET /api/properties (featured) | — |
| Featured coworking | **PASS** | / | GET /api/coworking?limit=4&sort=featured | — |
| Insights feed | **PASS** | / | GET /api/insights?limit=3 | — |

### Authentication

| Test | Status | Route | Endpoint | Notes |
|------|--------|-------|----------|-------|
| Login | **WARN** | /login | POST /api/auth/login | PHASE5A_TEST_EMAIL/PASSWORD not set — password login not exercised |
| GET /api/auth/me | **PASS** | /user/credentials | GET /api/auth/me | — |
| Logout | **PASS** | /login | Client-side (localStorage) | Logout is client-only token removal; no server endpoint required |
| Profile page data | **PASS** | /user/credentials | GET /api/auth/me | Profile page depends on auth/me response |

### Property Pages

| Test | Status | Route | Endpoint | Notes |
|------|--------|-------|----------|-------|
| Property listing | **PASS** | /properties | GET /api/properties | — |
| Property details | **PASS** | /properties/6a1d5d953c0b9929d703270b | GET /api/properties/6a1d5d953c0b9929d703270b | Detail includes base64 images (expected for unmigrated covers) |
| Property search | **PASS** | /properties | GET /api/properties/search | — |
| Property filters | **PASS** | /invest | GET /api/properties?city=Gurugram&category=investment | — |
| Property pagination | **PASS** | /properties | GET /api/properties?page=2 | — |

### Coworking

| Test | Status | Route | Endpoint | Notes |
|------|--------|-------|----------|-------|
| Coworking list | **PASS** | /coworking | GET /api/coworking | — |
| Coworking details | **PASS** | /coworking/6a1d5c101c1b768a50bfd0e2 | GET /api/coworking/6a1d5c101c1b768a50bfd0e2 | — |

### Proposals

| Test | Status | Route | Endpoint | Notes |
|------|--------|-------|----------|-------|
| Public proposal URL | **PASS** | /proposals/6a27a94cd987e7398bcdb057 | GET /api/proposals/6a27a94cd987e7398bcdb057/public | — |
| Proposal preview (staff) | **PASS** | /properties/[id]/proposal/preview | GET /api/employee/proposals/6a27a94cd987e7398bcdb057 | Preview UI uses local draft; staff GET requires proposal creator token |
| PDF generation | **WARN** | /properties/[id]/proposal/preview | Client-side html2canvas | Requires manual browser verification; prior lab() color issue may persist in some builds |

### Uploads

| Test | Status | Route | Endpoint | Notes |
|------|--------|-------|----------|-------|
| Property image upload | **PASS** | — | POST /api/uploads/image | — |
| Avatar upload | **PASS** | — | POST /api/uploads/image | — |
| Coworking image upload | **PASS** | — | POST /api/uploads/image | — |

### Dashboards

| Test | Status | Route | Endpoint | Notes |
|------|--------|-------|----------|-------|
| Buyer dashboard | **PASS** | /user/dashboard | GET /api/saved-properties + GET /api/enquiries/me | — |
| Seller dashboard | **PASS** | /seller/dashboard | GET /api/properties/seller/my-properties | — |
| Employee dashboard | **PASS** | /employee/dashboard | GET /api/employee/summary | — |
| Admin dashboard | **PASS** | /admin/dashboard | GET /api/admin/summary | — |

## Remaining Blockers

- Set PHASE5A_TEST_EMAIL/PASSWORD for password login E2E
- Manual PDF download verification in browser
- Run migrate:images to restore list thumbnails (0 coverImagePublicId in DB)