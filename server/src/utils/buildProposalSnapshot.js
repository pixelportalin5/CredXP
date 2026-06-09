function isPopulated(value) {
  if (value === undefined || value === null) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (typeof value === "number") return !Number.isNaN(value);
  if (typeof value === "boolean") return true;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "object") return Object.keys(value).length > 0;
  return false;
}

function formatInr(price) {
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
  if (price >= 100000) return `₹${(price / 100000).toFixed(2)} L`;
  return `₹${Math.round(price).toLocaleString("en-IN")}`;
}

function formatSize(size, unit = "sqft") {
  return `${Math.round(size).toLocaleString("en-IN")} ${unit}`;
}

function formatYield(value) {
  return `${Number(value).toFixed(2)}%`;
}

function formatPricePerSqft(price, size) {
  if (!size) return null;
  return `₹${Math.round(price / size).toLocaleString("en-IN")}/sqft`;
}

const FIELD_LABELS = {
  title: "Title",
  type: "Property Type",
  status: "Status",
  grade: "Grade",
  description: "Description",
  buildingName: "Building",
  reraId: "RERA ID",
  occupancy: "Occupancy",
  address: "Address",
  city: "City",
  state: "State",
  pincode: "Pincode",
  micromarket: "Micromarket",
  landmark: "Landmark",
  rentalYield: "Rental Yield",
  capRate: "Cap Rate",
  securityDeposit: "Security Deposit",
  maintenanceCharges: "Maintenance Charges",
  escalation: "Escalation",
  furnishing: "Furnishing",
  parking: "Parking",
  cabins: "Cabins",
  workstations: "Workstations",
  meetingRooms: "Meeting Rooms",
  washrooms: "Washrooms",
  floors: "Floor",
  totalFloors: "Total Floors",
  pantry: "Pantry",
  tenantName: "Tenant",
  tenantIndustry: "Tenant Industry",
  leaseExpiry: "Lease Expiry",
  lockInPeriod: "Lock-in Period",
  amenities: "Amenities",
  highlights: "Highlights",
  price: "Price",
  size: "Area",
  pricePerSqft: "Price per Sqft",
};

function pushField(rows, key, label, value) {
  if (!isPopulated(value)) return;
  rows.push({ key, label: label || FIELD_LABELS[key] || key, value: String(value) });
}

function buildAgentSnapshot(user) {
  const agent = { name: user.name, email: user.email };
  if (isPopulated(user.phone)) agent.phone = user.phone;
  if (isPopulated(user.avatar)) agent.avatar = user.avatar;
  return agent;
}

function buildPropertySnapshotRows(property) {
  const rows = [];

  pushField(rows, "title", "Title", property.title);
  pushField(rows, "type", "Property Type", property.type);
  pushField(rows, "status", "Status", property.status);
  pushField(rows, "grade", "Grade", property.grade);
  pushField(rows, "description", "Description", property.description);
  pushField(rows, "buildingName", "Building", property.buildingName);
  pushField(rows, "reraId", "RERA ID", property.reraId);
  if (isPopulated(property.occupancy)) {
    pushField(rows, "occupancy", "Occupancy", `${property.occupancy}%`);
  }

  if (property.location) {
    pushField(rows, "address", "Address", property.location.address);
    pushField(rows, "city", "City", property.location.city);
    pushField(rows, "state", "State", property.location.state);
    pushField(rows, "pincode", "Pincode", property.location.pincode);
    pushField(rows, "micromarket", "Micromarket", property.location.micromarket);
    pushField(rows, "landmark", "Landmark", property.location.landmark);
  }

  if (isPopulated(property.price)) pushField(rows, "price", "Price", formatInr(property.price));
  if (isPopulated(property.size)) {
    const unit = property.specs?.sizeUnit || "sqft";
    pushField(rows, "size", "Area", formatSize(property.size, unit));
    if (isPopulated(property.price)) {
      const pps = formatPricePerSqft(property.price, property.size);
      if (pps) pushField(rows, "pricePerSqft", "Price per Sqft", pps);
    }
  }

  if (property.financials) {
    if (isPopulated(property.financials.rentalYield)) {
      pushField(rows, "rentalYield", "Rental Yield", formatYield(property.financials.rentalYield));
    }
    if (isPopulated(property.financials.capRate)) {
      pushField(rows, "capRate", "Cap Rate", formatYield(property.financials.capRate));
    }
    if (isPopulated(property.financials.securityDeposit)) {
      pushField(rows, "securityDeposit", "Security Deposit", formatInr(property.financials.securityDeposit));
    }
    if (isPopulated(property.financials.maintenanceCharges)) {
      pushField(rows, "maintenanceCharges", "Maintenance Charges", formatInr(property.financials.maintenanceCharges));
    }
    pushField(rows, "escalation", "Escalation", property.financials.escalation);
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

  if (Array.isArray(property.amenities) && property.amenities.length > 0) {
    pushField(rows, "amenities", "Amenities", property.amenities.join(", "));
  }
  if (Array.isArray(property.highlights) && property.highlights.length > 0) {
    pushField(rows, "highlights", "Highlights", property.highlights.join(" • "));
  }

  return rows;
}

function buildProposalSnapshot(user, property) {
  return {
    agent: buildAgentSnapshot(user),
    property: buildPropertySnapshotRows(property),
  };
}

function publicProposal(proposal) {
  return {
    _id: proposal._id,
    propertyId: proposal.propertyId,
    propertyTitle: proposal.propertyTitle,
    agent: proposal.agent,
    propertySnapshot: proposal.propertySnapshot,
    createdAt: proposal.createdAt,
  };
}

module.exports = {
  buildProposalSnapshot,
  buildAgentSnapshot,
  buildPropertySnapshotRows,
  publicProposal,
  isPopulated,
};
