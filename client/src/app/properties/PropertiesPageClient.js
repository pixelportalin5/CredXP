"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import PropertyCard from "@/components/PropertyCard";
import PropertyCardSkeleton from "@/components/PropertyCardSkeleton";
import PropertyFilters from "@/components/PropertyFilters";
import SearchBar from "@/components/SearchBar";
import Pagination from "@/components/Pagination";
import EmptyState from "@/components/EmptyState";
import propertyService from "@/services/propertyService";

export default function PropertiesPageClient() {
  const searchParams = useSearchParams();

  const [properties, setProperties] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Initialize filters from URL search params
  const [filters, setFilters] = useState({
    page: 1,
    limit: 9,
    type: searchParams.get("type") || "",
    status: searchParams.get("status") || "",
    city: searchParams.get("city") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    sort: searchParams.get("sort") || "newest",
  });

  const fetchProperties = useCallback(async () => {
    try {
      setLoading(true);

      // Build clean params (remove empty values)
      const params = {};
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
  }, [filters, searchQuery]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const handleSearch = (query) => {
    setSearchQuery(query);
    setFilters((prev) => ({ ...prev, page: 1 }));
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handlePageChange = (page) => {
    setFilters((prev) => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Commercial Properties</h1>
        <p className="mt-2 text-slate-400">
          Explore our curated collection of offices and shops across Bangalore.
        </p>
      </div>

      {/* Search + Mobile Filter Toggle Row */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center">
        <SearchBar onSearch={handleSearch} initialValue={searchQuery} />
        {/* Mobile-only filter toggle — the component hides itself on lg+ */}
        <div className="lg:hidden">
          <PropertyFilters filters={filters} onChange={handleFilterChange} variant="mobile" />
        </div>
      </div>

      {/* Main Content: Sidebar + Grid */}
      <div className="flex gap-8">
        {/* Desktop Filter Sidebar — hidden on mobile */}
        <div className="hidden lg:block w-64 shrink-0">
          <PropertyFilters filters={filters} onChange={handleFilterChange} variant="desktop" />
        </div>

        {/* Property Grid */}
        <div className="flex-1 min-w-0">
          {/* Results count */}
          {!loading && pagination && (
            <p className="mb-6 text-sm text-slate-500">
              Showing{" "}
              <span className="font-medium text-slate-300">
                {properties.length}
              </span>{" "}
              of{" "}
              <span className="font-medium text-slate-300">
                {pagination.totalItems}
              </span>{" "}
              properties
              {searchQuery && (
                <span>
                  {" "}for &ldquo;<span className="text-indigo-400">{searchQuery}</span>&rdquo;
                </span>
              )}
            </p>
          )}

          {loading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <PropertyCardSkeleton key={i} />
              ))}
            </div>
          ) : properties.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {properties.map((property) => (
                <PropertyCard key={property._id} property={property} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && pagination && pagination.totalPages > 1 && (
            <div className="mt-10">
              <Pagination
                pagination={pagination}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
