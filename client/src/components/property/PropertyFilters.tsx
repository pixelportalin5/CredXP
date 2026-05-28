"use client";

import { useState } from "react";
import { SlidersHorizontal, X, MapPin } from "lucide-react";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { cn } from "@/utils/cn";
import {
  CITIES,
  PROPERTY_TYPES,
  PRICE_RANGES,
  SIZE_RANGES,
  SORT_OPTIONS,
  FURNISHING_OPTIONS,
} from "@/config/filters";
import type { PropertyFilters as PropertyFiltersType } from "@/types/property";

/* ============================================================
   PropertyFilters — Sidebar & Mobile Filter System
   ============================================================ */

interface PropertyFiltersProps {
  filters: PropertyFiltersType;
  onChange: (filters: PropertyFiltersType) => void;
  variant?: "desktop" | "mobile";
}

export default function PropertyFilters({ filters, onChange, variant = "desktop" }: PropertyFiltersProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const updateFilter = (key: keyof PropertyFiltersType, value: string) => {
    onChange({ ...filters, [key]: value, page: 1 });
  };

  const clearFilters = () => {
    onChange({ page: 1, limit: 6 });
  };

  const hasActiveFilters = Boolean(
    filters.type || filters.city || filters.minPrice || filters.maxPrice || filters.sort
  );

  const filterContent = (
    <div className="space-y-5">
      <div className="rounded-2xl border border-white/10 bg-white/8 p-4">
        <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-white/70">
          <MapPin className="h-3.5 w-3.5 text-accent-500" />
          Location & Search
        </div>
        <Select
          label="Location"
          options={CITIES}
          value={filters.city || ""}
          onChange={(e) => updateFilter("city", e.target.value)}
          placeholder="All Locations"
        />
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/8 p-4">
        <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-white/70">
          Property Type
        </label>
        <div className="grid grid-cols-2 gap-2">
          {PROPERTY_TYPES.slice(0, 5).map((t) => (
            <button
              key={t.value}
              onClick={() => updateFilter("type", t.value)}
              className={cn(
                "rounded-xl border px-3 py-2 text-left text-xs font-semibold transition-all duration-200",
                (filters.type === t.value || (!filters.type && t.value === ""))
                  ? "border-white/30 bg-white/22 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_8px_18px_rgba(0,0,0,0.18)]"
                  : "border-white/10 bg-white/12 text-white/82 hover:border-white/25 hover:bg-white/18"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 rounded-2xl border border-white/10 bg-white/8 p-4">
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.22em] text-white/70">
            Budget Range
          </label>
          <select
            value={`${filters.minPrice || ""}-${filters.maxPrice || ""}`}
            onChange={(e) => {
              const [min, max] = e.target.value.split("-");
              onChange({ ...filters, minPrice: min, maxPrice: max, page: 1 });
            }}
            className="w-full rounded-xl border border-white/15 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition-all hover:border-white/30 focus:border-accent-500/50 focus:ring-1 focus:ring-accent-500/15"
          >
            {PRICE_RANGES.map((r) => (
              <option key={r.label} value={`${r.min}-${r.max}`}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        <Select
          label="Sort By"
          options={SORT_OPTIONS}
          value={filters.sort || "newest"}
          onChange={(e) => updateFilter("sort", e.target.value)}
        />

        <Select
          label="Furnishing"
          options={FURNISHING_OPTIONS}
          value={filters.furnishing || ""}
          onChange={(e) => updateFilter("furnishing", e.target.value)}
          placeholder="Any furnishing"
        />
      </div>

      {hasActiveFilters && (
        <Button variant="danger" size="sm" fullWidth onClick={clearFilters}>
          Clear All Filters
        </Button>
      )}
    </div>
  );

  // Mobile variant
  if (variant === "mobile") {
    return (
      <>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 lg:hidden"
          id="mobile-filter-toggle"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {hasActiveFilters && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent-500 text-xs text-white">
              !
            </span>
          )}
        </button>

        {mobileOpen && (
          <div className="fixed inset-0 z-[var(--z-overlay)] lg:hidden">
            <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
            <div className="black-section-bg absolute right-0 top-0 h-full w-80 max-w-[85vw] overflow-y-auto border-l border-white/10 p-6 shadow-2xl">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Filters</h3>
                <button onClick={() => setMobileOpen(false)} aria-label="Close filters">
                  <X className="h-5 w-5 text-white/70 transition-colors hover:text-white" />
                </button>
              </div>
              {filterContent}
            </div>
          </div>
        )}
      </>
    );
  }

  // Desktop variant
  return (
    <div className="black-section-bg rounded-3xl border border-white/10 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.16)]" id="property-filters">
      <h3 className="mb-5 text-xs font-semibold uppercase tracking-[0.22em] text-white/70">
        Filters
      </h3>
      {filterContent}
    </div>
  );
}
