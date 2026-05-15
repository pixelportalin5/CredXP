"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, TrendingUp, Clock, WifiOff } from "lucide-react";
import PropertyCard from "@/components/PropertyCard";
import PropertyCardSkeleton from "@/components/PropertyCardSkeleton";
import propertyService from "@/services/propertyService";

export default function HomePageClient() {
  const [trending, setTrending] = useState([]);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [trendingRes, recentRes] = await Promise.all([
          propertyService.getByStatus("Trending", 6),
          propertyService.getByStatus("Recently Posted", 6),
        ]);
        setTrending(trendingRes.data || []);
        setRecent(recentRes.data || []);
      } catch (err) {
        console.error("Failed to fetch homepage data:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // API unavailable state
  if (!loading && error) {
    return (
      <section className="py-20">
        <div className="mx-auto max-w-md px-4 text-center">
          <WifiOff className="mx-auto h-12 w-12 text-slate-600" />
          <h3 className="mt-4 text-lg font-semibold text-slate-300">Unable to Load Properties</h3>
          <p className="mt-2 text-sm text-slate-500">
            We are having trouble connecting to our servers. Please check your connection and try again.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 rounded-lg bg-indigo-500 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-600"
          >
            Retry
          </button>
        </div>
      </section>
    );
  }

  return (
    <>
      {/* Trending Now */}
      <section className="py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex items-center justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-amber-400">
                <TrendingUp className="h-5 w-5" />
                <span className="text-sm font-semibold uppercase tracking-wider">Trending Now</span>
              </div>
              <h2 className="text-2xl font-bold sm:text-3xl">Most Popular Spaces</h2>
            </div>
            <Link
              href="/properties?status=Trending"
              className="hidden items-center gap-1 text-sm font-medium text-indigo-400 transition-colors hover:text-indigo-300 sm:inline-flex"
            >
              View All
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => <PropertyCardSkeleton key={i} />)
              : trending.map((property) => (
                  <PropertyCard key={property._id} property={property} />
                ))}
          </div>
        </div>
      </section>

      {/* Recently Posted */}
      <section className="border-t border-white/5 bg-slate-900/30 py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex items-center justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-emerald-400">
                <Clock className="h-5 w-5" />
                <span className="text-sm font-semibold uppercase tracking-wider">Recently Posted</span>
              </div>
              <h2 className="text-2xl font-bold sm:text-3xl">Fresh Listings</h2>
            </div>
            <Link
              href="/properties?status=Recently+Posted"
              className="hidden items-center gap-1 text-sm font-medium text-indigo-400 transition-colors hover:text-indigo-300 sm:inline-flex"
            >
              View All
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => <PropertyCardSkeleton key={i} />)
              : recent.map((property) => (
                  <PropertyCard key={property._id} property={property} />
                ))}
          </div>
        </div>
      </section>
    </>
  );
}
