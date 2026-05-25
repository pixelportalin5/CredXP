require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });
const Property = require("../models/Property");
const connectDB = require("../config/db");

const officeImages = [
  "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&h=800&fit=crop&q=80",
  "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1200&h=800&fit=crop&q=80",
  "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&h=800&fit=crop&q=80",
  "https://images.unsplash.com/photo-1556761175-4b46a572b786?w=1200&h=800&fit=crop&q=80",
  "https://images.unsplash.com/photo-1568992687947-868a62a9f521?w=1200&h=800&fit=crop&q=80",
  "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1200&h=800&fit=crop&q=80",
  "https://images.unsplash.com/photo-1606836576983-8b458e75221d?w=1200&h=800&fit=crop&q=80",
  "https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?w=1200&h=800&fit=crop&q=80",
];

const shopImages = [
  "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=800&fit=crop&q=80",
  "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=1200&h=800&fit=crop&q=80",
  "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&h=800&fit=crop&q=80",
  "https://images.unsplash.com/photo-1582037928769-181f2644ecb7?w=1200&h=800&fit=crop&q=80",
  "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=800&fit=crop&q=80",
  "https://images.unsplash.com/photo-1604328698692-f76ea9498e76?w=1200&h=800&fit=crop&q=80",
  "https://images.unsplash.com/photo-1555529771-835f59fc5efe?w=1200&h=800&fit=crop&q=80",
  "https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?w=1200&h=800&fit=crop&q=80",
];

const officeAmenities = [
  "Central AC",
  "High-Speed Internet",
  "24/7 Security",
  "CCTV Surveillance",
  "Dedicated Parking",
  "Conference Room",
  "Cafeteria",
  "Power Backup",
  "Elevator Access",
  "Reception Area",
  "Server Room",
  "Pantry",
  "Fire Safety System",
  "Housekeeping",
  "Visitor Parking",
  "EV Charging",
  "Metro Connectivity",
  "Business Lounge",
];

const shopAmenities = [
  "Central AC",
  "Power Backup",
  "CCTV Surveillance",
  "Fire Safety",
  "Display Window",
  "Storage Room",
  "Restroom",
  "Loading Bay",
  "Customer Parking",
  "Glass Frontage",
  "Rolling Shutter",
  "Water Supply",
  "Signage Space",
  "Wheelchair Access",
  "Corner Visibility",
];

const gurgaonOfficeAreas = [
  { area: "Cyber City", road: "NH-48", city: "Gurugram" },
  { area: "Udyog Vihar Phase 3", road: "MG Road", city: "Gurugram" },
  { area: "Golf Course Road", road: "Golf Course Road", city: "Gurugram" },
  { area: "Sohna Road", road: "Sohna Road", city: "Gurugram" },
  { area: "Sector 44", road: "Huda City Centre Road", city: "Gurugram" },
  { area: "Sector 29", road: "Mehrauli-Gurugram Road", city: "Gurugram" },
  { area: "Sector 32", road: "Netaji Subhash Marg", city: "Gurugram" },
  { area: "Sector 48", road: "Sohna Road", city: "Gurugram" },
  { area: "Sector 50", road: "Golf Course Extension Road", city: "Gurugram" },
  { area: "DLF Phase 3", road: "Cyber Hub Road", city: "Gurugram" },
  { area: "DLF Phase 4", road: "MG Road", city: "Gurugram" },
  { area: "DLF Phase 5", road: "Golf Course Road", city: "Gurugram" },
  { area: "Sector 14", road: "Old Delhi Road", city: "Gurugram" },
  { area: "Sector 17", road: "Arjun Marg", city: "Gurugram" },
  { area: "Sector 54", road: "Golf Course Extension Road", city: "Gurugram" },
  { area: "Sector 56", road: "Golf Course Extension Road", city: "Gurugram" },
  { area: "Sector 67", road: "Sohna Road", city: "Gurugram" },
  { area: "Sector 68", road: "Southern Peripheral Road", city: "Gurugram" },
  { area: "Sector 74A", road: "Southern Peripheral Road", city: "Gurugram" },
  { area: "Sushant Lok 1", road: "MG Road", city: "Gurugram" },
];

const gurgaonRetailAreas = [
  { area: "Sadar Bazaar", road: "Main Market Road", city: "Gurugram" },
  { area: "Sector 14 Market", road: "Old Delhi Road", city: "Gurugram" },
  { area: "Sector 29 Market", road: "Mehrauli-Gurugram Road", city: "Gurugram" },
  { area: "MG Road", road: "MG Road", city: "Gurugram" },
  { area: "Cyber Hub", road: "NH-48", city: "Gurugram" },
  { area: "Golf Course Extension", road: "Golf Course Extension Road", city: "Gurugram" },
  { area: "Sohna Road", road: "Sohna Road", city: "Gurugram" },
  { area: "Sector 50 Market", road: "Golf Course Extension Road", city: "Gurugram" },
  { area: "Sector 56 Market", road: "Golf Course Extension Road", city: "Gurugram" },
  { area: "Sector 57 Market", road: "Golf Course Extension Road", city: "Gurugram" },
  { area: "South City 2", road: "Sohna Road", city: "Gurugram" },
  { area: "Palam Vihar", road: "Palam Vihar Road", city: "Gurugram" },
  { area: "Nirvana Country", road: "Nirvana Road", city: "Gurugram" },
  { area: "DLF Phase 1", road: "MG Road", city: "Gurugram" },
  { area: "DLF Phase 2", road: "Cyber City Road", city: "Gurugram" },
  { area: "DLF Phase 4", road: "MG Road", city: "Gurugram" },
  { area: "Sector 23", road: "Palam Vihar Road", city: "Gurugram" },
  { area: "Sector 31", road: "Huda City Centre Road", city: "Gurugram" },
  { area: "Sector 82", road: "New Gurgaon Road", city: "Gurugram" },
  { area: "Sector 83", road: "Dwarka Expressway", city: "Gurugram" },
];

const officeTemplates = [
  { prefix: "Premium", suffix: "Office Suite" },
  { prefix: "Grade A", suffix: "Workspace" },
  { prefix: "Executive", suffix: "Office Floor" },
  { prefix: "Corporate", suffix: "Office Tower" },
  { prefix: "Tech Park", suffix: "Business Center" },
  { prefix: "Managed", suffix: "Office Wing" },
];

const shopTemplates = [
  { prefix: "Prime", suffix: "Retail Space" },
  { prefix: "Corner", suffix: "Shop" },
  { prefix: "High Street", suffix: "Showroom" },
  { prefix: "Premium", suffix: "Storefront" },
  { prefix: "Boutique", suffix: "Shop Space" },
  { prefix: "Flagship", suffix: "Retail Outlet" },
];

const officeDescriptions = [
  "Grade-A Gurugram office inventory with efficient floor plates, fast metro access, and a polished lobby profile suited to enterprise occupiers.",
  "Plug-and-play commercial office with strong brand visibility, parking support, and immediate connectivity to Cyber City and Golf Course Road.",
  "Institutional office floor offering modern services, flexible layouts, and a tenant profile aligned with long-term capital preservation.",
  "Well-finished workspace in a core business corridor with strong rental demand, clear signage, and easy access from major arterial roads.",
  "Premium office unit designed for scaled teams, with dependable backup systems, contemporary interiors, and a market-ready layout.",
  "Commercial office asset in a high-absorption micro-market with a professional building envelope and strong leasing fundamentals.",
];

const shopDescriptions = [
  "High-visibility retail unit in a dense Gurugram catchment with strong footfall, broad frontage, and appeal to premium brands.",
  "Ground-floor shop with excellent visibility, steady neighbourhood traffic, and a layout suited to daily needs or boutique retail.",
  "Retail investment opportunity in a busy market corridor with strong signage potential and a dependable commercial audience.",
  "Corner retail space positioned for maximum exposure, ideal for lifestyle brands, cafes, clinics, or specialty stores.",
  "Premium shop in a high-demand commercial pocket with strong accessibility and a clear fit for stable income strategies.",
  "Market-facing commercial unit with efficient size, clean frontage, and an established business district around it.",
];

function pickRandom(values, count = 1) {
  const shuffled = [...values].sort(() => 0.5 - Math.random());
  return count === 1 ? shuffled[0] : shuffled.slice(0, count);
}

function formatReraId(prefix, index) {
  return `${prefix}-RERA-${String(index + 1).padStart(3, "0")}`;
}

function buildFinancials(price, size, type) {
  const rentalYield =
    type === "Office Space"
      ? Number((6.5 + Math.random() * 2.3).toFixed(2))
      : Number((5.75 + Math.random() * 1.8).toFixed(2));

  return {
    price,
    priceUnit: "total",
    securityDeposit: Math.round(price * (type === "Office Space" ? 0.12 : 0.16)),
    maintenanceCharges: Math.round(size * (type === "Office Space" ? 3.5 : 4.25)),
    rentalYield,
    capRate: Number((rentalYield - 0.45).toFixed(2)),
    escalation: type === "Office Space" ? "10% every 3 years" : "8% every 3 years",
  };
}

function buildSpecs(size, type) {
  const isOffice = type === "Office Space";
  return {
    size,
    sizeUnit: "sqft",
    floors: isOffice ? 8 + Math.floor(Math.random() * 18) : 1,
    totalFloors: isOffice ? 12 + Math.floor(Math.random() * 24) : 1,
    furnishing: pickRandom(["Fully Furnished", "Semi Furnished", "Bare Shell", "Warm Shell"]),
    parking: isOffice ? 1 + Math.floor(Math.random() * 6) : 1 + Math.floor(Math.random() * 4),
    cabins: isOffice ? 1 + Math.floor(Math.random() * 8) : 0,
    workstations: isOffice ? 12 + Math.floor(Math.random() * 110) : 0,
    meetingRooms: isOffice ? 1 + Math.floor(Math.random() * 4) : 0,
    pantry: true,
    washrooms: isOffice ? 1 + Math.floor(Math.random() * 4) : 1,
  };
}

function buildTenant(type, index) {
  const officeTenants = [
    { name: "Fortis Business Services", industry: "Healthcare Services" },
    { name: "TechCurve Analytics", industry: "Technology" },
    { name: "Axis Advisory Partners", industry: "Financial Services" },
    { name: "Nimbus Consulting", industry: "Consulting" },
    { name: "Indus Operations Hub", industry: "Shared Services" },
    { name: "Summit Digital", industry: "Software" },
  ];

  const retailTenants = [
    { name: "Urban Pantry", industry: "Convenience Retail" },
    { name: "Style Avenue", industry: "Fashion" },
    { name: "Brew & Bite", industry: "Food & Beverage" },
    { name: "HealthFirst Care", industry: "Pharmacy" },
    { name: "The Furnish Studio", industry: "Homeware" },
    { name: "Nova Optics", industry: "Eyewear" },
  ];

  const pool = type === "Office Space" ? officeTenants : retailTenants;
  const selected = pool[index % pool.length];

  return {
    name: selected.name,
    industry: selected.industry,
    leaseExpiry: `${2027 + (index % 3)}-${String((index % 12) + 1).padStart(2, "0")}-30`,
    lockInPeriod: `${2 + (index % 3)} years`,
  };
}

function generateProperties() {
  const properties = [];

  for (let index = 0; index < 30; index += 1) {
    const area = gurgaonOfficeAreas[index % gurgaonOfficeAreas.length];
    const template = officeTemplates[index % officeTemplates.length];
    const size = 1200 + Math.floor(Math.random() * 14000);
    const pricePerSqft = 85 + Math.floor(Math.random() * 90);
    const price = Math.round((size * pricePerSqft) / 100) * 100;

    properties.push({
      title: `${template.prefix} ${template.suffix} - ${area.area}`,
      buildingName: `${area.area} Commercial Tower ${index + 1}`,
      type: "Office Space",
      location: {
        address: `${Math.floor(Math.random() * 180) + 1}, ${area.road}, ${area.area}`,
        city: area.city,
        state: "Haryana",
      },
      price,
      size,
      financials: buildFinancials(price, size, "Office Space"),
      specs: buildSpecs(size, "Office Space"),
      tenant: buildTenant("Office Space", index),
      amenities: pickRandom(officeAmenities, 5 + Math.floor(Math.random() * 5)),
      images: pickRandom(officeImages, 2 + Math.floor(Math.random() * 2)),
      status: index % 4 === 0 ? "Trending" : "Recently Posted",
      grade: index % 3 === 0 ? "A+" : "A",
      occupancy: 70 + (index % 25),
      reraId: formatReraId("GUR-OF", index),
      highlights: [
        "Metro connected",
        "Institutional ownership",
        "Strong leasing corridor",
        "Ready for immediate occupancy",
      ].slice(0, 3 + (index % 2)),
      description: officeDescriptions[index % officeDescriptions.length],
    });
  }

  for (let index = 0; index < 20; index += 1) {
    const area = gurgaonRetailAreas[index % gurgaonRetailAreas.length];
    const template = shopTemplates[index % shopTemplates.length];
    const size = 250 + Math.floor(Math.random() * 4200);
    const pricePerSqft = 140 + Math.floor(Math.random() * 160);
    const price = Math.round((size * pricePerSqft) / 100) * 100;

    properties.push({
      title: `${template.prefix} ${template.suffix} - ${area.area}`,
      buildingName: `${area.area} Retail Block ${index + 1}`,
      type: "Shop",
      location: {
        address: `${Math.floor(Math.random() * 140) + 1}, ${area.road}, ${area.area}`,
        city: area.city,
        state: "Haryana",
      },
      price,
      size,
      financials: buildFinancials(price, size, "Shop"),
      specs: buildSpecs(size, "Shop"),
      tenant: buildTenant("Shop", index),
      amenities: pickRandom(shopAmenities, 4 + Math.floor(Math.random() * 4)),
      images: pickRandom(shopImages, 2 + Math.floor(Math.random() * 2)),
      status: index % 3 === 0 ? "Trending" : "Recently Posted",
      grade: index % 2 === 0 ? "A" : "B+",
      occupancy: 60 + (index % 35),
      reraId: formatReraId("GUR-SH", index),
      highlights: [
        "High street frontage",
        "Retail-ready shell",
        "Strong local demand",
        "Suitable for brand visibility",
      ].slice(0, 3 + (index % 2)),
      description: shopDescriptions[index % shopDescriptions.length],
    });
  }

  return properties;
}

const seedDB = async () => {
  try {
    await connectDB();
    await Property.deleteMany({});
    const data = generateProperties();
    const inserted = await Property.insertMany(data);

    console.log(`\n✅ Database seeded with ${inserted.length} properties`);
    console.log(`   - Office Spaces: ${inserted.filter((property) => property.type === "Office Space").length}`);
    console.log(`   - Shops: ${inserted.filter((property) => property.type === "Shop").length}`);
    console.log(`   - Trending: ${inserted.filter((property) => property.status === "Trending").length}`);
    console.log(`   - Recently Posted: ${inserted.filter((property) => property.status === "Recently Posted").length}\n`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Seed failed:", error.message);
    process.exit(1);
  }
};

seedDB();
