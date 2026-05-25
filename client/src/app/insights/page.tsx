import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import LeadCaptureBar from "@/components/lead/LeadCaptureBar";
import { BarChart3, TrendingUp, BookOpen, ArrowRight } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Market Insights – CRE Intelligence & Reports",
  description:
    "Stay ahead with market insights, investment analysis, and expert commentary on India's commercial real estate landscape.",
};

export default function InsightsPage() {
  const articles = [
    {
      category: "Market Update",
      title: "Gurugram Office Market Shows Strong Demand in Q1 2026",
      excerpt: "Grade A office absorption in Gurugram crossed 4.2 million sqft in Q1 2026, led by IT/ITeS and BFSI sectors.",
      date: "May 15, 2026",
    },
    {
      category: "Investment Insights",
      title: "Why Pre-Leased Assets Are the Future of CRE Investments",
      excerpt: "With yields ranging 7-9%, pre-leased commercial assets offer the best risk-adjusted returns in Indian real estate.",
      date: "May 10, 2026",
    },
    {
      category: "Company",
      title: "CredXP Partners with Leading Coworking Operators",
      excerpt: "We've onboarded 15+ coworking operators to offer India's largest flex-space aggregation platform.",
      date: "May 5, 2026",
    },
    {
      category: "Market Update",
      title: "Noida Emerges as a Key Commercial Hub",
      excerpt: "Sector 62 and 135 are seeing increased institutional investment with Grade A developments.",
      date: "April 28, 2026",
    },
    {
      category: "Investment Insights",
      title: "Understanding Cap Rates in Indian Commercial Real Estate",
      excerpt: "A comprehensive guide to cap rate analysis for institutional investors and HNIs.",
      date: "April 20, 2026",
    },
    {
      category: "Market Update",
      title: "Flex Space Demand Surges 40% YoY",
      excerpt: "Enterprise demand for managed offices and coworking continues to accelerate across tier-1 cities.",
      date: "April 15, 2026",
    },
  ];

  const categoryIcon: Record<string, React.ReactNode> = {
    "Market Update": <BarChart3 className="h-3 w-3" />,
    "Investment Insights": <TrendingUp className="h-3 w-3" />,
    "Company": <BookOpen className="h-3 w-3" />,
  };

  return (
    <>
      <section className="border-b border-slate-200 bg-white py-16 lg:py-20">
        <Container size="xl">
          <Badge variant="accent" icon={<BarChart3 className="h-3 w-3" />} className="mb-4">
            Market Intelligence
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Market Insights & Updates
          </h1>
          <p className="mt-3 max-w-2xl text-slate-600">
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
              <Card key={item.label} padding="md" hover>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{item.label}</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{item.value}</p>
                <p className="mt-1 text-sm text-slate-600">{item.note}</p>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <Card key={article.title} hover padding="md" className="flex flex-col">
                <Badge
                  variant="accent"
                  size="sm"
                  icon={categoryIcon[article.category]}
                  className="mb-3 w-fit"
                >
                  {article.category}
                </Badge>
                <h3 className="mb-2 text-lg font-semibold leading-snug text-slate-900 line-clamp-2">
                  {article.title}
                </h3>
                <p className="mb-4 flex-1 text-sm text-slate-600 line-clamp-3">
                  {article.excerpt}
                </p>
                <div className="flex items-center justify-between border-t border-slate-200 pt-3">
                  <span className="text-xs text-slate-500">{article.date}</span>
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-accent-500">
                    Read More <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <LeadCaptureBar variant="compact" />
    </>
  );
}
