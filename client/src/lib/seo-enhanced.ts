/**
 * Enhanced SEO utilities for CredXP
 * Includes Google verification, structured data enhancements, and indexing optimization
 */

import type { Metadata } from 'next';

/**
 * Build meta tags for Google verification
 * Automatically includes google-site-verification if environment variable is set
 */
export function getGoogleVerificationMeta(): { name: string; content: string } | null {
  const verificationCode = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;
  if (!verificationCode) return null;

  return {
    name: 'google-site-verification',
    content: verificationCode,
  };
}

/**
 * Build comprehensive metadata for indexing
 * Ensures all necessary tags are present for Google to crawl and index your site
 */
export function buildIndexingMetadata(): Metadata {
  return {
    // Basic indexing directives
    robots: {
      index: true,
      follow: true,
      nocache: false,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },
    // Verification
    verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
      ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
      : undefined,
    // Additional meta tags for indexing
    other: {
      'Content-Type': 'text/html; charset=utf-8',
      'X-UA-Compatible': 'IE=edge',
    },
  };
}

/**
 * Enhanced schema markup for better SERP appearance
 */
export function buildAggregateRating(reviews?: { ratingValue: number; reviewCount: number }) {
  if (!reviews) return undefined;

  return {
    '@type': 'AggregateRating',
    ratingValue: reviews.ratingValue,
    reviewCount: reviews.reviewCount,
  };
}

/**
 * Build FAQSchema for featured snippets
 */
export function buildFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * Build BreadcrumbList schema for navigation
 */
export function buildBreadcrumbSchema(
  items: Array<{ name: string; url: string }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Sitemap optimization: Ensure priority and frequency are set correctly
 */
export const SITEMAP_CONFIG = {
  homepage: { priority: 1.0, changeFrequency: 'daily' as const },
  mainPages: { priority: 0.9, changeFrequency: 'weekly' as const },
  properties: { priority: 0.8, changeFrequency: 'weekly' as const },
  coworking: { priority: 0.75, changeFrequency: 'weekly' as const },
  archives: { priority: 0.5, changeFrequency: 'monthly' as const },
};
