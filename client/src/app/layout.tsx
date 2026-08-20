import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import MainContent from "@/components/layout/MainContent";
import Footer from "@/components/layout/Footer";
import ScrollToTop from "@/components/layout/ScrollToTop";
import { AppProviders } from "@/components/providers/AppProviders";
import JsonLd from "@/components/seo/JsonLd";
import { buildDefaultMetadata, buildOrganizationJsonLd, buildWebsiteJsonLd } from "@/lib/seo";
import type { Metadata } from "next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = buildDefaultMetadata();

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
        <JsonLd data={buildWebsiteJsonLd()} />
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
