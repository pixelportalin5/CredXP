const CATEGORY_TYPE_MAP = {
  "pre-leased": ["Pre-Leased Office", "Shop", "Retail/SCO"],
  investment: ["Pre-Leased Office", "Shop", "Retail/SCO"],
  lease: ["Office Space", "Shop"],
};

const LISTING_STATUS_VALUES = new Set(["Recently Posted", "Trending"]);
const LEASE_PRICE_UNITS = ["month", "year"];

function resolveCategory(category, status) {
  if (category && CATEGORY_TYPE_MAP[category]) return category;
  if (status === "Pre-Leased") return "pre-leased";
  return "";
}

function parseTypes(type) {
  if (!type) return [];
  if (Array.isArray(type)) return type.map((item) => String(item).trim()).filter(Boolean);

  return String(type)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function intersectTypes(categoryTypes, type) {
  const selectedTypes = parseTypes(type);

  if (selectedTypes.length === 0) {
    if (Array.isArray(categoryTypes)) return { $in: categoryTypes };
    return categoryTypes;
  }

  const intersection = selectedTypes.filter((item) => categoryTypes.includes(item));

  if (intersection.length === 0) return { $in: [] };
  if (intersection.length === 1) return intersection[0];
  return { $in: intersection };
}

function applyTypeAndCategoryFilters(query, { category, type, status }) {
  const resolvedCategory = resolveCategory(category, status);

  if (resolvedCategory) {
    query.type = intersectTypes(CATEGORY_TYPE_MAP[resolvedCategory], type);
    return;
  }

  if (type) {
    const selectedTypes = parseTypes(type);
    if (selectedTypes.length === 1) {
      query.type = selectedTypes[0];
    } else if (selectedTypes.length > 1) {
      query.type = { $in: selectedTypes };
    }
  }
}

function applyListingStatusFilter(query, status) {
  if (!status || status === "Pre-Leased" || !LISTING_STATUS_VALUES.has(status)) return;
  query.status = status;
}

function applyFurnishingFilter(query, furnishing) {
  if (!furnishing) return;
  query["specs.furnishing"] = furnishing;
}

function applyListingIntentFilter(query, resolvedCategory) {
  if (!resolvedCategory) return;

  if (resolvedCategory === "lease") {
    query["financials.priceUnit"] = { $in: LEASE_PRICE_UNITS };
    return;
  }

  if (resolvedCategory === "pre-leased" || resolvedCategory === "investment") {
    query["financials.priceUnit"] = { $nin: LEASE_PRICE_UNITS };
  }
}

function applyPropertyFilters(query, filters = {}) {
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
  } = filters;

  const resolvedCategory = resolveCategory(category, status);

  applyTypeAndCategoryFilters(query, { category, type, status });
  applyListingIntentFilter(query, resolvedCategory);
  applyListingStatusFilter(query, status);
  applyFurnishingFilter(query, furnishing);

  if (city) query["location.city"] = { $regex: city, $options: "i" };

  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  if (minSize || maxSize) {
    query.size = {};
    if (minSize) query.size.$gte = Number(minSize);
    if (maxSize) query.size.$lte = Number(maxSize);
  }

  if (minYield || maxYield) {
    query["financials.rentalYield"] = {};
    if (minYield) query["financials.rentalYield"].$gte = Number(minYield);
    if (maxYield) query["financials.rentalYield"].$lte = Number(maxYield);
  }
}

module.exports = {
  CATEGORY_TYPE_MAP,
  applyPropertyFilters,
  resolveCategory,
  parseTypes,
};
