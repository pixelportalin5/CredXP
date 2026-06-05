"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { MapPin, TrendingUp, Clock, ImageOff, Building2, Heart } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/components/providers/AuthProvider";
import { useToast } from "@/components/providers/ToastProvider";
import savedPropertyService from "@/services/saved-property.service";
import { cn } from "@/utils/cn";
import { formatPriceCompact, formatSize, formatYield } from "@/utils/format";
import { getPropertySectionCoverImage } from "@/utils/propertySections";
import type { Property } from "@/types/property";

interface PropertyCardProps {
  property: Property;
  variant?: "default" | "compact" | "featured";
  initialSaved?: boolean;
  onSavedChange?: (propertyId: string, saved: boolean) => void;
}

const STATUS_BADGE_MAP: Record<string, { variant: "warning" | "success" | "accent" | "info"; icon: React.ReactNode }> = {
  "Trending": { variant: "warning", icon: <TrendingUp className="h-3 w-3" /> },
  "Recently Posted": { variant: "success", icon: <Clock className="h-3 w-3" /> },
  "Pre-Leased": { variant: "accent", icon: <Building2 className="h-3 w-3" /> },
  "Available": { variant: "info", icon: null },
};

export default function PropertyCard({ property, variant = "default", initialSaved = false, onSavedChange }: PropertyCardProps) {
  const { _id, title, type, location, price, size, status, financials, grade, tenant } = property;
  const imageUrl = getPropertySectionCoverImage(property);
  const [imgError, setImgError] = useState(false);
  const [saved, setSaved] = useState(initialSaved);
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const { user } = useAuth();
  const { showToast } = useToast();

  const isCompact = variant === "compact" || variant === "default";
  const statusBadge = STATUS_BADGE_MAP[status] || { variant: "info" as const, icon: null };
  const rentalYield = financials?.rentalYield;

  const handleSaveClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (!user) {
      showToast({ type: "info", title: "Login required", message: "Login to save properties to your dashboard." });
      return;
    }
    try {
      setSaving(true);
      if (saved) {
        await savedPropertyService.remove(_id);
        setSaved(false);
        onSavedChange?.(_id, false);
        showToast({ type: "success", title: "Removed from saved" });
      } else {
        await savedPropertyService.save(_id);
        setSaved(true);
        onSavedChange?.(_id, true);
        showToast({ type: "success", title: "Property saved" });
      }
    } catch (error) {
      showToast({ type: "error", title: "Save failed", message: error instanceof Error ? error.message : "Please try again." });
    } finally {
      setSaving(false);
    }
  };

  const openProperty = () => router.push(`/properties/${_id}`);

  return (
    <article
      id={`property-card-${_id}`}
      role="link"
      tabIndex={0}
      aria-label={`Open ${title}`}
      onClick={openProperty}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openProperty();
        }
      }}
      className="group cursor-pointer overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-accent-500/30 hover:shadow-xl focus:outline-none focus-visible:border-accent-500/30 focus-visible:shadow-xl"
    >
      <div className="relative overflow-hidden bg-pink-50/70">
        <div className="relative aspect-square w-full">
          {imgError || !imageUrl ? (
            <div className="placeholder-surface flex h-full w-full items-center justify-center text-pink-400">
              <ImageOff className="h-10 w-10" />
            </div>
          ) : (
            <Image
              src={imageUrl}
              alt={title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              unoptimized={imageUrl.startsWith("data:")}
              onError={() => setImgError(true)}
            />
          )}
        </div>

        <div className="absolute left-3 top-3 z-10">
          <Badge variant={statusBadge.variant} icon={statusBadge.icon} size="sm">{status}</Badge>
        </div>

        <button
          type="button"
          aria-label={`${saved ? "Unsave" : "Save"} ${title}`}
          disabled={saving}
          onClick={handleSaveClick}
          className={cn(
            "absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white/95 text-slate-500 shadow-sm transition-colors hover:border-accent-500/30 hover:text-accent-500 disabled:cursor-not-allowed disabled:opacity-60",
            saved && "border-accent-500/30 text-accent-500"
          )}
        >
          <Heart className={cn("h-4 w-4", saved && "fill-current")} />
        </button>

        <div className="absolute bottom-3 left-3 right-3 z-10 flex flex-wrap items-end justify-between gap-1.5">
          <Badge variant="default" size="sm">{type}</Badge>
          {rentalYield ? (
            <Badge variant="success" size="sm">{formatYield(rentalYield)} Yield</Badge>
          ) : null}
        </div>
      </div>

      <div className={cn("space-y-3", isCompact ? "p-4" : "space-y-4 p-5")}>
        <div>
          <h3 className="line-clamp-2 text-base font-semibold leading-6 text-slate-900 transition-colors group-hover:text-accent-500">
            {title}
          </h3>
          <p className="mt-1 flex items-start gap-1.5 text-sm text-slate-600">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
            <span className="line-clamp-1">{location.city}, {location.state}</span>
          </p>
        </div>

        <div className={cn("grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3", isCompact ? "grid-cols-2" : "grid-cols-3")}>
          <div>
            <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Price</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">{formatPriceCompact(price)}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Area</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">{formatSize(size)}</p>
          </div>
          {!isCompact && (
            <div>
              <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Yield</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">{rentalYield ? formatYield(rentalYield) : "—"}</p>
            </div>
          )}
        </div>

        {!isCompact && grade ? (
          <div className="flex flex-wrap gap-2">
            <Badge variant="accent" size="sm">Grade {grade}</Badge>
          </div>
        ) : null}

        <p className="line-clamp-1 text-xs text-slate-500">
          Tenant: {tenant?.name || "Blue-chip tenant mix"}
        </p>
      </div>
    </article>
  );
}
