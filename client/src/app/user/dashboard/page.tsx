"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Bookmark, Mail, Search, Trash2, UserCircle } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { EnterpriseInput } from "@/components/forms/EnterpriseForm";
import PropertyCard from "@/components/property/PropertyCard";
import { useAuth } from "@/components/providers/AuthProvider";
import { useToast } from "@/components/providers/ToastProvider";
import enquiryService from "@/services/enquiry.service";
import savedPropertyService from "@/services/saved-property.service";
import { formatDate, formatPriceCompact } from "@/utils/format";
import type { Enquiry } from "@/types/enquiry";
import type { Property } from "@/types/property";

function getProperty(enquiry: Enquiry) {
  return typeof enquiry.propertyId === "string" ? null : enquiry.propertyId;
}

function getCoworkingSpace(enquiry: Enquiry) {
  return typeof enquiry.coworkingSpaceId === "string" ? null : enquiry.coworkingSpaceId;
}

export default function UserDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const [savedProperties, setSavedProperties] = useState<Property[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!user) return;

    async function fetchDashboard() {
      try {
        setDashboardLoading(true);
        const [savedRes, enquiryRes] = await Promise.all([
          savedPropertyService.list(),
          enquiryService.getMyEnquiries(),
        ]);
        setSavedProperties(savedRes.data);
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
    return enquiries.filter((enquiry) => {
      const property = getProperty(enquiry);
      const coworkingSpace = getCoworkingSpace(enquiry);
      return (
        enquiry.message?.toLowerCase().includes(normalized) ||
        property?.title.toLowerCase().includes(normalized) ||
        property?.location.city.toLowerCase().includes(normalized) ||
        coworkingSpace?.title.toLowerCase().includes(normalized) ||
        coworkingSpace?.location.city.toLowerCase().includes(normalized)
      );
    });
  }, [enquiries, query]);

  const handleRemoveEnquiry = async (enquiryId: string) => {
    try {
      await enquiryService.removeMyEnquiry(enquiryId);
      setEnquiries((current) => current.filter((enquiry) => enquiry._id !== enquiryId));
      showToast({ type: "success", title: "Enquiry removed" });
    } catch (error) {
      showToast({ type: "error", title: "Unable to remove enquiry", message: error instanceof Error ? error.message : "Please try again." });
    }
  };

  const handleClearEnquiries = async () => {
    if (enquiries.length === 0) return;
    if (!window.confirm("Clear all enquiries from your dashboard?")) return;

    try {
      await enquiryService.clearMyEnquiries();
      setEnquiries([]);
      showToast({ type: "success", title: "Enquiries cleared" });
    } catch (error) {
      showToast({ type: "error", title: "Unable to clear enquiries", message: error instanceof Error ? error.message : "Please try again." });
    }
  };

  if (authLoading || dashboardLoading) {
    return <div className="min-h-[50vh]" />;
  }

  if (!user) {
    return (
      <Container size="sm" className="py-16">
        <Card padding="lg" className="border-slate-200 bg-white text-center shadow-sm">
          <h1 className="text-2xl font-semibold text-slate-900">Login required</h1>
          <p className="mt-2 text-sm text-slate-600">Login to view saved properties and enquiries.</p>
          <Link href="/login?next=/user/dashboard" className="mt-6 inline-block">
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
          <Badge variant="accent" icon={<UserCircle className="h-3 w-3" />}>User Dashboard</Badge>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Saved Properties & Enquiries</h1>
          <p className="mt-3 text-white/72">Welcome back, {user.name}. Track your shortlisted properties and enquiry history.</p>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {[
              { label: "Saved", value: savedProperties.length },
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
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-slate-900">
              <Bookmark className="h-5 w-5 text-accent-500" />
              Saved
            </h2>
            {savedProperties.length === 0 ? (
              <Card padding="lg" className="border-slate-200 bg-white text-center shadow-sm">
                <p className="text-sm text-slate-600">No saved properties yet.</p>
                <Link href="/properties" className="mt-5 inline-block">
                  <Button>Explore Properties</Button>
                </Link>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {savedProperties.map((property) => (
                  <PropertyCard
                    key={property._id}
                    property={property}
                    variant="compact"
                    initialSaved
                    onSavedChange={(propertyId, saved) => {
                      if (!saved) {
                        setSavedProperties((current) => current.filter((item) => item._id !== propertyId));
                      }
                    }}
                  />
                ))}
              </div>
            )}
          </section>

          <section>
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <h2 className="flex items-center gap-2 text-xl font-semibold text-slate-900">
                <Mail className="h-5 w-5 text-accent-500" />
                Enquiries
              </h2>
              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                <div className="relative w-full sm:w-64">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <EnterpriseInput value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search enquiries" className="border-slate-200 bg-white pl-11 text-slate-900 placeholder:text-slate-400" />
                </div>
                <Button
                  type="button"
                  variant="danger"
                  size="md"
                  icon={<Trash2 className="h-4 w-4" />}
                  disabled={enquiries.length === 0}
                  onClick={() => void handleClearEnquiries()}
                >
                  Clear
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {filteredEnquiries.length === 0 ? (
                <Card padding="lg" className="border-slate-200 bg-white text-center shadow-sm">
                  <p className="text-sm text-slate-600">No enquiries yet.</p>
                </Card>
              ) : filteredEnquiries.map((enquiry) => {
                const property = getProperty(enquiry);
                const coworkingSpace = getCoworkingSpace(enquiry);
                return (
                  <Card key={enquiry._id} padding="md" className="border-slate-200 bg-white shadow-sm">
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3 className="font-semibold text-slate-900">{property?.title || coworkingSpace?.title || "Deleted listing"}</h3>
                        <Badge variant="outline" size="sm">{formatDate(enquiry.createdAt)}</Badge>
                      </div>
                      {property && (
                        <p className="text-sm text-slate-600">
                          {property.location.city} • {formatPriceCompact(property.price)}
                        </p>
                      )}
                      {coworkingSpace && (
                        <p className="text-sm text-slate-600">
                          {coworkingSpace.location.city} • {coworkingSpace.priceLabel || formatPriceCompact(coworkingSpace.monthlySeatPrice)}
                        </p>
                      )}
                      {enquiry.message && (
                        <p className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm leading-6 text-slate-600">
                          {enquiry.message}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2">
                        {property && (
                          <Link href={`/properties/${property._id}`}>
                            <Button variant="outline" size="sm" className="border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50">
                              View Property
                            </Button>
                          </Link>
                        )}
                        {coworkingSpace && (
                          <Link href={`/coworking/${coworkingSpace._id}`}>
                            <Button variant="outline" size="sm" className="border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50">
                              View Coworking
                            </Button>
                          </Link>
                        )}
                        <Button
                          type="button"
                          variant="danger"
                          size="sm"
                          icon={<Trash2 className="h-4 w-4" />}
                          onClick={() => void handleRemoveEnquiry(enquiry._id)}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </section>
        </div>
      </Container>
    </>
  );
}
