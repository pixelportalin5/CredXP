export function isDataImageUrl(src: string | null | undefined): boolean {
  return typeof src === "string" && src.startsWith("data:image/");
}

export function isCloudinaryUrl(src: string | null | undefined): boolean {
  return typeof src === "string" && src.includes("res.cloudinary.com/");
}

const LIST_IMAGE_TRANSFORM = "c_fill,w_720,h_720,q_auto,f_auto";

/** Smaller Cloudinary delivery URL for property/coworking list cards. */
export function listThumbnailUrl(src: string | null | undefined): string {
  if (!src || !isCloudinaryUrl(src)) return src || "";

  const marker = "/image/upload/";
  const markerIndex = src.indexOf(marker);
  if (markerIndex === -1) return src;

  const afterUpload = src.slice(markerIndex + marker.length);
  if (afterUpload.startsWith(LIST_IMAGE_TRANSFORM)) return src;

  return `${src.slice(0, markerIndex + marker.length)}${LIST_IMAGE_TRANSFORM}/${afterUpload}`;
}

export function isRemoteImageUrl(src: string | null | undefined): boolean {
  return typeof src === "string" && /^https?:\/\//i.test(src);
}

/** Next.js Image: skip optimizer for inline data URLs only. */
export function shouldUseUnoptimizedImage(src: string | null | undefined): boolean {
  return isDataImageUrl(src);
}
