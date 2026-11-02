import type { Metadata } from "next";
import { propertyTypeLabel } from "@/config/filters";
import type { CoworkingSpace } from "@/types/coworking";
import type { Property, PropertyListResponse } from "@/types/property";
import { siteConfig } from "@/config/site";
import { formatPriceCompact, formatSize } from "@/utils/format";
import { getListingDirectoryPath } from "@/utils/propertyFilterParams";
import { coworkingPath, propertyPath } from "@/utils/listingUrl";

const DEFAULT_REVALIDATE_SECONDS = 3600;

export function getSiteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    siteConfig.url.replace(/\/$/, "")
  );
}

/**
 * True on the production deployment (and locally / when self-hosted).
 * Vercel preview deployments set VERCEL_ENV to "preview".
 */
export function isProductionDeployment(): boolean {
  const vercelEnv = process.env.VERCEL_ENV;
  return !vercelEnv || vercelEnv === "production";
}

export function getApiBaseUrl(): string {
  return (
    process.env.INTERNAL_API_URL?.replace(/\/$/, "") ||
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
    "http://localhost:5000/api"
  );
}

export function absoluteUrl(path: string): string {
  const base = getSiteUrl();
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
}

export const noIndexMetadata: Metadata = {
  robots: { index: false, follow: false },
};

export const noIndexFollowMetadata: Metadata = {
  robots: { index: false, follow: true },
};

export function placeholderMetadata(title: string, description: string): Metadata {
  return {
    title,
    description,
    robots: { index: false, follow: true },
  };
}

export function defaultOpenGraph(
  title: string,
  description: string,
  path = "/"
): Metadata["openGraph"] {
  return {
    title,
    description,
    url: absoluteUrl(path),
    siteName: siteConfig.name,
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: absoluteUrl(siteConfig.ogImage),
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} – ${siteConfig.tagline}`,
      },
    ],
  };
}

export function buildDefaultMetadata(): Metadata {
  const title = `${siteConfig.name} – ${siteConfig.tagline}`;
  const description = siteConfig.description;

  return {
    title: {
      default: title,
      template: `%s | ${siteConfig.name}`,
    },
    description,
    keywords: [...siteConfig.keywords],
    applicationName: siteConfig.name,
    authors: [{ name: siteConfig.legal.companyName, url: getSiteUrl() }],
    creator: siteConfig.legal.companyName,
    publisher: siteConfig.legal.companyName,
    category: "Commercial Real Estate",
    metadataBase: new URL(siteConfig.url),
    openGraph: defaultOpenGraph(title, description, "/"),
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [absoluteUrl(siteConfig.ogImage)],
    },
    verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
      ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
      : undefined,
    robots: isProductionDeployment() ? {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    } : { index: false, follow: false },
  };
}

interface SeoFetchResult<T> {
  data: T | null;
  /** True only when the API explicitly answered 404 (not on timeouts or 5xx). */
  notFound: boolean;
}

async function fetchApi<T>(url: string): Promise<SeoFetchResult<T>> {
  try {
    const response = await fetch(url, {
      next: { revalidate: DEFAULT_REVALIDATE_SECONDS },
    });
    if (!response.ok) return { data: null, notFound: response.status === 404 };
    const json = (await response.json()) as { success?: boolean; data?: T };
    return { data: json.data ?? null, notFound: false };
  } catch {
    return { data: null, notFound: false };
  }
}

async function fetchJson<T>(url: string): Promise<T | null> {
  return (await fetchApi<T>(url)).data;
}

export async function fetchPropertyForSeo(id: string): Promise<SeoFetchResult<Property>> {
  return fetchApi<Property>(`${getApiBaseUrl()}/properties/${encodeURIComponent(id)}`);
}

export async function fetchCoworkingForSeo(id: string): Promise<SeoFetchResult<CoworkingSpace>> {
  return fetchApi<CoworkingSpace>(`${getApiBaseUrl()}/coworking/${encodeURIComponent(id)}`);
}

function toQueryString(params: Record<string, unknown>): string {
  return new URLSearchParams(
    Object.entries(params)
      .filter(([, value]) => value !== undefined && value !== "")
      .map(([key, value]) => [key, String(value)])
  ).toString();
}

export async function fetchPropertyListForSeo(
  params: Record<string, unknown>
): Promise<PropertyListResponse | null> {
  return fetchJson<PropertyListResponse>(`${getApiBaseUrl()}/properties?${toQueryString(params)}`);
}

export async function fetchCoworkingListForSeo(
  params: Record<string, unknown>
): Promise<CoworkingSpace[] | null> {
  return fetchJson<CoworkingSpace[]>(`${getApiBaseUrl()}/coworking?${toQueryString(params)}`);
}

export interface ListingCounts {
  investment: number;
  lease: number;
  coworking: number;
}

/**
 * Live listing totals from the API. Returns null when any call fails, so
 * callers can hide stats instead of showing made-up or zero values.
 */
export async function fetchListingCountsForSeo(): Promise<ListingCounts | null> {
  const base = getApiBaseUrl();
  const total = async (url: string): Promise<number | null> => {
    try {
      const response = await fetch(url, { next: { revalidate: DEFAULT_REVALIDATE_SECONDS } });
      if (!response.ok) return null;
      const json = (await response.json()) as {
        pagination?: { totalItems?: number };
        data?: { pagination?: { totalItems?: number } };
      };
      const value = json.data?.pagination?.totalItems ?? json.pagination?.totalItems;
      return typeof value === "number" ? value : null;
    } catch {
      return null;
    }
  };

  const [investment, lease, coworking] = await Promise.all([
    total(`${base}/properties?page=1&limit=1&category=investment`),
    total(`${base}/properties?page=1&limit=1&category=lease`),
    total(`${base}/coworking?page=1&limit=1`),
  ]);

  if (investment === null || lease === null || coworking === null) return null;
  return { investment, lease, coworking };
}

export interface SitemapListing {
  id: string;
  updatedAt?: string;
  title?: string;
  city?: string;
}

/**
 * Every published property (list payload), newest first. One cached request
 * shared by the sitemap, location pages and static params.
 */
export async function fetchAllListingsForSeo(limit = 500): Promise<Property[]> {
  const result = await fetchJson<{ properties?: Property[] }>(
    `${getApiBaseUrl()}/properties?limit=${limit}&page=1&sort=newest`
  );
  return (result?.properties || []).filter((property) => property._id);
}

export async function fetchCoworkingForSitemap(limit = 200): Promise<SitemapListing[]> {
  const result = await fetchJson<CoworkingSpace[]>(
    `${getApiBaseUrl()}/coworking?limit=${limit}&sort=newest`
  );
  return (result || [])
    .filter((space) => space._id)
    .map((space) => ({
      id: space._id,
      updatedAt: space.updatedAt || space.createdAt,
      title: space.title,
      city: space.location?.city,
    }));
}

function propertyImage(property: Property): string | undefined {
  const image = property.coverImage || property.images?.[0];
  if (!image) return undefined;
  if (image.startsWith("http") || image.startsWith("/")) return image;
  return undefined;
}

/** Published and active. Sold, paused, draft or deactivated listings are not. */
export function isPropertyAvailable(property: Pick<Property, "listingStatus" | "isActive">): boolean {
  if (property.isActive === false) return false;
  return !property.listingStatus || property.listingStatus === "published";
}

// Root layout appends " | CredXP" (9 chars); keep the whole title within ~65.
const MAX_PAGE_TITLE = 56;
const MAX_DESCRIPTION = 160;

function truncateAtWord(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[\s,–—-]+$/, "")}…`;
}

function buildPropertyTitle(property: Property): string {
  const { title: name, type, location } = property;
  const lowerName = name.toLowerCase();
  const mentionsCity = [location.city, "gurgaon", "gurugram"].some((city) => city && lowerName.includes(city.toLowerCase()));
  const suffix = lowerName.includes(type.toLowerCase())
    ? mentionsCity ? "" : location.city
    : mentionsCity ? type : `${type} in ${location.city}`;
  const full = suffix ? `${name} – ${suffix}` : name;
  if (full.length <= MAX_PAGE_TITLE) return full;
  return truncateAtWord(name, MAX_PAGE_TITLE);
}

export function buildPropertyMetadata(property: Property, id: string): Metadata {
  const { location } = property;
  const place = [location.micromarket, location.city].filter(Boolean).join(", ");
  const title = buildPropertyTitle(property);
  const details = [
    property.size ? formatSize(property.size) : null,
    property.price ? formatPriceCompact(property.price) : null,
    property.financials?.rentalYield ? `${property.financials.rentalYield}% rental yield` : null,
    property.tenant?.name ? `leased to ${property.tenant.name}` : null,
  ].filter(Boolean).join(" · ");
  // Leading with the listing name keeps descriptions unique for near-identical units.
  const summary = `${property.title}: ${propertyTypeLabel(property.type)} in ${place}${details ? ` — ${details}` : ""}.`;
  const withCta = `${summary} View photos, pricing and specs on CredXP.`;
  const description = withCta.length <= MAX_DESCRIPTION ? withCta : truncateAtWord(summary, MAX_DESCRIPTION);
  const image = propertyImage(property);
  const canonical = propertyPath({ ...property, _id: property._id || id });
  const available = isPropertyAvailable(property);

  return {
    title: available ? title : `${title} (No Longer Available)`,
    description,
    alternates: { canonical },
    // Sold, paused or draft listings stay reachable for old links but leave the index.
    ...(available ? {} : { robots: { index: false, follow: true } }),
    openGraph: {
      ...defaultOpenGraph(title, description, canonical),
      type: "website",
      images: image ? [{ url: image.startsWith("/") ? absoluteUrl(image) : image }] : defaultOpenGraph(title, description, canonical)?.images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image.startsWith("/") ? absoluteUrl(image) : image] : [absoluteUrl(siteConfig.ogImage)],
    },
  };
}

export function buildCoworkingMetadata(space: CoworkingSpace, id: string): Metadata {
  const title = `${space.title} – ${space.operator}, ${space.location.city}`;
  const description = `${space.workspaceType} coworking at ${space.location.city}. ${space.priceLabel}. Explore amenities and book via CredXP.`;
  const image = space.coverImage || space.images?.[0];
  const canonical = coworkingPath({ ...space, _id: space._id || id });

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      ...defaultOpenGraph(title, description, canonical),
      images: image ? [{ url: image.startsWith("/") ? absoluteUrl(image) : image }] : defaultOpenGraph(title, description, canonical)?.images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image.startsWith("/") ? absoluteUrl(image) : image] : [absoluteUrl(siteConfig.ogImage)],
    },
  };
}

export function buildOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "@id": `${siteConfig.url}/#organization`,
    name: siteConfig.name,
    legalName: siteConfig.legal.companyName,
    url: siteConfig.url,
    logo: {
      "@type": "ImageObject",
      url: `${siteConfig.url}/logos/credxp-logo-square.png`,
      width: 512,
      height: 512,
    },
    image: `${siteConfig.url}${siteConfig.ogImage}`,
    description: siteConfig.description,
    email: siteConfig.contact.email,
    telephone: siteConfig.contact.phone,
    address: { "@type": "PostalAddress", ...siteConfig.contact.postalAddress },
    hasMap: siteConfig.contact.mapsUrl,
    areaServed: [
      { "@type": "City", name: "Gurugram" },
      { "@type": "Place", name: "Delhi NCR" },
    ],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: siteConfig.contact.phone,
      email: siteConfig.contact.email,
      contactType: "sales",
      areaServed: "IN",
      availableLanguage: ["en"],
    },
    knowsAbout: [
      "Pre-leased commercial property",
      "Commercial office leasing",
      "Pre-leased retail / SCO investment",
      "Coworking and managed offices",
      "Gurugram commercial real estate",
    ],
    sameAs: Object.values(siteConfig.social),
  };
}

export function buildWebsiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteConfig.url}/#website`,
    // Google uses name / alternateName for the site name shown in results.
    name: siteConfig.name,
    alternateName: ["CredXp", "CredXP Prop-Tech"],
    url: `${siteConfig.url}/`,
    inLanguage: "en-IN",
    description: siteConfig.description,
    publisher: { "@id": `${siteConfig.url}/#organization` },
  };
}

export function buildBreadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${siteConfig.url}${item.path === "/" ? "" : item.path}`,
    })),
  };
}

export function buildPropertyBreadcrumbJsonLd(property: Property, id: string) {
  const directory = getListingDirectoryPath(property);
  return buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: directory === "/lease" ? "Lease" : "Invest", path: directory },
    { name: property.title, path: propertyPath({ ...property, _id: property._id || id }) },
  ]);
}

export function buildCoworkingBreadcrumbJsonLd(space: CoworkingSpace, id: string) {
  return buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Coworking", path: "/coworking" },
    { name: space.title, path: coworkingPath({ ...space, _id: space._id || id }) },
  ]);
}

export function buildRealEstateListingJsonLd(property: Property, id: string) {
  const image = propertyImage(property);
  const isLease = getListingDirectoryPath(property) === "/lease";
  const priceUnit = property.financials?.priceUnit;
  const available = isPropertyAvailable(property);
  const address = {
    "@type": "PostalAddress",
    streetAddress: property.location.address,
    addressLocality: property.location.city,
    addressRegion: property.location.state,
    postalCode: property.location.pincode,
    addressCountry: "IN",
  };
  const extra = [
    property.financials?.rentalYield
      ? { "@type": "PropertyValue", name: "Gross rental yield (seller-supplied)", value: property.financials.rentalYield, unitText: "%" }
      : null,
    property.financials?.escalation
      ? { "@type": "PropertyValue", name: "Rent escalation", value: property.financials.escalation }
      : null,
    property.specs?.furnishing ? { "@type": "PropertyValue", name: "Furnishing", value: property.specs.furnishing } : null,
  ].filter(Boolean);

  return {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: property.title,
    description: (property.description || `${propertyTypeLabel(property.type)} in ${property.location.city}, ${property.location.state}`).slice(0, 500),
    url: absoluteUrl(propertyPath({ ...property, _id: property._id || id })),
    image: image ? (image.startsWith("/") ? absoluteUrl(image) : image) : undefined,
    datePosted: property.createdAt,
    dateModified: property.updatedAt,
    offers: {
      "@type": "Offer",
      price: property.price,
      priceCurrency: "INR",
      businessFunction: isLease
        ? "http://purl.org/goodrelations/v1#LeaseOut"
        : "http://purl.org/goodrelations/v1#Sell",
      availability: available ? "https://schema.org/InStock" : "https://schema.org/SoldOut",
      ...(isLease && (priceUnit === "month" || priceUnit === "year")
        ? {
            priceSpecification: {
              "@type": "UnitPriceSpecification",
              price: property.price,
              priceCurrency: "INR",
              unitText: priceUnit === "year" ? "YEAR" : "MONTH",
            },
          }
        : {}),
      seller: { "@id": `${siteConfig.url}/#organization` },
    },
    about: {
      "@type": "Accommodation",
      name: property.buildingName || property.title,
      additionalType: property.type,
      address,
      ...(property.size
        ? { floorSize: { "@type": "QuantitativeValue", value: property.size, unitCode: "FTK", unitText: "sq ft" } }
        : {}),
      ...(extra.length ? { additionalProperty: extra } : {}),
    },
  };
}

export function buildCoworkingJsonLd(space: CoworkingSpace, id: string) {
  const image = space.coverImage || space.images?.[0];
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: space.title,
    description: `${space.operator} coworking space in ${space.location.city}`,
    url: absoluteUrl(coworkingPath({ ...space, _id: space._id || id })),
    image: image ? (image.startsWith("/") ? absoluteUrl(image) : image) : undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress: space.location.address,
      addressLocality: space.location.city,
      addressRegion: space.location.state,
      addressCountry: "IN",
    },
  };
}

export function buildGuideJsonLd(guide: {
  slug: string;
  title: string;
  description: string;
  reviewed: string;
  faqs: { question: string; answer: string }[];
}) {
  const url = absoluteUrl(`/guides/${guide.slug}`);
  return [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: guide.title,
      description: guide.description,
      url,
      mainEntityOfPage: url,
      dateModified: guide.reviewed,
      inLanguage: "en-IN",
      author: { "@id": `${siteConfig.url}/#organization` },
      publisher: { "@id": `${siteConfig.url}/#organization` },
      image: absoluteUrl(siteConfig.ogImage),
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: guide.faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: { "@type": "Answer", text: faq.answer },
      })),
    },
  ];
}

export const PUBLIC_STATIC_ROUTES = [
  "/",
  "/invest",
  "/lease",
  "/gurugram",
  "/coworking",
  "/insights",
  "/guides",
  "/about",
  "/contact",
  "/privacy-policy",
] as const;
