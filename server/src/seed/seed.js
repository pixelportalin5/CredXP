require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });
const mongoose = require("mongoose");
const Property = require("../models/Property");
const connectDB = require("../config/db");

// Stable Unsplash image URLs - using picsum.photos as reliable CDN with seed IDs for consistency
const officeImages = [
  "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=500&fit=crop&q=80",
  "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&h=500&fit=crop&q=80",
  "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&h=500&fit=crop&q=80",
  "https://images.unsplash.com/photo-1556761175-4b46a572b786?w=800&h=500&fit=crop&q=80",
  "https://images.unsplash.com/photo-1568992687947-868a62a9f521?w=800&h=500&fit=crop&q=80",
  "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&h=500&fit=crop&q=80",
  "https://images.unsplash.com/photo-1606836576983-8b458e75221d?w=800&h=500&fit=crop&q=80",
  "https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?w=800&h=500&fit=crop&q=80",
];

const shopImages = [
  "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=500&fit=crop&q=80",
  "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800&h=500&fit=crop&q=80",
  "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=500&fit=crop&q=80",
  "https://images.unsplash.com/photo-1582037928769-181f2644ecb7?w=800&h=500&fit=crop&q=80",
  "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=500&fit=crop&q=80",
  "https://images.unsplash.com/photo-1604328698692-f76ea9498e76?w=800&h=500&fit=crop&q=80",
  "https://images.unsplash.com/photo-1555529771-835f59fc5efe?w=800&h=500&fit=crop&q=80",
  "https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?w=800&h=500&fit=crop&q=80",
];

function pickRandom(arr, count = 1) {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return count === 1 ? shuffled[0] : shuffled.slice(0, count);
}

const bangaloreAreas = [
  "Koramangala", "Indiranagar", "Whitefield", "Electronic City",
  "MG Road", "Brigade Road", "Jayanagar", "HSR Layout",
  "Marathahalli", "Hebbal", "Rajajinagar", "Malleswaram",
  "Sadashivanagar", "Yelahanka", "Bannerghatta Road",
  "JP Nagar", "BTM Layout", "Banashankari", "Bellandur",
  "Sarjapur Road",
];

const officeAmenities = [
  "Central AC", "High-Speed WiFi", "24/7 Security", "CCTV Surveillance",
  "Dedicated Parking", "Conference Room", "Cafeteria", "Backup Generator",
  "Elevator Access", "Reception Area", "Server Room", "Pantry",
  "Fire Safety System", "Housekeeping", "Visitor Parking",
  "EV Charging Station", "Gym Access", "Rooftop Lounge",
];

const shopAmenities = [
  "Central AC", "Power Backup", "CCTV Surveillance", "Fire Safety",
  "Display Window", "Storage Room", "Restroom", "Loading Bay",
  "Customer Parking", "Glass Frontage", "Rolling Shutter",
  "Water Supply", "Signage Space", "Wheelchair Access",
];

function generateProperties() {
  const properties = [];

  const officeTemplates = [
    { prefix: "Premium", suffix: "Office Suite" },
    { prefix: "Modern", suffix: "Workspace" },
    { prefix: "Executive", suffix: "Office Floor" },
    { prefix: "Co-Working", suffix: "Hub" },
    { prefix: "Tech", suffix: "Office Park" },
    { prefix: "Elite", suffix: "Business Center" },
    { prefix: "Startup", suffix: "Office Space" },
    { prefix: "Corporate", suffix: "Office Tower" },
    { prefix: "Flexi", suffix: "Work Studio" },
    { prefix: "Open-Plan", suffix: "Office Loft" },
  ];

  const shopTemplates = [
    { prefix: "Prime", suffix: "Retail Space" },
    { prefix: "Corner", suffix: "Shop" },
    { prefix: "High Street", suffix: "Showroom" },
    { prefix: "Mall", suffix: "Retail Unit" },
    { prefix: "Premium", suffix: "Storefront" },
    { prefix: "Boutique", suffix: "Shop Space" },
    { prefix: "Ground Floor", suffix: "Commercial Unit" },
    { prefix: "Flagship", suffix: "Retail Outlet" },
    { prefix: "Drive-In", suffix: "Shop" },
    { prefix: "Double-Height", suffix: "Showroom" },
  ];

  const officeDescriptions = [
    "Fully furnished premium office space with panoramic city views. Features modern interiors, ergonomic workstations, and dedicated meeting rooms. Ideal for IT companies and consulting firms.",
    "Bright and airy co-working space designed for startups and freelancers. Includes high-speed internet, printer access, and a well-stocked pantry. Flexible lease terms available.",
    "Grade-A office floor in a prestigious tech park with world-class amenities. Fiber optic connectivity, 24/7 access, and on-site food court. Perfect for scaling teams.",
    "Contemporary open-plan office with industrial-chic interiors. Large windows flood the space with natural light. Located near metro station for easy commute.",
    "Plug-and-play office suite with all utilities included. Move-in ready with AC, furniture, and networking infrastructure. Suitable for teams of 20-50 people.",
    "Exclusive corner office with private balcony and premium finishes. Executive boardroom, dedicated washroom, and VIP parking. Built for C-suite executives.",
    "Smart office space with IoT-enabled climate control and lighting. Green building certified with energy-efficient systems. Reduced operational costs guaranteed.",
    "Heritage building converted into a stunning modern workspace. Exposed brick walls meet contemporary furniture. A unique environment that inspires creativity.",
  ];

  const shopDescriptions = [
    "High-visibility retail space on a bustling commercial street. Large glass frontage ensures maximum exposure. Suitable for fashion, electronics, or lifestyle brands.",
    "Compact and affordable shop unit in a popular neighborhood market. Steady foot traffic and established customer base. Ideal for food, grocery, or service businesses.",
    "Spacious showroom with double-height ceilings and premium flooring. Dedicated customer parking and loading bay. Perfect for automobile, furniture, or luxury retail.",
    "Modern retail unit inside a premium shopping mall. Escalator-level access with anchor store adjacency. Benefits from mall marketing and festive promotions.",
    "Corner shop with dual road access and excellent visibility. Independent entry with rolling shutter security. Great for pharmacy, bakery, or convenience store.",
    "Ground-floor commercial space in a residential complex. Captive audience of 500+ families. Ideal for salon, clinic, gym, or daily-needs store.",
    "Drive-in shop space on a national highway service road. Massive signage opportunity and truck-friendly access. Suitable for auto parts, hardware, or wholesale.",
    "Boutique retail space in an upscale lifestyle center. Curated tenant mix with high-net-worth footfall. Premium finishes and dedicated air conditioning.",
  ];

  // Generate 28 office spaces
  for (let i = 0; i < 28; i++) {
    const area = bangaloreAreas[i % bangaloreAreas.length];
    const template = officeTemplates[i % officeTemplates.length];
    const size = 800 + Math.floor(Math.random() * 9200);
    const pricePerSqft = 25 + Math.floor(Math.random() * 55);
    const price = Math.round((size * pricePerSqft) / 100) * 100;

    properties.push({
      title: `${template.prefix} ${template.suffix} – ${area}`,
      type: "Office Space",
      location: {
        address: `${Math.floor(Math.random() * 200) + 1}, ${["1st Main", "2nd Cross", "3rd Block", "4th Phase", "5th Avenue", "Service Road", "Outer Ring Road", "Old Airport Road"][i % 8]}, ${area}`,
        city: area,
        state: "Karnataka",
      },
      price,
      size,
      amenities: pickRandom(officeAmenities, 4 + Math.floor(Math.random() * 5)),
      images: pickRandom(officeImages, 2 + Math.floor(Math.random() * 3)),
      status: i % 3 === 0 ? "Trending" : "Recently Posted",
      description: officeDescriptions[i % officeDescriptions.length],
    });
  }

  // Generate 24 shops
  for (let i = 0; i < 24; i++) {
    const area = bangaloreAreas[i % bangaloreAreas.length];
    const template = shopTemplates[i % shopTemplates.length];
    const size = 200 + Math.floor(Math.random() * 3300);
    const pricePerSqft = 40 + Math.floor(Math.random() * 80);
    const price = Math.round((size * pricePerSqft) / 100) * 100;

    properties.push({
      title: `${template.prefix} ${template.suffix} – ${area}`,
      type: "Shop",
      location: {
        address: `${Math.floor(Math.random() * 150) + 1}, ${["Main Road", "Cross Road", "Market Street", "Commercial Street", "Ring Road", "Highway Junction", "Town Center", "Mall Road"][i % 8]}, ${area}`,
        city: area,
        state: "Karnataka",
      },
      price,
      size,
      amenities: pickRandom(shopAmenities, 3 + Math.floor(Math.random() * 4)),
      images: pickRandom(shopImages, 2 + Math.floor(Math.random() * 3)),
      status: i % 4 === 0 ? "Trending" : "Recently Posted",
      description: shopDescriptions[i % shopDescriptions.length],
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
    console.log(`   - Office Spaces: ${inserted.filter((p) => p.type === "Office Space").length}`);
    console.log(`   - Shops: ${inserted.filter((p) => p.type === "Shop").length}`);
    console.log(`   - Trending: ${inserted.filter((p) => p.status === "Trending").length}`);
    console.log(`   - Recently Posted: ${inserted.filter((p) => p.status === "Recently Posted").length}\n`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Seed failed:", error.message);
    process.exit(1);
  }
};

seedDB();
