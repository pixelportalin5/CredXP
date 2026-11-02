-- Separate from the enum change: Postgres can't use a new enum value in the
-- transaction that adds it.

-- "Shop" is no longer a category on the site: shops are listed as Retail/SCO.
UPDATE "properties" SET "type" = 'Retail/SCO' WHERE "type" = 'Shop';

-- Sale listings with a bank as tenant move to "Bank Rented".
UPDATE "properties"
SET "type" = 'Bank Rented'
WHERE "type" IN ('Pre-Leased Office', 'Retail/SCO')
  AND "tenant_name" ~* '\mbank\M'
  AND ("financial_price_unit" IS NULL OR "financial_price_unit"::text NOT IN ('month', 'year'));
