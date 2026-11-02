-- Existing sale listings with a bank as tenant move to "Bank Rented".
-- (Separate migration: Postgres can't use a new enum value in the transaction that adds it.)
UPDATE "properties"
SET "type" = 'Bank Rented'
WHERE "type" IN ('Pre-Leased Office', 'Retail/SCO', 'Shop')
  AND "tenant_name" ~* '\mbank\M'
  AND ("financial_price_unit" IS NULL OR "financial_price_unit"::text NOT IN ('month', 'year'));
