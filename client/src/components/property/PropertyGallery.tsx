"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageOff, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/utils/cn";
import { shouldUseUnoptimizedImage } from "@/utils/imageUrl";

/* ============================================================
   PropertyGallery — Image Gallery with Thumbnails
   ============================================================ */

interface PropertyGalleryProps {
  images: string[];
  title: string;
}

function PropertyImage({
  src,
  alt,
  fill,
  sizes,
  className,
  priority,
}: {
  src: string | null;
  alt: string;
  fill?: boolean;
  sizes?: string;
  className?: string;
  priority?: boolean;
}) {
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <div className="placeholder-surface flex h-full w-full items-center justify-center text-pink-400">
        <ImageOff className="h-10 w-10" />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      sizes={sizes}
      className={className}
      priority={priority}
      unoptimized={shouldUseUnoptimizedImage(src)}
      onError={() => setError(true)}
    />
  );
}

export default function PropertyGallery({ images, title }: PropertyGalleryProps) {
  const [activeImage, setActiveImage] = useState(0);
  const displayImages = images && images.length > 0 ? images : [];
  const mainImageSrc = displayImages[activeImage] || displayImages[0] || null;

  const goNext = () => {
    if (displayImages.length > 0) {
      setActiveImage((prev) => (prev + 1) % displayImages.length);
    }
  };

  const goPrev = () => {
    if (displayImages.length > 0) {
      setActiveImage((prev) => (prev - 1 + displayImages.length) % displayImages.length);
    }
  };

  return (
    <div className="mb-10 grid grid-cols-1 gap-4 md:grid-cols-5">
      {/* Main Image */}
      <div className="group relative h-72 overflow-hidden rounded-3xl border border-slate-200 bg-pink-50/70 shadow-sm md:col-span-3 sm:h-80 lg:h-[28rem]">
        <PropertyImage
          src={mainImageSrc}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, 60vw"
          className="object-cover transition-opacity duration-300"
          priority
        />

        {/* Navigation Arrows */}
        {displayImages.length > 1 && (
          <>
            <button
              onClick={goPrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white/90 text-slate-700 shadow-md backdrop-blur-sm opacity-0 transition-opacity group-hover:opacity-100 hover:bg-white"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={goNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white/90 text-slate-700 shadow-md backdrop-blur-sm opacity-0 transition-opacity group-hover:opacity-100 hover:bg-white"
              aria-label="Next image"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}

        {/* Image Counter */}
        {displayImages.length > 1 && (
          <div className="absolute bottom-3 left-3 rounded-full border border-slate-200 bg-white/90 px-3 py-1 text-xs font-medium text-slate-700 shadow-sm backdrop-blur-sm">
            {activeImage + 1} / {displayImages.length}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {displayImages.length > 0 && (
        <div className="grid grid-cols-2 gap-3 md:col-span-2">
          {displayImages.slice(0, 4).map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveImage(i)}
              className={cn(
                "relative h-28 overflow-hidden rounded-2xl border transition-all duration-200 sm:h-36 lg:h-[calc(14rem-0.375rem)]",
                activeImage === i
                  ? "border-accent-500 ring-2 ring-accent-500/20"
                  : "border-slate-200 hover:border-slate-300"
              )}
            >
              <PropertyImage
                src={img}
                alt={`${title} - ${i + 1}`}
                fill
                sizes="(max-width: 768px) 25vw, 20vw"
                className="object-cover"
              />
              {/* +N more overlay on last thumbnail */}
              {i === 3 && displayImages.length > 4 && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-950/55 text-sm font-semibold text-white backdrop-blur-sm">
                  +{displayImages.length - 4} more
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
