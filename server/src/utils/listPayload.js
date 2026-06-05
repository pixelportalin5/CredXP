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
].join(" ");

function resolveCoverImage(doc) {
  if (doc.coverImage) return doc.coverImage;
  if (Array.isArray(doc.images) && doc.images.length > 0) return doc.images[0];
  return "";
}

function normalizePropertyListItem(property) {
  const doc = typeof property.toObject === "function" ? property.toObject() : property;
  const coverImage = resolveCoverImage(doc);

  return {
    ...doc,
    coverImage,
    images: coverImage ? [coverImage] : [],
    description: undefined,
    highlights: undefined,
    amenities: undefined,
    buildingName: undefined,
    reraId: undefined,
    occupancy: undefined,
    specs: doc.specs
      ? {
          size: doc.specs.size,
          sizeUnit: doc.specs.sizeUnit,
          furnishing: doc.specs.furnishing,
        }
      : undefined,
  };
}

function normalizeCoworkingListItem(space) {
  const doc = typeof space.toObject === "function" ? space.toObject() : space;
  const coverImage = resolveCoverImage(doc);

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
};
