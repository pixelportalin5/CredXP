import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import {
  fetchCoworkingIdsForSitemap,
  fetchPropertyIdsForSitemap,
  PUBLIC_STATIC_ROUTES,
} from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url.replace(/\/$/, "");
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = PUBLIC_STATIC_ROUTES.map((route) => ({
    url: `${base}${route === "/" ? "" : route}`,
    lastModified: now,
    changeFrequency: route === "/" ? "daily" : "weekly",
    priority: route === "/" ? 1 : route === "/invest" || route === "/lease" ? 0.9 : 0.7,
  }));

  const [propertyIds, coworkingIds] = await Promise.all([
    fetchPropertyIdsForSitemap(),
    fetchCoworkingIdsForSitemap(),
  ]);

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
