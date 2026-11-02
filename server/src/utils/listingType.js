/**
 * Listing type rules shared by Zoho sync, bulk upload and every save:
 * - "Shop" is no longer a category on the site; shops are "Retail/SCO".
 * - "Bank Rented" = a sale listing whose tenant is a bank (DCB Bank, IDBI Bank, ...).
 *   Sellers rarely tag these themselves, so it's inferred from the tenant name.
 */
const BANK_TENANT = /\bbank\b/i;
const INVESTABLE_TYPES = new Set(["Pre-Leased Office", "Retail/SCO"]);
const LEASE_PRICE_UNITS = new Set(["month", "year"]);

function isBankTenant(name) {
  return BANK_TENANT.test(String(name || ""));
}

function normalizeListingType(type, tenantName, priceUnit) {
  const base = type === "Shop" ? "Retail/SCO" : type;
  if (!INVESTABLE_TYPES.has(base) || LEASE_PRICE_UNITS.has(priceUnit)) return base;
  return isBankTenant(tenantName) ? "Bank Rented" : base;
}

module.exports = { isBankTenant, normalizeListingType };
