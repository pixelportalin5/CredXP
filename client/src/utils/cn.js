import { clsx } from "clsx";

/**
 * Utility to merge class names conditionally
 */
export function cn(...inputs) {
  return clsx(inputs);
}
