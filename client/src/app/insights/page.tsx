import Link from "next/link";
import { BarChart3 } from "lucide-react";
import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import LeadCaptureBar from "@/components/lead/LeadCaptureBar";
import InsightCard from "@/components/insights/InsightCard";
import { getApiBaseUrl } from "@/lib/seo";
import type { InsightArticle } from "@/services/insights.service";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Commercial Real Estate News & Market Updates",
  description:
    "Recent commercial real estate news for Gurugram and India, with links to the original publishers, plus CredXP's own guides for investors and occupiers.",
  alternates: { canonical: "/insights" },
};

async function fetchInsights(): Promise<InsightArticle[]> {
  try {
    const response = await fetch(`${getApiBaseUrl()}/insights?limit=9`, { next: { revalidate: 3600 } });
    if (!response.ok) return [];
    const json = (await response.json()) as { data?: InsightArticle[] };
    // Fallback items carry no source, so they are never shown.
    return (json.data || []).filter((item) => !item.id.startsWith("fallback-") && item.sourceUrl.startsWith("http"));
  } catch {
    return [];
  }
}

export default async function InsightsPage() {
  const articles = await fetchInsights();

  return (
    <>
      <section className="blue-hero-bg border-b border-white/10 py-16 text-white lg:py-20">
        <Container size="xl">
          <Badge variant="accent" icon={<BarChart3 className="h-3 w-3" />} className="mb-4">
            Market News
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Commercial Real Estate News &amp; Market Updates
          </h1>
          <p className="mt-3 max-w-2xl text-white/72">
            Recent headlines from industry publications. Each story links to the original source.
          </p>
        </Container>
      </section>

      <section className="bg-slate-50 py-16 lg:py-20">
        <Container size="xl">
          <div className="mb-10 rounded-2xl border border-accent-500/20 bg-white p-6">
            <h2 className="text-lg font-semibold text-slate-900">CredXP guides</h2>
            <p className="mt-1 text-sm text-slate-600">Our own explainers for investors and businesses.</p>
            <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm">
              <li><Link href="/guides/what-is-pre-leased-commercial-property" className="text-accent-500 hover:underline">What is pre-leased property?</Link></li>
              <li><Link href="/guides/rental-yield-gross-vs-net" className="text-accent-500 hover:underline">Gross vs net rental yield</Link></li>
              <li><Link href="/guides/pre-leased-property-due-diligence-checklist" className="text-accent-500 hover:underline">Due diligence checklist</Link></li>
              <li><Link href="/guides" className="text-accent-500 hover:underline">All guides →</Link></li>
            </ul>
          </div>

          {articles.length === 0 ? (
            <p className="text-slate-600">No news is available right now. Please check back later.</p>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {articles.map((article) => (
                <InsightCard key={article.id} article={article} />
              ))}
            </div>
          )}
        </Container>
      </section>

      <LeadCaptureBar variant="compact" />
    </>
  );
}
