import type { Metadata } from "next";
import type { CoworkingSpace } from "@/types/coworking";
import type { Property } from "@/types/property";
import { siteConfig } from "@/config/site";

const DEFAULT_REVALIDATE_SECONDS = 3600;

export function getSiteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    siteConfig.url.replace(/\/$/, "")
  );
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

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const response = await fetch(url, {
      next: { revalidate: DEFAULT_REVALIDATE_SECONDS },
    });
    if (!response.ok) return null;
    const json = (await response.json()) as { success?: boolean; data?: T };
    return json.data ?? null;
  } catch {
    return null;
  }
}

export async function fetchPropertyForSeo(id: string): Promise<Property | null> {
  return fetchJson<Property>(`${getApiBaseUrl()}/properties/${encodeURIComponent(id)}`);
}

export async function fetchCoworkingForSeo(id: string): Promise<CoworkingSpace | null> {
  return fetchJson<CoworkingSpace>(`${getApiBaseUrl()}/coworking/${encodeURIComponent(id)}`);
}

export async function fetchPropertyIdsForSitemap(limit = 500): Promise<string[]> {
  const result = await fetchJson<{ properties?: Property[] }>(
    `${getApiBaseUrl()}/properties?limit=${limit}&page=1&sort=newest`
  );
  return (result?.properties || []).map((property) => property._id).filter(Boolean);
}

export async function fetchCoworkingIdsForSitemap(limit = 200): Promise<string[]> {
  const result = await fetchJson<CoworkingSpace[]>(
    `${getApiBaseUrl()}/coworking?limit=${limit}&sort=newest`
  );
  return (result || []).map((space) => space._id).filter(Boolean);
}

function propertyImage(property: Property): string | undefined {
  const image = property.coverImage || property.images?.[0];
  if (!image) return undefined;
  if (image.startsWith("http") || image.startsWith("/")) return image;
  return undefined;
}

export function buildPropertyMetadata(property: Property, id: string): Metadata {
  const title = `${property.title} – ${property.location.city}`;
  const yieldText = property.financials?.rentalYield
    ? ` ${property.financials.rentalYield}% yield.`
    : "";
  const description = `${property.type} in ${property.location.city}, ${property.location.state}.${yieldText} View pricing, tenant details, and specs on CredXP.`;
  const image = propertyImage(property);
  const canonical = `/properties/${id}`;

  return {
    title,
    description,
    alternates: { canonical },
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
  const canonical = `/coworking/${id}`;

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
    "@type": "Organization",
    name: siteConfig.name,
    url: getSiteUrl(),
    logo: absoluteUrl("/logos/Credxp.webp"),
    description: siteConfig.description,
    email: siteConfig.contact.email,
    telephone: siteConfig.contact.phone,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Gurugram",
      addressRegion: "Haryana",
      addressCountry: "IN",
    },
    sameAs: Object.values(siteConfig.social),
  };
}

export function buildRealEstateListingJsonLd(property: Property, id: string) {
  const image = propertyImage(property);
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: property.title,
    description: `${property.type} in ${property.location.city}, ${property.location.state}`,
    url: absoluteUrl(`/properties/${id}`),
    image: image ? (image.startsWith("/") ? absoluteUrl(image) : image) : undefined,
    offers: {
      "@type": "Offer",
      price: property.price,
      priceCurrency: "INR",
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: property.location.address,
      addressLocality: property.location.city,
      addressRegion: property.location.state,
      postalCode: property.location.pincode,
      addressCountry: "IN",
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
    url: absoluteUrl(`/coworking/${id}`),
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

export const PUBLIC_STATIC_ROUTES = [
  "/",
  "/invest",
  "/lease",
  "/coworking",
  "/insights",
  "/about",
  "/contact",
  "/compare",
  "/privacy",
  "/terms",
  "/list-property",
  "/list-coworking",
] as const;
