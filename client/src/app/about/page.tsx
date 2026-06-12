import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import LeadCaptureBar from "@/components/lead/LeadCaptureBar";
import AboutStatsSection from "./AboutStatsSection";
import AboutMissionCards from "./AboutMissionCards";
import {
  Building2, Users,
  TrendingUp, Globe, Award, Handshake,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About CredXP – India's CRE Intelligence Platform",
  description:
    "Learn about CredXP's mission to transform commercial real estate discovery for investors, corporate tenants, and asset managers across India.",
};

export default function AboutPage() {
  return (
    <>
      <section className="blue-hero-bg border-b border-white/10 py-16 text-white lg:py-24">
        <Container size="lg" className="text-center">
          <Badge variant="accent" icon={<Building2 className="h-3 w-3" />} className="mb-4">
            About Us
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Transforming Commercial <span className="text-accent-500">Real Estate Discovery</span>
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-white/72">
            CredXP is India&apos;s premium commercial real estate intelligence platform, connecting investors, occupiers, and advisors with structured property discovery and institutional market data.
          </p>
        </Container>
      </section>

      <section className="border-b border-slate-200 bg-slate-50 py-14">
        <Container size="md">
          <AboutStatsSection />
        </Container>
      </section>

      <section className="py-16 lg:py-20">
        <Container>
          <div className="mx-auto max-w-4xl">
            <div className="mb-12 text-center">
              <h2 className="text-2xl font-semibold text-slate-900 sm:text-3xl">
                Our Mission
              </h2>
              <p className="mx-auto mt-4 max-w-2xl leading-relaxed text-slate-600">
                To make commercial real estate discovery transparent, data-driven, and ready for enterprise decision-making.
              </p>
            </div>

            <AboutMissionCards />
          </div>
        </Container>
      </section>

      <section className="border-t border-slate-200 bg-white py-16 lg:py-20">
        <Container>
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-semibold text-slate-900 sm:text-3xl">Who We Serve</h2>
            <p className="mt-3 text-slate-600">
              Trusted by India&apos;s most discerning commercial real estate stakeholders.
            </p>
          </div>

          <div className="mx-auto grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-3">
            {[
              { icon: <TrendingUp className="h-5 w-5" />, label: "HNI Investors" },
              { icon: <Building2 className="h-5 w-5" />, label: "Corporate Tenants" },
              { icon: <Award className="h-5 w-5" />, label: "Asset Managers" },
              { icon: <Globe className="h-5 w-5" />, label: "Institutional Funds" },
              { icon: <Users className="h-5 w-5" />, label: "Startup Founders" },
              { icon: <Handshake className="h-5 w-5" />, label: "CRE Brokers" },
            ].map((persona) => (
              <Card key={persona.label} padding="sm" className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-500/10 text-accent-400">
                  {persona.icon}
                </span>
                <span className="text-sm font-medium text-navy-200">{persona.label}</span>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <LeadCaptureBar
        title="Partner with CredXP"
        subtitle="Whether you're a developer, broker, or institutional investor — let's build together."
      />
    </>
  );
}
