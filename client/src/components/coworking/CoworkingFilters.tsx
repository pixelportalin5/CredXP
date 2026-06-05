"use client";

import { useState } from "react";
import { SlidersHorizontal, X, MapPin } from "lucide-react";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { EnterpriseInput } from "@/components/forms/EnterpriseForm";
import {
  COWORKING_CITIES,
  COWORKING_OPERATORS,
  COWORKING_PRICE_RANGES,
  COWORKING_SORT_OPTIONS,
} from "@/config/coworkingFilters";
import type { CoworkingFilters as CoworkingFiltersType } from "@/types/coworking";

interface CoworkingFiltersProps {
  filters: CoworkingFiltersType;
  onChange: (filters: CoworkingFiltersType) => void;
  variant?: "desktop" | "mobile";
}

export default function CoworkingFilters({ filters, onChange, variant = "desktop" }: CoworkingFiltersProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const updateFilter = (key: keyof CoworkingFiltersType, value: string) => {
    onChange({ ...filters, [key]: value, page: 1 });
  };

  const clearFilters = () => {
    onChange({ page: 1, limit: filters.limit || 12 });
  };

  const hasActiveFilters = Boolean(
    filters.city || filters.operator || filters.minPrice || filters.maxPrice || filters.minSeats || filters.q
  );

  const filterContent = (
    <div className="space-y-5">
      <div className="rounded-2xl border border-white/10 bg-white/8 p-4">
        <EnterpriseInput
          value={filters.q || ""}
          onChange={(event) => updateFilter("q", event.target.value)}
          placeholder="Search spaces..."
          className="border-white/15 bg-white text-slate-900 placeholder:text-slate-400"
        />
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/8 p-4">
        <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-white/70">
          <MapPin className="h-3.5 w-3.5 text-accent-500" />
          Location
        </div>
        <Select
          label="City"
          options={COWORKING_CITIES}
          value={filters.city || ""}
          onChange={(e) => updateFilter("city", e.target.value)}
          placeholder="All Locations"
        />
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/8 p-4">
        <Select
          label="Operator"
          options={COWORKING_OPERATORS}
          value={filters.operator || ""}
          onChange={(e) => updateFilter("operator", e.target.value)}
          placeholder="All Operators"
        />
      </div>

      <div className="grid gap-4 rounded-2xl border border-white/10 bg-white/8 p-4">
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.22em] text-white/70">
            Seat Budget
          </label>
          <select
            value={`${filters.minPrice || ""}-${filters.maxPrice || ""}`}
            onChange={(e) => {
              const [min, max] = e.target.value.split("-");
              onChange({ ...filters, minPrice: min, maxPrice: max, page: 1 });
            }}
            className="w-full rounded-xl border border-white/15 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition-all hover:border-white/30 focus:border-accent-500/50 focus:ring-1 focus:ring-accent-500/15"
          >
            {COWORKING_PRICE_RANGES.map((range) => (
              <option key={range.label} value={`${range.min}-${range.max}`}>
                {range.label}
              </option>
            ))}
          </select>
        </div>

        <EnterpriseInput
          name="minSeats"
          type="number"
          value={filters.minSeats || ""}
          onChange={(event) => updateFilter("minSeats", event.target.value)}
          placeholder="Min seats"
          className="border-white/15 bg-white text-slate-900 placeholder:text-slate-400"
        />

        <Select
          label="Sort By"
          options={COWORKING_SORT_OPTIONS}
          value={filters.sort || "featured"}
          onChange={(e) => updateFilter("sort", e.target.value)}
        />
      </div>

      {hasActiveFilters && (
        <Button variant="danger" size="sm" fullWidth onClick={clearFilters}>
          Clear All Filters
        </Button>
      )}
    </div>
  );

  if (variant === "mobile") {
    return (
      <>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 lg:hidden"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </button>
        {mobileOpen && (
          <div className="fixed inset-0 z-[var(--z-overlay)] lg:hidden">
            <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
            <div className="black-section-bg absolute right-0 top-0 h-full w-80 max-w-[85vw] overflow-y-auto border-l border-white/10 p-6 shadow-2xl">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Filters</h3>
                <button onClick={() => setMobileOpen(false)} aria-label="Close filters">
                  <X className="h-5 w-5 text-white/70" />
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
    <div className="black-section-bg rounded-3xl border border-white/10 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.16)]">
      <h3 className="mb-5 text-xs font-semibold uppercase tracking-[0.22em] text-white/70">Filters</h3>
      {filterContent}
    </div>
  );
}
