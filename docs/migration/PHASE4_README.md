# Phase 4 — Prisma Service Layer (Dual Implementation)

**Default:** `DB_PROVIDER=mongo` — production behavior unchanged.

## Pattern

```
contactService.js          → factory (picks implementation)
contactService.mongo.js    → existing Mongoose logic
contactService.prisma.js   → PostgreSQL / Prisma logic
```

## Modules (migration order)

1. ContactMessage
2. SavedProperty
3. AuditLog
4. User (`authService`)
5. CoworkingSpace
6. Property
7. Proposal
8. Enquiry

## Switch provider (staging only)

```env
DB_PROVIDER=postgres
```

Do **not** change in production until cutover approval.

## Validation

```bash
npm run compare:service-modules
npm run validate:service-modules
```

## Rollback

Set `DB_PROVIDER=mongo` or remove env var. No data migration required.
