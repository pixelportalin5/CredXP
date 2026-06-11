# PostgreSQL Schema Design (Phase 3A)

## Identity strategy

| Column | Purpose |
|--------|---------|
| `id` | UUID primary key (`gen_random_uuid()` via Prisma `@default(uuid())`) |
| `legacy_mongo_id` | Original MongoDB `_id` string — **unique**, used for idempotent migration and cutover mapping |

New writes in Phase 4+ will use UUID `id`. `legacy_mongo_id` remains for traceability until Mongo is retired.

## Tables (8 entities + 1 infra)

| Prisma model | PostgreSQL table | Mongo collection |
|--------------|------------------|------------------|
| `User` | `users` | `users` |
| `Property` | `properties` | `properties` |
| `CoworkingSpace` | `coworking_spaces` | `coworkingspaces` |
| `Enquiry` | `enquiries` | `enquiries` |
| `Proposal` | `proposals` | `proposals` |
| `SavedProperty` | `saved_properties` | `savedproperties` |
| `ContactMessage` | `contact_messages` | `contactmessages` |
| `AuditLog` | `audit_logs` | `auditlogs` |
| `MigrationCheckpoint` | `migration_checkpoints` | (infra only) |

## Normalization choices

### Flattened columns
Mongo subdocuments flattened with prefixes for queryable fields:
- **Property:** `location_*`, `financial_*`, `spec_*`, `tenant_*`
- **CoworkingSpace:** `location_*`, `spec_*`

### JSON columns
Preserved as `Json` for fidelity:
- **Proposal:** `agent`, `property_snapshot`, `prepared_for`, `agent_research`, `overview_fields`, `detail_fields`
- **AuditLog:** `metadata`

### Arrays
`String[]` in PostgreSQL for `amenities`, `highlights`, `images`, `image_public_ids`.

## Foreign keys

```
users ← properties.seller_id
users ← coworking_spaces.seller_id
users ← enquiries.user_id, enquiries.seller_id
properties ← enquiries.property_id, proposals.property_id, saved_properties.property_id
coworking_spaces ← enquiries.coworking_space_id
users ← proposals.created_by_id
users ← audit_logs.actor_id
```

`audit_logs.entity_legacy_mongo_id` is **not** an FK (polymorphic Mongo reference).

## Enums
All Mongoose string enums mapped 1:1 with PostgreSQL enums using Prisma `@map` for values containing spaces or `+`.

## Indexes
Replicates MongoDB indexes declared in Mongoose schemas (price, city, listing status, createdAt, etc.).

## Migration file
`server/prisma/migrations/20250609120000_phase3a_init/migration.sql`
