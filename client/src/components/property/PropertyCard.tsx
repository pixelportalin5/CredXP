"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { MapPin, TrendingUp, Clock, ImageOff, Building2, Heart } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/utils/cn";
import { formatPriceCompact, formatSize, formatYield } from "@/utils/format";
import type { Property } from "@/types/property";

/* ============================================================
   PropertyCard — Enterprise CRE Property Card
   ============================================================ */

interface PropertyCardProps {
  property: Property;
  variant?: "default" | "compact" | "featured";
}

const STATUS_BADGE_MAP: Record<string, { variant: "warning" | "success" | "accent" | "info"; icon: React.ReactNode }> = {
  "Trending": { variant: "warning", icon: <TrendingUp className="h-3 w-3" /> },
  "Recently Posted": { variant: "success", icon: <Clock className="h-3 w-3" /> },
  "Pre-Leased": { variant: "accent", icon: <Building2 className="h-3 w-3" /> },
  "Available": { variant: "info", icon: null },
};

export default function PropertyCard({ property, variant = "default" }: PropertyCardProps) {
  const { _id, title, type, location, price, size, images, status, financials, grade, tenant, occupancy } = property;
  const imageUrl = images?.[0];
  const [imgError, setImgError] = useState(false);
  const router = useRouter();

  const statusBadge = STATUS_BADGE_MAP[status] || { variant: "info" as const, icon: null };
  const rentalYield = financials?.rentalYield;
  const imageHeightClass = variant === "featured" ? "h-44 sm:h-48" : variant === "compact" ? "h-40 sm:h-44" : "h-40 sm:h-44";

  if (variant === "featured") {
    return (
      <article
        id={`property-card-${_id}`}
        role="link"
        tabIndex={0}
        aria-label={`Open ${title}`}
        onClick={() => router.push(`/properties/${_id}`)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            router.push(`/properties/${_id}`);
          }
        }}
        className={cn(
          "group cursor-pointer overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-accent-500/30 hover:shadow-xl focus:outline-none focus-visible:border-accent-500/30 focus-visible:shadow-xl"
        )}
      >
        <div className="relative overflow-hidden bg-pink-50/70">
          <div className={cn("relative w-full", imageHeightClass)}>
            {imgError || !imageUrl ? (
              <div className="placeholder-surface flex h-full w-full items-center justify-center text-pink-400">
                <ImageOff className="h-10 w-10" />
              </div>
            ) : (
              <Image
                src={imageUrl}
                alt={title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                onError={() => setImgError(true)}
              />
            )}
          </div>

          <div className="absolute left-4 top-4 z-10">
            <Badge variant={statusBadge.variant} icon={statusBadge.icon} size="sm">
              {status}
            </Badge>
          </div>

          <button
            type="button"
            aria-label={`Save ${title}`}
            onClick={(event) => event.stopPropagation()}
            className="absolute right-4 top-4 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white/95 text-slate-500 shadow-sm transition-colors hover:border-accent-500/30 hover:text-accent-500"
          >
            <Heart className="h-4 w-4" />
          </button>

          <div className="absolute right-4 top-14 z-10 flex flex-wrap justify-end gap-1.5">
            {grade && <Badge variant="accent" size="sm">Grade {grade}</Badge>}
            <Badge variant="default" size="sm">{type}</Badge>
          </div>

          {rentalYield && (
            <div className="absolute bottom-4 right-4">
              <Badge variant="success" size="sm">
                {formatYield(rentalYield)} Yield
              </Badge>
            </div>
          )}
        </div>

        <div className="space-y-4 p-5">
          <div>
            <h3 className="line-clamp-2 text-base font-semibold leading-6 text-slate-900 transition-colors group-hover:text-accent-500">
              {title}
            </h3>
            <p className="mt-1 flex items-start gap-1.5 text-sm text-slate-600">
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
              <span className="line-clamp-1">
                {location.address}, {location.city}
              </span>
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Price</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">{formatPriceCompact(price)}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Area</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">{formatSize(size)}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Yield</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">{rentalYield ? `${formatYield(rentalYield)}` : "—"}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 p-3">
            <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Tenant</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              {tenant?.name || "Blue-chip tenant mix"}
            </p>
            <p className="mt-1 text-xs text-slate-500">{tenant?.industry || "Institutional demand"}</p>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article
      className={cn(
        "group overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-accent-500/30 hover:shadow-xl",
        variant === "featured" && "border-slate-300 shadow-md"
      )}
      id={`property-card-${_id}`}
    >
      <div className="relative overflow-hidden bg-pink-50/70">
        <div className={cn("relative w-full", imageHeightClass)}>
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
              onError={() => setImgError(true)}
            />
          )}
        </div>

        <div className="absolute left-4 top-4 z-10">
          <Badge variant={statusBadge.variant} icon={statusBadge.icon} size="sm">
            {status}
          </Badge>
        </div>

        <button
          type="button"
          aria-label={`Save ${title}`}
          className="absolute right-4 top-4 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white/95 text-slate-500 shadow-sm transition-colors hover:border-accent-500/30 hover:text-accent-500"
        >
          <Heart className="h-4 w-4" />
        </button>

        <div className="absolute right-4 top-14 z-10 flex flex-wrap justify-end gap-1.5">
          {grade && <Badge variant="accent" size="sm">Grade {grade}</Badge>}
          <Badge variant="default" size="sm">{type}</Badge>
        </div>

        {rentalYield && (
          <div className="absolute bottom-4 right-4">
            <Badge variant="success" size="sm">
              {formatYield(rentalYield)} Yield
            </Badge>
          </div>
        )}
      </div>

      <div className="space-y-4 p-5">
        <div>
          <h3 className="line-clamp-2 text-base font-semibold leading-6 text-slate-900 transition-colors group-hover:text-accent-500">
            {title}
          </h3>
          <p className="mt-1 flex items-start gap-1.5 text-sm text-slate-600">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
            <span className="line-clamp-1">
              {location.address}, {location.city}
            </span>
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Price</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">{formatPriceCompact(price)}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Area</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">{formatSize(size)}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Yield</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">{rentalYield ? `${formatYield(rentalYield)}` : "—"}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 p-3">
          <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Tenant</p>
          <p className="mt-1 text-sm font-semibold text-slate-900">
            {tenant?.name || "Blue-chip tenant mix"}
          </p>
          <p className="mt-1 text-xs text-slate-500">{tenant?.industry || "Institutional demand"}</p>
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 pt-4">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Current Yield</p>
            <p className="mt-1 text-xl font-semibold text-slate-900">{rentalYield ? formatYield(rentalYield) : "—"}</p>
          </div>
          <Link
            href={`/properties/${_id}`}
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
          >
            View Details
          </Link>
        </div>
      </div>
    </article>
  );
}
