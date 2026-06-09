import { formatPriceCompact, formatPricePerSqft, formatSize, formatYield } from "@/utils/format";
import type { ProposalAgent, ProposalField } from "@/types/proposal";
import type { Property } from "@/types/property";
import type { User } from "@/types/auth";

function isPopulated(value: unknown): boolean {
  if (value === undefined || value === null) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (typeof value === "number") return !Number.isNaN(value);
  if (typeof value === "boolean") return true;
  if (Array.isArray(value)) return value.length > 0;
  return false;
}

function pushField(rows: ProposalField[], key: string, label: string, value: unknown) {
  if (!isPopulated(value)) return;
  rows.push({ key, label, value: String(value) });
}

export function buildAgentSnapshot(user: User): ProposalAgent {
  const agent: ProposalAgent = { name: user.name, email: user.email };
  if (isPopulated(user.phone)) agent.phone = user.phone;
  if (isPopulated(user.avatar)) agent.avatar = user.avatar;
  return agent;
}

export function buildPropertySnapshotRows(property: Property): ProposalField[] {
  const rows: ProposalField[] = [];

  pushField(rows, "title", "Title", property.title);
  pushField(rows, "type", "Property Type", property.type);
  pushField(rows, "status", "Status", property.status);
  pushField(rows, "grade", "Grade", property.grade);
  pushField(rows, "description", "Description", property.description);
  pushField(rows, "buildingName", "Building", property.buildingName);
  pushField(rows, "reraId", "RERA ID", property.reraId);
  if (isPopulated(property.occupancy)) pushField(rows, "occupancy", "Occupancy", `${property.occupancy}%`);

  if (property.location) {
    pushField(rows, "address", "Address", property.location.address);
    pushField(rows, "city", "City", property.location.city);
    pushField(rows, "state", "State", property.location.state);
    pushField(rows, "pincode", "Pincode", property.location.pincode);
    pushField(rows, "micromarket", "Micromarket", property.location.micromarket);
    pushField(rows, "landmark", "Landmark", property.location.landmark);
  }

  if (isPopulated(property.price)) pushField(rows, "price", "Price", formatPriceCompact(property.price));
  if (isPopulated(property.size)) {
    const unit = property.specs?.sizeUnit || "sqft";
    pushField(rows, "size", "Area", formatSize(property.size, unit));
    if (isPopulated(property.price)) pushField(rows, "pricePerSqft", "Price per Sqft", formatPricePerSqft(property.price, property.size));
  }

  if (property.financials) {
    const { rentalYield, capRate, securityDeposit, maintenanceCharges, escalation } = property.financials;
    if (isPopulated(rentalYield)) {
      pushField(rows, "rentalYield", "Rental Yield", formatYield(rentalYield as number));
    }
    if (isPopulated(capRate)) {
      pushField(rows, "capRate", "Cap Rate", formatYield(capRate as number));
    }
    if (isPopulated(securityDeposit)) {
      pushField(rows, "securityDeposit", "Security Deposit", formatPriceCompact(securityDeposit as number));
    }
    if (isPopulated(maintenanceCharges)) {
      pushField(rows, "maintenanceCharges", "Maintenance Charges", formatPriceCompact(maintenanceCharges as number));
    }
    pushField(rows, "escalation", "Escalation", escalation);
  }

  if (property.specs) {
    pushField(rows, "furnishing", "Furnishing", property.specs.furnishing);
    if (isPopulated(property.specs.parking)) pushField(rows, "parking", "Parking", `${property.specs.parking} slots`);
    if (isPopulated(property.specs.cabins)) pushField(rows, "cabins", "Cabins", property.specs.cabins);
    if (isPopulated(property.specs.workstations)) pushField(rows, "workstations", "Workstations", property.specs.workstations);
    if (isPopulated(property.specs.meetingRooms)) pushField(rows, "meetingRooms", "Meeting Rooms", property.specs.meetingRooms);
    if (isPopulated(property.specs.washrooms)) pushField(rows, "washrooms", "Washrooms", property.specs.washrooms);
    if (isPopulated(property.specs.floors)) pushField(rows, "floors", "Floor", property.specs.floors);
    if (isPopulated(property.specs.totalFloors)) pushField(rows, "totalFloors", "Total Floors", property.specs.totalFloors);
    if (property.specs.pantry === true) pushField(rows, "pantry", "Pantry", "Yes");
  }

  if (property.tenant) {
    pushField(rows, "tenantName", "Tenant", property.tenant.name);
    pushField(rows, "tenantIndustry", "Tenant Industry", property.tenant.industry);
    pushField(rows, "leaseExpiry", "Lease Expiry", property.tenant.leaseExpiry);
    pushField(rows, "lockInPeriod", "Lock-in Period", property.tenant.lockInPeriod);
  }

  if (property.amenities?.length) pushField(rows, "amenities", "Amenities", property.amenities.join(", "));
  if (property.highlights?.length) pushField(rows, "highlights", "Highlights", property.highlights.join(" • "));

  return rows;
}

export function buildProposalPreview(user: User, property: Property) {
  return {
    agent: buildAgentSnapshot(user),
    property: buildPropertySnapshotRows(property),
    propertyTitle: property.title,
    propertyId: property._id,
  };
}
