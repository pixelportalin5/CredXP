-- Pre-leased deal sheet fields. All nullable, so existing rows and older code are unaffected.
ALTER TABLE "properties" ADD COLUMN IF NOT EXISTS "financial_monthly_rent" DOUBLE PRECISION;
ALTER TABLE "properties" ADD COLUMN IF NOT EXISTS "financial_rent_per_sqft" DOUBLE PRECISION;
ALTER TABLE "properties" ADD COLUMN IF NOT EXISTS "financial_security_deposit_months" DOUBLE PRECISION;
ALTER TABLE "properties" ADD COLUMN IF NOT EXISTS "spec_units" INTEGER;
ALTER TABLE "properties" ADD COLUMN IF NOT EXISTS "tenant_area_leased" DOUBLE PRECISION;
ALTER TABLE "properties" ADD COLUMN IF NOT EXISTS "tenant_lease_tenure" TEXT;
ALTER TABLE "properties" ADD COLUMN IF NOT EXISTS "tenant_lease_start" TEXT;
