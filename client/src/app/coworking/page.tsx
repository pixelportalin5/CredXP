import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import LeadCaptureBar from "@/components/lead/LeadCaptureBar";
import { Landmark, MapPin, Users, Wifi, ArrowRight } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Coworking Spaces – Flexible Workspace Solutions",
  description:
    "Discover and book coworking spaces from India's top operators — WeWork, AWFIS, Smartworks, BHIVE, Regus, and more.",
};

export default function CoworkingPage() {
  const operators = [
    { name: "WeWork", location: "Cyber City, Gurugram", seats: "4,870+ seats", type: "Enterprise hubs" },
    { name: "AWFIS", location: "DLF Cyber Hub, Gurugram", seats: "3,200+ seats", type: "Managed offices" },
    { name: "Smartworks", location: "Golf Course Road, Gurugram", seats: "2,500+ seats", type: "Enterprise workspace" },
    { name: "BHIVE", location: "Sohna Road, Gurugram", seats: "1,800+ seats", type: "Flexible workspace" },
    { name: "Regus", location: "MG Road, Gurugram", seats: "1,500+ seats", type: "Business centres" },
    { name: "91springboard", location: "Sector 44, Gurugram", seats: "2,100+ seats", type: "Co-working hubs" },
  ];

  return (
    <>
      <section className="border-b border-slate-200 bg-white py-16 lg:py-20">
        <Container size="xl">
          <Badge variant="accent" icon={<Landmark className="h-3 w-3" />} className="mb-4">
            Coworking Aggregator
          </Badge>
          <h1 className="max-w-2xl text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Flexible Workspace Solutions for Enterprise Teams
          </h1>
          <p className="mt-3 max-w-2xl text-slate-600">
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
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900">{space.name}</h3>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Partner</p>
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
