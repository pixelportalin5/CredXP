/* ============================================================
   Formatting Utilities
   Centralized formatters for currency, area, dates, and numbers
   ============================================================ */

const INR_FORMATTER = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const INR_COMPACT = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  notation: "compact",
  maximumFractionDigits: 1,
});

const NUMBER_FORMATTER = new Intl.NumberFormat("en-IN");

/**
 * Format price to INR currency string: ₹1,25,000
 */
export function formatPrice(price: number): string {
  return INR_FORMATTER.format(price);
}

/**
 * Format price in compact form: ₹1.25L, ₹5Cr
 */
export function formatPriceCompact(price: number): string {
  if (price >= 10000000) {
    return `₹${(price / 10000000).toFixed(2)} Cr`;
  }
  if (price >= 100000) {
    return `₹${(price / 100000).toFixed(2)} L`;
  }
  return INR_COMPACT.format(price);
}

/**
 * Format area size with unit: 2,500 sqft
 */
export function formatSize(size: number, unit: string = "sqft"): string {
  return `${NUMBER_FORMATTER.format(size)} ${unit}`;
}

/**
 * Format per-sqft price: ₹45/sqft
 */
export function formatPricePerSqft(price: number, size: number): string {
  if (!size || size === 0) return "—";
  return `₹${Math.round(price / size).toLocaleString("en-IN")}/sqft`;
}

/**
 * Format rental yield percentage
 */
export function formatYield(yieldPercent: number): string {
  return `${yieldPercent.toFixed(2)}%`;
}

/**
 * Format date in human-readable Indian format
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Format relative time (e.g., "2 days ago")
 */
export function formatRelativeTime(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

/**
 * Format number with Indian numbering system
 */
export function formatNumber(num: number): string {
  return NUMBER_FORMATTER.format(num);
}
