import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, Landmark, TrendingUp } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { StatsBar } from "@/components/shared/StatCard";
import CoworkingPartnerMarquee from "@/components/coworking/CoworkingPartnerMarquee";
import HomeHeroSection from "./HomeHeroSection";
import LeadCaptureBar from "@/components/lead/LeadCaptureBar";
import HomePageClient from "./HomePageClient";
import HomeInsightsSection from "@/components/insights/HomeInsightsSection";
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
      icon: <TrendingUp className="h-10 w-10" />,
      title: "Invest in Pre-Leased",
      description: "Secure income-producing assets with blue-chip occupiers.",
      href: "/invest",
      cta: "Explore Investments",
    },
    {
      icon: <BriefcaseBusiness className="h-10 w-10" />,
      title: "Lease Corporate Space",
      description: "Structured office solutions for enterprise teams and growth.",
      href: "/lease",
      cta: "Explore Leasing",
    },
    {
      icon: <Landmark className="h-10 w-10" />,
      title: "Book Partner Coworking",
      description: "Flexible workspace inventory across India’s leading operators.",
      href: "/coworking",
      cta: "Explore Coworking",
    },
  ];

  return (
    <>
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
                className="group flex min-h-[148px] items-center gap-5 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-accent-500/10 text-accent-500">
                  {item.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
                  <p className="mt-1.5 text-sm leading-6 text-slate-600">{item.description}</p>
                  <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-accent-500">
                    {item.cta}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
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

          <CoworkingPartnerMarquee />
        </Container>
      </section>

      <HomeInsightsSection />

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
    </>
  );
}
