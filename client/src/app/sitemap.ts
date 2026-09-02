import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import {
  fetchCoworkingIdsForSitemap,
  fetchPropertyIdsForSitemap,
  PUBLIC_STATIC_ROUTES,
} from "@/lib/seo";

// Cache the generated sitemap so Googlebot gets a fast, consistent XML response.
export const revalidate = 3600;

function buildStaticEntries(base: string, now: Date): MetadataRoute.Sitemap {
  return PUBLIC_STATIC_ROUTES.map((route) => ({
    url: `${base}${route === "/" ? "" : route}`,
    lastModified: now,
    changeFrequency: route === "/" ? "daily" : "weekly",
    priority: route === "/" ? 1 : route === "/invest" || route === "/lease" ? 0.9 : 0.7,
  }));
}

async function fetchDynamicIds(): Promise<{ propertyIds: string[]; coworkingIds: string[] }> {
  try {
    const timeoutMs = 8000;
    const [propertyIds, coworkingIds] = await Promise.race([
      Promise.all([fetchPropertyIdsForSitemap(), fetchCoworkingIdsForSitemap()]),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("sitemap API timeout")), timeoutMs)
      ),
    ]);
    return { propertyIds, coworkingIds };
  } catch {
    return { propertyIds: [], coworkingIds: [] };
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url.replace(/\/$/, "");
  const now = new Date();
  const staticEntries = buildStaticEntries(base, now);

  const { propertyIds, coworkingIds } = await fetchDynamicIds();

  const propertyEntries: MetadataRoute.Sitemap = propertyIds.map((id) => ({
    url: `${base}/properties/${id}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const coworkingEntries: MetadataRoute.Sitemap = coworkingIds.map((id) => ({
    url: `${base}/coworking/${id}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.75,
  }));

  return [...staticEntries, ...propertyEntries, ...coworkingEntries];
}
