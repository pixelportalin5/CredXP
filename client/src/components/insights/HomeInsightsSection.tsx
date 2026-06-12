"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BarChart3 } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import InsightCard from "@/components/insights/InsightCard";
import ScrollReveal from "@/components/motion/ScrollReveal";
import { InsightCardSkeleton } from "@/components/ui/Skeleton";
import insightsService, { type InsightArticle } from "@/services/insights.service";

export default function HomeInsightsSection() {
  const [articles, setArticles] = useState<InsightArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInsights() {
      try {
        const res = await insightsService.getAll(3);
        setArticles(res.data);
      } finally {
        setLoading(false);
      }
    }
    void fetchInsights();
  }, []);

  return (
    <section className="border-t border-slate-200 py-16 lg:py-20">
      <Container size="xl">
        <ScrollReveal>
          <SectionHeader
            eyebrow="Insights"
            eyebrowIcon={<BarChart3 className="h-4 w-4" />}
            title="Market Insights & Updates"
            subtitle="A structured market feed for investors, occupiers, and broker teams."
            action={{ label: "View Insights", href: "/insights" }}
          />
        </ScrollReveal>

        {loading ? (
          <div className="grid gap-6 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <InsightCardSkeleton key={index} />
            ))}
          </div>
        ) : (
          <ScrollReveal stagger className="grid gap-6 md:grid-cols-3">
            {articles.map((article) => (
              <InsightCard key={article.id} article={article} compact />
            ))}
          </ScrollReveal>
        )}

        <div className="mt-6 text-center sm:hidden">
          <Link href="/insights" className="text-sm font-semibold text-accent-500 hover:text-accent-600">
            View Insights
          </Link>
        </div>
      </Container>
    </section>
  );
}
