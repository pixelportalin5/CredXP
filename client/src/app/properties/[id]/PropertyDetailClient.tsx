"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, MapPin, Ruler, IndianRupee, Tag, Building2,
  Phone, Mail, CheckCircle2, TrendingUp, Clock, ShieldCheck, Route,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import PropertyGallery from "@/components/property/PropertyGallery";
import PropertyEnquiryForm from "@/components/property/PropertyEnquiryForm";
import propertyService from "@/services/property.service";
import { formatPrice, formatSize, formatPricePerSqft, formatDate, formatPriceCompact, formatYield } from "@/utils/format";
import { siteConfig } from "@/config/site";
import type { Property } from "@/types/property";

/* ============================================================
   PropertyDetailClient — Decomposed Property Detail Page
   ============================================================ */

export default function PropertyDetailClient() {
  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProperty() {
      if (!id || id === "undefined" || id === "null") {
        setLoading(false);
        setError("Invalid property ID");
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const res = await propertyService.getById(id);
        setProperty(res.data);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Property not found";
        setError(message);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchProperty();
  }, [id]);

  // ── Loading State ──
  if (loading) {
    return (
      <Container className="py-12 animate-pulse">
        <Skeleton className="mb-8 h-5 w-40" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-5 mb-10">
          <Skeleton className="md:col-span-3 h-72 sm:h-80" rounded="2xl" />
          <div className="md:col-span-2 grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-36 sm:h-[9.5rem]" rounded="xl" />
            ))}
          </div>
        </div>
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-24" rounded="xl" />
              ))}
            </div>
            <Skeleton className="h-40" rounded="2xl" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-48" rounded="2xl" />
            <Skeleton className="h-72" rounded="2xl" />
          </div>
        </div>
      </Container>
    );
  }

  // ── Error State ──
  if (error || !property) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center px-4">
        <div className="text-center">
          <Building2 className="mx-auto h-12 w-12 text-navy-600" />
          <h2 className="mt-4 text-xl font-bold text-navy-50">Property Not Found</h2>
          <p className="mt-2 max-w-sm text-sm text-navy-400">
            {error || "This property does not exist or has been removed."}
          </p>
          <Link href="/properties" className="inline-block mt-6">
            <Button variant="primary" size="md" icon={<ArrowLeft className="h-4 w-4" />}>
              Back to Properties
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const {
    _id, title, type, location, price, size, amenities,
    images, status, description, createdAt, financials, grade,
    tenant, specs, occupancy, highlights, reraId,
  } = property;

  const STATUS_ICON = status === "Trending"
    ? <TrendingUp className="h-3.5 w-3.5" />
    : <Clock className="h-3.5 w-3.5" />;

  const STATUS_VARIANT = status === "Trending" ? "warning" : "success";

  return (
    <Container as="section" size="xl" className="py-10 lg:py-14">
      <Link
        href="/properties"
        className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
        id="back-to-properties"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Properties
      </Link>

      <div className="mb-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <Card padding="lg" className="shadow-sm">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <Badge variant="accent">{type}</Badge>
            <Badge variant={STATUS_VARIANT as "warning" | "success"} icon={STATUS_ICON}>
              {status}
            </Badge>
            {grade && <Badge variant="info">Grade {grade}</Badge>}
            {occupancy && <Badge variant="outline">{occupancy}% Occupied</Badge>}
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                {title}
              </h1>
              <p className="mt-3 flex items-center gap-1.5 text-sm text-slate-600">
                <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
                {location.address}, {location.city}, {location.state}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2">
              {[
                { label: "Price", value: formatPriceCompact(price) },
                { label: "Area", value: formatSize(size) },
                { label: "Per Sqft", value: formatPricePerSqft(price, size) },
                { label: "Yield", value: financials?.rentalYield ? formatYield(financials.rentalYield) : "—" },
              ].map((metric) => (
                <div key={metric.label} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">{metric.label}</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">{metric.value}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card padding="md" className="border-slate-200 shadow-sm">
          <div className="mb-1 flex items-baseline gap-1 text-3xl font-semibold text-slate-900">
            {formatPrice(price)}
            <span className="text-sm font-normal text-slate-500">/month</span>
          </div>
          <p className="mb-5 text-sm text-slate-500">
            {formatPricePerSqft(price, size)} &bull; {formatSize(size)}
          </p>

          {financials?.rentalYield && (
            <div className="mb-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">Expected Yield</p>
              <p className="mt-1 text-2xl font-semibold text-emerald-700">{financials.rentalYield.toFixed(2)}%</p>
            </div>
          )}

          <div className="space-y-3 text-sm text-slate-600">
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 shrink-0 text-slate-400" />
              <a href={`tel:${siteConfig.contact.phone}`} className="transition-colors hover:text-slate-900">
                {siteConfig.contact.phone}
              </a>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 shrink-0 text-slate-400" />
              <a href={`mailto:${siteConfig.contact.email}`} className="transition-colors hover:text-slate-900">
                {siteConfig.contact.email}
              </a>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <Link href="/contact" className="inline-flex flex-1 items-center justify-center rounded-xl bg-accent-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-600">
              Request Brochure
            </Link>
            <Link href="/contact" className="inline-flex flex-1 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50">
              Speak to Advisor
            </Link>
          </div>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
        <div className="space-y-8">
          <PropertyGallery images={images} title={title} />

          <Card padding="lg" className="shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Investment Overview</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">{description}</p>
            {highlights && highlights.length > 0 && (
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {highlights.map((highlight) => (
                  <div key={highlight} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                    {highlight}
                  </div>
                ))}
              </div>
            )}
            {createdAt && (
              <p className="mt-4 text-xs text-slate-500">Listed on {formatDate(createdAt)}</p>
            )}
          </Card>

          <div className="grid gap-6 xl:grid-cols-2">
            <Card padding="lg" className="shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Lease & Tenant Profile</h2>
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <div className="flex justify-between gap-4 border-b border-slate-200 pb-2">
                  <span>Tenant</span>
                  <span className="font-medium text-slate-900">{tenant?.name || "Blue-chip tenant mix"}</span>
                </div>
                <div className="flex justify-between gap-4 border-b border-slate-200 pb-2">
                  <span>Industry</span>
                  <span className="font-medium text-slate-900">{tenant?.industry || "Enterprise occupiers"}</span>
                </div>
                <div className="flex justify-between gap-4 border-b border-slate-200 pb-2">
                  <span>Lease Expiry</span>
                  <span className="font-medium text-slate-900">{tenant?.leaseExpiry || "—"}</span>
                </div>
                <div className="flex justify-between gap-4 border-b border-slate-200 pb-2">
                  <span>Lock-in</span>
                  <span className="font-medium text-slate-900">{tenant?.lockInPeriod || "—"}</span>
                </div>
                <div className="flex justify-between gap-4 border-b border-slate-200 pb-2">
                  <span>Occupancy</span>
                  <span className="font-medium text-slate-900">{occupancy ? `${occupancy}%` : "—"}</span>
                </div>
                {specs?.furnishing && (
                  <div className="flex justify-between gap-4">
                    <span>Furnishing</span>
                    <span className="font-medium text-slate-900">{specs.furnishing}</span>
                  </div>
                )}
              </div>
            </Card>

            <Card padding="lg" className="shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Key Specifications</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  { label: "Floor Area", value: formatSize(size) },
                  { label: "Property Type", value: type },
                  { label: "RERA ID", value: reraId || "—" },
                  { label: "Cap Rate", value: financials?.capRate ? `${financials.capRate.toFixed(2)}%` : "—" },
                  { label: "Escalation", value: financials?.escalation || "—" },
                  { label: "Price / Month", value: formatPrice(price) },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">{item.label}</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">{item.value}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <Card padding="lg" className="shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Amenities</h2>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {amenities.map((amenity) => (
                <div key={amenity} className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                  {amenity}
                </div>
              ))}
            </div>
          </Card>

          <Card padding="lg" className="shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-slate-900">Location Advantage</h2>
              <Badge variant="outline" icon={<Route className="h-3 w-3" />}>Map View</Badge>
            </div>
            <div className="mt-4 rounded-3xl border border-pink-200 bg-[linear-gradient(135deg,rgba(252,231,243,0.96),rgba(253,242,248,1))] p-6">
              <div className="flex min-h-[220px] items-center justify-center rounded-2xl border border-slate-200 bg-white/80 text-center">
                <div>
                  <Building2 className="mx-auto h-12 w-12 text-accent-500" />
                  <p className="mt-3 text-sm font-medium text-slate-900">Map preview placeholder</p>
                  <p className="mt-1 text-xs text-slate-500">{location.landmark || `${location.city}, ${location.state}`}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card padding="lg" className="sticky top-24 shadow-sm">
            <div className="mb-1 text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Investment Dashboard</div>
            <div className="mb-5 flex items-baseline gap-1 text-3xl font-semibold text-slate-900">
              {formatPrice(price)}
              <span className="text-sm font-normal text-slate-500">/month</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Price per Sqft</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">{formatPricePerSqft(price, size)}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Yield</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">{financials?.rentalYield ? formatYield(financials.rentalYield) : "—"}</p>
              </div>
            </div>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-4 w-4 text-slate-400" />
                Institutional verification available
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-slate-400" />
                <a href={`tel:${siteConfig.contact.phone}`} className="hover:text-slate-900">{siteConfig.contact.phone}</a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-slate-400" />
                <a href={`mailto:${siteConfig.contact.email}`} className="hover:text-slate-900">{siteConfig.contact.email}</a>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <Link href="/contact" className="inline-flex flex-1 items-center justify-center rounded-xl bg-accent-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-600">
                Request Brochure
              </Link>
              <Link href="/contact" className="inline-flex flex-1 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50">
                Schedule Call
              </Link>
            </div>
          </Card>

          <PropertyEnquiryForm propertyTitle={title} propertyId={_id} />
        </div>
      </div>
    </Container>
  );
}
