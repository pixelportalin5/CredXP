"use client";

import { SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";

const LOCATIONS = [
  "Koramangala", "Indiranagar", "Whitefield", "Electronic City",
  "MG Road", "HSR Layout", "Marathahalli", "Hebbal",
  "JP Nagar", "BTM Layout", "Bellandur", "Sarjapur Road",
];

const PRICE_RANGES = [
  { label: "Any Price", min: "", max: "" },
  { label: "Under ₹25,000", min: "", max: "25000" },
  { label: "₹25,000 – ₹50,000", min: "25000", max: "50000" },
  { label: "₹50,000 – ₹1,00,000", min: "50000", max: "100000" },
  { label: "₹1,00,000 – ₹2,00,000", min: "100000", max: "200000" },
  { label: "Above ₹2,00,000", min: "200000", max: "" },
];

export default function PropertyFilters({ filters, onChange, variant = "desktop" }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const updateFilter = (key, value) => {
    onChange({ ...filters, [key]: value, page: 1 });
  };

  const clearFilters = () => {
    onChange({ page: 1, limit: 9 });
  };

  const hasActiveFilters = filters.type || filters.city || filters.minPrice || filters.maxPrice || filters.sort;

  const filterContent = (
    <div className="space-y-5">
      {/* Type Filter */}
      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">
          Property Type
        </label>
        <div className="flex gap-2">
          {["", "Office Space", "Shop"].map((t) => (
            <button
              key={t}
              onClick={() => updateFilter("type", t)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                filters.type === t || (!filters.type && t === "")
                  ? "bg-indigo-500 text-white"
                  : "border border-white/10 bg-slate-800/80 text-slate-300 hover:bg-slate-700"
              }`}
            >
              {t || "All"}
            </button>
          ))}
        </div>
      </div>

      {/* Location Filter */}
      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">
          Location
        </label>
        <select
          value={filters.city || ""}
          onChange={(e) => updateFilter("city", e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-slate-800/80 px-3 py-2 text-sm text-slate-200 outline-none focus:border-indigo-500/50"
        >
          <option value="">All Locations</option>
          {LOCATIONS.map((loc) => (
            <option key={loc} value={loc}>
              {loc}
            </option>
          ))}
        </select>
      </div>

      {/* Price Range */}
      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">
          Price Range
        </label>
        <select
          value={`${filters.minPrice || ""}-${filters.maxPrice || ""}`}
          onChange={(e) => {
            const [min, max] = e.target.value.split("-");
            onChange({ ...filters, minPrice: min, maxPrice: max, page: 1 });
          }}
          className="w-full rounded-lg border border-white/10 bg-slate-800/80 px-3 py-2 text-sm text-slate-200 outline-none focus:border-indigo-500/50"
        >
          {PRICE_RANGES.map((r) => (
            <option key={r.label} value={`${r.min}-${r.max}`}>
              {r.label}
            </option>
          ))}
        </select>
      </div>

      {/* Sort */}
      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">
          Sort By
        </label>
        <select
          value={filters.sort || "newest"}
          onChange={(e) => updateFilter("sort", e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-slate-800/80 px-3 py-2 text-sm text-slate-200 outline-none focus:border-indigo-500/50"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="size_desc">Size: Largest First</option>
          <option value="size_asc">Size: Smallest First</option>
        </select>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="w-full rounded-lg border border-red-500/20 bg-red-500/10 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/20"
        >
          Clear All Filters
        </button>
      )}
    </div>
  );

  if (variant === "mobile") {
    return (
      <>
        {/* Mobile Toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex w-fit items-center gap-2 rounded-xl border border-white/10 bg-slate-800/80 px-4 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-700 lg:hidden"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {hasActiveFilters && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500 text-xs text-white">
              !
            </span>
          )}
        </button>

        {/* Mobile Overlay */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
            <div className="absolute right-0 top-0 h-full w-80 max-w-[85vw] overflow-y-auto bg-slate-900 p-6 shadow-2xl">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Filters</h3>
                <button onClick={() => setMobileOpen(false)}>
                  <X className="h-5 w-5 text-slate-400 hover:text-white" />
                </button>
              </div>
              {filterContent}
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="sticky top-24 rounded-2xl border border-white/[0.06] bg-slate-900/70 p-5">
      <h3 className="mb-5 text-sm font-semibold uppercase tracking-wider text-slate-300">
        Filters
      </h3>
      {filterContent}
    </div>
  );
}
