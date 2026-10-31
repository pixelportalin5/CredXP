"use client";

import { Building2, BriefcaseBusiness, Landmark, Store } from "lucide-react";
import { Container } from "@/components/ui/Container";
import ScrollReveal from "@/components/motion/ScrollReveal";
import AnimatedStatsGrid, { type AnimatedStatItem } from "@/components/shared/AnimatedStatsGrid";
import { siteConfig } from "@/config/site";
import type { ListingCounts } from "@/lib/seo";

/**
 * Shows live listing totals only. Marketing figures (portfolio size, tenant
 * counts) stay off the page until the business supplies verified numbers.
 */
export function buildListingStats(counts: ListingCounts): AnimatedStatItem[] {
  return [
    { label: "Investment Listings", numericValue: counts.investment, icon: Building2 },
    { label: "Spaces for Lease", numericValue: counts.lease, icon: BriefcaseBusiness },
    { label: "Coworking Spaces", numericValue: counts.coworking, icon: Store },
    { label: "Coworking Partner Brands", numericValue: siteConfig.trustPartners.length, icon: Landmark },
  ];
}

export default function HomeStatsSection({ counts }: { counts: ListingCounts | null }) {
  if (!counts || counts.investment + counts.lease + counts.coworking === 0) return null;

  return (
    <section className="border-y border-slate-200 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.12),transparent_30%),linear-gradient(180deg,#f8fbff_0%,#eef5ff_100%)] py-8 sm:py-12">
      <Container size="xl">
        <ScrollReveal>
          <AnimatedStatsGrid stats={buildListingStats(counts)} variant="dark-bar" />
        </ScrollReveal>
      </Container>
    </section>
  );
}
