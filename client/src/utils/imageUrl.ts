export function isDataImageUrl(src: string | null | undefined): boolean {
  return typeof src === "string" && src.startsWith("data:image/");
}

export function isCloudinaryUrl(src: string | null | undefined): boolean {
  return typeof src === "string" && src.includes("res.cloudinary.com/");
}

export function isRemoteImageUrl(src: string | null | undefined): boolean {
  return typeof src === "string" && /^https?:\/\//i.test(src);
}

/** Next.js Image: skip optimizer for inline data URLs only. */
export function shouldUseUnoptimizedImage(src: string | null | undefined): boolean {
  return isDataImageUrl(src);
}
