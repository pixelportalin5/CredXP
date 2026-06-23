import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  const base = siteConfig.url.replace(/\/$/, "");

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/employee/",
          "/seller/dashboard",
          "/user/",
          "/login",
          "/register",
          "/export/",
          "/properties/*/proposal",
          "/proposals/",
          "/list-property/bulk-upload",
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
