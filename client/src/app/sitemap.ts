import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import {
  PUBLIC_STATIC_ROUTES,
  fetchCoworkingForSitemap,
  fetchPropertiesForSitemap,
  type SitemapListing,
} from "@/lib/seo";

// Static routes are always returned. Listing URLs are appended best-effort:
// if the API is slow or down, the sitemap still serves the static routes.
const API_TIMEOUT_MS = 5000;

async function withTimeout(promise: Promise<SitemapListing[]>): Promise<SitemapListing[]> {
  return Promise.race([
    promise.catch(() => []),
    new Promise<SitemapListing[]>((resolve) => setTimeout(() => resolve([]), API_TIMEOUT_MS)),
  ]);
}

const STATIC_ROUTE_SETTINGS: Partial<
  Record<(typeof PUBLIC_STATIC_ROUTES)[number], Pick<MetadataRoute.Sitemap[number], "changeFrequency" | "priority">>
> = {
  "/": { changeFrequency: "daily", priority: 1.0 },
  "/invest": { changeFrequency: "daily", priority: 0.9 },
  "/lease": { changeFrequency: "daily", priority: 0.9 },
  "/coworking": { changeFrequency: "weekly", priority: 0.8 },
  "/privacy-policy": { changeFrequency: "yearly", priority: 0.3 },
};

function lastModified(updatedAt?: string): Date | undefined {
  if (!updatedAt) return undefined;
  const date = new Date(updatedAt);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export const revalidate = 3600; // Revalidate every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Always the canonical production origin, never a preview or localhost URL.
  const baseUrl = siteConfig.url.replace(/\/$/, "");

  const [properties, coworkingSpaces] = await Promise.all([
    withTimeout(fetchPropertiesForSitemap()),
    withTimeout(fetchCoworkingForSitemap()),
  ]);

  // Static pages have no reliable edit date, so lastModified is omitted
  // rather than reporting the build time for every URL.
  const staticRoutes: MetadataRoute.Sitemap = PUBLIC_STATIC_ROUTES.map((route) => ({
    url: route === "/" ? baseUrl : `${baseUrl}${route}`,
    changeFrequency: "weekly",
    priority: 0.7,
    ...STATIC_ROUTE_SETTINGS[route],
  }));

  const listingRoutes: MetadataRoute.Sitemap = [
    ...properties.map((listing) => ({
      url: `${baseUrl}/properties/${listing.id}`,
      lastModified: lastModified(listing.updatedAt),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...coworkingSpaces.map((listing) => ({
      url: `${baseUrl}/coworking/${listing.id}`,
      lastModified: lastModified(listing.updatedAt),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];

  return [...staticRoutes, ...listingRoutes];
}
