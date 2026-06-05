"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  Activity,
  BarChart3,
  Building2,
  CheckCircle2,
  Edit3,
  Eye,
  FileWarning,
  Mail,
  Plus,
  Search,
  ShieldCheck,
  Star,
  Trash2,
  Upload,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { PageLoader } from "@/components/ui/PageLoader";
import { AdminSectionSkeleton } from "@/components/ui/Skeleton";
import { EnterpriseInput } from "@/components/forms/EnterpriseForm";
import PropertyListingForm from "@/components/property/PropertyListingForm";
import { useAuth } from "@/components/providers/AuthProvider";
import { useToast } from "@/components/providers/ToastProvider";
import adminService, { type AdminAuditLog, type AdminSummary, type AdminUser } from "@/services/admin.service";
import { formatDate, formatPriceCompact } from "@/utils/format";
import type { Enquiry } from "@/types/enquiry";
import type { Property } from "@/types/property";

type AdminSection = "users" | "enquiries" | "logs" | "properties";

const CACHE_TTL_MS = 3 * 60 * 1000;

const sectionButtons: { id: AdminSection; label: string; icon: ReactNode }[] = [
  { id: "users", label: "Users", icon: <Users className="h-4 w-4" /> },
  { id: "enquiries", label: "Enquiries", icon: <Mail className="h-4 w-4" /> },
  { id: "logs", label: "Logs", icon: <Activity className="h-4 w-4" /> },
  { id: "properties", label: "Properties", icon: <Building2 className="h-4 w-4" /> },
];

const adminSections: AdminSection[] = ["users", "enquiries", "logs", "properties"];

let summaryCache: { data: AdminSummary; fetchedAt: number } | null = null;

type SectionDataMap = {
  users: AdminUser[];
  enquiries: Enquiry[];
  logs: AdminAuditLog[];
  properties: Property[];
};

const sectionDataCache: Partial<{ [K in AdminSection]: { data: SectionDataMap[K]; fetchedAt: number } }> = {};

function isCacheFresh(fetchedAt: number) {
  return Date.now() - fetchedAt < CACHE_TTL_MS;
}

function userLabel(value: Enquiry["userId"] | Enquiry["sellerId"]) {
  if (!value || typeof value === "string") return "Unassigned";
  return `${value.name} (${value.email})`;
}

function propertyTitle(enquiry: Enquiry) {
  if (enquiry.coworkingSpaceId && typeof enquiry.coworkingSpaceId !== "string") {
    return enquiry.coworkingSpaceId.title;
  }
  if (!enquiry.propertyId || typeof enquiry.propertyId === "string") return "Deleted listing";
  return enquiry.propertyId.title;
}

function isAdminSection(value: string | null): value is AdminSection {
  return !!value && adminSections.includes(value as AdminSection);
}

export default function AdminDashboardPage() {
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const [activeSection, setActiveSection] = useState<AdminSection>(() => {
    const section = searchParams.get("section");
    return isAdminSection(section) ? section : "users";
  });
  const [summary, setSummary] = useState<AdminSummary | null>(summaryCache?.data ?? null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [logs, setLogs] = useState<AdminAuditLog[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [showPropertyForm, setShowPropertyForm] = useState(false);
  const [query, setQuery] = useState("");
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [sectionLoading, setSectionLoading] = useState<AdminSection | null>(null);
  const loadedSections = useRef<Set<AdminSection>>(new Set());

  const invalidateSummary = useCallback(() => {
    summaryCache = null;
  }, []);

  const invalidateSection = useCallback((section: AdminSection) => {
    delete sectionDataCache[section];
    loadedSections.current.delete(section);
  }, []);

  const fetchSummary = useCallback(async (force = false) => {
    if (!force && summaryCache && isCacheFresh(summaryCache.fetchedAt)) {
      setSummary(summaryCache.data);
      return;
    }

    try {
      setSummaryLoading(true);
      const res = await adminService.getSummary();
      summaryCache = { data: res.data, fetchedAt: Date.now() };
      setSummary(res.data);
    } catch (error) {
      showToast({ type: "error", title: "Summary unavailable", message: error instanceof Error ? error.message : "Please try again." });
    } finally {
      setSummaryLoading(false);
    }
  }, [showToast]);

  const applySectionData = useCallback((section: AdminSection, data: SectionDataMap[AdminSection]) => {
    if (section === "users") setUsers(data as AdminUser[]);
    else if (section === "enquiries") setEnquiries(data as Enquiry[]);
    else if (section === "logs") setLogs(data as AdminAuditLog[]);
    else setProperties(data as Property[]);
  }, []);

  const fetchSection = useCallback(async (section: AdminSection, force = false) => {
    const cached = sectionDataCache[section];
    if (!force && cached && isCacheFresh(cached.fetchedAt)) {
      applySectionData(section, cached.data);
      loadedSections.current.add(section);
      return;
    }

    try {
      setSectionLoading(section);
      if (section === "users") {
        const res = await adminService.getUsers();
        sectionDataCache.users = { data: res.data, fetchedAt: Date.now() };
        setUsers(res.data);
      } else if (section === "enquiries") {
        const res = await adminService.getEnquiries();
        sectionDataCache.enquiries = { data: res.data, fetchedAt: Date.now() };
        setEnquiries(res.data);
      } else if (section === "logs") {
        const res = await adminService.getLogs();
        sectionDataCache.logs = { data: res.data, fetchedAt: Date.now() };
        setLogs(res.data);
      } else {
        const res = await adminService.getProperties();
        sectionDataCache.properties = { data: res.data, fetchedAt: Date.now() };
        setProperties(res.data);
      }
      loadedSections.current.add(section);
    } catch (error) {
      showToast({ type: "error", title: "Admin data unavailable", message: error instanceof Error ? error.message : "Please try again." });
    } finally {
      setSectionLoading((current) => (current === section ? null : current));
    }
  }, [applySectionData, showToast]);

  useEffect(() => {
    const section = searchParams.get("section");
    if (isAdminSection(section)) {
      setActiveSection(section);
    }
  }, [searchParams]);

  useEffect(() => {
    if (user?.role !== "admin") return;
    void fetchSummary();
    void fetchSection(activeSection);
  }, [user?.role, activeSection, fetchSummary, fetchSection]);

  const filteredUsers = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (activeSection !== "users" || !normalized) return users;
    return users.filter((item) => (
      item.name.toLowerCase().includes(normalized) ||
      item.email.toLowerCase().includes(normalized) ||
      item.role.toLowerCase().includes(normalized)
    ));
  }, [activeSection, query, users]);

  const filteredEnquiries = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (activeSection !== "enquiries" || !normalized) return enquiries;
    return enquiries.filter((item) => (
      item.customerName.toLowerCase().includes(normalized) ||
      item.email.toLowerCase().includes(normalized) ||
      propertyTitle(item).toLowerCase().includes(normalized)
    ));
  }, [activeSection, enquiries, query]);

  const filteredProperties = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (activeSection !== "properties" || !normalized) return properties;
    return properties.filter((property) => (
      property.title.toLowerCase().includes(normalized) ||
      property.location.city.toLowerCase().includes(normalized) ||
      property.type.toLowerCase().includes(normalized)
    ));
  }, [activeSection, properties, query]);

  const handleUserUpdate = async (nextUser: AdminUser, data: Partial<AdminUser>) => {
    try {
      const res = await adminService.updateUser(nextUser._id, data);
      setUsers((current) => current.map((item) => item._id === res.data._id ? res.data : item));
      showToast({ type: "success", title: "User updated" });
      invalidateSummary();
      void fetchSummary(true);
    } catch (error) {
      showToast({ type: "error", title: "User update failed", message: error instanceof Error ? error.message : "Please try again." });
    }
  };

  const handleEnquiryStatus = async (enquiry: Enquiry, status: "open" | "closed") => {
    try {
      const res = await adminService.updateEnquiryStatus(enquiry._id, status);
      setEnquiries((current) => current.map((item) => item._id === enquiry._id ? res.data : item));
      showToast({ type: "success", title: status === "closed" ? "Enquiry closed" : "Enquiry reopened" });
      invalidateSummary();
      void fetchSummary(true);
    } catch (error) {
      showToast({ type: "error", title: "Enquiry update failed", message: error instanceof Error ? error.message : "Please try again." });
    }
  };

  const handlePropertySubmit = async (data: Partial<Property>) => {
    try {
      const res = await adminService.createProperty(data);
      setProperties((current) => [res.data, ...current]);
      setShowPropertyForm(false);
      showToast({ type: "success", title: "Property published" });
      invalidateSummary();
      invalidateSection("properties");
      void fetchSummary(true);
    } catch (error) {
      showToast({ type: "error", title: "Property save failed", message: error instanceof Error ? error.message : "Please review the listing." });
    }
  };

  const handlePropertyQuickUpdate = async (property: Property, data: Partial<Property>) => {
    try {
      const res = await adminService.updateProperty(property._id, data);
      setProperties((current) => current.map((item) => item._id === property._id ? res.data : item));
      showToast({ type: "success", title: "Property updated" });
      invalidateSummary();
      void fetchSummary(true);
    } catch (error) {
      showToast({ type: "error", title: "Property update failed", message: error instanceof Error ? error.message : "Please try again." });
    }
  };

  const handlePropertyDelete = async (property: Property) => {
    if (!window.confirm(`Delete ${property.title}?`)) return;
    try {
      await adminService.deleteProperty(property._id);
      setProperties((current) => current.filter((item) => item._id !== property._id));
      showToast({ type: "success", title: "Property deleted" });
      invalidateSummary();
      void fetchSummary(true);
    } catch (error) {
      showToast({ type: "error", title: "Property delete failed", message: error instanceof Error ? error.message : "Please try again." });
    }
  };

  const handleSectionChange = (section: AdminSection) => {
    setActiveSection(section);
    void fetchSection(section);
  };

  if (authLoading) {
    return <PageLoader label="Checking access…" />;
  }

  if (!user || user.role !== "admin") {
    return (
      <Container size="sm" className="py-16">
        <Card padding="lg" className="border-slate-200 bg-white text-center shadow-sm">
          <ShieldCheck className="mx-auto h-10 w-10 text-slate-400" />
          <h1 className="mt-4 text-2xl font-semibold text-slate-900">Admin access required</h1>
          <p className="mt-2 text-sm text-slate-600">Login with an admin account to access the admin portal.</p>
          <Link href="/login?next=/admin/dashboard" className="mt-6 inline-block">
            <Button>Login</Button>
          </Link>
        </Card>
      </Container>
    );
  }

  const isSectionLoading = sectionLoading === activeSection && !loadedSections.current.has(activeSection);

  return (
    <>
      <section className="blue-hero-bg border-b border-white/10 py-10 text-white lg:py-14">
        <Container size="xl">
          <Badge variant="accent" icon={<ShieldCheck className="h-3 w-3" />}>Admin Console</Badge>
          <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Marketplace Operations</h1>
              <p className="mt-3 max-w-2xl text-white/72">Manage users, enquiries, audit logs, listings, featured placements, and data quality.</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/list-property/bulk-upload">
                <Button icon={<Upload className="h-4 w-4" />} className="!bg-white !text-slate-950 hover:!bg-slate-100">
                  Bulk Upload
                </Button>
              </Link>
              <Button icon={<Plus className="h-4 w-4" />} onClick={() => setShowPropertyForm(true)}>
                Publish Property
              </Button>
            </div>
          </div>

          {summaryLoading && !summary ? (
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <Card key={index} padding="sm" className="border-blue-100/80 bg-white/95 text-center shadow-sm">
                  <div className="mx-auto h-3 w-16 animate-pulse rounded bg-slate-200" />
                  <div className="mx-auto mt-3 h-8 w-10 animate-pulse rounded bg-slate-200" />
                </Card>
              ))}
            </div>
          ) : summary ? (
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
              {[
                ["Users", summary.metrics.totalUsers],
                ["Sellers", summary.metrics.activeSellers],
                ["Listings", summary.metrics.activeListings],
                ["Open", summary.metrics.openEnquiries],
                ["Closed", summary.metrics.closedEnquiries],
                ["Saved", summary.metrics.savedPropertyCount],
              ].map(([label, value]) => (
                <Card key={label} padding="sm" className="border-blue-100/80 bg-white/95 text-center shadow-sm">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
                </Card>
              ))}
            </div>
          ) : null}
        </Container>
      </section>

      <Container size="xl" className="py-10 lg:py-14">
        {summary ? (
          <Card padding="md" className="mb-8 border-amber-200 bg-amber-50 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <FileWarning className="h-5 w-5 text-amber-600" />
              <h2 className="font-semibold text-slate-900">Data Quality Checks</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-4">
              {[
                ["Missing Images", summary.dataQuality.missingImages],
                ["Missing RERA", summary.dataQuality.missingReraId],
                ["Missing Tenant", summary.dataQuality.missingTenant],
                ["Missing Financials", summary.dataQuality.missingFinancials],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-amber-200 bg-white px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-amber-700">{label}</p>
                  <p className="mt-1 text-xl font-semibold text-slate-900">{value}</p>
                </div>
              ))}
            </div>
          </Card>
        ) : null}

        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {sectionButtons.map((section) => (
              <Button
                key={section.id}
                type="button"
                variant={activeSection === section.id ? "primary" : "outline"}
                icon={section.icon}
                onClick={() => handleSectionChange(section.id)}
                className={activeSection === section.id ? "" : "border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50"}
              >
                {section.label}
              </Button>
            ))}
          </div>
          <div className="relative w-full lg:w-80">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <EnterpriseInput value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Search ${activeSection}`} className="border-slate-200 bg-white pl-11 text-slate-900 placeholder:text-slate-400" />
          </div>
        </div>

        {showPropertyForm && (
          <Card padding="lg" className="mb-8 border-slate-200 bg-white shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Publish Property</h2>
                <p className="text-sm text-slate-600">Admin-created listings can be published, paused, featured, and edited from here.</p>
              </div>
              <Button type="button" variant="outline" onClick={() => setShowPropertyForm(false)}>
                Cancel
              </Button>
            </div>
            <PropertyListingForm submitLabel="Publish Property" onSubmit={handlePropertySubmit} />
          </Card>
        )}

        {isSectionLoading ? (
          <AdminSectionSkeleton />
        ) : (
          <>
            {activeSection === "users" && (
              <div className="space-y-4">
                {filteredUsers.map((item) => (
                  <Card key={item._id} padding="md" className="border-slate-200 bg-white shadow-sm">
                    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-slate-900">{item.name}</h3>
                          <Badge variant="outline" size="sm">{item.role}</Badge>
                          <Badge variant={item.accountStatus === "disabled" ? "warning" : "success"} size="sm">{item.accountStatus || "active"}</Badge>
                        </div>
                        <p className="mt-2 text-sm text-slate-600">{item.email}{item.phone ? ` - ${item.phone}` : ""}</p>
                        <p className="mt-1 text-xs text-slate-500">Joined {item.createdAt ? formatDate(item.createdAt) : "-"}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {(["buyer", "seller", "admin"] as const).map((role) => (
                          <Button key={role} size="sm" variant="outline" disabled={item.role === role} onClick={() => void handleUserUpdate(item, { role })} className="border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50">
                            {role}
                          </Button>
                        ))}
                        <Button size="sm" variant={item.accountStatus === "disabled" ? "primary" : "danger"} onClick={() => void handleUserUpdate(item, { accountStatus: item.accountStatus === "disabled" ? "active" : "disabled" })}>
                          {item.accountStatus === "disabled" ? "Enable" : "Disable"}
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {activeSection === "enquiries" && (
              <div className="space-y-4">
                {filteredEnquiries.map((enquiry) => (
                  <Card key={enquiry._id} padding="md" className="border-slate-200 bg-white shadow-sm">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-slate-900">{enquiry.customerName}</h3>
                          <Badge variant={enquiry.status === "closed" ? "success" : "warning"} size="sm">{enquiry.status || "open"}</Badge>
                        </div>
                        <p className="mt-2 text-sm text-slate-600">{enquiry.email}{enquiry.phone ? ` - ${enquiry.phone}` : ""}</p>
                        <p className="mt-2 text-sm font-medium text-slate-900">{propertyTitle(enquiry)}</p>
                        <p className="mt-1 text-xs text-slate-500">Buyer: {userLabel(enquiry.userId)} | Seller: {userLabel(enquiry.sellerId)}</p>
                        {enquiry.message && <p className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm leading-6 text-slate-600">{enquiry.message}</p>}
                      </div>
                      <Button
                        size="sm"
                        variant={enquiry.status === "closed" ? "outline" : "primary"}
                        icon={<CheckCircle2 className="h-4 w-4" />}
                        onClick={() => void handleEnquiryStatus(enquiry, enquiry.status === "closed" ? "open" : "closed")}
                        className={enquiry.status === "closed" ? "border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50" : ""}
                      >
                        {enquiry.status === "closed" ? "Reopen" : "Close"}
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {activeSection === "logs" && (
              <div className="space-y-3">
                {logs.map((log) => (
                  <Card key={log._id} padding="md" className="border-slate-200 bg-white shadow-sm">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-semibold text-slate-900">{log.action}</p>
                        <p className="text-sm text-slate-600">{log.entityType} {log.entityId || ""}</p>
                        <p className="text-xs text-slate-500">Actor: {log.actor?.name || "System"}</p>
                      </div>
                      <Badge variant="outline">{formatDate(log.createdAt)}</Badge>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {activeSection === "properties" && (
              <div className="space-y-4">
                {filteredProperties.map((property) => (
                  <Card key={property._id} padding="md" className="border-slate-200 bg-white shadow-sm">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-slate-900">{property.title}</h3>
                          <Badge variant={property.featured ? "accent" : "outline"} size="sm">{property.featured ? "Featured" : "Standard"}</Badge>
                          <Badge variant={property.isActive === false ? "warning" : "success"} size="sm">{property.isActive === false ? "Inactive" : "Active"}</Badge>
                          <Badge variant="outline" size="sm">{property.listingStatus || "published"}</Badge>
                        </div>
                        <p className="mt-2 text-sm text-slate-600">{property.location.city}, {property.location.state} - {formatPriceCompact(property.price)} - {property.size} sqft</p>
                        <p className="mt-1 text-xs text-slate-500">{property.views || 0} views - {property.enquiryCount || 0} enquiries</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Link href={`/properties/${property._id}`}>
                          <Button size="sm" variant="outline" icon={<Eye className="h-4 w-4" />} className="border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50">View</Button>
                        </Link>
                        <Link href={`/admin/dashboard/properties/${property._id}/edit?from=properties`}>
                          <Button size="sm" variant="outline" icon={<Edit3 className="h-4 w-4" />} className="border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50">Edit</Button>
                        </Link>
                        <Button size="sm" variant={property.featured ? "outline" : "primary"} icon={<Star className="h-4 w-4" />} onClick={() => void handlePropertyQuickUpdate(property, { featured: !property.featured })} className={property.featured ? "border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50" : ""}>
                          {property.featured ? "Unfeature" : "Feature"}
                        </Button>
                        <Button size="sm" variant="outline" icon={<BarChart3 className="h-4 w-4" />} onClick={() => void handlePropertyQuickUpdate(property, { listingStatus: property.listingStatus === "published" ? "paused" : "published", isActive: property.listingStatus !== "published" })} className="border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50">
                          {property.listingStatus === "published" ? "Pause" : "Publish"}
                        </Button>
                        <Button size="sm" variant="danger" icon={<Trash2 className="h-4 w-4" />} onClick={() => void handlePropertyDelete(property)}>Delete</Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {activeSection !== "logs" && activeSection !== "properties" && !isSectionLoading && (
              <p className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-500">
                Tables are export-ready in structure for a future CSV/XLSX export action.
              </p>
            )}

            {activeSection === "logs" && logs.length === 0 && !isSectionLoading && (
              <p className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-500">No audit logs yet.</p>
            )}
          </>
        )}
      </Container>
    </>
  );
}
