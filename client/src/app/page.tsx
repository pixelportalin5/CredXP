import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BarChart3, BriefcaseBusiness, Landmark, TrendingUp } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { StatsBar } from "@/components/shared/StatCard";
import HomeHeroSection from "./HomeHeroSection";
import LeadCaptureBar from "@/components/lead/LeadCaptureBar";
import HomePageClient from "./HomePageClient";
import { coworkingPartnerLogos } from "@/config/coworkingLogos";
import { siteConfig } from "@/config/site";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Premium Commercial Real Estate. Delivered.",
  description:
    "Pre-leased investments, enterprise office leasing, coworking aggregation, and institutional-grade property discovery across India's top commercial markets.",
};

/* ============================================================
   Homepage — Premium Enterprise CRE Landing
   ============================================================ */

export default function HomePage() {
  const goalCards = [
    {
      icon: <TrendingUp className="h-5 w-5" />,
      title: "Invest in Pre-Leased",
      description: "Secure income-producing assets with blue-chip occupiers.",
      href: "/properties?category=pre-leased",
      cta: "Explore Investments",
    },
    {
      icon: <BriefcaseBusiness className="h-5 w-5" />,
      title: "Lease Corporate Space",
      description: "Structured office solutions for enterprise teams and growth.",
      href: "/properties?category=lease",
      cta: "Explore Leasing",
    },
    {
      icon: <Landmark className="h-5 w-5" />,
      title: "Book Partner Coworking",
      description: "Flexible workspace inventory across India’s leading operators.",
      href: "/coworking",
      cta: "Explore Coworking",
    },
  ];

  const insightCards = [
    {
      category: "Market Update",
      title: "Gurugram Grade A absorption continues to outpace supply",
      date: "May 15, 2026",
    },
    {
      category: "Investment",
      title: "Pre-leased assets remain the strongest risk-adjusted entry point",
      date: "May 10, 2026",
    },
    {
      category: "Coworking",
      title: "Enterprise demand is consolidating around managed office models",
      date: "May 05, 2026",
    },
  ];

  return (
    <main>
      <HomeHeroSection />

      <section className="border-y border-slate-200 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.12),transparent_30%),linear-gradient(180deg,#f8fbff_0%,#eef5ff_100%)] py-12">
        <Container size="xl">
          <StatsBar stats={siteConfig.stats} tone="dark" className="gap-0" />
        </Container>
      </section>

      <HomePageClient />

      <section className="border-t border-slate-200 py-16 lg:py-20">
        <Container size="xl">
          <SectionHeader
            eyebrow="Explore"
            eyebrowIcon={<Landmark className="h-4 w-4" />}
            title="Explore by What You Need"
            subtitle="Whether you are investing, leasing, or booking flex space, the platform is organized around real enterprise use cases."
            align="center"
          />

          <div className="grid gap-6 md:grid-cols-3">
            {goalCards.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-accent-500/30 hover:shadow-lg"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-500/10 text-accent-500">
                  {item.icon}
                </div>
                <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-accent-500">
                  {item.cta}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-t border-slate-200 bg-slate-50 py-12 lg:py-14">
        <Container size="xl">
          <SectionHeader
            eyebrow="Coworking"
            eyebrowIcon={<Landmark className="h-4 w-4" />}
            title="Our Trusted Partners (Coworking & Flex Space)"
            subtitle="Logos shown here are the actual partner brands and workspace networks."
            action={{ label: "View Coworking", href: "/coworking" }}
          />

          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-6">
            {coworkingPartnerLogos.map((operator) => (
              <Card key={operator.name} padding="none" className="flex min-h-[86px] items-center justify-center rounded-2xl border-slate-200 bg-white p-2 text-center shadow-sm">
                <div className="flex h-16 w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
                  <Image
                    src={operator.src}
                    alt={operator.name}
                    width={180}
                    height={64}
                    className={operator.imageClassName}
                  />
                </div>
              </Card>
            ))}
            <Card padding="none" className="flex min-h-[86px] items-center justify-center rounded-2xl border-slate-200 bg-white p-2 text-center shadow-sm">
              <div className="flex h-14 w-full items-center justify-center rounded-xl border border-slate-200 bg-[linear-gradient(135deg,rgba(248,250,252,1),rgba(255,255,255,1))] px-4 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                And More
              </div>
            </Card>
          </div>
        </Container>
      </section>

      <section className="border-t border-slate-200 py-16 lg:py-20">
        <Container size="xl">
          <SectionHeader
            eyebrow="Insights"
            eyebrowIcon={<BarChart3 className="h-4 w-4" />}
            title="Market Insights & Updates"
            subtitle="A structured market feed for investors, occupiers, and broker teams."
            action={{ label: "View Insights", href: "/insights" }}
          />

          <div className="grid gap-6 md:grid-cols-3">
            {insightCards.map((article) => (
              <Card key={article.title} hover padding="md" className="flex flex-col">
                <Badge variant="accent" size="sm" className="mb-4 w-fit">
                  {article.category}
                </Badge>
                <div className="mb-4 h-32 rounded-2xl border border-pink-200 bg-[linear-gradient(135deg,rgba(252,231,243,0.96),rgba(253,242,248,1))]" />
                <h3 className="text-lg font-semibold text-slate-900">{article.title}</h3>
                <p className="mt-3 text-sm text-slate-500">{article.date}</p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-t border-slate-200 py-14">
        <Container size="xl">
          <p className="mb-6 text-center text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
            Trusted Partners
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {siteConfig.trustPartners.map((partner) => (
              <span
                key={partner}
                className="rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-600 shadow-sm"
              >
                {partner}
              </span>
            ))}
          </div>
        </Container>
      </section>

      <LeadCaptureBar />
    </main>
  );
}
