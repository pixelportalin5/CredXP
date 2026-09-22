import type { MetadataRoute } from "next";
import { fetchCoworkingIdsForSitemap, fetchPropertyIdsForSitemap } from "@/lib/seo";

// Static routes are always returned. Listing URLs are appended best-effort:
// if the API is slow or down, the sitemap still serves the static routes.
const API_TIMEOUT_MS = 5000;

async function withTimeout(promise: Promise<string[]>): Promise<string[]> {
  return Promise.race([
    promise.catch(() => []),
    new Promise<string[]>((resolve) => setTimeout(() => resolve([]), API_TIMEOUT_MS)),
  ]);
}

export const revalidate = 3600; // Revalidate every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://www.credxp.com";

  const [propertyIds, coworkingIds] = await Promise.all([
    withTimeout(fetchPropertyIdsForSitemap()),
    withTimeout(fetchCoworkingIdsForSitemap()),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/invest`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/lease`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/coworking`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/insights`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/compare`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/list-property`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/list-coworking`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
  ];

  const listingRoutes: MetadataRoute.Sitemap = [
    ...propertyIds.map((id) => ({
      url: `${baseUrl}/properties/${id}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...coworkingIds.map((id) => ({
      url: `${baseUrl}/coworking/${id}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];

  return [...staticRoutes, ...listingRoutes];
}
