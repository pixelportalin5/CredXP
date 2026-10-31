/* ============================================================
   Readable listing URLs
   /properties/pre-leased-office-dlf-phase-1-gurugram-13680-sq-ft-<id>
   The id stays at the end so old /properties/<id> links keep working
   (they redirect to the readable version).
   ============================================================ */

// Mongo ObjectId (24 hex) or UUID (Postgres).
const ID_AT_END = /([0-9a-f]{24}|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i;

export function slugify(text: string, maxLength = 80): string {
  const slug = text
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (slug.length <= maxLength) return slug;
  const cut = slug.slice(0, maxLength);
  return cut.slice(0, cut.lastIndexOf("-") > 20 ? cut.lastIndexOf("-") : maxLength).replace(/-+$/g, "");
}

function unique(parts: (string | undefined | null)[]): string[] {
  const seen = new Set<string>();
  return parts
    .map((part) => (part || "").trim())
    .filter((part) => {
      const key = part.toLowerCase();
      if (!part || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

interface PropertyUrlFields {
  _id: string;
  type?: string;
  size?: number;
  location?: { micromarket?: string; city?: string };
}

/** Built only from fields present in list and detail payloads, so every link agrees. */
export function propertySlug(property: PropertyUrlFields): string {
  const size = property.size ? `${Math.round(property.size)} sq ft` : "";
  return slugify(unique([property.type, property.location?.micromarket, property.location?.city, size]).join(" "));
}

export function propertyPath(property: PropertyUrlFields): string {
  const slug = propertySlug(property);
  return `/properties/${slug ? `${slug}-` : ""}${property._id}`;
}

interface CoworkingUrlFields {
  _id: string;
  title?: string;
  location?: { city?: string };
}

export function coworkingPath(space: CoworkingUrlFields): string {
  const slug = slugify(unique([space.title, space.location?.city]).join(" "));
  return `/coworking/${slug ? `${slug}-` : ""}${space._id}`;
}

/** Accepts "<slug>-<id>" or a bare id and returns the id. */
export function listingIdFromParam(param: string): string {
  const value = decodeURIComponent(param || "");
  const match = value.match(ID_AT_END);
  return match ? match[1] : value;
}
