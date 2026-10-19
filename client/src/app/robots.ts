import type { MetadataRoute } from 'next';
import { siteConfig } from '@/config/site';
import { isProductionDeployment } from '@/lib/seo';

const PRIVATE_PATHS = [
  '/admin',
  '/employee/',
  '/seller/dashboard',
  '/user/',
  '/login',
  '/register',
  '/export/',
  '/*/proposal',
  '/proposals/',
  '/list-property/bulk-upload',
  '/api/',
  '/private/',
];

export default function robots(): MetadataRoute.Robots {
  const baseUrl = siteConfig.url.replace(/\/$/, '');

  // Preview deployments (*.vercel.app) stay crawlable so bots can see their
  // noindex meta tag; see buildDefaultMetadata().
  if (!isProductionDeployment()) {
    return { rules: { userAgent: '*', allow: '/' } };
  }

  return {
    rules: {
      userAgent: '*',
      // /_next/ holds the JS/CSS/images Google needs to render pages.
      allow: ['/', '/_next/'],
      disallow: PRIVATE_PATHS,
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
