import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { StatsBar } from "@/components/shared/StatCard";
import LeadCaptureBar from "@/components/lead/LeadCaptureBar";
import { siteConfig } from "@/config/site";
import {
  Building2, Target, Users, ShieldCheck,
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
      <section className="border-b border-slate-200 bg-white py-16 lg:py-24">
        <Container size="lg" className="text-center">
          <Badge variant="accent" icon={<Building2 className="h-3 w-3" />} className="mb-4">
            About Us
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            Transforming Commercial <span className="text-accent-500">Real Estate Discovery</span>
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-slate-600">
            CredXP is India&apos;s premium commercial real estate intelligence platform, connecting investors, occupiers, and advisors with structured property discovery and institutional market data.
          </p>
        </Container>
      </section>

      <section className="border-b border-slate-200 bg-slate-50 py-14">
        <Container size="md">
          <StatsBar
            stats={[
              { value: "50M+", label: "Sq. Ft. Portfolio" },
              { value: "200+", label: "Assets" },
              { value: "150+", label: "Blue-Chip Tenants" },
              { value: "15+", label: "Coworking Partners" },
            ]}
          />
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

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {[
                {
                  icon: <Target className="h-6 w-6" />,
                  title: "Investment Intelligence",
                  description: "Data-driven insights and yield analytics for pre-leased investments and commercial assets.",
                },
                {
                  icon: <Handshake className="h-6 w-6" />,
                  title: "Enterprise Leasing",
                  description: "End-to-end corporate leasing solutions for Grade A office spaces across India's top markets.",
                },
                {
                  icon: <Globe className="h-6 w-6" />,
                  title: "Coworking Aggregation",
                  description: "India's largest flex-space aggregation platform — compare and book from 15+ operators.",
                },
                {
                  icon: <ShieldCheck className="h-6 w-6" />,
                  title: "Trust & Transparency",
                  description: "RERA-compliant, verified properties with complete due-diligence documentation.",
                },
              ].map((value) => (
                <Card key={value.title} hover padding="md">
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-accent-500/10 text-accent-500">
                    {value.icon}
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-slate-900">{value.title}</h3>
                  <p className="text-sm leading-relaxed text-slate-600">{value.description}</p>
                </Card>
              ))}
            </div>
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
