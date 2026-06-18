"use client";

import { useState, useEffect, useCallback, useMemo, type ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PropertyCard from "@/components/property/PropertyCard";
import { PropertyCardSkeleton } from "@/components/ui/Skeleton";
import PropertyDirectoryFilters from "@/components/property/PropertyDirectoryFilters";
import SearchBar from "@/components/shared/SearchBar";
import Pagination from "@/components/shared/Pagination";
import { EmptyState } from "@/components/ui/EmptyState";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import AnimatedStatsGrid, { type AnimatedStatItem } from "@/components/shared/AnimatedStatsGrid";
import { Select } from "@/components/ui/Select";
import { SORT_OPTIONS } from "@/config/filters";
import propertyService from "@/services/property.service";
import {
  filtersFromSearchParams,
  searchParamsFromFilters,
  filtersToApiParams,
  type PropertyDirectoryMode,
} from "@/utils/propertyFilterParams";
import type { Property, PropertyFilters as PropertyFiltersType } from "@/types/property";
import type { Pagination as PaginationType } from "@/types/common";

interface PropertyDirectoryShellProps {
  mode: PropertyDirectoryMode;
  basePath: "/invest" | "/lease";
  hero: {
    badge: ReactNode;
    title: string;
    description: string;
    stats?: { label: string; value: string | number }[];
  };
}

export default function PropertyDirectoryShell({ mode, basePath, hero }: PropertyDirectoryShellProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const filters = useMemo(() => filtersFromSearchParams(searchParams, mode), [searchParams, mode]);
  const searchQuery = searchParams.get("q") || "";

  const [properties, setProperties] = useState<Property[]>([]);
  const [pagination, setPagination] = useState<PaginationType | null>(null);
  const [loading, setLoading] = useState(true);

  const updateFilters = useCallback((next: PropertyFiltersType, nextQuery = searchQuery) => {
    const params = searchParamsFromFilters(next, nextQuery, mode);
    const query = params.toString();
    router.replace(query ? `${basePath}?${query}` : basePath, { scroll: false });
  }, [router, searchQuery, mode, basePath]);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const params = filtersToApiParams(filters, mode);

        const res = searchQuery
          ? await propertyService.search({ ...params, q: searchQuery })
          : await propertyService.getAll(params);

        setProperties(res.data.properties || []);
        setPagination(res.data.pagination || null);
      } catch (err) {
        console.error("Failed to fetch properties:", err);
        setProperties([]);
      } finally {
        setLoading(false);
      }
    };

    void fetchProperties();
  }, [filters, searchQuery, mode]);

  const handleSearch = (query: string) => {
    updateFilters({ ...filters, page: 1 }, query);
  };

  const handleFilterChange = (newFilters: PropertyFiltersType) => {
    updateFilters(newFilters);
  };

  const handlePageChange = (page: number) => {
    updateFilters({ ...filters, page });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const sortLabel = SORT_OPTIONS.find((option) => option.value === (filters.sort || "newest"))?.label || "Newest First";
  const totalItems = pagination?.totalItems;
  const stats: AnimatedStatItem[] = hero.stats
    ? hero.stats.map((item) => ({
        label: item.label,
        value: String(item.value),
        numericValue: typeof item.value === "number" ? item.value : undefined,
      }))
    : [
        {
          label: "Results",
          numericValue: typeof totalItems === "number" ? totalItems : undefined,
          value: totalItems != null ? String(totalItems) : "—",
        },
        { label: "Markets", value: "8+", prefix: "", suffix: "+", numericValue: 8 },
        {
          label: mode === "invest" ? "Yields" : "Operators",
          value: mode === "invest" ? "7%+" : "15+",
          prefix: "",
          suffix: mode === "invest" ? "%+" : "+",
          numericValue: mode === "invest" ? 7 : 15,
        },
        { label: "Cities", value: "10+", prefix: "", suffix: "+", numericValue: 10 },
      ];

  return (
    <>
      <section className="blue-hero-bg border-b border-white/10 py-10 lg:py-14">
        <Container size="xl">
          <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              {hero.badge}
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                {hero.title}
              </h1>
              <p className="mt-3 max-w-2xl text-white/72">{hero.description}</p>
            </div>

            <AnimatedStatsGrid stats={stats} variant="dark-card" columns={4} className="lg:min-w-[560px]" />
          </div>

          <Card
            className="mb-8 border-blue-100/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(240,247,255,0.94))] shadow-[0_18px_48px_rgba(15,23,42,0.08)]"
            padding="md"
          >
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,0.5fr)] lg:items-end">
              <SearchBar
                onSearch={handleSearch}
                initialValue={searchQuery}
                placeholder="Search by tower, city, tenant, or micromarket"
              />
              <Select
                label="Sort by"
                options={SORT_OPTIONS}
                placeholder="Sort"
                value={filters.sort || "newest"}
                onChange={(e) => updateFilters({ ...filters, sort: e.target.value, page: 1 })}
              />
            </div>
          </Card>
        </Container>
      </section>

      <Container as="section" size="xl" className="py-10 lg:py-14">
        <div className="mb-8 flex items-center justify-between gap-4 xl:hidden">
          <PropertyDirectoryFilters
            mode={mode}
            filters={filters}
            onChange={handleFilterChange}
            variant="mobile"
          />
          <p className="text-sm text-slate-500">
            {loading ? "Loading results..." : `${pagination?.totalItems ?? 0} properties found`}
          </p>
        </div>

        <div className="grid gap-8 xl:grid-cols-[280px_minmax(0,1fr)]">
          <div className="hidden xl:block" id="property-filters">
            <PropertyDirectoryFilters
              mode={mode}
              filters={filters}
              onChange={handleFilterChange}
              variant="desktop"
            />
          </div>

          <div className="min-w-0">
            {!loading && pagination && (
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <p className="text-sm text-slate-600">
                  Showing <span className="font-semibold text-slate-900">{properties.length}</span> of{" "}
                  <span className="font-semibold text-slate-900">{pagination.totalItems}</span> properties
                  {searchQuery && (
                    <span>
                      {" "}
                      for <span className="font-semibold text-accent-500">&ldquo;{searchQuery}&rdquo;</span>
                    </span>
                  )}
                </p>
                <Badge variant="outline">{sortLabel}</Badge>
              </div>
            )}

            {loading ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 8 }).map((_, i) => (
                  <PropertyCardSkeleton key={i} />
                ))}
              </div>
            ) : properties.length === 0 ? (
              <EmptyState
                title="No properties found"
                message="Try adjusting your filters or search query to find what you're looking for."
                actionLabel="Clear filters"
                onAction={() => router.replace(basePath)}
              />
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {properties.map((property, index) => (
                  <PropertyCard
                    key={property._id}
                    property={property}
                    variant="compact"
                    priorityImage={index < 6}
                  />
                ))}
              </div>
            )}

            {!loading && pagination && pagination.totalPages > 1 && (
              <div className="mt-10 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
                <Pagination pagination={pagination} onPageChange={handlePageChange} />
              </div>
            )}
          </div>
        </div>
      </Container>
    </>
  );
}
