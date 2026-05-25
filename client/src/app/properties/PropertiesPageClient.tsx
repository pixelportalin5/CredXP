"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Building2, SlidersHorizontal } from "lucide-react";
import PropertyCard from "@/components/property/PropertyCard";
import { PropertyCardSkeleton } from "@/components/ui/Skeleton";
import PropertyFilters from "@/components/property/PropertyFilters";
import SearchBar from "@/components/shared/SearchBar";
import Pagination from "@/components/shared/Pagination";
import { EmptyState } from "@/components/ui/EmptyState";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { CITIES, PROPERTY_TYPES, SORT_OPTIONS } from "@/config/filters";
import propertyService from "@/services/property.service";
import type { Property, PropertyFilters as PropertyFiltersType } from "@/types/property";
import type { Pagination as PaginationType } from "@/types/common";

/* ============================================================
   PropertiesPageClient — Directory Listing Page
   ============================================================ */

export default function PropertiesPageClient() {
  const searchParams = useSearchParams();

  const [properties, setProperties] = useState<Property[]>([]);
  const [pagination, setPagination] = useState<PaginationType | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [filters, setFilters] = useState<PropertyFiltersType>({
    page: 1,
    limit: 12,
    type: searchParams.get("type") || "",
    status: searchParams.get("status") || "",
    city: searchParams.get("city") || "",
    category: searchParams.get("category") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    sort: searchParams.get("sort") || "newest",
  });

  useEffect(() => {
    const fetchProperties = async () => {
    try {
      setLoading(true);

      // Build clean params
      const params: Record<string, unknown> = {};
      Object.entries(filters).forEach(([key, val]) => {
        if (val !== "" && val !== undefined) params[key] = val;
      });

      let res;
      if (searchQuery) {
        res = await propertyService.search({ ...params, q: searchQuery });
      } else {
        res = await propertyService.getAll(params);
      }

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
  }, [filters, searchQuery]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setFilters((prev) => ({ ...prev, page: 1 }));
  };

  const handleFilterChange = (newFilters: PropertyFiltersType) => {
    setFilters(newFilters);
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Container as="section" size="xl" className="py-10 lg:py-14">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Badge variant="accent" icon={<Building2 className="h-3 w-3" />}>
            Property Directory
          </Badge>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Commercial Property Listings
          </h1>
          <p className="mt-3 max-w-2xl text-slate-600">
            Discover pre-leased investments, office leasing, and premium commercial spaces across India in a structured enterprise directory.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:min-w-[560px]">
          {[
            { label: "Results", value: pagination?.totalItems ?? "—" },
            { label: "Markets", value: "8+" },
            { label: "Yields", value: "7%+" },
            { label: "Operators", value: "15+" },
          ].map((item) => (
            <Card key={item.label} padding="sm" className="text-center">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{item.label}</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">{item.value}</p>
            </Card>
          ))}
        </div>
      </div>

      <Card className="mb-8 shadow-sm" padding="md">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))_auto] xl:items-end">
          <SearchBar onSearch={handleSearch} initialValue={searchQuery} placeholder="Search by tower, city, tenant, or micromarket" />
          <Select label="Location" options={CITIES} placeholder="All locations" value={filters.city || ""} onChange={(e) => setFilters((prev) => ({ ...prev, city: e.target.value, page: 1 }))} />
          <Select label="Type" options={PROPERTY_TYPES} placeholder="All types" value={filters.type || ""} onChange={(e) => setFilters((prev) => ({ ...prev, type: e.target.value, page: 1 }))} />
          <Select label="Sort" options={SORT_OPTIONS} placeholder="Sort" value={filters.sort || "newest"} onChange={(e) => setFilters((prev) => ({ ...prev, sort: e.target.value, page: 1 }))} />
          <Link href="#property-filters" className="hidden xl:block">
            <Button variant="outline" size="md" icon={<SlidersHorizontal className="h-4 w-4" />}>
              Advanced Filters
            </Button>
          </Link>
        </div>
      </Card>

      <div className="mb-8 flex items-center justify-between gap-4 xl:hidden">
        <PropertyFilters filters={filters} onChange={handleFilterChange} variant="mobile" />
        <p className="text-sm text-slate-500">
          {loading ? "Loading results..." : `${pagination?.totalItems ?? 0} properties found`}
        </p>
      </div>

      <div className="grid gap-8 xl:grid-cols-[280px_minmax(0,1fr)]">
        <div className="hidden xl:block" id="property-filters">
          <PropertyFilters filters={filters} onChange={handleFilterChange} variant="desktop" />
        </div>

        <div className="min-w-0">
          {!loading && pagination && (
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <p className="text-sm text-slate-600">
                Showing <span className="font-semibold text-slate-900">{properties.length}</span> of <span className="font-semibold text-slate-900">{pagination.totalItems}</span> properties
                {searchQuery && (
                  <span> for <span className="font-semibold text-accent-500">&ldquo;{searchQuery}&rdquo;</span></span>
                )}
              </p>
              <Badge variant="outline">Sorted by {filters.sort || "newest"}</Badge>
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <PropertyCardSkeleton key={i} />
              ))}
            </div>
          ) : properties.length === 0 ? (
            <EmptyState
              title="No properties found"
              message="Try adjusting your filters or search query to find what you're looking for."
              actionLabel="Clear Filters"
              onAction={() => setFilters({ page: 1, limit: 12 })}
            />
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-2">
              {properties.map((property) => (
                <PropertyCard key={property._id} property={property} variant="compact" />
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
  );
}
