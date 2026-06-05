"use client";

import { useEffect, useState } from "react";
import { Landmark } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import CoworkingFilters from "@/components/coworking/CoworkingFilters";
import CoworkingSpaceCard from "@/components/coworking/CoworkingSpaceCard";
import LeadCaptureBar from "@/components/lead/LeadCaptureBar";
import coworkingService from "@/services/coworking.service";
import type { CoworkingSpace, CoworkingFilters as CoworkingFiltersType } from "@/types/coworking";

export default function CoworkingPageClient() {
  const [spaces, setSpaces] = useState<CoworkingSpace[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<CoworkingFiltersType>({
    page: 1,
    limit: 12,
    sort: "featured",
  });

  useEffect(() => {
    async function fetchSpaces() {
      try {
        setLoading(true);
        const params: Record<string, unknown> = {};
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== "" && value !== undefined) params[key] = value;
        });
        const res = await coworkingService.getAll(params);
        setSpaces(res.data);
      } finally {
        setLoading(false);
      }
    }

    void fetchSpaces();
  }, [filters]);

  return (
    <>
      <section className="blue-hero-bg border-b border-white/10 py-16 text-white lg:py-20">
        <Container size="xl">
          <Badge variant="accent" icon={<Landmark className="h-3 w-3" />} className="mb-4">
            Coworking Aggregator
          </Badge>
          <h1 className="max-w-2xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Flexible Workspace Solutions for Enterprise Teams
          </h1>
          <p className="mt-3 max-w-2xl text-white/72">
            Book coworking desks, private offices, and managed suites across curated operators.
          </p>
        </Container>
      </section>

      <section className="bg-slate-50 py-16 lg:py-20">
        <Container size="xl">
          <div className="mb-8 flex items-center justify-between gap-4">
            <SectionHeader
              eyebrow="Operator Network"
              title="Partner Coworking Spaces"
              subtitle="Compare pricing, amenities, and availability across curated coworking spaces."
              className="mb-0"
            />
            <CoworkingFilters filters={filters} onChange={setFilters} variant="mobile" />
          </div>

          <div className="grid gap-8 xl:grid-cols-[280px_minmax(0,1fr)]">
            <div className="hidden lg:block">
              <CoworkingFilters filters={filters} onChange={setFilters} />
            </div>

            <div>
              {loading ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="h-80 animate-pulse rounded-3xl border border-slate-200 bg-white" />
                  ))}
                </div>
              ) : spaces.length === 0 ? (
                <EmptyState
                  title="No coworking spaces found"
                  message="Try adjusting your filters to discover available workspace options."
                  actionLabel="Clear Filters"
                  onAction={() => setFilters({ page: 1, limit: 12, sort: "featured" })}
                />
              ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {spaces.map((space) => (
                    <CoworkingSpaceCard key={space._id} space={space} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </Container>
      </section>

      <LeadCaptureBar
        title="Need Help Finding the Right Coworking Space?"
        subtitle="Our workspace advisors will match you with the perfect operator."
      />
    </>
  );
}
