"use client";

import { useEffect, useState } from "react";
import { BarChart3, TrendingUp, BookOpen } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import LeadCaptureBar from "@/components/lead/LeadCaptureBar";
import InsightCard from "@/components/insights/InsightCard";
import insightsService, { type InsightArticle } from "@/services/insights.service";

const categoryIcon: Record<string, React.ReactNode> = {
  "Market Update": <BarChart3 className="h-3 w-3" />,
  Investment: <TrendingUp className="h-3 w-3" />,
  "Investment Insights": <TrendingUp className="h-3 w-3" />,
  Coworking: <BookOpen className="h-3 w-3" />,
  Company: <BookOpen className="h-3 w-3" />,
};

export default function InsightsPageClient() {
  const [articles, setArticles] = useState<InsightArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInsights() {
      try {
        const res = await insightsService.getAll(9);
        setArticles(res.data);
      } finally {
        setLoading(false);
      }
    }
    void fetchInsights();
  }, []);

  return (
    <>
      <section className="blue-hero-bg border-b border-white/10 py-16 text-white lg:py-20">
        <Container size="xl">
          <Badge variant="accent" icon={<BarChart3 className="h-3 w-3" />} className="mb-4">
            Market Intelligence
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Market Insights & Updates
          </h1>
          <p className="mt-3 max-w-2xl text-white/72">
            Expert analysis, market reports, and investment insights for India&apos;s commercial real estate ecosystem.
          </p>
        </Container>
      </section>

      <section className="bg-slate-50 py-16 lg:py-20">
        <Container size="xl">
          <div className="mb-8 grid gap-4 md:grid-cols-3">
            {[
              { label: "Office absorption", value: "4.2M sqft", note: "Gurugram market" },
              { label: "Average yield", value: "7.0% - 8.5%", note: "Pre-leased assets" },
              { label: "Flex space demand", value: "+40% YoY", note: "Enterprise uptake" },
            ].map((item) => (
              <Card key={item.label} padding="md" hover className="black-section-bg border-white/10 shadow-[0_16px_40px_rgba(15,23,42,0.16)]">
                <p className="text-xs uppercase tracking-[0.18em] text-white/60">{item.label}</p>
                <p className="mt-2 text-2xl font-semibold text-white">{item.value}</p>
                <p className="mt-1 text-sm text-white/70">{item.note}</p>
              </Card>
            ))}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="h-80 animate-pulse rounded-3xl border border-slate-200 bg-white" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {articles.map((article) => (
                <div key={article.id}>
                  <div className="mb-2">
                    <Badge variant="accent" size="sm" icon={categoryIcon[article.category]}>
                      {article.category}
                    </Badge>
                  </div>
                  <InsightCard article={article} />
                </div>
              ))}
            </div>
          )}
        </Container>
      </section>

      <LeadCaptureBar variant="compact" />
    </>
  );
}
