"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { CheckCircle2, UploadCloud, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EnterpriseInput, EnterpriseSelect, EnterpriseTextarea, FormField, FormSection } from "@/components/forms/EnterpriseForm";
import { useToast } from "@/components/providers/ToastProvider";
import { MAX_IMAGE_SIZE_BYTES, MAX_IMAGE_SIZE_MB, compressImageFile } from "@/utils/compressImage";
import type { CoworkingSpace } from "@/types/coworking";

const MAX_IMAGES = 3;

interface CoworkingListingFormProps {
  initialSpace?: CoworkingSpace;
  submitLabel?: string;
  onSubmit: (data: Partial<CoworkingSpace>) => Promise<void>;
}

export default function CoworkingListingForm({
  initialSpace,
  submitLabel = "Save Coworking Space",
  onSubmit,
}: CoworkingListingFormProps) {
  const { showToast } = useToast();
  const initialImages = useMemo(() => initialSpace?.images || [], [initialSpace]);
  const [images, setImages] = useState<string[]>(initialImages);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setImages(initialSpace?.images || []);
  }, [initialSpace]);

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const availableSlots = MAX_IMAGES - images.length;

    if (files.length === 0) return;

    if (files.length > availableSlots) {
      showToast({
        type: "error",
        title: "Too many images",
        message: availableSlots > 0
          ? `You can add ${availableSlots} more image${availableSlots === 1 ? "" : "s"}.`
          : "Remove an image before adding a new one.",
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

    try {
      const encoded = await Promise.all(files.map((file) => compressImageFile(file)));
      setImages((current) => [...current, ...encoded].slice(0, MAX_IMAGES));
    } catch {
      showToast({ type: "error", title: "Image upload failed", message: "Please try another image file." });
    } finally {
      event.target.value = "";
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((current) => current.filter((_, imageIndex) => imageIndex !== index));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (images.length === 0) {
      showToast({ type: "error", title: "Images required", message: "Add at least one coworking space image." });
      return;
    }

    const formData = new FormData(event.currentTarget);

    try {
      setLoading(true);
      await onSubmit({
        title: String(formData.get("title") || ""),
        operator: String(formData.get("operator") || ""),
        website: String(formData.get("website") || "") || undefined,
        location: {
          address: String(formData.get("address") || ""),
          city: String(formData.get("city") || ""),
          state: String(formData.get("state") || ""),
          micromarket: String(formData.get("micromarket") || "") || undefined,
          landmark: String(formData.get("landmark") || "") || undefined,
        },
        monthlySeatPrice: Number(formData.get("monthlySeatPrice") || 0),
        priceLabel: String(formData.get("priceLabel") || ""),
        workspaceType: String(formData.get("workspaceType") || "Coworking Space"),
        description: String(formData.get("description") || ""),
        amenities: String(formData.get("amenities") || "").split(",").map((item) => item.trim()).filter(Boolean),
        highlights: String(formData.get("highlights") || "").split(",").map((item) => item.trim()).filter(Boolean),
        images,
        specs: {
          seatsFrom: Number(formData.get("seatsFrom") || 1),
          privateCabins: formData.get("privateCabins") === "on",
          meetingRooms: formData.get("meetingRooms") === "on",
          internet: formData.get("internet") === "on",
          parking: formData.get("parking") === "on",
        },
        featured: formData.get("featured") === "on",
        isActive: formData.get("isActive") !== "off",
        listingStatus: (formData.get("listingStatus") as CoworkingSpace["listingStatus"]) || "published",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={(event) => void handleSubmit(event)} className="space-y-8">
      <FormSection title="Basic Details">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField label="Title">
            <EnterpriseInput name="title" defaultValue={initialSpace?.title} required />
          </FormField>
          <FormField label="Operator">
            <EnterpriseInput name="operator" defaultValue={initialSpace?.operator} required />
          </FormField>
          <FormField label="Website">
            <EnterpriseInput name="website" defaultValue={initialSpace?.website} />
          </FormField>
          <FormField label="Workspace Type">
            <EnterpriseInput name="workspaceType" defaultValue={initialSpace?.workspaceType || "Coworking Space"} />
          </FormField>
        </div>
      </FormSection>

      <FormSection title="Location">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField label="Address" className="md:col-span-2">
            <EnterpriseInput name="address" defaultValue={initialSpace?.location.address} required />
          </FormField>
          <FormField label="City">
            <EnterpriseInput name="city" defaultValue={initialSpace?.location.city} required />
          </FormField>
          <FormField label="State">
            <EnterpriseInput name="state" defaultValue={initialSpace?.location.state} required />
          </FormField>
          <FormField label="Micromarket">
            <EnterpriseInput name="micromarket" defaultValue={initialSpace?.location.micromarket} />
          </FormField>
          <FormField label="Landmark">
            <EnterpriseInput name="landmark" defaultValue={initialSpace?.location.landmark} />
          </FormField>
        </div>
      </FormSection>

      <FormSection title="Pricing & Listing">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField label="Monthly Seat Price">
            <EnterpriseInput name="monthlySeatPrice" type="number" defaultValue={initialSpace?.monthlySeatPrice} required />
          </FormField>
          <FormField label="Price Label">
            <EnterpriseInput name="priceLabel" defaultValue={initialSpace?.priceLabel} required />
          </FormField>
          <FormField label="Seats From">
            <EnterpriseInput name="seatsFrom" type="number" defaultValue={initialSpace?.specs?.seatsFrom || 1} />
          </FormField>
          <FormField label="Listing Status">
            <EnterpriseSelect
              name="listingStatus"
              defaultValue={initialSpace?.listingStatus || "published"}
              options={[
                { label: "Published", value: "published" },
                { label: "Paused", value: "paused" },
                { label: "Draft", value: "draft" },
              ]}
            />
          </FormField>
        </div>
        <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-700">
          <label className="inline-flex items-center gap-2"><input type="checkbox" name="featured" defaultChecked={initialSpace?.featured} /> Featured</label>
          <label className="inline-flex items-center gap-2"><input type="checkbox" name="isActive" defaultChecked={initialSpace?.isActive !== false} /> Active</label>
          <label className="inline-flex items-center gap-2"><input type="checkbox" name="privateCabins" defaultChecked={initialSpace?.specs?.privateCabins} /> Private Cabins</label>
          <label className="inline-flex items-center gap-2"><input type="checkbox" name="meetingRooms" defaultChecked={initialSpace?.specs?.meetingRooms} /> Meeting Rooms</label>
          <label className="inline-flex items-center gap-2"><input type="checkbox" name="internet" defaultChecked={initialSpace?.specs?.internet !== false} /> Internet</label>
          <label className="inline-flex items-center gap-2"><input type="checkbox" name="parking" defaultChecked={initialSpace?.specs?.parking} /> Parking</label>
        </div>
      </FormSection>

      <FormSection
        eyebrow="Visual Assets"
        title="Media Uploads"
        subtitle="Upload up to three images. At least one image is required for public display."
      >
        <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-[linear-gradient(135deg,#f8fafc,#ffffff)] p-6">
          <label className="flex cursor-pointer flex-col items-center justify-center gap-3 text-center text-sm text-slate-600">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-500/10 text-accent-500">
              <UploadCloud className="h-7 w-7" />
            </span>
            <span className="text-base font-semibold text-slate-950">
              {images.length === MAX_IMAGES
                ? `All ${MAX_IMAGES} coworking images are ready`
                : `Upload ${MAX_IMAGES - images.length} more image${MAX_IMAGES - images.length === 1 ? "" : "s"}`}
            </span>
            <span className="max-w-md text-sm leading-6 text-slate-500">JPEG, PNG, or WebP. Images are optimized automatically for faster loading.</span>
            <input type="file" accept="image/*" multiple className="sr-only" onChange={handleImageChange} disabled={images.length >= MAX_IMAGES} />
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
                    alt={`Coworking preview ${index + 1}`}
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

      <FormSection title="Content">
        <FormField label="Description">
          <EnterpriseTextarea name="description" defaultValue={initialSpace?.description} rows={4} required />
        </FormField>
        <FormField label="Amenities (comma separated)">
          <EnterpriseInput name="amenities" defaultValue={initialSpace?.amenities?.join(", ")} />
        </FormField>
        <FormField label="Highlights (comma separated)">
          <EnterpriseInput name="highlights" defaultValue={initialSpace?.highlights?.join(", ")} />
        </FormField>
      </FormSection>

      <Button type="submit" size="lg" disabled={loading}>{loading ? "Saving…" : submitLabel}</Button>
    </form>
  );
}
