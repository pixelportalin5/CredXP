"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ExternalLink, MapPin, Users, Wifi } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { CoworkingSpace } from "@/types/coworking";

interface CoworkingSpaceCardProps {
  space: CoworkingSpace;
  compact?: boolean;
}

export default function CoworkingSpaceCard({ space, compact = false }: CoworkingSpaceCardProps) {
  const coverImage = space.coverImage || space.images[0] || "/images/office1.png";

  return (
    <Card hover padding="none" className="flex h-full flex-col overflow-hidden border-slate-200 bg-white shadow-sm">
      <Link href={`/coworking/${space._id}`} className="group block">
        <div className={`relative overflow-hidden bg-slate-100 ${compact ? "aspect-[4/3]" : "h-56"}`}>
          <Image
            src={coverImage}
            alt={space.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            unoptimized={coverImage.startsWith("data:")}
          />
          <div className="absolute left-4 top-4">
            <Badge variant="accent" size="sm">{space.featured ? "Featured" : "Verified"}</Badge>
          </div>
        </div>
      </Link>
      <div className={`flex flex-1 flex-col ${compact ? "p-4" : "p-5"}`}>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent-500">{space.operator}</p>
        <h2 className={`mt-2 font-semibold text-slate-950 ${compact ? "line-clamp-2 text-base" : "text-xl"}`}>{space.title}</h2>
        <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-600">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
          <span className="line-clamp-1">{space.location.city}, {space.location.state}</span>
        </p>
        <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-600">
          <Users className="h-3.5 w-3.5 shrink-0 text-slate-400" />
          {space.priceLabel}
        </p>
        {!compact && (
          <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-600">
            <Wifi className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            {space.workspaceType}
          </p>
        )}
        {compact && space.amenities?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {space.amenities.slice(0, 2).map((chip) => (
              <span key={chip} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
                {chip}
              </span>
            ))}
          </div>
        )}
        <div className={`mt-auto flex flex-col gap-3 ${compact ? "mt-4" : "mt-5 sm:flex-row"}`}>
          <Link href={`/coworking/${space._id}`} className="flex-1">
            <Button variant="primary" size="sm" fullWidth iconRight={<ArrowRight className="h-4 w-4" />}>
              View Details
            </Button>
          </Link>
          {!compact && space.website && (
            <a href={space.website} target="_blank" rel="noopener noreferrer" className="flex-1">
              <Button variant="outline" size="sm" fullWidth icon={<ExternalLink className="h-4 w-4" />} className="border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50">
                Visit Website
              </Button>
            </a>
          )}
        </div>
      </div>
    </Card>
  );
}
