/* ============================================================
   App-wide Constants
   ============================================================ */

export const DEFAULT_PAGE_SIZE = 12;

export const IMAGE_PLACEHOLDER = "/placeholder-property.svg";

export const SUPPORTED_IMAGE_DOMAINS = [
  "images.unsplash.com",
  "res.cloudinary.com",
  "credxp-assets.s3.amazonaws.com",
];

/** Breakpoints matching Tailwind defaults */
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;
