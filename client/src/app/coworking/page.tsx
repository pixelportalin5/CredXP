import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import LeadCaptureBar from "@/components/lead/LeadCaptureBar";
import { Landmark, MapPin, Users, Wifi, ArrowRight } from "lucide-react";
import Link from "next/link";
import { coworkingPartnerLogos } from "@/config/coworkingLogos";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Coworking Spaces – Flexible Workspace Solutions",
  description:
    "Discover and book coworking spaces from India's top operators — WeWork, AWFIS, Smartworks, BHIVE, Regus, and more.",
};

export default function CoworkingPage() {
  const operators = coworkingPartnerLogos.map((logo) => ({
    ...logo,
    location: {
      WeWork: "Cyber City, Gurugram",
      AWFIS: "DLF Cyber Hub, Gurugram",
      Smartworks: "Golf Course Road, Gurugram",
      BHIVE: "Sohna Road, Gurugram",
      Regus: "MG Road, Gurugram",
      "91springboard": "Sector 44, Gurugram",
    }[logo.name],
    seats: {
      WeWork: "4,870+ seats",
      AWFIS: "3,200+ seats",
      Smartworks: "2,500+ seats",
      BHIVE: "1,800+ seats",
      Regus: "1,500+ seats",
      "91springboard": "2,100+ seats",
    }[logo.name],
    type: {
      WeWork: "Enterprise hubs",
      AWFIS: "Managed offices",
      Smartworks: "Enterprise workspace",
      BHIVE: "Flexible workspace",
      Regus: "Business centres",
      "91springboard": "Co-working hubs",
    }[logo.name],
  }));

  return (
    <>
      <section className="blue-hero-bg border-b border-white/10 py-16 text-white lg:py-20">
        <Container size="xl">
          <Badge variant="accent" icon={<Landmark className="h-3 w-3" />} className="mb-4">
            Coworking Aggregator
          </Badge>
          <h1 className="max-w-2xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Flexible Workspace Solutions for Enterprise Teams
          </h1>
          <p className="mt-3 max-w-2xl text-white/72">
            Book coworking desks, private offices, and enterprise suites from 15+ partner operators across India&apos;s top commercial hubs.
          </p>
        </Container>
      </section>

      <section className="bg-slate-50 py-16 lg:py-20">
        <Container size="xl">
          <SectionHeader
            eyebrow="Operator Network"
            title="Partner Coworking Spaces"
            subtitle="Compare pricing, amenities, and availability across operators in a structured workspace directory."
          />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {operators.map((space) => (
              <Card key={space.name} hover padding="md" className="flex flex-col">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div className="flex h-16 items-center">
                    <Image
                      src={space.src}
                      alt={space.name}
                      width={150}
                      height={48}
                      className={space.imageClassName}
                    />
                  </div>
                  <Badge variant="accent" size="sm">Verified</Badge>
                </div>
                <p className="mb-2 flex items-center gap-1.5 text-sm text-slate-600">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  {space.location}
                </p>
                <p className="mb-2 flex items-center gap-1.5 text-sm text-slate-600">
                  <Users className="h-3.5 w-3.5 text-slate-400" />
                  {space.seats}
                </p>
                <p className="mb-4 flex items-center gap-1.5 text-sm text-slate-600">
                  <Wifi className="h-3.5 w-3.5 text-slate-400" />
                  {space.type}
                </p>
                <div className="mt-auto flex gap-3">
                  <Button variant="outline" size="sm" fullWidth disabled>
                    View Details
                  </Button>
                  <Button variant="primary" size="sm" fullWidth disabled>
                    Compare
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <LeadCaptureBar
        title="Need Help Finding the Right Coworking Space?"
        subtitle="Our workspace advisors will match you with the perfect operator."
      />
    </>
  );
}
