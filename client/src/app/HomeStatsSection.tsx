"use client";

import { useEffect, useState } from "react";
import { Building2, Users, BriefcaseBusiness, Landmark } from "lucide-react";
import { Container } from "@/components/ui/Container";
import ScrollReveal from "@/components/motion/ScrollReveal";
import AnimatedStatsGrid, { type AnimatedStatItem, parseStatValue } from "@/components/shared/AnimatedStatsGrid";
import { siteConfig } from "@/config/site";
import propertyService from "@/services/property.service";
import coworkingService from "@/services/coworking.service";

const statIcons = [Building2, BriefcaseBusiness, Users, Landmark];

export default function HomeStatsSection() {
  const [stats, setStats] = useState<AnimatedStatItem[]>(() =>
    siteConfig.stats.map((stat, index) => {
      const parsed = parseStatValue(stat.value);
      return {
        label: stat.label,
        value: stat.value,
        prefix: parsed.prefix,
        suffix: parsed.suffix,
        numericValue: parsed.numeric,
        icon: statIcons[index % statIcons.length],
      };
    })
  );

  useEffect(() => {
    async function fetchStats() {
      try {
        const [propertyRes, coworkingRes] = await Promise.all([
          propertyService.getAll({ page: 1, limit: 1 }),
          coworkingService.getAll({ limit: 1 }),
        ]);

        const propertyCount = propertyRes.data.pagination?.totalItems ?? 0;
        const coworkingCount = coworkingRes.pagination?.totalItems ?? coworkingRes.data.length;
        const partnerCount = siteConfig.trustPartners.length;

        if (propertyCount > 0 || coworkingCount > 0) {
          setStats([
            {
              label: "Listed Assets",
              prefix: "",
              suffix: "+",
              numericValue: propertyCount || 200,
              icon: Building2,
            },
            {
              label: "Active Listings",
              prefix: "",
              suffix: "+",
              numericValue: propertyCount || 200,
              icon: BriefcaseBusiness,
            },
            {
              label: "Blue-Chip Tenants",
              prefix: "",
              suffix: "+",
              numericValue: 150,
              icon: Users,
            },
            {
              label: "Coworking Partners",
              prefix: "",
              suffix: "+",
              numericValue: partnerCount || 15,
              icon: Landmark,
            },
          ]);
        }
      } catch {
        // Keep fallback stats from siteConfig
      }
    }

    void fetchStats();
  }, []);

  return (
    <section className="border-y border-slate-200 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.12),transparent_30%),linear-gradient(180deg,#f8fbff_0%,#eef5ff_100%)] py-8 sm:py-12">
      <Container size="xl">
        <ScrollReveal>
          <AnimatedStatsGrid stats={stats} variant="dark-bar" />
        </ScrollReveal>
      </Container>
    </section>
  );
}
