#!/usr/bin/env node
/**
 * Validate PropertyDisplayStatus mapping for create/update/list flows.
 */
require("dotenv").config();

const prisma = require("../src/lib/prisma");
const {
  propertyDataToPrisma,
  toApiProperty,
  DISPLAY_STATUS_FROM_API,
  DISPLAY_STATUS_TO_API,
} = require("../src/lib/prisma/mappers");
const propertyService = require("../src/services/propertyService");
const { newLegacyMongoId, newUuid } = require("../src/lib/prisma/legacyId");

const TEST_TITLE = "__status_enum_validation__";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function cleanup() {
  await prisma.property.deleteMany({ where: { title: TEST_TITLE } });
}

async function testMapperRoundTrip() {
  const prismaPayload = propertyDataToPrisma({
    title: "x",
    type: "Office Space",
    location: { address: "a", city: "Gurugram", state: "Haryana" },
    price: 1000,
    size: 100,
    status: "Recently Posted",
    grade: "A+",
    description: "d",
  });

  assert(prismaPayload.status === "Recently_Posted", "API status should map to Recently_Posted");
  assert(prismaPayload.grade === "A_Plus", "API grade A+ should map to A_Plus");

  const api = toApiProperty({
    legacyMongoId: "x",
    title: "x",
    type: "Office_Space",
    locationAddress: "a",
    locationCity: "Gurugram",
    locationState: "Haryana",
    price: 1000,
    size: 100,
    status: "Recently_Posted",
    grade: "A_Plus",
    description: "d",
    amenities: [],
    highlights: [],
    images: [],
    imagePublicIds: [],
    isActive: true,
    featured: false,
    views: 0,
    enquiryCount: 0,
    listingStatus: "published",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  assert(api.status === "Recently Posted", "Prisma status should map to Recently Posted for API");
  assert(api.grade === "A+", "Prisma grade should map to A+ for API");
  console.log("PASS mapper round-trip");
}

async function testDirectPrismaCreate() {
  const data = propertyDataToPrisma({
    title: TEST_TITLE,
    type: "Office Space",
    location: { address: "Test", city: "Gurugram", state: "Haryana", pincode: "122001" },
    price: 50000,
    size: 500,
    financials: { price: 50000, priceUnit: "month" },
    status: "Recently Posted",
    grade: "A",
    description: "Status enum validation property",
    listingStatus: "published",
    isActive: true,
  });

  const created = await prisma.property.create({
    data: { id: newUuid(), legacyMongoId: newLegacyMongoId(), ...data },
  });

  assert(created.status === "Recently_Posted", "DB row should store Recently_Posted enum key");

  const api = toApiProperty(created);
  assert(api.status === "Recently Posted", "Listed property should expose Recently Posted");

  console.log("PASS direct prisma create with API status label");
  return created;
}

async function testPropertyServiceUpdate(property, adminUser) {
  const updated = await propertyService.updateByOwner(
    property.legacyMongoId,
    { status: "Trending", grade: "B+" },
    adminUser
  );

  assert(updated.status === "Trending", "Update should return Trending display label");

  const row = await prisma.property.findUnique({ where: { id: property.id } });
  assert(row.status === "Trending", "DB should store Trending enum");
  assert(row.grade === "B_Plus", "DB should store B_Plus grade enum");

  console.log("PASS admin property update");
}

async function testPropertyServiceCreateAdmin() {
  const created = await propertyService.create(
    {
      title: `${TEST_TITLE}-admin-create`,
      type: "Shop",
      location: { address: "Test Shop", city: "Gurugram", state: "Haryana", pincode: "122001" },
      price: 70000,
      size: 600,
      financials: { price: 70000, priceUnit: "month" },
      status: "Recently Posted",
      grade: "A+",
      description: "Admin create validation",
      listingStatus: "published",
      isActive: true,
    },
    null
  );

  assert(created.status === "Recently Posted", "Admin create should return display status");
  await prisma.property.deleteMany({ where: { title: `${TEST_TITLE}-admin-create` } });
  console.log("PASS admin property create (null actor, same as adminService)");
}

async function testPropertyServiceCreateSeller(sellerUser) {
  const created = await propertyService.create(
    {
      title: `${TEST_TITLE}-seller-create`,
      type: "Office Space",
      location: { address: "Test Office", city: "Gurugram", state: "Haryana", pincode: "122001" },
      price: 120000,
      size: 2200,
      financials: { price: 120000, priceUnit: "month" },
      status: "Recently Posted",
      description: "Seller create validation",
      images: ["https://example.com/1.jpg", "https://example.com/2.jpg", "https://example.com/3.jpg"],
      listingStatus: "published",
      isActive: true,
    },
    sellerUser
  );

  assert(created.status === "Recently Posted", "Seller create should return display status");
  await prisma.property.deleteMany({ where: { title: `${TEST_TITLE}-seller-create` } });
  console.log("PASS seller property create");
}

async function main() {
  console.log("DISPLAY_STATUS_FROM_API:", DISPLAY_STATUS_FROM_API);
  console.log("DISPLAY_STATUS_TO_API:", DISPLAY_STATUS_TO_API);

  await cleanup();
  await testMapperRoundTrip();

  const admin = await prisma.user.findFirst({
    where: { email: "admin@gmail.com" },
    select: { id: true, legacyMongoId: true, email: true, role: true, name: true },
  });
  assert(admin, "admin@gmail.com must exist for service tests");
  const adminUser = { _id: admin.legacyMongoId, role: admin.role, name: admin.name, email: admin.email };

  const property = await testDirectPrismaCreate();
  await testPropertyServiceUpdate(property, adminUser);
  await testPropertyServiceCreateAdmin();

  const seller = await prisma.user.findFirst({
    where: { role: "seller" },
    select: { legacyMongoId: true, role: true, name: true, email: true },
  });
  if (seller) {
    await testPropertyServiceCreateSeller({
      _id: seller.legacyMongoId,
      role: seller.role,
      name: seller.name,
      email: seller.email,
    });
  } else {
    console.log("SKIP seller property create (no seller user in DB)");
  }

  await cleanup();
  await prisma.$disconnect();
  console.log("\nAll status enum validation checks passed.");
}

main().catch(async (err) => {
  console.error("FAIL:", err.message);
  try {
    await cleanup();
    await prisma.$disconnect();
  } catch {
    /* ignore */
  }
  process.exit(1);
});
