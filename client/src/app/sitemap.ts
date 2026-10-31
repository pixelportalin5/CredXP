import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { MIN_INDEXABLE_LISTINGS } from "@/config/locations";
import {
  PUBLIC_STATIC_ROUTES,
  fetchAllListingsForSeo,
  fetchCoworkingForSitemap,
  isPropertyAvailable,
} from "@/lib/seo";
import { fetchListingsByArea } from "@/lib/locations";
import { guides } from "@/content/guides";
import { coworkingPath, propertyPath } from "@/utils/listingUrl";

// Static routes are always returned. Listing URLs are appended best-effort:
// if the API is slow or down, the sitemap still serves the static routes.
const API_TIMEOUT_MS = 5000;

async function withTimeout<T>(promise: Promise<T[]>): Promise<T[]> {
  return Promise.race([
    promise.catch(() => [] as T[]),
    new Promise<T[]>((resolve) => setTimeout(() => resolve([]), API_TIMEOUT_MS)),
  ]);
}

const STATIC_ROUTE_SETTINGS: Partial<
  Record<(typeof PUBLIC_STATIC_ROUTES)[number], Pick<MetadataRoute.Sitemap[number], "changeFrequency" | "priority">>
> = {
  "/": { changeFrequency: "daily", priority: 1.0 },
  "/invest": { changeFrequency: "daily", priority: 0.9 },
  "/lease": { changeFrequency: "daily", priority: 0.9 },
  "/gurugram": { changeFrequency: "daily", priority: 0.8 },
  "/coworking": { changeFrequency: "weekly", priority: 0.8 },
  "/guides": { changeFrequency: "monthly", priority: 0.7 },
  "/privacy-policy": { changeFrequency: "yearly", priority: 0.3 },
};

function lastModified(value?: string): Date | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export const revalidate = 3600; // Revalidate every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Always the canonical production origin, never a preview or localhost URL.
  const baseUrl = siteConfig.url.replace(/\/$/, "");

  const [properties, coworkingSpaces, areas] = await Promise.all([
    withTimeout(fetchAllListingsForSeo()),
    withTimeout(fetchCoworkingForSitemap()),
    withTimeout(fetchListingsByArea()),
  ]);

  // Static pages have no reliable edit date, so lastModified is omitted
  // rather than reporting the build time for every URL.
  const staticRoutes: MetadataRoute.Sitemap = PUBLIC_STATIC_ROUTES.map((route) => ({
    url: route === "/" ? baseUrl : `${baseUrl}${route}`,
    changeFrequency: "weekly",
    priority: 0.7,
    ...STATIC_ROUTE_SETTINGS[route],
  }));

  const guideRoutes: MetadataRoute.Sitemap = guides.map((guide) => ({
    url: `${baseUrl}/guides/${guide.slug}`,
    lastModified: new Date(`${guide.reviewed}T00:00:00Z`),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  // Only areas with enough listings to be indexable.
  const areaRoutes: MetadataRoute.Sitemap = areas
    .filter((group) => group.total >= MIN_INDEXABLE_LISTINGS)
    .map((group) => {
      const newest = [...group.invest, ...group.lease]
        .map((listing) => lastModified(listing.updatedAt || listing.createdAt))
        .filter((date): date is Date => Boolean(date))
        .sort((a, b) => b.getTime() - a.getTime())[0];
      return {
        url: `${baseUrl}/gurugram/${group.area.slug}`,
        lastModified: newest,
        changeFrequency: "daily" as const,
        priority: 0.8,
      };
    });

  const listingRoutes: MetadataRoute.Sitemap = [
    ...properties.filter(isPropertyAvailable).map((listing) => ({
      url: `${baseUrl}${propertyPath(listing)}`,
      lastModified: lastModified(listing.updatedAt || listing.createdAt),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...coworkingSpaces.map((listing) => ({
      url: `${baseUrl}${coworkingPath({ _id: listing.id, title: listing.title, location: { city: listing.city } })}`,
      lastModified: lastModified(listing.updatedAt),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];

  return [...staticRoutes, ...areaRoutes, ...guideRoutes, ...listingRoutes];
}
