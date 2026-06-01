"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { CheckCircle2, Eye, ImagePlus, UploadCloud, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EnterpriseInput, EnterpriseSelect, EnterpriseTextarea, FormField, FormSection } from "@/components/forms/EnterpriseForm";
import { useToast } from "@/components/providers/ToastProvider";
import type { Property } from "@/types/property";

type ListingFormValues = Partial<Property> & {
  images: string[];
};

const defaultValues: ListingFormValues = {
  title: "",
  type: "Office Space",
  location: { address: "", city: "", state: "" },
  price: 0,
  size: 0,
  financials: { price: 0, priceUnit: "month" },
  specs: { size: 0, sizeUnit: "sqft", pantry: false },
  tenant: {},
  amenities: [],
  images: [],
  status: "Recently Posted",
  grade: "A",
  occupancy: 0,
  reraId: "",
  buildingName: "",
  highlights: [],
  description: "",
  isActive: true,
  featured: false,
  listingStatus: "published",
};

function toNumber(value: FormDataEntryValue | null) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function toOptionalNumber(value: FormDataEntryValue | null) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && value !== "" ? parsed : undefined;
}

function splitList(value: FormDataEntryValue | null) {
  return String(value || "")
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

const MAX_IMAGE_SIZE_MB = 4;
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;

interface PropertyListingFormProps {
  initialProperty?: Property;
  submitLabel?: string;
  onSubmit: (data: Partial<Property>) => Promise<void>;
}

export default function PropertyListingForm({
  initialProperty,
  submitLabel = "Publish Property",
  onSubmit,
}: PropertyListingFormProps) {
  const { showToast } = useToast();
  const initialValues = useMemo(
    () => ({ ...defaultValues, ...initialProperty }),
    [initialProperty]
  );
  const [images, setImages] = useState<string[]>(initialValues.images || []);
  const [loading, setLoading] = useState(false);

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const availableSlots = 3 - images.length;

    if (files.length === 0) {
      return;
    }

    if (files.length > availableSlots) {
      showToast({
        type: "error",
        title: "Too many images",
        message: availableSlots > 0 ? `You can add ${availableSlots} more image${availableSlots === 1 ? "" : "s"}.` : "Remove an image before adding a new one.",
      });
      event.target.value = "";
      return;
    }

    const oversized = files.find((file) => file.size > MAX_IMAGE_SIZE_BYTES);
    if (oversized) {
      showToast({ type: "error", title: "Image too large", message: `Each image should be ${MAX_IMAGE_SIZE_MB}MB or smaller.` });
      event.target.value = "";
      return;
    }

    const encoded = await Promise.all(files.map(readFileAsDataUrl));
    setImages((current) => [...current, ...encoded].slice(0, 3));
    event.target.value = "";
  };

  const handleRemoveImage = (index: number) => {
    setImages((current) => current.filter((_, imageIndex) => imageIndex !== index));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    if (images.length !== 3) {
      showToast({ type: "error", title: "Exactly 3 images required", message: "Seller listings must include three images." });
      return;
    }

    const payload: Partial<Property> = {
      title: String(formData.get("title")),
      type: formData.get("type") as Property["type"],
      location: {
        address: String(formData.get("address")),
        city: String(formData.get("city")),
        state: String(formData.get("state")),
        pincode: String(formData.get("pincode") || ""),
        micromarket: String(formData.get("micromarket") || ""),
        landmark: String(formData.get("landmark") || ""),
      },
      price: toNumber(formData.get("price")),
      size: toNumber(formData.get("size")),
      financials: {
        price: toNumber(formData.get("financialPrice")),
        priceUnit: formData.get("priceUnit") as Property["financials"] extends infer T ? T extends { priceUnit?: infer U } ? U : never : never,
        securityDeposit: toOptionalNumber(formData.get("securityDeposit")),
        maintenanceCharges: toOptionalNumber(formData.get("maintenanceCharges")),
        rentalYield: toOptionalNumber(formData.get("rentalYield")),
        capRate: toOptionalNumber(formData.get("capRate")),
        escalation: String(formData.get("escalation") || ""),
      },
      specs: {
        size: toNumber(formData.get("specSize")),
        sizeUnit: formData.get("sizeUnit") as "sqft" | "sqm",
        floors: toOptionalNumber(formData.get("floors")),
        totalFloors: toOptionalNumber(formData.get("totalFloors")),
        furnishing: formData.get("furnishing") as Property["specs"] extends infer T ? T extends { furnishing?: infer U } ? U : never : never,
        parking: toOptionalNumber(formData.get("parking")),
        cabins: toOptionalNumber(formData.get("cabins")),
        workstations: toOptionalNumber(formData.get("workstations")),
        meetingRooms: toOptionalNumber(formData.get("meetingRooms")),
        pantry: formData.get("pantry") === "on",
        washrooms: toOptionalNumber(formData.get("washrooms")),
      },
      tenant: {
        name: String(formData.get("tenantName") || ""),
        industry: String(formData.get("tenantIndustry") || ""),
        leaseExpiry: String(formData.get("leaseExpiry") || ""),
        lockInPeriod: String(formData.get("lockInPeriod") || ""),
      },
      amenities: splitList(formData.get("amenities")),
      images,
      status: formData.get("status") as Property["status"],
      grade: formData.get("grade") as Property["grade"],
      occupancy: toOptionalNumber(formData.get("occupancy")),
      reraId: String(formData.get("reraId") || ""),
      buildingName: String(formData.get("buildingName") || ""),
      highlights: splitList(formData.get("highlights")),
      description: String(formData.get("description")),
      isActive: formData.get("isActive") === "on",
      featured: formData.get("featured") === "on",
      listingStatus: formData.get("listingStatus") as Property["listingStatus"],
    };

    try {
      setLoading(true);
      await onSubmit(payload);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <FormSection
        eyebrow="Listing Setup"
        title="Core Details"
        subtitle="Define how this listing appears across CredXP search and seller workflows."
      >
        <div className="grid gap-5 md:grid-cols-2">
          <FormField label="Listing Title">
            <EnterpriseInput name="title" defaultValue={initialValues.title} placeholder="Premium office floor in Cyber City" required />
          </FormField>
          <FormField label="Property Type">
            <EnterpriseSelect name="type" defaultValue={initialValues.type} required options={[
              { label: "Office Space", value: "Office Space" },
              { label: "Shop", value: "Shop" },
              { label: "Coworking Space", value: "Coworking Space" },
            ]} />
          </FormField>
          <FormField label="Price" helper="Monthly rent or expected commercial price.">
            <EnterpriseInput name="price" type="number" defaultValue={initialValues.price} required />
          </FormField>
          <FormField label="Area">
            <EnterpriseInput name="size" type="number" defaultValue={initialValues.size} required />
          </FormField>
        </div>
      </FormSection>

      <FormSection
        eyebrow="Address Intelligence"
        title="Location"
        subtitle="Add enough context for buyers and tenants to evaluate the micro-market quickly."
      >
        <div className="grid gap-5 md:grid-cols-3">
          <FormField label="Address" className="md:col-span-3">
            <EnterpriseInput name="address" defaultValue={initialValues.location?.address} placeholder="Building, road, sector" required />
          </FormField>
          <FormField label="City">
            <EnterpriseInput name="city" defaultValue={initialValues.location?.city} required />
          </FormField>
          <FormField label="State">
            <EnterpriseInput name="state" defaultValue={initialValues.location?.state} required />
          </FormField>
          <FormField label="Pincode">
            <EnterpriseInput name="pincode" defaultValue={initialValues.location?.pincode} />
          </FormField>
          <FormField label="Micromarket">
            <EnterpriseInput name="micromarket" defaultValue={initialValues.location?.micromarket} placeholder="Cyber City, Golf Course Road" />
          </FormField>
          <FormField label="Landmark" className="md:col-span-2">
            <EnterpriseInput name="landmark" defaultValue={initialValues.location?.landmark} placeholder="Near metro, mall, or major road" />
          </FormField>
        </div>
      </FormSection>

      <FormSection
        eyebrow="Commercial Profile"
        title="Financials & Specifications"
        subtitle="Capture commercial terms and fit-out details in a structured dashboard format."
      >
        <div className="grid gap-5 md:grid-cols-4">
          <FormField label="Financial Price">
            <EnterpriseInput name="financialPrice" type="number" defaultValue={initialValues.financials?.price || initialValues.price} />
          </FormField>
          <FormField label="Price Unit">
            <EnterpriseSelect name="priceUnit" defaultValue={initialValues.financials?.priceUnit || "month"} options={[
              { label: "Month", value: "month" },
              { label: "Year", value: "year" },
              { label: "Sqft", value: "sqft" },
              { label: "Total", value: "total" },
            ]} />
          </FormField>
          <FormField label="Security Deposit">
            <EnterpriseInput name="securityDeposit" type="number" defaultValue={initialValues.financials?.securityDeposit} />
          </FormField>
          <FormField label="Maintenance">
            <EnterpriseInput name="maintenanceCharges" type="number" defaultValue={initialValues.financials?.maintenanceCharges} />
          </FormField>
          <FormField label="Rental Yield">
            <EnterpriseInput name="rentalYield" type="number" step="0.01" defaultValue={initialValues.financials?.rentalYield} />
          </FormField>
          <FormField label="Cap Rate">
            <EnterpriseInput name="capRate" type="number" step="0.01" defaultValue={initialValues.financials?.capRate} />
          </FormField>
          <FormField label="Escalation" className="md:col-span-2">
            <EnterpriseInput name="escalation" defaultValue={initialValues.financials?.escalation} placeholder="10% every 3 years" />
          </FormField>
          <FormField label="Spec Size">
            <EnterpriseInput name="specSize" type="number" defaultValue={initialValues.specs?.size || initialValues.size} />
          </FormField>
          <FormField label="Size Unit">
            <EnterpriseSelect name="sizeUnit" defaultValue={initialValues.specs?.sizeUnit || "sqft"} options={[
              { label: "Sqft", value: "sqft" },
              { label: "Sqm", value: "sqm" },
            ]} />
          </FormField>
          <FormField label="Floor">
            <EnterpriseInput name="floors" type="number" defaultValue={initialValues.specs?.floors} />
          </FormField>
          <FormField label="Total Floors">
            <EnterpriseInput name="totalFloors" type="number" defaultValue={initialValues.specs?.totalFloors} />
          </FormField>
          <FormField label="Furnishing">
            <EnterpriseSelect name="furnishing" defaultValue={initialValues.specs?.furnishing || "Fully Furnished"} options={[
              { label: "Fully Furnished", value: "Fully Furnished" },
              { label: "Semi Furnished", value: "Semi Furnished" },
              { label: "Bare Shell", value: "Bare Shell" },
              { label: "Warm Shell", value: "Warm Shell" },
            ]} />
          </FormField>
          <FormField label="Parking">
            <EnterpriseInput name="parking" type="number" defaultValue={initialValues.specs?.parking} />
          </FormField>
          <FormField label="Cabins">
            <EnterpriseInput name="cabins" type="number" defaultValue={initialValues.specs?.cabins} />
          </FormField>
          <FormField label="Workstations">
            <EnterpriseInput name="workstations" type="number" defaultValue={initialValues.specs?.workstations} />
          </FormField>
          <FormField label="Meeting Rooms">
            <EnterpriseInput name="meetingRooms" type="number" defaultValue={initialValues.specs?.meetingRooms} />
          </FormField>
          <FormField label="Washrooms">
            <EnterpriseInput name="washrooms" type="number" defaultValue={initialValues.specs?.washrooms} />
          </FormField>
        </div>
        <label className="mt-5 inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
          <input name="pantry" type="checkbox" defaultChecked={Boolean(initialValues.specs?.pantry)} className="h-4 w-4 rounded border-slate-300 text-accent-500" />
          Pantry available
        </label>
      </FormSection>

      <FormSection
        eyebrow="Experience Layer"
        title="Amenities"
        subtitle="Use commas or new lines to add the amenities shown on the public detail page."
      >
        <FormField label="Amenities">
          <EnterpriseTextarea name="amenities" defaultValue={initialValues.amenities?.join(", ")} placeholder="High-Speed Internet, Power Backup, Dedicated Parking" />
        </FormField>
      </FormSection>

      <FormSection
        eyebrow="Occupier Profile"
        title="Tenant Information"
        subtitle="Optional tenant and lease context for investment-grade listings."
      >
        <div className="grid gap-5 md:grid-cols-2">
          <FormField label="Tenant Name">
            <EnterpriseInput name="tenantName" defaultValue={initialValues.tenant?.name} />
          </FormField>
          <FormField label="Tenant Industry">
            <EnterpriseInput name="tenantIndustry" defaultValue={initialValues.tenant?.industry} />
          </FormField>
          <FormField label="Lease Expiry">
            <EnterpriseInput name="leaseExpiry" defaultValue={initialValues.tenant?.leaseExpiry} />
          </FormField>
          <FormField label="Lock-In Period">
            <EnterpriseInput name="lockInPeriod" defaultValue={initialValues.tenant?.lockInPeriod} />
          </FormField>
        </div>
      </FormSection>

      <FormSection
        eyebrow="Visual Assets"
        title="Media Uploads"
        subtitle="Seller listings require exactly three optimized images for public display."
      >
        <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-[linear-gradient(135deg,#f8fafc,#ffffff)] p-6">
          <label className="flex cursor-pointer flex-col items-center justify-center gap-3 text-center text-sm text-slate-600">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-500/10 text-accent-500">
              <UploadCloud className="h-7 w-7" />
            </span>
            <span className="text-base font-semibold text-slate-950">
              {images.length === 3 ? "All 3 property images are ready" : `Upload ${3 - images.length} more property image${3 - images.length === 1 ? "" : "s"}`}
            </span>
            <span className="max-w-md text-sm leading-6 text-slate-500">JPEG, PNG, or WebP. Keep each file under 4MB for faster listing performance.</span>
            <input type="file" accept="image/*" multiple className="sr-only" onChange={handleImageChange} disabled={images.length >= 3} />
          </label>
          {images.length > 0 && (
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {images.map((image, index) => (
                <div key={image.slice(0, 48) + index} className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
                  <button
                    type="button"
                    aria-label={`Remove image ${index + 1}`}
                    onClick={() => handleRemoveImage(index)}
                    className="absolute right-3 top-3 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/70 bg-slate-950/70 text-white shadow-lg backdrop-blur transition-colors hover:bg-red-500"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <Image
                    src={image}
                    alt={`Preview ${index + 1}`}
                    width={360}
                    height={180}
                    className="h-36 w-full rounded-xl object-cover"
                    unoptimized={image.startsWith("data:")}
                  />
                  <p className="mt-2 flex items-center gap-1.5 px-1 text-xs font-semibold text-emerald-600">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Image {index + 1} ready
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </FormSection>

      <FormSection
        eyebrow="Listing Narrative"
        title="Highlights & Description"
        subtitle="Write the premium positioning copy buyers and tenants will read first."
      >
        <div className="grid gap-5 md:grid-cols-2">
          <FormField label="Highlights">
            <EnterpriseTextarea name="highlights" defaultValue={initialValues.highlights?.join(", ")} placeholder="Metro connected, Ready to occupy, Strong frontage" />
          </FormField>
          <FormField label="Description">
            <EnterpriseTextarea name="description" defaultValue={initialValues.description} required className="min-h-36" />
          </FormField>
        </div>
      </FormSection>

      <FormSection
        eyebrow="Publishing Controls"
        title="Publishing Settings"
        subtitle="Control listing visibility, public status, and marketplace metadata."
      >
        <div className="grid gap-5 md:grid-cols-4">
          <FormField label="Public Status">
            <EnterpriseSelect name="status" defaultValue={initialValues.status} required options={[
              { label: "Recently Posted", value: "Recently Posted" },
              { label: "Trending", value: "Trending" },
            ]} />
          </FormField>
          <FormField label="Listing Status">
            <EnterpriseSelect name="listingStatus" defaultValue={initialValues.listingStatus} required options={[
              { label: "Published", value: "published" },
              { label: "Draft", value: "draft" },
              { label: "Paused", value: "paused" },
              { label: "Sold", value: "sold" },
            ]} />
          </FormField>
          <FormField label="Grade">
            <EnterpriseSelect name="grade" defaultValue={initialValues.grade || "A"} options={[
              { label: "A", value: "A" },
              { label: "A+", value: "A+" },
              { label: "B", value: "B" },
              { label: "B+", value: "B+" },
            ]} />
          </FormField>
          <FormField label="Occupancy %">
            <EnterpriseInput name="occupancy" type="number" defaultValue={initialValues.occupancy} />
          </FormField>
          <FormField label="Building Name" className="md:col-span-2">
            <EnterpriseInput name="buildingName" defaultValue={initialValues.buildingName} />
          </FormField>
          <FormField label="RERA ID" className="md:col-span-2">
            <EnterpriseInput name="reraId" defaultValue={initialValues.reraId} />
          </FormField>
        </div>
        <div className="mt-6 flex flex-wrap gap-4">
          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
            <input name="isActive" type="checkbox" defaultChecked={initialValues.isActive !== false} className="h-4 w-4 rounded border-slate-300 text-accent-500" />
            Active publicly
          </label>
          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
            <input name="featured" type="checkbox" defaultChecked={Boolean(initialValues.featured)} className="h-4 w-4 rounded border-slate-300 text-accent-500" />
            Featured listing
          </label>
        </div>
      </FormSection>

      <div className="sticky bottom-4 z-10 rounded-[1.5rem] border border-slate-200 bg-white/90 p-3 shadow-[0_18px_48px_rgba(15,23,42,0.12)] backdrop-blur">
        <Button type="submit" size="lg" loading={loading} fullWidth icon={<ImagePlus className="h-4 w-4" />} className="h-13 shadow-lg shadow-accent-500/20">
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
