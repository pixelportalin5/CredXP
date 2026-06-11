const PROPERTY_LIST_FIELDS = [
  "title",
  "type",
  "location",
  "price",
  "size",
  "financials",
  "status",
  "grade",
  "tenant",
  "featured",
  "views",
  "enquiryCount",
  "createdAt",
  "coverImage",
  "coverImagePublicId",
].join(" ");

function isBase64DataUrl(value) {
  return typeof value === "string" && value.startsWith("data:image/");
}

function isCloudinaryUrl(value) {
  return typeof value === "string" && value.includes("res.cloudinary.com/");
}

function isSafeListImageUrl(value) {
  if (!value || typeof value !== "string") return false;
  if (isBase64DataUrl(value)) return false;
  return isCloudinaryUrl(value) || value.startsWith("/") || /^https?:\/\//i.test(value);
}

function cloudinaryListThumbnail(publicId) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const id = publicId ? String(publicId).trim() : "";
  if (!cloudName || !id) return "";
  return `https://res.cloudinary.com/${cloudName}/image/upload/c_fill,w_720,h_720,q_auto,f_auto/${id}`;
}

function resolveListCoverImage(doc) {
  const publicId = doc.coverImagePublicId ? String(doc.coverImagePublicId).trim() : "";
  if (publicId) {
    const fromId = cloudinaryListThumbnail(publicId);
    if (fromId) return fromId;
  }

  const cover = doc.coverImage ? String(doc.coverImage) : "";
  if (isSafeListImageUrl(cover)) return cover;

  const firstImage = Array.isArray(doc.images) && doc.images.length > 0 ? doc.images[0] : "";
  if (isSafeListImageUrl(firstImage)) return firstImage;

  return "";
}

function normalizePropertyListItem(property) {
  const doc = typeof property.toObject === "function" ? property.toObject() : property;
  const coverImage = resolveListCoverImage(doc);

  return {
    _id: doc._id,
    title: doc.title,
    type: doc.type,
    location: doc.location,
    price: doc.price,
    size: doc.size,
    status: doc.status,
    grade: doc.grade,
    featured: doc.featured,
    views: doc.views,
    enquiryCount: doc.enquiryCount,
    financials: doc.financials
      ? {
          price: doc.financials.price,
          priceUnit: doc.financials.priceUnit,
          rentalYield: doc.financials.rentalYield,
        }
      : undefined,
    tenant: doc.tenant
      ? {
          name: doc.tenant.name,
          industry: doc.tenant.industry,
        }
      : undefined,
    specs: doc.specs
      ? {
          size: doc.specs.size,
          sizeUnit: doc.specs.sizeUnit,
          furnishing: doc.specs.furnishing,
        }
      : undefined,
    coverImage,
    images: [],
    createdAt: doc.createdAt,
    listingStatus: doc.listingStatus,
    isActive: doc.isActive,
  };
}

function normalizeCoworkingListItem(space) {
  const doc = typeof space.toObject === "function" ? space.toObject() : space;
  const coverImage = resolveListCoverImage(doc);

  return {
    ...doc,
    coverImage,
    images: coverImage ? [coverImage] : [],
    description: undefined,
    highlights: undefined,
    amenities: doc.amenities?.slice(0, 4),
  };
}

module.exports = {
  PROPERTY_LIST_FIELDS,
  normalizePropertyListItem,
  normalizeCoworkingListItem,
  resolveListCoverImage,
  isBase64DataUrl,
  isSafeListImageUrl,
};
