/**
 * "Bank Rented" = a sale listing whose tenant is a bank (DCB Bank, IDBI Bank, ...).
 * Sellers rarely tag these themselves, so Zoho sync and bulk upload infer it.
 */
const BANK_TENANT = /\bbank\b/i;
const INVESTABLE_TYPES = new Set(["Pre-Leased Office", "Retail/SCO", "Shop"]);
const LEASE_PRICE_UNITS = new Set(["month", "year"]);

function isBankTenant(name) {
  return BANK_TENANT.test(String(name || ""));
}

/** Upgrade a pre-leased sale type to "Bank Rented" when the tenant is a bank. */
function withBankRentedType(type, tenantName, priceUnit) {
  if (!INVESTABLE_TYPES.has(type) || LEASE_PRICE_UNITS.has(priceUnit)) return type;
  return isBankTenant(tenantName) ? "Bank Rented" : type;
}

module.exports = { isBankTenant, withBankRentedType };
