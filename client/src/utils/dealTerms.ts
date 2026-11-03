import type { Property } from "@/types/property";
import { getListingDirectoryPath } from "@/utils/propertyFilterParams";

/* ============================================================
   Pre-leased deal sheet
   Turns a listing into the rows brokers share on WhatsApp, working
   out any figure that can be derived from the others (rent ↔ rent
   per sqft, deposit ↔ deposit months, ROI, price per sqft).
   ============================================================ */

export type DealRowKey =
  | "building"
  | "location"
  | "tenant"
  | "areaLeased"
  | "sellableArea"
  | "monthlyRent"
  | "leaseTenure"
  | "lockIn"
  | "escalation"
  | "leaseStart"
  | "securityDeposit"
  | "roi"
  | "dealValue";

export interface DealRow {
  key: DealRowKey;
  label: string;
  value: string;
  /** Smaller second line, e.g. "₹105 per sqft". */
  note?: string;
}

export interface DealTerms {
  units: number;
  sellableArea?: number;
  monthlyRent?: number;
  rentPerSqft?: number;
  securityDeposit?: number;
  securityDepositMonths?: number;
  roi?: number;
  dealValue?: number;
  dealValuePerSqft?: number;
  rows: DealRow[];
}

const INR = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const INR_2 = new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** ₹105 or ₹50.50 */
function formatRate(value: number): string {
  return `₹${Number.isInteger(Math.round(value * 100) / 100) ? INR.format(value) : INR_2.format(value)}`;
}

const positive = (value?: number | null): number | undefined =>
  typeof value === "number" && Number.isFinite(value) && value > 0 ? value : undefined;

/** Sale listings (the /invest side) use the deal sheet; lease listings keep the old page. */
export function usesDealSheet(property: Property): boolean {
  return getListingDirectoryPath(property) === "/invest";
}

/** ₹11.89 Cr, ₹48 Lakh, ₹3,96,060 */
export function formatDealAmount(amount: number): string {
  if (amount >= 1e7) return `₹${trimZeros((amount / 1e7).toFixed(2))} Cr`;
  if (amount >= 1e5) return `₹${trimZeros((amount / 1e5).toFixed(2))} Lakh`;
  return `₹${INR.format(amount)}`;
}

function trimZeros(text: string): string {
  return text.replace(/\.?0+$/, "");
}

function formatPercent(value: number): string {
  return `${trimZeros(value.toFixed(2))}%`;
}

function formatMonths(months: number): string {
  const rounded = Math.round(months * 2) / 2;
  return `${trimZeros(rounded.toFixed(1))} ${rounded === 1 ? "month" : "months"}`;
}

export function dealLocation(property: Property): string {
  const { location } = property;
  const area = location.micromarket || location.address;
  return [area, location.city].filter(Boolean).join(", ");
}

export function getDealTerms(property: Property): DealTerms {
  const { financials = {} as NonNullable<Property["financials"]>, tenant, specs } = property;
  const units = Math.max(1, Math.round(specs?.units ?? 1));
  const sellableArea = positive(specs?.size) ?? positive(property.size);
  const dealValue = positive(property.price);

  let monthlyRent = positive(financials.monthlyRent);
  let rentPerSqft = positive(financials.rentPerSqft);
  if (!monthlyRent && rentPerSqft && sellableArea) monthlyRent = rentPerSqft * sellableArea;
  if (!rentPerSqft && monthlyRent && sellableArea) rentPerSqft = monthlyRent / sellableArea;

  const roi =
    positive(financials.rentalYield) ??
    (monthlyRent && dealValue ? (monthlyRent * 12 * 100) / dealValue : undefined);
  // No rent given: annual rent = ROI% of the price (₹1 Cr at 12% → ₹12 L a year → ₹1 L a month).
  if (!monthlyRent && roi && dealValue) monthlyRent = (dealValue * roi) / 100 / 12;
  if (!rentPerSqft && monthlyRent && sellableArea) rentPerSqft = monthlyRent / sellableArea;

  let securityDeposit = positive(financials.securityDeposit);
  let securityDepositMonths = positive(financials.securityDepositMonths);
  if (!securityDeposit && securityDepositMonths && monthlyRent) securityDeposit = securityDepositMonths * monthlyRent;
  if (!securityDepositMonths && securityDeposit && monthlyRent) securityDepositMonths = securityDeposit / monthlyRent;
  const dealValuePerSqft = dealValue && sellableArea ? dealValue / sellableArea : undefined;

  const rows: DealRow[] = [];
  const perUnit = units > 1 ? " (per unit)" : "";
  const add = (key: DealRowKey, label: string, value?: string, note?: string) => {
    if (value) rows.push({ key, label, value, ...(note ? { note } : {}) });
  };

  add("building", "Building", property.buildingName);
  add("location", "Location", dealLocation(property));
  add("tenant", "Tenant", tenant?.name);
  add("areaLeased", "Total Area Leased", positive(tenant?.areaLeased) ? `${INR.format(tenant!.areaLeased!)} sqft` : undefined);
  add(
    "sellableArea",
    units > 1 ? "Offered Area" : "Sellable Area",
    sellableArea ? `${INR.format(sellableArea)} sqft${units > 1 ? ` × ${units} units` : ""}` : undefined
  );
  add(
    "monthlyRent",
    `Monthly Rent${perUnit}`,
    monthlyRent ? `₹${INR.format(Math.round(monthlyRent))}` : rentPerSqft ? `${formatRate(rentPerSqft)} per sqft` : undefined,
    monthlyRent && rentPerSqft ? `${formatRate(rentPerSqft)} per sqft` : undefined
  );
  add("leaseTenure", "Lease Tenure", tenant?.leaseTenure);
  add("lockIn", "Lock-in Period", tenant?.lockInPeriod);
  add("escalation", "Escalation", financials.escalation);
  add("leaseStart", "Lease Start", tenant?.leaseStart);
  add(
    "securityDeposit",
    `Security Deposit${perUnit}`,
    securityDeposit
      ? `₹${INR.format(Math.round(securityDeposit))}`
      : securityDepositMonths
        ? formatMonths(securityDepositMonths)
        : undefined,
    securityDeposit && securityDepositMonths ? formatMonths(securityDepositMonths) : undefined
  );
  add("roi", "ROI", roi ? formatPercent(roi) : undefined);
  add(
    "dealValue",
    "Deal Value",
    dealValue ? `${formatDealAmount(dealValue)}${units > 1 ? " per unit" : ""}` : undefined,
    dealValuePerSqft ? `₹${INR.format(Math.round(dealValuePerSqft))} per sqft` : undefined
  );

  return {
    units,
    sellableArea,
    monthlyRent,
    rentPerSqft,
    securityDeposit,
    securityDepositMonths,
    roi,
    dealValue,
    dealValuePerSqft,
    rows,
  };
}

/*
 * WhatsApp share text. No emoji: wa.me share links garble them into "?"
 * boxes on WhatsApp Web / desktop. Plain text, ₹ and • come through fine.
 */
const WHATSAPP_HEADLINE: Record<string, string> = {
  "Bank Rented": "PRE-LEASED BANK PROPERTY FOR SALE",
  "Pre-Leased Office": "PRE-LEASED OFFICE SPACE FOR SALE",
  "Retail/SCO": "PRE-LEASED RETAIL / SCO FOR SALE",
  "Commercial Land": "INDUSTRIAL LAND FOR SALE",
  Warehouse: "INDUSTRIAL / WAREHOUSE PROPERTY FOR SALE",
};

const SUMMARY_ROWS: DealRowKey[] = ["dealValue", "monthlyRent", "roi", "sellableArea", "areaLeased"];
const LEASE_ROWS: DealRowKey[] = ["leaseTenure", "lockIn", "escalation", "leaseStart", "securityDeposit"];

export interface WhatsAppContact {
  phone?: string;
  website?: string;
}

/** The deal as a clean WhatsApp message, ending with the listing link. */
export function dealWhatsAppText(property: Property, pageUrl: string, contact: WhatsAppContact = {}): string {
  const { rows } = getDealTerms(property);
  const byKey = new Map(rows.map((row) => [row.key, row]));
  const bullet = (row: DealRow) => `• ${row.label}: ${row.value}${row.note ? ` (${row.note})` : ""}`;
  const section = (heading: string, keys: DealRowKey[]) => {
    const items = keys.map((key) => byKey.get(key)).filter((row): row is DealRow => Boolean(row));
    return items.length ? [`*${heading}*`, ...items.map(bullet), ""] : [];
  };

  const headline = WHATSAPP_HEADLINE[property.type] || "PRE-LEASED COMMERCIAL PROPERTY FOR SALE";
  const name = property.buildingName || property.title;
  const location = byKey.get("location")?.value;
  const tenant = byKey.get("tenant")?.value;

  const lines = [`*${headline}*`, "", `*${name}*`];
  if (location) lines.push(location);
  lines.push("");
  if (tenant) lines.push(`*Tenant:* ${tenant}`, "");
  lines.push(...section("Investment Summary", SUMMARY_ROWS));
  lines.push(...section("Lease Terms", LEASE_ROWS));
  lines.push("*Photos & full details:*", pageUrl);

  const footer = ["CredXP", contact.phone, contact.website].filter(Boolean).join(" | ");
  lines.push("", `_${footer}_`);
  return lines.join("\n");
}

/** Opens WhatsApp with the text ready to send to any chat. */
export function whatsappShareUrl(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text).replace(/'/g, "%27")}`;
}
