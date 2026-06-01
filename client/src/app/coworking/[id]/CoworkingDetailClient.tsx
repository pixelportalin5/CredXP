"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Building2, CheckCircle2, Clock, ExternalLink, MapPin, Users, Wifi } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import PropertyGallery from "@/components/property/PropertyGallery";
import PropertyEnquiryForm from "@/components/property/PropertyEnquiryForm";
import coworkingService from "@/services/coworking.service";
import { formatPrice, formatDate } from "@/utils/format";
import type { CoworkingSpace } from "@/types/coworking";

export default function CoworkingDetailClient() {
  const { id } = useParams<{ id: string }>();
  const [space, setSpace] = useState<CoworkingSpace | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSpace() {
      if (!id || id === "undefined" || id === "null") {
        setLoading(false);
        setError("Invalid coworking space ID");
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const res = await coworkingService.getById(id);
        setSpace(res.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Coworking space not found");
      } finally {
        setLoading(false);
      }
    }

    void fetchSpace();
  }, [id]);

  if (loading) {
    return (
      <Container className="py-12 animate-pulse">
        <Skeleton className="mb-8 h-5 w-40" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-5 mb-10">
          <Skeleton className="md:col-span-3 h-72 sm:h-80" rounded="2xl" />
          <div className="md:col-span-2 grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((item) => (
              <Skeleton key={item} className="h-36 sm:h-[9.5rem]" rounded="xl" />
            ))}
          </div>
        </div>
      </Container>
    );
  }

  if (error || !space) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center px-4">
        <div className="text-center">
          <Building2 className="mx-auto h-12 w-12 text-slate-400" />
          <h2 className="mt-4 text-xl font-bold text-slate-900">Coworking Space Not Found</h2>
          <p className="mt-2 max-w-sm text-sm text-slate-500">
            {error || "This coworking space does not exist or has been removed."}
          </p>
          <Link href="/coworking" className="mt-6 inline-block">
            <Button variant="primary" size="md" icon={<ArrowLeft className="h-4 w-4" />}>
              Back to Coworking
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleEnquireClick = () => {
    document.getElementById("property-enquiry-form")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const detailTabs = ["Overview", "Workspace Details", "Amenities", "Pricing", "Location"];
  const locationAdvantages = [
    space.location.landmark || "Iris Tech Park",
    `${space.location.city}, ${space.location.state}`,
    space.location.micromarket || "Sector 48",
    "Connectivity details available on request",
  ];
  const workspaceRows = [
    { label: "Operator", value: space.operator },
    { label: "Workspace Type", value: space.workspaceType },
    { label: "Starting Seat Price", value: `${formatPrice(space.monthlySeatPrice)} / month` },
    { label: "Location", value: `${space.location.address}, ${space.location.city}` },
    { label: "Private Cabins", value: space.specs?.privateCabins ? "Available" : "On request" },
    { label: "Meeting Rooms", value: space.specs?.meetingRooms ? "Available" : "On request" },
  ];

  return (
    <Container as="section" size="xl" className="py-10 lg:py-14">
      <Link
        href="/coworking"
        className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Coworking
      </Link>

      <Card padding="lg" className="mb-8 overflow-hidden border-slate-200 bg-white shadow-[0_18px_48px_rgba(15,23,42,0.08)]">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.12fr)_minmax(340px,0.88fr)] lg:items-start">
          <div className="[&>div]:mb-0">
            <PropertyGallery images={space.images} title={space.title} />
          </div>

          <div className="flex h-full flex-col">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <Badge variant="accent">Coworking Space</Badge>
              <Badge variant="success" icon={<Clock className="h-3.5 w-3.5" />}>Available</Badge>
            </div>

            <h1 className="text-3xl font-semibold tracking-tight text-slate-950 lg:text-4xl">{space.title}</h1>
            <p className="mt-3 flex items-start gap-2 text-sm leading-6 text-slate-600">
              <MapPin className="mt-0.5 h-4 w-4 text-accent-500" />
              <span>{space.location.address}, {space.location.city}, {space.location.state}</span>
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              {[
                { label: "Starts At", value: `${formatPrice(space.monthlySeatPrice)}/mo`, icon: Users },
                { label: "Operator", value: space.operator, icon: Building2 },
                { label: "Type", value: space.workspaceType, icon: Wifi },
                { label: "Listed", value: formatDate(space.createdAt), icon: Clock },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <item.icon className="mb-3 h-4 w-4 text-accent-500" />
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">{item.label}</p>
                  <p className="mt-1 text-sm font-semibold text-slate-950">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-auto flex flex-col gap-3 pt-6 sm:flex-row">
              <Button size="lg" className="flex-1" onClick={handleEnquireClick}>
                Enquire Now
              </Button>
              {space.website && (
                <a href={space.website} target="_blank" rel="noopener noreferrer" className="flex-1">
                  <Button size="lg" variant="outline" fullWidth icon={<ExternalLink className="h-4 w-4" />} className="border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50">
                    Visit Website
                  </Button>
                </a>
              )}
            </div>
          </div>
        </div>
      </Card>

      <div className="mb-8 flex gap-2 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
        {detailTabs.map((tab) => (
          <button key={tab} className="whitespace-nowrap rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900">
            {tab}
          </button>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="space-y-6">
          <Card padding="lg" className="border-slate-200 bg-white shadow-sm">
            <h2 className="text-xl font-semibold text-slate-950">Overview</h2>
            <p className="mt-4 leading-7 text-slate-600">{space.description}</p>
          </Card>

          <Card padding="lg" className="border-slate-200 bg-white shadow-sm">
            <h2 className="text-xl font-semibold text-slate-950">Workspace Details</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {workspaceRows.map((row) => (
                <div key={row.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">{row.label}</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">{row.value}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card padding="lg" className="border-slate-200 bg-white shadow-sm">
            <h2 className="text-xl font-semibold text-slate-950">Amenities & Highlights</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {[...(space.highlights || []), ...space.amenities].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 text-sm font-medium text-slate-700">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  {item}
                </div>
              ))}
            </div>
          </Card>

          <Card padding="lg" className="border-slate-200 bg-white shadow-sm">
            <h2 className="text-xl font-semibold text-slate-950">Location Advantages</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {locationAdvantages.map((item) => (
                <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-medium text-slate-700">
                  {item}
                </div>
              ))}
            </div>
          </Card>
        </div>

        <aside id="property-enquiry-form" className="space-y-5 scroll-mt-28">
          <PropertyEnquiryForm
            propertyTitle={space.title}
            coworkingSpaceId={space._id}
            subjectType="coworking"
          />
        </aside>
      </div>
    </Container>
  );
}
