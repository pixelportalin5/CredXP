-- Zoho CRM sync: one website listing per Zoho record. NULLs don't clash with the unique index.
ALTER TABLE "properties" ADD COLUMN IF NOT EXISTS "zoho_id" TEXT;
ALTER TABLE "properties" ADD COLUMN IF NOT EXISTS "zoho_last_sync" TIMESTAMP(3);
CREATE UNIQUE INDEX IF NOT EXISTS "properties_zoho_id_key" ON "properties"("zoho_id");
