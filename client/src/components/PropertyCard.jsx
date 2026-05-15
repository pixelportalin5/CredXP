"use client";

import Link from "next/link";
import { useState } from "react";
import Image from "next/image";
import { MapPin, Ruler, IndianRupee, TrendingUp, Clock, ImageOff } from "lucide-react";

const FALLBACK_IMAGE = "/placeholder-property.svg";

function formatPrice(price) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
}

export default function PropertyCard({ property }) {
  const { _id, title, type, location, price, size, images, status } = property;
  const imageUrl = images?.[0] || FALLBACK_IMAGE;
  const [imgError, setImgError] = useState(false);

  return (
    <Link href={`/properties/${_id}`} className="group block">
      <article className="h-full overflow-hidden rounded-2xl border border-white/[0.06] bg-slate-900/70 backdrop-blur-sm transition-all duration-300 hover:border-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/[0.07] hover:-translate-y-1">
        {/* Image */}
        <div className="relative h-52 w-full overflow-hidden bg-slate-800">
          {imgError ? (
            <div className="flex h-full w-full items-center justify-center bg-slate-800 text-slate-600">
              <ImageOff className="h-10 w-10" />
            </div>
          ) : (
            <Image
              src={imageUrl}
              alt={title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              onError={() => setImgError(true)}
            />
          )}
          {/* Status Badge */}
          <div className="absolute left-3 top-3 z-10">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold backdrop-blur-md ${
                status === "Trending"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
              }`}
            >
              {status === "Trending" ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <Clock className="h-3 w-3" />
              )}
              {status}
            </span>
          </div>
          {/* Type Badge */}
          <div className="absolute right-3 top-3 z-10">
            <span className="rounded-full bg-slate-900/70 px-2.5 py-1 text-xs font-medium text-slate-200 backdrop-blur-md border border-white/10">
              {type}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="mb-2 text-lg font-semibold leading-tight text-white line-clamp-1 group-hover:text-indigo-300 transition-colors duration-200">
            {title}
          </h3>
          <p className="mb-4 flex items-center gap-1.5 text-sm text-slate-400">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-500" />
            <span className="truncate">{location.address}, {location.city}</span>
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-white/[0.06] pt-4">
            <div className="flex items-center gap-1 text-lg font-bold text-indigo-400">
              <IndianRupee className="h-4 w-4" />
              {formatPrice(price).replace("₹", "")}
              <span className="text-xs font-normal text-slate-500">/mo</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-slate-400">
              <Ruler className="h-3.5 w-3.5" />
              {size.toLocaleString("en-IN")} sqft
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
