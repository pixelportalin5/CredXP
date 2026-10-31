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
import Link from "next/link";
import { fetchListingCountsForSeo } from "@/lib/seo";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "About CredXP – Commercial Real Estate Advisory in Gurugram",
  description:
    "CredXP is a Gurugram-based commercial real estate advisory and marketplace helping investors buy pre-leased property and businesses lease offices and shops across Delhi NCR.",
  alternates: { canonical: "/about" },
};

export default async function AboutPage() {
  const counts = await fetchListingCountsForSeo();

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
            CredXP is a commercial real estate advisory and property marketplace based in Gurugram, Haryana. We help investors find pre-leased offices and shops, and help businesses find office, retail and coworking space across Gurugram and Delhi NCR.
          </p>
        </Container>
      </section>

      <section className="border-b border-slate-200 bg-slate-50 py-14">
        <Container size="md">
          <AboutStatsSection counts={counts} />
        </Container>
      </section>

      <section className="border-b border-slate-200 bg-white py-14">
        <Container size="md">
          <h2 className="text-2xl font-semibold text-slate-900 sm:text-3xl">What CredXP Does</h2>
          <ul className="mt-6 space-y-3 text-slate-700">
            <li>
              <strong>Pre-leased property investment:</strong> we list commercial offices and shops that already have a
              tenant, along with the rent, lease terms and gross yield the seller has shared.{" "}
              <Link href="/invest" className="text-accent-500 hover:underline">Browse investment listings</Link>.
            </li>
            <li>
              <strong>Office and retail leasing:</strong> we help businesses find office space and shops to rent in
              Gurugram.{" "}
              <Link href="/lease" className="text-accent-500 hover:underline">See spaces for lease</Link>.
            </li>
            <li>
              <strong>Coworking:</strong> we work with flexible-workspace operators to match teams with coworking and
              managed offices.{" "}
              <Link href="/coworking" className="text-accent-500 hover:underline">View coworking spaces</Link>.
            </li>
            <li>
              <strong>Investor education:</strong> plain-English guides on yields, leases and due diligence.{" "}
              <Link href="/guides" className="text-accent-500 hover:underline">Read the guides</Link>.
            </li>
          </ul>
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
              The people and teams we help find, evaluate and secure commercial space.
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
