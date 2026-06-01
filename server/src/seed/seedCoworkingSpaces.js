require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });

const path = require("path");
const connectDB = require("../config/db");
const CoworkingSpace = require("../models/CoworkingSpace");
const User = require("../models/User");

const ADMIN_EMAIL = "admin@gmail.com";
const TEMP_IMAGES = ["/images/office1.png", "/images/office2.png", "/images/office1.png"];

async function seedCoworkingSpaces() {
  await connectDB();

  const admin = await User.findOne({ email: ADMIN_EMAIL });
  if (!admin) {
    throw new Error(`Admin user not found: ${ADMIN_EMAIL}`);
  }

  const spaces = [
    {
      title: "Regus Iris Tech Park Sector 48",
      operator: "Regus",
      website: "https://www.regus.com/en",
      seller: admin._id,
      location: {
        address: "Iris Tech Park, Sector 48",
        city: "Gurugram",
        state: "Haryana",
        micromarket: "Sector 48",
        landmark: "Iris Tech Park",
      },
      monthlySeatPrice: 10000,
      priceLabel: "Seats start at ₹10,000 per month",
      workspaceType: "Business Centre",
      images: TEMP_IMAGES,
      amenities: ["High-speed internet", "Meeting rooms", "Reception", "Business lounge", "Parking", "Power backup"],
      highlights: ["Iris Tech Park location", "Flexible desks and offices", "Managed workspace by Regus"],
      description: "Flexible coworking and business centre space by Regus at Iris Tech Park, Sector 48, Gurugram. Seats start at ₹10,000 per month.",
      specs: {
        seatsFrom: 1,
        privateCabins: true,
        meetingRooms: true,
        internet: true,
        parking: true,
      },
      isActive: true,
      featured: true,
      listingStatus: "published",
    },
    {
      title: "Desq Worx Iris Tech Park Sector 48",
      operator: "Desq Worx",
      website: "https://www.desqworx.com/",
      seller: admin._id,
      location: {
        address: "Iris Tech Park, Sector 48",
        city: "Gurugram",
        state: "Haryana",
        micromarket: "Sector 48",
        landmark: "Iris Tech Park",
      },
      monthlySeatPrice: 10000,
      priceLabel: "Seats start at ₹10,000 per month",
      workspaceType: "Managed Coworking",
      images: TEMP_IMAGES,
      amenities: ["High-speed internet", "Conference rooms", "Managed reception", "Tea and coffee", "Parking", "Power backup"],
      highlights: ["Iris Tech Park location", "Managed coworking by Desq Worx", "Flexible seating plans"],
      description: "Managed coworking space by Desq Worx at Iris Tech Park, Sector 48, Gurugram. Seats start at ₹10,000 per month.",
      specs: {
        seatsFrom: 1,
        privateCabins: true,
        meetingRooms: true,
        internet: true,
        parking: true,
      },
      isActive: true,
      featured: true,
      listingStatus: "published",
    },
  ];

  const deleted = await CoworkingSpace.deleteMany({});
  const inserted = await CoworkingSpace.insertMany(spaces);

  console.log(JSON.stringify({
    success: true,
    deletedCoworkingSpaces: deleted.deletedCount,
    importedCoworkingSpaces: inserted.length,
    ownerEmail: admin.email,
    ownerId: admin._id,
  }, null, 2));

  process.exit(0);
}

seedCoworkingSpaces().catch((error) => {
  console.error("Coworking seed failed:", error.message);
  process.exit(1);
});
