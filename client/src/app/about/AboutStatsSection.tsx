"use client";

import AnimatedStatsGrid from "@/components/shared/AnimatedStatsGrid";
import ScrollReveal from "@/components/motion/ScrollReveal";
import { buildListingStats } from "@/app/HomeStatsSection";
import type { ListingCounts } from "@/lib/seo";

export default function AboutStatsSection({ counts }: { counts: ListingCounts | null }) {
  if (!counts || counts.investment + counts.lease + counts.coworking === 0) return null;

  const stats = buildListingStats(counts).map(({ label, numericValue }) => ({ label, numericValue }));
  return (
    <ScrollReveal>
      <AnimatedStatsGrid stats={stats} variant="dark-card" columns={4} />
    </ScrollReveal>
  );
}
