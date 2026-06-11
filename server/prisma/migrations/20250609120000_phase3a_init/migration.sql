-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('buyer', 'seller', 'admin', 'employee');

-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('active', 'disabled');

-- CreateEnum
CREATE TYPE "PropertyListingType" AS ENUM ('Pre-Leased Office', 'Office Space', 'Retail/SCO', 'Coworking', 'Coworking Space', 'Shop', 'Warehouse', 'Commercial Land');

-- CreateEnum
CREATE TYPE "PriceUnit" AS ENUM ('month', 'year', 'sqft', 'total');

-- CreateEnum
CREATE TYPE "SizeUnit" AS ENUM ('sqft', 'sqm');

-- CreateEnum
CREATE TYPE "FurnishingType" AS ENUM ('Fully Furnished', 'Semi Furnished', 'Bare Shell', 'Warm Shell');

-- CreateEnum
CREATE TYPE "PropertyDisplayStatus" AS ENUM ('Recently Posted', 'Trending');

-- CreateEnum
CREATE TYPE "PropertyGrade" AS ENUM ('A', 'A+', 'B', 'B+');

-- CreateEnum
CREATE TYPE "PropertyListingStatus" AS ENUM ('draft', 'published', 'paused', 'sold');

-- CreateEnum
CREATE TYPE "CoworkingListingStatus" AS ENUM ('draft', 'published', 'paused');

-- CreateEnum
CREATE TYPE "EnquiryStatus" AS ENUM ('open', 'closed');

-- CreateEnum
CREATE TYPE "ContactEnquiryType" AS ENUM ('Investment Advisory', 'Office Leasing', 'Coworking', 'Partnership', 'General Enquiry');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "legacy_mongo_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "phone" TEXT,
    "avatar" TEXT,
    "avatar_public_id" TEXT DEFAULT '',
    "role" "UserRole" NOT NULL DEFAULT 'buyer',
    "account_status" "AccountStatus" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "properties" (
    "id" UUID NOT NULL,
    "legacy_mongo_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "PropertyListingType" NOT NULL,
    "seller_id" UUID,
    "location_address" TEXT NOT NULL,
    "location_city" TEXT NOT NULL,
    "location_state" TEXT NOT NULL,
    "location_pincode" TEXT,
    "location_micromarket" TEXT,
    "location_landmark" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "size" DOUBLE PRECISION NOT NULL,
    "financial_price" DOUBLE PRECISION,
    "financial_price_unit" "PriceUnit",
    "financial_security_deposit" DOUBLE PRECISION,
    "financial_maintenance_charges" DOUBLE PRECISION,
    "financial_rental_yield" DOUBLE PRECISION,
    "financial_cap_rate" DOUBLE PRECISION,
    "financial_escalation" TEXT,
    "spec_size" DOUBLE PRECISION,
    "spec_size_unit" "SizeUnit",
    "spec_floors" INTEGER,
    "spec_total_floors" INTEGER,
    "spec_furnishing" "FurnishingType",
    "spec_parking" INTEGER,
    "spec_cabins" INTEGER,
    "spec_workstations" INTEGER,
    "spec_meeting_rooms" INTEGER,
    "spec_pantry" BOOLEAN,
    "spec_washrooms" INTEGER,
    "tenant_name" TEXT,
    "tenant_industry" TEXT,
    "tenant_lease_expiry" TEXT,
    "tenant_lock_in_period" TEXT,
    "amenities" TEXT[],
    "highlights" TEXT[],
    "images" TEXT[],
    "image_public_ids" TEXT[],
    "cover_image" TEXT DEFAULT '',
    "cover_image_public_id" TEXT DEFAULT '',
    "status" "PropertyDisplayStatus" NOT NULL DEFAULT 'Recently Posted',
    "grade" "PropertyGrade",
    "occupancy" DOUBLE PRECISION,
    "rera_id" TEXT,
    "building_name" TEXT,
    "description" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "views" INTEGER NOT NULL DEFAULT 0,
    "enquiry_count" INTEGER NOT NULL DEFAULT 0,
    "listing_status" "PropertyListingStatus" NOT NULL DEFAULT 'published',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "properties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coworking_spaces" (
    "id" UUID NOT NULL,
    "legacy_mongo_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "operator" TEXT NOT NULL,
    "website" TEXT,
    "seller_id" UUID,
    "location_address" TEXT NOT NULL,
    "location_city" TEXT NOT NULL,
    "location_state" TEXT NOT NULL,
    "location_micromarket" TEXT,
    "location_landmark" TEXT,
    "monthly_seat_price" DOUBLE PRECISION NOT NULL,
    "price_label" TEXT NOT NULL,
    "workspace_type" TEXT NOT NULL DEFAULT 'Coworking Space',
    "images" TEXT[],
    "image_public_ids" TEXT[],
    "cover_image" TEXT DEFAULT '',
    "cover_image_public_id" TEXT DEFAULT '',
    "amenities" TEXT[],
    "highlights" TEXT[],
    "description" TEXT NOT NULL,
    "spec_seats_from" INTEGER,
    "spec_private_cabins" BOOLEAN,
    "spec_meeting_rooms" BOOLEAN,
    "spec_internet" BOOLEAN,
    "spec_parking" BOOLEAN,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "views" INTEGER NOT NULL DEFAULT 0,
    "enquiry_count" INTEGER NOT NULL DEFAULT 0,
    "listing_status" "CoworkingListingStatus" NOT NULL DEFAULT 'published',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coworking_spaces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "enquiries" (
    "id" UUID NOT NULL,
    "legacy_mongo_id" TEXT NOT NULL,
    "customer_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "message" TEXT,
    "property_id" UUID,
    "coworking_space_id" UUID,
    "seller_id" UUID,
    "user_id" UUID,
    "user_archived" BOOLEAN NOT NULL DEFAULT false,
    "status" "EnquiryStatus" NOT NULL DEFAULT 'open',
    "closed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "enquiries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proposals" (
    "id" UUID NOT NULL,
    "legacy_mongo_id" TEXT NOT NULL,
    "created_by_id" UUID NOT NULL,
    "property_id" UUID NOT NULL,
    "property_title" TEXT NOT NULL,
    "property_type" TEXT,
    "agent" JSONB NOT NULL,
    "property_snapshot" JSONB NOT NULL,
    "cover_image" TEXT,
    "cover_image_public_id" TEXT DEFAULT '',
    "prepared_for" JSONB,
    "agent_research" JSONB,
    "overview_fields" JSONB,
    "detail_fields" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "proposals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saved_properties" (
    "id" UUID NOT NULL,
    "legacy_mongo_id" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    "property_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "saved_properties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_messages" (
    "id" UUID NOT NULL,
    "legacy_mongo_id" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "enquiry_type" "ContactEnquiryType" NOT NULL,
    "message" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contact_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL,
    "legacy_mongo_id" TEXT NOT NULL,
    "actor_id" UUID,
    "action" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_legacy_mongo_id" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "migration_checkpoints" (
    "id" UUID NOT NULL,
    "phase" TEXT NOT NULL,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "migration_checkpoints_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_legacy_mongo_id_key" ON "users"("legacy_mongo_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_account_status_idx" ON "users"("account_status");

-- CreateIndex
CREATE UNIQUE INDEX "properties_legacy_mongo_id_key" ON "properties"("legacy_mongo_id");

-- CreateIndex
CREATE INDEX "properties_created_at_idx" ON "properties"("created_at" DESC);

-- CreateIndex
CREATE INDEX "properties_price_idx" ON "properties"("price");

-- CreateIndex
CREATE INDEX "properties_size_idx" ON "properties"("size");

-- CreateIndex
CREATE INDEX "properties_financial_rental_yield_idx" ON "properties"("financial_rental_yield" DESC);

-- CreateIndex
CREATE INDEX "properties_is_active_listing_status_created_at_idx" ON "properties"("is_active", "listing_status", "created_at" DESC);

-- CreateIndex
CREATE INDEX "properties_type_is_active_listing_status_idx" ON "properties"("type", "is_active", "listing_status");

-- CreateIndex
CREATE INDEX "properties_location_city_is_active_idx" ON "properties"("location_city", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "coworking_spaces_legacy_mongo_id_key" ON "coworking_spaces"("legacy_mongo_id");

-- CreateIndex
CREATE INDEX "coworking_spaces_is_active_listing_status_featured_created__idx" ON "coworking_spaces"("is_active", "listing_status", "featured" DESC, "created_at" DESC);

-- CreateIndex
CREATE INDEX "coworking_spaces_location_city_is_active_idx" ON "coworking_spaces"("location_city", "is_active");

-- CreateIndex
CREATE INDEX "coworking_spaces_operator_is_active_idx" ON "coworking_spaces"("operator", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "enquiries_legacy_mongo_id_key" ON "enquiries"("legacy_mongo_id");

-- CreateIndex
CREATE INDEX "enquiries_status_idx" ON "enquiries"("status");

-- CreateIndex
CREATE INDEX "enquiries_property_id_idx" ON "enquiries"("property_id");

-- CreateIndex
CREATE INDEX "enquiries_coworking_space_id_idx" ON "enquiries"("coworking_space_id");

-- CreateIndex
CREATE INDEX "enquiries_user_id_idx" ON "enquiries"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "proposals_legacy_mongo_id_key" ON "proposals"("legacy_mongo_id");

-- CreateIndex
CREATE INDEX "proposals_created_by_id_idx" ON "proposals"("created_by_id");

-- CreateIndex
CREATE INDEX "proposals_property_id_idx" ON "proposals"("property_id");

-- CreateIndex
CREATE UNIQUE INDEX "saved_properties_legacy_mongo_id_key" ON "saved_properties"("legacy_mongo_id");

-- CreateIndex
CREATE INDEX "saved_properties_user_id_idx" ON "saved_properties"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "saved_properties_user_id_property_id_key" ON "saved_properties"("user_id", "property_id");

-- CreateIndex
CREATE UNIQUE INDEX "contact_messages_legacy_mongo_id_key" ON "contact_messages"("legacy_mongo_id");

-- CreateIndex
CREATE INDEX "contact_messages_created_at_idx" ON "contact_messages"("created_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "audit_logs_legacy_mongo_id_key" ON "audit_logs"("legacy_mongo_id");

-- CreateIndex
CREATE INDEX "audit_logs_actor_id_idx" ON "audit_logs"("actor_id");

-- CreateIndex
CREATE INDEX "audit_logs_entity_type_entity_legacy_mongo_id_idx" ON "audit_logs"("entity_type", "entity_legacy_mongo_id");

-- CreateIndex
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at" DESC);

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coworking_spaces" ADD CONSTRAINT "coworking_spaces_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enquiries" ADD CONSTRAINT "enquiries_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enquiries" ADD CONSTRAINT "enquiries_coworking_space_id_fkey" FOREIGN KEY ("coworking_space_id") REFERENCES "coworking_spaces"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enquiries" ADD CONSTRAINT "enquiries_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enquiries" ADD CONSTRAINT "enquiries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_properties" ADD CONSTRAINT "saved_properties_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_properties" ADD CONSTRAINT "saved_properties_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
