"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Building2, CheckCircle2, Edit3, Eye, Mail, Plus, Power, Search, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { PageLoader } from "@/components/ui/PageLoader";
import { AdminSectionSkeleton } from "@/components/ui/Skeleton";
import { EnterpriseInput } from "@/components/forms/EnterpriseForm";
import { useAuth } from "@/components/providers/AuthProvider";
import { useToast } from "@/components/providers/ToastProvider";
import enquiryService from "@/services/enquiry.service";
import propertyService from "@/services/property.service";
import { formatDate, formatPriceCompact } from "@/utils/format";
import type { Enquiry } from "@/types/enquiry";
import type { Property } from "@/types/property";

const inputClass = "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400";

function getEnquiryPropertyTitle(enquiry: Enquiry) {
  if (enquiry.coworkingSpaceId && typeof enquiry.coworkingSpaceId !== "string") {
    return enquiry.coworkingSpaceId.title;
  }
  if (!enquiry.propertyId) return "Deleted listing";
  return typeof enquiry.propertyId === "string" ? "Property" : enquiry.propertyId.title;
}

export default function SellerDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const [properties, setProperties] = useState<Property[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [query, setQuery] = useState("");
  useEffect(() => {
    if (!user) return;

    async function fetchDashboard() {
      try {
        setDashboardLoading(true);
        const [propertyRes, enquiryRes] = await Promise.all([
          propertyService.getMyProperties(),
          enquiryService.getSellerEnquiries(),
        ]);
        setProperties(propertyRes.data);
        setEnquiries(enquiryRes.data);
      } catch (error) {
        showToast({ type: "error", title: "Dashboard unavailable", message: error instanceof Error ? error.message : "Please try again." });
      } finally {
        setDashboardLoading(false);
      }
    }

    void fetchDashboard();
  }, [user, showToast]);

  const filteredEnquiries = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return enquiries;
    return enquiries.filter((enquiry) => (
      enquiry.customerName.toLowerCase().includes(normalized) ||
      enquiry.email.toLowerCase().includes(normalized) ||
      getEnquiryPropertyTitle(enquiry).toLowerCase().includes(normalized)
    ));
  }, [enquiries, query]);

  const handleDelete = async (property: Property) => {
    if (!window.confirm(`Delete ${property.title}?`)) return;
    try {
      await propertyService.delete(property._id);
      setProperties((current) => current.filter((item) => item._id !== property._id));
      showToast({ type: "success", title: "Property deleted" });
    } catch (error) {
      showToast({ type: "error", title: "Delete failed", message: error instanceof Error ? error.message : "Please try again." });
    }
  };

  const handleToggleActive = async (property: Property) => {
    const nextActive = property.isActive === false;
    setProperties((current) => current.map((item) => (
      item._id === property._id ? { ...item, isActive: nextActive } : item
    )));

    try {
      await propertyService.update(property._id, { isActive: nextActive });
      showToast({ type: "success", title: nextActive ? "Listing activated" : "Listing paused" });
    } catch (error) {
      setProperties((current) => current.map((item) => (
        item._id === property._id ? { ...item, isActive: property.isActive } : item
      )));
      showToast({ type: "error", title: "Update failed", message: error instanceof Error ? error.message : "Please try again." });
    }
  };

  const handleCloseEnquiry = async (enquiry: Enquiry) => {
    try {
      const res = await enquiryService.closeSellerEnquiry(enquiry._id);
      setEnquiries((current) => current.map((item) => item._id === enquiry._id ? res.data : item));
      showToast({ type: "success", title: "Enquiry closed", message: "The buyer can now see it in history." });
    } catch (error) {
      showToast({ type: "error", title: "Unable to close enquiry", message: error instanceof Error ? error.message : "Please try again." });
    }
  };

  if (authLoading) {
    return <PageLoader label="Checking access…" />;
  }

  if (!user) {
    return (
      <Container size="sm" className="py-16">
        <Card padding="lg" className="border-slate-200 bg-white text-center shadow-sm">
          <h1 className="text-2xl font-semibold text-slate-900">Seller login required</h1>
          <p className="mt-2 text-sm text-slate-600">Login to manage your listings and enquiries.</p>
          <Link href="/login?next=/seller/dashboard" className="mt-6 inline-block">
            <Button>Login</Button>
          </Link>
        </Card>
      </Container>
    );
  }

  return (
    <>
      <section className="blue-hero-bg border-b border-white/10 py-10 text-white lg:py-14">
        <Container size="xl">
          <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <Badge variant="accent" icon={<Building2 className="h-3 w-3" />}>Seller Dashboard</Badge>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Manage Listings & Enquiries</h1>
              <p className="mt-3 text-white/72">Welcome back, {user.name}. Your public listings and customer enquiries are below.</p>
            </div>
            <Link href="/list-property">
              <Button icon={<Plus className="h-4 w-4" />}>List Property</Button>
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            {[
              { label: "Listings", value: properties.length },
              { label: "Active", value: properties.filter((property) => property.isActive !== false).length },
              { label: "Views", value: properties.reduce((sum, property) => sum + (property.views || 0), 0) },
              { label: "Enquiries", value: enquiries.length },
            ].map((item) => (
              <Card key={item.label} padding="md" className="border-blue-100/80 bg-white/95 shadow-sm backdrop-blur">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{item.label}</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{item.value}</p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <Container size="xl" className="py-10 lg:py-14">
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
        <section>
          <h2 className="mb-4 text-xl font-semibold text-slate-900">Listed Properties</h2>
          {dashboardLoading ? (
            <AdminSectionSkeleton rows={3} />
          ) : (
          <div className="space-y-4">
            {properties.length === 0 ? (
              <Card padding="lg" className="border-slate-200 bg-white text-center shadow-sm">
                <p className="text-sm text-slate-600">No listings yet.</p>
              </Card>
            ) : properties.map((property) => (
              <Card key={property._id} padding="md" className="border-slate-200 bg-white shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-slate-900">{property.title}</h3>
                      <Badge variant={property.isActive === false ? "warning" : "success"} size="sm">
                        {property.isActive === false ? "Inactive" : "Active"}
                      </Badge>
                      <Badge variant="outline" size="sm">{property.listingStatus || "published"}</Badge>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">
                      {property.location.city}, {property.location.state} • {formatPriceCompact(property.price)} • {property.size} sqft
                    </p>
                    <p className="mt-2 text-xs text-slate-500">
                      {property.views || 0} views • {property.enquiryCount || 0} enquiries
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link href={`/properties/${property._id}`}>
                      <Button variant="outline" size="sm" icon={<Eye className="h-4 w-4" />}>View</Button>
                    </Link>
                    <Link href={`/seller/dashboard/properties/${property._id}/edit`}>
                      <Button variant="outline" size="sm" icon={<Edit3 className="h-4 w-4" />}>Edit</Button>
                    </Link>
                    <Button variant="outline" size="sm" icon={<Power className="h-4 w-4" />} onClick={() => void handleToggleActive(property)}>
                      {property.isActive === false ? "Activate" : "Deactivate"}
                    </Button>
                    <Button variant="danger" size="sm" icon={<Trash2 className="h-4 w-4" />} onClick={() => void handleDelete(property)}>Delete</Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          )}
        </section>

        <section>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <h2 className="text-xl font-semibold text-slate-900">Enquiries</h2>
            <div className="w-full sm:w-64">
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <EnterpriseInput value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search enquiries" className={`${inputClass} pl-11`} />
              </div>
            </div>
          </div>
          {dashboardLoading ? (
            <AdminSectionSkeleton rows={3} />
          ) : (
          <div className="space-y-4">
            {filteredEnquiries.length === 0 ? (
              <Card padding="lg" className="border-slate-200 bg-white text-center shadow-sm">
                <Mail className="mx-auto h-8 w-8 text-slate-400" />
                <p className="mt-3 text-sm text-slate-600">No enquiries found.</p>
              </Card>
            ) : filteredEnquiries.map((enquiry) => (
              <Card key={enquiry._id} padding="md" className="border-slate-200 bg-white shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-slate-900">{enquiry.customerName}</h3>
                      <Badge variant={enquiry.status === "closed" ? "success" : "warning"} size="sm">
                        {enquiry.status === "closed" ? "Closed" : "Active"}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-slate-600">{enquiry.email}{enquiry.phone ? ` • ${enquiry.phone}` : ""}</p>
                  </div>
                  <span className="text-xs text-slate-500">{formatDate(enquiry.createdAt)}</span>
                </div>
                <p className="mt-3 text-sm font-medium text-slate-900">{getEnquiryPropertyTitle(enquiry)}</p>
                {enquiry.message && <p className="mt-2 text-sm leading-6 text-slate-600">{enquiry.message}</p>}
                {enquiry.status !== "closed" && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    icon={<CheckCircle2 className="h-4 w-4" />}
                    onClick={() => void handleCloseEnquiry(enquiry)}
                    className="mt-4 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                  >
                    Close Enquiry
                  </Button>
                )}
              </Card>
            ))}
          </div>
          )}
        </section>
      </div>
    </Container>
    </>
  );
}
