const { CATEGORY_TYPE_MAP, resolveCategory, parseTypes } = require("../../utils/propertyFilters");
const { PROPERTY_TYPE_FROM_API, FURNISHING_FROM_API } = require("./mappers");

const LISTING_STATUS_VALUES = new Set(["Recently Posted", "Trending"]);
const LEASE_PRICE_UNITS = ["month", "year"];

function prismaTypeValues(category, type, status) {
  const resolvedCategory = resolveCategory(category, status);
  let types = [];

  if (resolvedCategory && CATEGORY_TYPE_MAP[resolvedCategory]) {
    const categoryTypes = CATEGORY_TYPE_MAP[resolvedCategory];
    const selected = parseTypes(type);
    types = selected.length
      ? selected.filter((item) => categoryTypes.includes(item))
      : categoryTypes;
  } else if (type) {
    types = parseTypes(type);
  }

  return types.map((item) => PROPERTY_TYPE_FROM_API[item]).filter(Boolean);
}

function buildPropertyWhere(filters = {}) {
  const {
    category,
    type,
    status,
    furnishing,
    city,
    minPrice,
    maxPrice,
    minSize,
    maxSize,
    minYield,
    maxYield,
    q,
    includeInactive = false,
    sellerId,
    listingStatus,
  } = filters;

  const where = {
    isActive: includeInactive ? undefined : true,
    listingStatus: includeInactive
      ? listingStatus || undefined
      : { in: ["published"] },
  };

  if (sellerId) where.sellerId = sellerId;

  const typeValues = prismaTypeValues(category, type, status);
  if (typeValues.length === 1) where.type = typeValues[0];
  else if (typeValues.length > 1) where.type = { in: typeValues };

  const resolvedCategory = resolveCategory(category, status);
  if (resolvedCategory === "lease") {
    where.financialPriceUnit = { in: LEASE_PRICE_UNITS };
  } else if (resolvedCategory === "pre-leased" || resolvedCategory === "investment") {
    where.NOT = { financialPriceUnit: { in: LEASE_PRICE_UNITS } };
  }

  if (status && status !== "Pre-Leased" && LISTING_STATUS_VALUES.has(status)) {
    where.status = status === "Recently Posted" ? "Recently_Posted" : status;
  }

  if (furnishing) where.specFurnishing = FURNISHING_FROM_API[furnishing] || furnishing;

  if (city) where.locationCity = { contains: city, mode: "insensitive" };

  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price.gte = Number(minPrice);
    if (maxPrice) where.price.lte = Number(maxPrice);
  }

  if (minSize || maxSize) {
    where.size = {};
    if (minSize) where.size.gte = Number(minSize);
    if (maxSize) where.size.lte = Number(maxSize);
  }

  if (minYield || maxYield) {
    where.financialRentalYield = {};
    if (minYield) where.financialRentalYield.gte = Number(minYield);
    if (maxYield) where.financialRentalYield.lte = Number(maxYield);
  }

  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { buildingName: { contains: q, mode: "insensitive" } },
      { locationCity: { contains: q, mode: "insensitive" } },
      { locationMicromarket: { contains: q, mode: "insensitive" } },
      { tenantName: { contains: q, mode: "insensitive" } },
    ];
  }

  return where;
}

function buildPropertyOrderBy(sort) {
  const map = {
    newest: { createdAt: "desc" },
    oldest: { createdAt: "asc" },
    price_asc: { price: "asc" },
    price_desc: { price: "desc" },
    size_asc: { size: "asc" },
    size_desc: { size: "desc" },
    yield_desc: { financialRentalYield: "desc" },
  };
  return map[sort] || { createdAt: "desc" };
}

module.exports = {
  buildPropertyWhere,
  buildPropertyOrderBy,
};
