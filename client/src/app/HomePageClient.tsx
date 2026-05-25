"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, SlidersHorizontal, WifiOff, TrendingUp } from "lucide-react";
import PropertyCard from "@/components/property/PropertyCard";
import { PropertyCardSkeleton } from "@/components/ui/Skeleton";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import propertyService from "@/services/property.service";
import type { Property } from "@/types/property";

/* ============================================================
   HomePageClient — Live Property Sections
   ============================================================ */

export default function HomePageClient() {
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeFeaturedTab, setActiveFeaturedTab] = useState("all-properties");
  const [featuredPage, setFeaturedPage] = useState(0);

  const featuredTabs = [
    { key: "all-properties", label: "All Properties" },
    { key: "pre-leased-office", label: "Pre-Leased Offices to buy" },
    { key: "pre-leased-shop", label: "Pre-Leased Shops to buy" },
    { key: "office-rent", label: "Office spaces available for rent" },
    { key: "shop-rent", label: "Shops available for rent" },
  ];

  const filteredFeatured = allProperties.filter((property) => {
    if (activeFeaturedTab === "pre-leased-office") {
      return property.type === "Office Space";
    }
    if (activeFeaturedTab === "pre-leased-shop") {
      return property.type === "Shop";
    }
    if (activeFeaturedTab === "office-rent") {
      return property.type === "Office Space" && property.status === "Recently Posted";
    }
    if (activeFeaturedTab === "shop-rent") {
      return property.type === "Shop" && property.status === "Recently Posted";
    }
    return true;
  });

  const featuredCardsPerPage = 4;
  const featuredPageCount = Math.max(1, Math.ceil(filteredFeatured.length / featuredCardsPerPage));
  const featuredPages = Array.from({ length: featuredPageCount }, (_, pageIndex) =>
    filteredFeatured.slice(pageIndex * featuredCardsPerPage, pageIndex * featuredCardsPerPage + featuredCardsPerPage)
  );

  useEffect(() => {
    async function fetchData() {
      try {
        const allRes = await propertyService.getAll({ page: 1, limit: 50, sort: "newest" });
        const properties = allRes.data.properties || [];
        setAllProperties(properties);
      } catch (err) {
        console.error("Failed to fetch homepage data:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (!loading && error) {
    return (
      <section className="py-20">
        <div className="mx-auto max-w-md px-4 text-center">
          <WifiOff className="mx-auto h-12 w-12 text-slate-400" />
          <h3 className="mt-4 text-lg font-semibold text-slate-900">
            Unable to Load Properties
          </h3>
          <p className="mt-2 text-sm text-slate-600">
            We&apos;re having trouble connecting to our servers. Please try again.
          </p>
          <Button
            variant="primary"
            size="md"
            onClick={() => window.location.reload()}
            className="mt-6"
          >
            Retry
          </Button>
        </div>
      </section>
    );
  }

  return (
    <>
      {/* Featured / Trending */}
      <section className="py-16 lg:py-20">
        <Container>
          <div className="mb-6 flex items-end justify-between gap-4">
            <SectionHeader
              eyebrow="Trending Now"
              eyebrowIcon={<TrendingUp className="h-4 w-4" />}
              title="Featured Properties"
              subtitle="Handpicked pre-leased assets and premium office spaces."
              className="mb-0"
            />

            <Link href="/properties" className="hidden items-center gap-1 text-sm font-medium text-accent-500 transition-colors hover:text-accent-600 sm:inline-flex">
              View All
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mb-5 flex flex-wrap items-center gap-2">
            {featuredTabs.map((tab) => {
              const isActive = activeFeaturedTab === tab.key;

              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => {
                    setActiveFeaturedTab(tab.key);
                    setFeaturedPage(0);
                  }}
                  className={[
                    "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-all",
                    isActive
                      ? "border-slate-900 bg-slate-900 text-white shadow-sm"
                      : "border-slate-200 bg-white text-slate-700 hover:border-accent-500/30 hover:text-slate-900",
                  ].join(" ")}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="mt-6 rounded-[1.75rem] border border-slate-200 bg-white px-4 py-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                <SlidersHorizontal className="h-4 w-4 text-accent-500" />
                {featuredTabs.find((tab) => tab.key === activeFeaturedTab)?.label || "All Properties"}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition-colors hover:border-slate-300 hover:text-slate-900"
                  aria-label="Previous featured properties"
                  onClick={() => setFeaturedPage((current) => (current - 1 + featuredPageCount) % featuredPageCount)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition-colors hover:border-slate-300 hover:text-slate-900"
                  aria-label="Next featured properties"
                  onClick={() => setFeaturedPage((current) => (current + 1) % featuredPageCount)}
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${featuredPage * 100}%)` }}
              >
                {loading
                  ? Array.from({ length: 1 }).map((_, pageIndex) => (
                      <div key={pageIndex} className="grid min-w-full grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                          <PropertyCardSkeleton key={i} />
                        ))}
                      </div>
                    ))
                  : featuredPages.map((page, pageIndex) => (
                      <div key={pageIndex} className="grid min-w-full grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
                        {page.map((property) => (
                          <PropertyCard key={property._id} property={property} variant="featured" />
                        ))}
                      </div>
                    ))}
              </div>
            </div>

            <div className="mt-4 flex items-center justify-center gap-2">
              {Array.from({ length: featuredPageCount }).map((_, index) => (
                <button
                  key={index}
                  type="button"
                  aria-label={`Go to featured page ${index + 1}`}
                  className={[
                    "h-2.5 rounded-full transition-all",
                    index === featuredPage ? "w-8 bg-accent-500" : "w-2.5 bg-slate-300 hover:bg-slate-400",
                  ].join(" ")}
                  onClick={() => setFeaturedPage(index)}
                />
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* Top Coworking Spaces */}
      <section className="border-t border-slate-200 bg-slate-50 py-16 lg:py-20">
        <Container>
          <div className="mb-4 flex items-center justify-center gap-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <span
                key={index}
                className={[
                  "h-2.5 rounded-full transition-all",
                  index === 0 ? "w-8 bg-accent-500" : "w-2.5 bg-slate-300",
                ].join(" ")}
              />
            ))}
          </div>

          <div className="mb-6 flex items-end justify-between gap-4">
            <SectionHeader
              eyebrow="Coworking"
              title="Top Coworking Spaces"
              subtitle="A quick look at the leading workspace operators available across Gurugram."
              className="mb-0"
            />

            <Link href="/coworking" className="hidden items-center gap-1 text-sm font-medium text-slate-700 transition-colors hover:text-slate-900 sm:inline-flex">
              View All
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              { name: "WeWork", location: "Cyber City, Gurugram", type: "Private Offices", price: "₹ 14,999 / seat / month", chips: ["Community Events", "24x7 Access"] },
              { name: "AWFIS", location: "DLF Cyber Hub, Gurugram", type: "Premium Office Space", price: "₹ 9,999 / seat / month", chips: ["High Speed Wi-Fi", "Meeting Rooms"] },
              { name: "Smartworks", location: "Golf Course Road, Gurugram", type: "Enterprise Workspace", price: "₹ 8,499 / seat / month", chips: ["Ergonomic Setup", "Pantry"] },
              { name: "BHIVE", location: "Sohna Road, Gurugram", type: "Flexible Workspace", price: "₹ 7,999 / seat / month", chips: ["Lounge Area", "Parking"] },
            ].map((space) => (
              <Card key={space.name} padding="md" hover className="overflow-hidden rounded-[1.4rem] border-slate-200 bg-white">
                <div className="mb-4 flex h-11 w-28 items-center justify-center rounded-2xl border border-pink-200 bg-[linear-gradient(135deg,rgba(252,231,243,0.96),rgba(253,242,248,1))] text-xs font-semibold uppercase tracking-[0.2em] text-pink-300">
                  Logo
                </div>
                <h3 className="text-xl font-semibold text-slate-900">{space.name}</h3>
                <p className="mt-1 text-sm text-slate-600">{space.location}</p>
                <p className="mt-2 text-sm text-slate-500">{space.type}</p>
                <p className="mt-4 text-base font-semibold text-slate-900">{space.price}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {space.chips.map((chip) => (
                    <span key={chip} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
                      {chip}
                    </span>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
