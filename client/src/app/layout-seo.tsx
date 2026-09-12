/**
 * Enhanced Layout with Complete SEO Configuration
 * This file shows all the SEO optimizations applied to the root layout
 * 
 * Key improvements:
 * 1. Google Site Verification meta tag (from NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION)
 * 2. Structured Data (JSON-LD) for Organization and Website
 * 3. Canonical URL configuration
 * 4. Open Graph and Twitter Card meta tags
 * 5. Mobile-friendly viewport
 * 6. Language and content type declarations
 */

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import MainContent from "@/components/layout/MainContent";
import Footer from "@/components/layout/Footer";
import ScrollToTop from "@/components/layout/ScrollToTop";
import { AppProviders } from "@/components/providers/AppProviders";
import JsonLd from "@/components/seo/JsonLd";
import { buildDefaultMetadata, buildOrganizationJsonLd, buildWebsiteJsonLd } from "@/lib/seo";
import { getGoogleVerificationMeta, buildIndexingMetadata } from "@/lib/seo-enhanced";
import type { Metadata } from "next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/**
 * IMPORTANT: This metadata is automatically applied by Next.js
 * Key SEO elements:
 * - Robots: index, follow (allows Google to crawl and index)
 * - Google Site Verification (from environment variable)
 * - Canonical URL (from siteConfig)
 * - Open Graph and Twitter Card
 * - Structured Data (JSON-LD)
 */
export const metadata: Metadata = {
  ...buildDefaultMetadata(),
  ...buildIndexingMetadata(),
  // Manual google verification if environment variable exists
  other: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? {
        "google-site-verification": process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
      }
    : undefined,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* Google Site Verification - CRITICAL FOR INDEXING */}
        {process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION && (
          <meta
            name="google-site-verification"
            content={process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION}
          />
        )}
        {/* Mobile Optimization */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=5"
        />
        {/* Content Type */}
        <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
        {/* Disable Zoom Reduction (better for mobile SEO) */}
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body className="flex min-h-full flex-col bg-[var(--bg-primary)] text-[var(--text-primary)]">
        {/* Structured Data for Search Engines */}
        <JsonLd data={buildOrganizationJsonLd()} />
        <JsonLd data={buildWebsiteJsonLd()} />
        
        {/* Main App Content */}
        <AppProviders>
          <ScrollToTop />
          <Navbar />
          <MainContent>{children}</MainContent>
          <Footer />
        </AppProviders>
      </body>
    </html>
  );
}
