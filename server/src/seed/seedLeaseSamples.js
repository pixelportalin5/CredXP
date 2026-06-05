require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });
const Property = require("../models/Property");
const connectDB = require("../config/db");

const officeImages = [
  "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&h=800&fit=crop&q=80",
  "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1200&h=800&fit=crop&q=80",
  "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&h=800&fit=crop&q=80",
];

const shopImages = [
  "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=800&fit=crop&q=80",
  "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=1200&h=800&fit=crop&q=80",
];

const leaseListings = [
  {
    title: "Lease - Grade A Office, DLF Cyber City Phase 2",
    type: "Office Space",
    location: { address: "DLF Cyber City, Phase 2", city: "Gurugram", state: "Haryana" },
    price: 185000,
    size: 3200,
    financials: { price: 185000, priceUnit: "month", securityDeposit: 555000, maintenanceCharges: 11200 },
    specs: { size: 3200, sizeUnit: "sqft", furnishing: "Fully Furnished", parking: 8, cabins: 4, workstations: 40 },
    amenities: ["Central AC", "High-Speed Internet", "24/7 Security", "Conference Room"],
    images: officeImages,
    status: "Recently Posted",
    grade: "A+",
    description: "Ready-to-move furnished office on Golf Course Road corridor with metro connectivity and institutional-grade amenities.",
  },
  {
    title: "Lease - Bare Shell Office, One Horizon Center",
    type: "Office Space",
    location: { address: "Golf Course Road", city: "Gurugram", state: "Haryana" },
    price: 142000,
    size: 4500,
    financials: { price: 142000, priceUnit: "month", securityDeposit: 426000, maintenanceCharges: 15750 },
    specs: { size: 4500, sizeUnit: "sqft", furnishing: "Bare Shell", parking: 10, cabins: 0, workstations: 0 },
    amenities: ["Power Backup", "Elevator Access", "Visitor Parking", "Fire Safety System"],
    images: officeImages.slice(1),
    status: "Trending",
    grade: "A",
    description: "Large-format bare shell office floor suitable for custom fit-out with strong visibility on Golf Course Road.",
  },
  {
    title: "Lease - Furnished Office, Udyog Vihar Phase 4",
    type: "Office Space",
    location: { address: "Udyog Vihar Phase 4", city: "Gurugram", state: "Haryana" },
    price: 98000,
    size: 2100,
    financials: { price: 98000, priceUnit: "month", securityDeposit: 294000, maintenanceCharges: 7350 },
    specs: { size: 2100, sizeUnit: "sqft", furnishing: "Semi Furnished", parking: 4, cabins: 2, workstations: 24 },
    amenities: ["Central AC", "Cafeteria", "CCTV Surveillance", "Housekeeping"],
    images: officeImages,
    status: "Recently Posted",
    grade: "A",
    description: "Mid-size semi-furnished office in Udyog Vihar with efficient layout and immediate occupancy.",
  },
  {
    title: "Lease - Retail Shop, MG Road High Street",
    type: "Shop",
    location: { address: "MG Road", city: "Gurugram", state: "Haryana" },
    price: 125000,
    size: 950,
    financials: { price: 125000, priceUnit: "month", securityDeposit: 375000, maintenanceCharges: 4750 },
    specs: { size: 950, sizeUnit: "sqft", furnishing: "Bare Shell", parking: 2 },
    amenities: ["Power Backup", "High Street Frontage", "24/7 Security"],
    images: shopImages,
    status: "Recently Posted",
    grade: "A",
    description: "High-street retail shop on MG Road with strong footfall and brand visibility.",
  },
  {
    title: "Lease - Corner Retail Unit, Sector 29",
    type: "Shop",
    location: { address: "Sector 29", city: "Gurugram", state: "Haryana" },
    price: 88000,
    size: 720,
    financials: { price: 88000, priceUnit: "month", securityDeposit: 264000, maintenanceCharges: 3600 },
    specs: { size: 720, sizeUnit: "sqft", furnishing: "Warm Shell", parking: 1 },
    amenities: ["Central AC", "Power Backup", "Visitor Parking"],
    images: shopImages.slice(1),
    status: "Trending",
    grade: "B+",
    description: "Corner retail unit in Sector 29 dining and lifestyle cluster, ideal for F&B or service retail.",
  },
];

async function seedLeaseSamples() {
  try {
    await connectDB();

    const existing = await Property.countDocuments({ title: /^Lease - / });
    if (existing >= leaseListings.length) {
      console.log(`Lease samples already present (${existing}). Skipping.`);
      process.exit(0);
    }

    const inserted = await Property.insertMany(leaseListings);
    console.log(`Inserted ${inserted.length} lease sample listings`);
    console.log(`   - Office Space: ${inserted.filter((item) => item.type === "Office Space").length}`);
    console.log(`   - Shop: ${inserted.filter((item) => item.type === "Shop").length}`);
    process.exit(0);
  } catch (error) {
    console.error("Lease sample seed failed:", error.message);
    process.exit(1);
  }
}

seedLeaseSamples();
