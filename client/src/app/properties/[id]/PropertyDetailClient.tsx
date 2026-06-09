"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, MapPin, Building2, CheckCircle2, TrendingUp,
  Clock, FileText, Heart, Download,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import PropertyGallery from "@/components/property/PropertyGallery";
import PropertyEnquiryForm from "@/components/property/PropertyEnquiryForm";
import { useAuth } from "@/components/providers/AuthProvider";
import { useToast } from "@/components/providers/ToastProvider";
import propertyService from "@/services/property.service";
import savedPropertyService from "@/services/saved-property.service";
import { formatPrice, formatSize, formatPricePerSqft, formatDate, formatPriceCompact, formatYield } from "@/utils/format";
import { getListingDirectoryPath } from "@/utils/propertyFilterParams";
import type { Property } from "@/types/property";
import { isStaff } from "@/utils/roles";

/* ============================================================
   PropertyDetailClient — Decomposed Property Detail Page
   ============================================================ */

export default function PropertyDetailClient() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

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
          <Link href="/invest" className="inline-block mt-6">
            <Button variant="primary" size="md" icon={<ArrowLeft className="h-4 w-4" />}>
              Back to listings
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

  const handleEnquireClick = () => {
    document.getElementById("property-enquiry-form")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const handleSaveClick = async () => {
    if (!user) {
      showToast({ type: "info", title: "Login required", message: "Login to save this property to your dashboard." });
      return;
    }

    try {
      setSaving(true);
      if (saved) {
        await savedPropertyService.remove(_id);
        setSaved(false);
        showToast({ type: "success", title: "Removed from saved" });
      } else {
        await savedPropertyService.save(_id);
        setSaved(true);
        showToast({ type: "success", title: "Property saved" });
      }
    } catch (err) {
      showToast({ type: "error", title: "Save failed", message: err instanceof Error ? err.message : "Please try again." });
    } finally {
      setSaving(false);
    }
  };

  const detailTabs = ["Overview", "Details", "Tenant Profile", "Financials", "Documents", "Location"];
  const keyHighlights = highlights && highlights.length > 0
    ? highlights
    : [
        `${formatSize(size)} commercial space`,
        `${occupancy ? `${occupancy}% occupied` : "Occupancy available on request"}`,
        financials?.escalation ? `Rent escalation: ${financials.escalation}` : "Commercial terms available on request",
        reraId ? `RERA No: ${reraId}` : "RERA details available on request",
      ];
  const locationAdvantages = [
    location.landmark || `${location.city} commercial catchment`,
    `${location.city}, ${location.state}`,
    location.micromarket || "Established business micro-market",
    "Connectivity details available on request",
  ];
  const tenantRows = [
    { label: "Tenant", value: tenant?.name || "Blue-chip tenant mix" },
    { label: "Industry", value: tenant?.industry || "Enterprise occupiers" },
    { label: "Lease Expiry", value: tenant?.leaseExpiry || "—" },
    { label: "Lock-in", value: tenant?.lockInPeriod || "—" },
    { label: "Occupancy", value: occupancy ? `${occupancy}%` : "—" },
    { label: "Furnishing", value: specs?.furnishing || "—" },
  ];
  const financialRows = [
    { label: "Price", value: formatPrice(price) },
    { label: "Price per Sqft", value: formatPricePerSqft(price, size) },
    { label: "Rental Yield", value: financials?.rentalYield ? formatYield(financials.rentalYield) : "—" },
    { label: "Cap Rate", value: financials?.capRate ? `${financials.capRate.toFixed(2)}%` : "—" },
    { label: "Security Deposit", value: financials?.securityDeposit ? formatPrice(financials.securityDeposit) : "—" },
    { label: "Escalation", value: financials?.escalation || "—" },
  ];
  const specificationRows = [
    { label: "Floor Area", value: formatSize(size) },
    { label: "Property Type", value: type },
    { label: "Building", value: property.buildingName || "—" },
    { label: "Grade", value: grade ? `Grade ${grade}` : "—" },
    { label: "Parking", value: specs?.parking ? `${specs.parking}` : "—" },
    { label: "Workstations", value: specs?.workstations ? `${specs.workstations}` : "—" },
    { label: "Meeting Rooms", value: specs?.meetingRooms ? `${specs.meetingRooms}` : "—" },
    { label: "Washrooms", value: specs?.washrooms ? `${specs.washrooms}` : "—" },
  ];

  const listingsPath = getListingDirectoryPath(property);

  return (
    <Container as="section" size="xl" className="py-10 lg:py-14">
      <Link
        href={listingsPath}
        className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
        id="back-to-properties"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to {listingsPath === "/lease" ? "lease listings" : "investments"}
      </Link>

      <Card padding="lg" className="mb-8 overflow-hidden border-slate-200 bg-white shadow-[0_18px_48px_rgba(15,23,42,0.08)]">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.12fr)_minmax(340px,0.88fr)] lg:items-start">
          <div className="[&>div]:mb-0">
            <PropertyGallery images={images} title={title} />
          </div>

          <div className="flex h-full flex-col">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <Badge variant="accent">{type}</Badge>
              <Badge variant={STATUS_VARIANT as "warning" | "success"} icon={STATUS_ICON}>
                {status}
              </Badge>
              {grade && <Badge variant="info">Grade {grade}</Badge>}
              {reraId && <Badge variant="outline">RERA Registered</Badge>}
            </div>

            <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              {property.buildingName || title}
            </h1>
            <p className="mt-2 text-lg font-semibold text-slate-800">{title}</p>
            <p className="mt-3 flex items-start gap-2 text-sm leading-6 text-slate-600">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent-500" />
              <span>{location.address}, {location.city}, {location.state}</span>
            </p>

            <div className="mt-7 grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Price</p>
                <p className="mt-2 text-3xl font-semibold text-slate-950">{formatPriceCompact(price)}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Current Yield</p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">
                  {financials?.rentalYield ? formatYield(financials.rentalYield) : "—"}
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Area</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">{formatSize(size)}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Price per Sqft</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">{formatPricePerSqft(price, size)}</p>
              </div>
            </div>

            <div className="mt-auto pt-7">
              {isStaff(user?.role) ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <Button type="button" size="lg" fullWidth onClick={handleEnquireClick} className="h-[52px] shadow-lg shadow-accent-500/20">
                    Enquire Now
                  </Button>
                  <Link href={`/properties/${_id}/proposal`} className="block">
                    <Button type="button" size="lg" fullWidth className="h-[52px] shadow-lg shadow-accent-500/20">
                      Create Proposal
                    </Button>
                  </Link>
                </div>
              ) : (
                <Button type="button" size="lg" fullWidth onClick={handleEnquireClick} className="h-[52px] shadow-lg shadow-accent-500/20">
                  Enquire Now
                </Button>
              )}
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <Button type="button" variant="outline" size="md" icon={<Download className="h-4 w-4" />} className="border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50">
                  Download Brochure
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  icon={<Heart className={`h-4 w-4 ${saved ? "fill-current" : ""}`} />}
                  loading={saving}
                  onClick={handleSaveClick}
                  className="border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                >
                  {saved ? "Saved" : "Add to Shortlist"}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 overflow-x-auto border-t border-slate-200 pt-5">
          <div className="flex min-w-max gap-8">
            {detailTabs.map((tab, index) => (
              <a
                key={tab}
                href={`#property-${tab.toLowerCase().replace(/\s+/g, "-")}`}
                className="relative pb-3 text-sm font-semibold text-slate-600 transition-colors hover:text-slate-950"
              >
                {tab}
                {index === 0 && <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-accent-500" />}
              </a>
            ))}
          </div>
        </div>
      </Card>

      <div id="property-overview" className="grid gap-8 lg:grid-cols-2">
        <Card padding="lg" className="shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Key Highlights</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">{description}</p>
          <div className="mt-5 space-y-3">
            {keyHighlights.map((highlight) => (
              <div key={highlight} className="flex gap-3 text-sm leading-6 text-slate-700">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent-500" />
                <span>{highlight}</span>
              </div>
            ))}
          </div>
          {createdAt && (
            <p className="mt-5 text-xs text-slate-500">Listed on {formatDate(createdAt)}</p>
          )}
        </Card>

        <div id="property-location" className="scroll-mt-28">
          <Card padding="lg" className="h-full shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Location Advantage</h2>
            <div className="mt-5 space-y-3">
              {locationAdvantages.map((advantage) => (
                <div key={advantage} className="flex gap-3 text-sm leading-6 text-slate-700">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent-500" />
                  <span>{advantage}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div id="property-tenant-profile" className="scroll-mt-28">
          <Card padding="lg" className="h-full shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Tenant Profile</h2>
            <div className="mt-5 divide-y divide-slate-200 text-sm">
              {tenantRows.map((row) => (
                <div key={row.label} className="flex justify-between gap-4 py-3">
                  <span className="text-slate-500">{row.label}</span>
                  <span className="text-right font-semibold text-slate-900">{row.value}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div id="property-financials" className="scroll-mt-28">
          <Card padding="lg" className="h-full shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Financials</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {financialRows.map((row) => (
                <div key={row.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{row.label}</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">{row.value}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div id="property-details" className="scroll-mt-28">
          <Card padding="lg" className="h-full shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Details</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {specificationRows.map((row) => (
                <div key={row.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{row.label}</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">{row.value}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card padding="lg" className="shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Amenities</h2>
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {amenities.map((amenity) => (
              <div key={amenity} className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                {amenity}
              </div>
            ))}
          </div>
        </Card>

        <div id="property-documents" className="scroll-mt-28 lg:col-span-2">
          <Card padding="lg" className="shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Documents</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {[
                { label: "RERA Certificate", value: reraId || "Available on request" },
                { label: "Brochure", value: "Available on request" },
                { label: "Due Diligence", value: "Available on request" },
              ].map((document) => (
                <div key={document.label} className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <FileText className="mt-0.5 h-4 w-4 shrink-0 text-accent-500" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{document.label}</p>
                    <p className="mt-1 text-xs text-slate-500">{document.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <section id="property-enquiry-form" className="scroll-mt-28 pt-10">
        <PropertyEnquiryForm propertyTitle={title} propertyId={_id} />
      </section>
    </Container>
  );
}
