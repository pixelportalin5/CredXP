import HomePageClient from "./HomePageClient";
import { Building2, Search, ArrowRight } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "CredXP – Premium Commercial Spaces in Bangalore",
  description:
    "Discover premium office spaces and shops for rent across Bangalore. CredXP makes finding commercial real estate simple, fast, and transparent.",
};

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative flex min-h-[75vh] items-center justify-center overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-indigo-950/40 to-slate-950" />
        <div className="absolute -top-32 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-indigo-500/15 blur-[100px] animate-pulse" />
        <div className="absolute bottom-0 right-0 h-[300px] w-[400px] rounded-full bg-purple-500/10 blur-[80px]" />

        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-sm text-indigo-300 backdrop-blur-sm">
            <Building2 className="h-4 w-4" />
            Premium Commercial Spaces in Bangalore
          </div>
          <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            Find Your Perfect{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
              Commercial Space
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-400">
            Browse 50+ verified office spaces and retail shops across
            Bangalore&apos;s top commercial hubs. Modern, transparent, and
            hassle-free leasing.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/properties"
              className="group inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:bg-indigo-600 hover:shadow-indigo-500/40 hover:-translate-y-0.5"
            >
              <Search className="h-4 w-4" />
              Browse Properties
            </Link>
            <Link
              href="/properties?type=Shop"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-7 py-3.5 text-sm font-semibold text-slate-300 transition-all hover:border-slate-500 hover:text-white hover:-translate-y-0.5"
            >
              View Shops
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-white/5 bg-slate-900/50 py-16">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 px-4 text-center md:grid-cols-4">
          {[
            { value: "50+", label: "Listed Spaces" },
            { value: "20+", label: "Localities" },
            { value: "1,000+", label: "Happy Clients" },
            { value: "99%", label: "Satisfaction" },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-3xl font-bold text-white lg:text-4xl">{stat.value}</p>
              <p className="mt-1 text-sm text-slate-400">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Live Data Sections */}
      <HomePageClient />

      {/* CTA */}
      <section className="py-20">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">
            Ready to find your next space?
          </h2>
          <p className="mt-4 text-slate-400">
            Browse our curated collection of offices and retail shops across Bangalore.
          </p>
          <Link
            href="/properties"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-7 py-3.5 text-sm font-semibold text-white transition-all hover:bg-indigo-600 hover:-translate-y-0.5"
          >
            View All Properties
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
