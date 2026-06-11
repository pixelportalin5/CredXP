"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { GitCompare, ArrowLeft } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import PropertyComparisonTable from "@/components/property/PropertyComparisonTable";
import PropertyComparisonCards from "@/components/property/PropertyComparisonCards";
import { usePropertyComparison } from "@/hooks/usePropertyComparison";
import propertyService from "@/services/property.service";
import type { Property } from "@/types/property";

export default function ComparePageClient() {
  const { ids, count, max, clearCompare } = usePropertyComparison();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProperties = useCallback(async () => {
    if (ids.length === 0) {
      setProperties([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const results = await Promise.all(
        ids.map(async (id) => {
          const response = await propertyService.getById(id);
          return response.data;
        })
      );
      setProperties(results);
    } catch (fetchError) {
      setProperties([]);
      setError(fetchError instanceof Error ? fetchError.message : "Failed to load properties for comparison.");
    } finally {
      setLoading(false);
    }
  }, [ids]);

  useEffect(() => {
    loadProperties();
  }, [loadProperties]);

  return (
    <div className="bg-slate-50/60 pb-24">
      <section className="border-b border-slate-200 bg-white">
        <Container size="lg" className="py-10 lg:py-14">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-3xl">
              <Badge variant="accent" icon={<GitCompare className="h-3 w-3" />}>
                Property Comparison
              </Badge>
              <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 lg:text-4xl">
                Compare Investment Properties
              </h1>
              <p className="mt-3 text-base text-slate-600">
                Side-by-side view of up to {max} pre-leased and investment-grade assets. Add properties from
                listings or detail pages, then review yield, lease terms, and ROI metrics here.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/invest"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-transparent px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
              >
                <ArrowLeft className="h-4 w-4" />
                Browse Properties
              </Link>
              {count > 0 ? (
                <Button type="button" variant="outline" size="md" onClick={clearCompare}>
                  Clear All
                </Button>
              ) : null}
            </div>
          </div>
        </Container>
      </section>

      <Container size="lg" className="py-8 lg:py-10">
        {loading ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-navy-700 border-t-accent-500" />
          </div>
        ) : null}

        {!loading && error ? (
          <div className="rounded-[1.75rem] border border-red-200 bg-red-50 px-6 py-8 text-center">
            <p className="text-sm font-medium text-red-700">{error}</p>
            <Button type="button" variant="outline" size="md" className="mt-4" onClick={loadProperties}>
              Retry
            </Button>
          </div>
        ) : null}

        {!loading && !error && count === 0 ? (
          <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <GitCompare className="mx-auto h-10 w-10 text-slate-300" />
            <h2 className="mt-4 text-xl font-semibold text-slate-900">No properties selected</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
              Use the Compare button on property cards or detail pages to add up to {max} assets.
            </p>
            <Link
              href="/invest"
              className="mt-6 inline-flex items-center justify-center rounded-xl bg-accent-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-accent-500/15 transition-colors hover:bg-accent-400"
            >
              Explore Investment Listings
            </Link>
          </div>
        ) : null}

        {!loading && !error && properties.length > 0 ? (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-slate-600">
                Comparing <span className="font-semibold text-slate-900">{properties.length}</span> of {max}{" "}
                properties
              </p>
              {count < max ? (
                <Link href="/invest" className="text-sm font-semibold text-accent-500 hover:text-accent-600">
                  Add another property
                </Link>
              ) : null}
            </div>
            <PropertyComparisonTable properties={properties} />
            <PropertyComparisonCards properties={properties} />
          </div>
        ) : null}
      </Container>
    </div>
  );
}
