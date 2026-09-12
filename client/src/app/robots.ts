import type { MetadataRoute } from 'next';
import { siteConfig } from '@/config/site';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = siteConfig.url.replace(/\/$/, '');

  return {
    rules: [
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/admin/',
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
          '/*.json',
          '/private/',
          '/admin',
        ],
        crawlDelay: 0,
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: [
          '/admin/',
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
          '/*.json',
          '/private/',
          '/admin',
        ],
        crawlDelay: 1,
      },
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
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
          '/*.json',
          '/private/',
          '/admin',
        ],
        crawlDelay: 1,
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
