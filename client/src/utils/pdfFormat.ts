export function toSafeCurrency(value: string): string {
  return value.replace(/₹/g, "Rs.");
}
