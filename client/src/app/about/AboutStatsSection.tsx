"use client";

import AnimatedStatsGrid, { parseStatValue } from "@/components/shared/AnimatedStatsGrid";
import ScrollReveal from "@/components/motion/ScrollReveal";
import { siteConfig } from "@/config/site";

const stats = siteConfig.stats.map((stat) => {
  const parsed = parseStatValue(stat.value);
  return {
    label: stat.label,
    value: stat.value,
    prefix: parsed.prefix,
    suffix: parsed.suffix,
    numericValue: parsed.numeric,
  };
});

export default function AboutStatsSection() {
  return (
    <ScrollReveal>
      <AnimatedStatsGrid stats={stats} variant="dark-card" columns={4} />
    </ScrollReveal>
  );
}
