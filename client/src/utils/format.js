/**
 * Format price to INR currency string
 * @param {number} price
 * @returns {string}
 */
export function formatPrice(price) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
}

/**
 * Format area size
 * @param {number} size
 * @returns {string}
 */
export function formatSize(size) {
  return `${size.toLocaleString("en-IN")} sq ft`;
}
