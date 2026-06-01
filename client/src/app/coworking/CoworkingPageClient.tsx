"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, ExternalLink, Landmark, MapPin, Users, Wifi } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import LeadCaptureBar from "@/components/lead/LeadCaptureBar";
import coworkingService from "@/services/coworking.service";
import type { CoworkingSpace } from "@/types/coworking";

export default function CoworkingPageClient() {
  const [spaces, setSpaces] = useState<CoworkingSpace[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSpaces() {
      try {
        const res = await coworkingService.getAll();
        setSpaces(res.data);
      } finally {
        setLoading(false);
      }
    }

    void fetchSpaces();
  }, []);

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
            Book coworking desks, private offices, and managed suites at Iris Tech Park, Sector 48.
          </p>
        </Container>
      </section>

      <section className="bg-slate-50 py-16 lg:py-20">
        <Container size="xl">
          <SectionHeader
            eyebrow="Operator Network"
            title="Partner Coworking Spaces"
            subtitle="Compare pricing, amenities, and availability across curated coworking spaces."
          />

          {loading ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {[1, 2].map((item) => (
                <Card key={item} padding="md" className="h-80 animate-pulse border-slate-200 bg-white shadow-sm">
                  <span className="sr-only">Loading coworking space</span>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {spaces.map((space) => (
                <Card key={space._id} hover padding="none" className="flex flex-col overflow-hidden border-slate-200 bg-white shadow-sm">
                  <Link href={`/coworking/${space._id}`} className="group block">
                    <div className="relative h-56 overflow-hidden bg-slate-100">
                      <Image
                        src={space.images[0] || "/images/office1.png"}
                        alt={space.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        unoptimized={space.images[0]?.startsWith("data:")}
                      />
                      <div className="absolute left-4 top-4">
                        <Badge variant="accent" size="sm">Verified</Badge>
                      </div>
                    </div>
                  </Link>
                  <div className="flex flex-1 flex-col p-5">
                    <div className="mb-4">
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent-500">{space.operator}</p>
                      <h2 className="mt-2 text-xl font-semibold text-slate-950">{space.title}</h2>
                    </div>
                    <p className="mb-2 flex items-center gap-1.5 text-sm text-slate-600">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                      {space.location.address}, {space.location.city}
                    </p>
                    <p className="mb-2 flex items-center gap-1.5 text-sm text-slate-600">
                      <Users className="h-3.5 w-3.5 text-slate-400" />
                      {space.priceLabel}
                    </p>
                    <p className="mb-5 flex items-center gap-1.5 text-sm text-slate-600">
                      <Wifi className="h-3.5 w-3.5 text-slate-400" />
                      {space.workspaceType}
                    </p>
                    <div className="mt-auto flex flex-col gap-3 sm:flex-row">
                      <Link href={`/coworking/${space._id}`} className="flex-1">
                        <Button variant="primary" size="sm" fullWidth iconRight={<ArrowRight className="h-4 w-4" />}>
                          View Details
                        </Button>
                      </Link>
                      {space.website && (
                        <a href={space.website} target="_blank" rel="noopener noreferrer" className="flex-1">
                          <Button variant="outline" size="sm" fullWidth icon={<ExternalLink className="h-4 w-4" />} className="border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50">
                            Visit Website
                          </Button>
                        </a>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Container>
      </section>

      <LeadCaptureBar
        title="Need Help Finding the Right Coworking Space?"
        subtitle="Our workspace advisors will match you with the perfect operator."
      />
    </>
  );
}
