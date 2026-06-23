import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import MainContent from "@/components/layout/MainContent";
import Footer from "@/components/layout/Footer";
import ScrollToTop from "@/components/layout/ScrollToTop";
import { AppProviders } from "@/components/providers/AppProviders";
import JsonLd from "@/components/seo/JsonLd";
import { siteConfig } from "@/config/site";
import { absoluteUrl, buildOrganizationJsonLd, defaultOpenGraph } from "@/lib/seo";
import type { Metadata } from "next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.name} – ${siteConfig.tagline}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  metadataBase: new URL(siteConfig.url),
  alternates: {
    canonical: "/",
  },
  openGraph: defaultOpenGraph(
    `${siteConfig.name} – ${siteConfig.tagline}`,
    siteConfig.description,
    "/"
  ),
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: [absoluteUrl(siteConfig.ogImage)],
  },
  robots: {
    index: true,
    follow: true,
  },
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
      <body className="flex min-h-full flex-col bg-[var(--bg-primary)] text-[var(--text-primary)]">
        <JsonLd data={buildOrganizationJsonLd()} />
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
