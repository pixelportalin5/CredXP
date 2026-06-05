import type { Property, PropertyFilters } from "@/types/property";

export type PropertyDirectoryMode = "invest" | "lease";

export function parseTypesParam(param: string | null): string[] {
  if (!param) return [];
  return param
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function typesToParam(types: string[]): string {
  return types.join(",");
}

export function filtersFromSearchParams(
  searchParams: URLSearchParams,
  mode?: PropertyDirectoryMode
): PropertyFilters {
  const status = searchParams.get("status") || "";

  return {
    page: Number(searchParams.get("page")) || 1,
    limit: Number(searchParams.get("limit")) || 6,
    types: parseTypesParam(searchParams.get("type")),
    status: status === "Pre-Leased" ? "" : status,
    city: searchParams.get("city") || "",
    category: mode === "invest" ? "investment" : mode === "lease" ? "lease" : searchParams.get("category") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    minSize: searchParams.get("minSize") || "",
    maxSize: searchParams.get("maxSize") || "",
    minYield: searchParams.get("minYield") || "",
    maxYield: searchParams.get("maxYield") || "",
    furnishing: searchParams.get("furnishing") || "",
    sort: searchParams.get("sort") || "newest",
    q: searchParams.get("q") || "",
  };
}

export function searchParamsFromFilters(
  filters: PropertyFilters,
  searchQuery = "",
  mode?: PropertyDirectoryMode
): URLSearchParams {
  const params = new URLSearchParams();

  if (searchQuery) params.set("q", searchQuery);
  if (filters.page && filters.page !== 1) params.set("page", String(filters.page));
  if (filters.limit && filters.limit !== 6) params.set("limit", String(filters.limit));

  const typeParam = typesToParam(filters.types || []);
  if (typeParam) params.set("type", typeParam);

  if (!mode && filters.category) params.set("category", filters.category);
  if (filters.status) params.set("status", filters.status);
  if (filters.city) params.set("city", filters.city);
  if (filters.minPrice) params.set("minPrice", filters.minPrice);
  if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);
  if (filters.minSize) params.set("minSize", filters.minSize);
  if (filters.maxSize) params.set("maxSize", filters.maxSize);
  if (filters.minYield) params.set("minYield", filters.minYield);
  if (filters.maxYield) params.set("maxYield", filters.maxYield);
  if (filters.furnishing) params.set("furnishing", filters.furnishing);
  if (filters.sort && filters.sort !== "newest") params.set("sort", filters.sort);

  return params;
}

export function filtersToApiParams(filters: PropertyFilters, mode: PropertyDirectoryMode): Record<string, unknown> {
  const params: Record<string, unknown> = {
    page: filters.page,
    limit: filters.limit,
    category: mode === "invest" ? "investment" : "lease",
    sort: filters.sort || "newest",
  };

  const typeParam = typesToParam(filters.types || []);
  if (typeParam) params.type = typeParam;
  if (filters.status) params.status = filters.status;
  if (filters.city) params.city = filters.city;
  if (filters.minPrice) params.minPrice = filters.minPrice;
  if (filters.maxPrice) params.maxPrice = filters.maxPrice;
  if (filters.minSize) params.minSize = filters.minSize;
  if (filters.maxSize) params.maxSize = filters.maxSize;
  if (filters.minYield) params.minYield = filters.minYield;
  if (filters.maxYield) params.maxYield = filters.maxYield;
  if (filters.furnishing) params.furnishing = filters.furnishing;
  if (filters.q) params.q = filters.q;

  return params;
}

export function getListingDirectoryPath(property: Property): "/invest" | "/lease" {
  const unit = property.financials?.priceUnit;
  if (unit === "month" || unit === "year") return "/lease";
  if (property.type === "Office Space") return "/lease";
  return "/invest";
}

export const FEATURED_TAB_QUERY: Record<string, { mode: PropertyDirectoryMode; type?: string }> = {
  "all-properties": { mode: "invest" },
  "pre-leased-office": { mode: "invest", type: "Pre-Leased Office" },
  "pre-leased-shop": { mode: "invest", type: "Shop" },
  "office-rent": { mode: "lease", type: "Office Space" },
  "shop-rent": { mode: "lease", type: "Shop" },
};

export function featuredTabHref(tabKey: string): string {
  const query = FEATURED_TAB_QUERY[tabKey] || { mode: "invest" as const };
  const base = query.mode === "lease" ? "/lease" : "/invest";
  const params = new URLSearchParams({ page: "1", limit: "6" });
  if (query.type) params.set("type", query.type);
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}

export function resolvePropertiesRedirect(searchParams: URLSearchParams): string {
  const category = searchParams.get("category") || "";
  const status = searchParams.get("status") || "";
  const type = searchParams.get("type") || "";

  let base = "/invest";
  if (category === "lease") {
    base = "/lease";
  } else if (type === "Office Space" && !category) {
    base = "/lease";
  } else if (status === "Pre-Leased" || category === "pre-leased" || category === "investment") {
    base = "/invest";
  }

  const params = new URLSearchParams();
  searchParams.forEach((value, key) => {
    if (key === "category" || (key === "status" && value === "Pre-Leased")) return;
    params.set(key, value);
  });

  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}
