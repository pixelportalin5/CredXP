import type { Property } from "@/types/property";
import {
  formatPrice,
  formatPriceCompact,
  formatPricePerSqft,
  formatSize,
  formatYield,
} from "@/utils/format";

export interface ComparisonMetricRow {
  key: string;
  label: string;
  values: string[];
}

function formatLeaseRemaining(leaseExpiry?: string): string {
  if (!leaseExpiry?.trim()) return "—";
  const expiry = new Date(leaseExpiry);
  if (Number.isNaN(expiry.getTime())) return leaseExpiry;
  const diffMs = expiry.getTime() - Date.now();
  if (diffMs <= 0) return "Lease expired";
  const totalMonths = Math.round(diffMs / (30.44 * 24 * 60 * 60 * 1000));
  if (totalMonths >= 12) {
    const years = Math.floor(totalMonths / 12);
    const months = totalMonths % 12;
    return months > 0 ? `${years}y ${months}m remaining` : `${years}y remaining`;
  }
  return `${totalMonths} months remaining`;
}

function formatPossession(property: Property): string {
  if (property.occupancy != null) return `${property.occupancy}% occupied`;
  if (property.status === "Pre-Leased") return "Pre-leased / tenanted";
  if (property.status === "Available") return "Available";
  return property.status || "—";
}

function formatRoiMetrics(property: Property): string {
  const parts: string[] = [];
  if (property.financials?.rentalYield != null) {
    parts.push(`Yield ${formatYield(property.financials.rentalYield)}`);
  }
  if (property.financials?.capRate != null) {
    parts.push(`Cap ${property.financials.capRate.toFixed(2)}%`);
  }
  if (property.financials?.escalation) {
    parts.push(`Escalation ${property.financials.escalation}`);
  }
  return parts.length > 0 ? parts.join(" · ") : "—";
}

const METRIC_EXTRACTORS: Array<{
  key: string;
  label: string;
  getValue: (property: Property) => string;
}> = [
  { key: "title", label: "Property Name", getValue: (p) => p.title },
  { key: "type", label: "Property Type", getValue: (p) => p.type },
  { key: "city", label: "City", getValue: (p) => p.location.city },
  {
    key: "area",
    label: "Area",
    getValue: (p) => formatSize(p.specs?.size ?? p.size, p.specs?.sizeUnit || "sqft"),
  },
  { key: "price", label: "Price", getValue: (p) => formatPrice(p.price) },
  {
    key: "pricePerSqft",
    label: "Price / Sqft",
    getValue: (p) => formatPricePerSqft(p.price, p.specs?.size ?? p.size),
  },
  {
    key: "rentalYield",
    label: "Rental Yield",
    getValue: (p) => (p.financials?.rentalYield != null ? formatYield(p.financials.rentalYield) : "—"),
  },
  { key: "tenant", label: "Tenant Name", getValue: (p) => p.tenant?.name || "—" },
  {
    key: "leaseRemaining",
    label: "Lease Remaining",
    getValue: (p) => formatLeaseRemaining(p.tenant?.leaseExpiry),
  },
  { key: "grade", label: "Property Grade", getValue: (p) => (p.grade ? `Grade ${p.grade}` : "—") },
  { key: "status", label: "Status", getValue: (p) => p.status },
  { key: "possession", label: "Possession", getValue: formatPossession },
  { key: "roi", label: "ROI Metrics", getValue: formatRoiMetrics },
];

export function buildComparisonRows(properties: Property[]): ComparisonMetricRow[] {
  return METRIC_EXTRACTORS.map((metric) => ({
    key: metric.key,
    label: metric.label,
    values: properties.map((property) => metric.getValue(property)),
  }));
}

export function getPropertySummaryLine(property: Property): string {
  const yieldText =
    property.financials?.rentalYield != null ? formatYield(property.financials.rentalYield) : null;
  return [formatPriceCompact(property.price), property.location.city, yieldText].filter(Boolean).join(" · ");
}
