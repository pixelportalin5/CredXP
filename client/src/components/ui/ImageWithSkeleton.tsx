"use client";

import { useState } from "react";
import Image, { type ImageProps } from "next/image";
import { ImageOff } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { shouldUseUnoptimizedImage } from "@/utils/imageUrl";
import { cn } from "@/utils/cn";

interface ImageWithSkeletonProps extends Omit<ImageProps, "onLoad" | "onError"> {
  variant?: "light" | "dark";
  placeholderLabel?: string;
  onLoadComplete?: () => void;
}

export default function ImageWithSkeleton({
  src,
  alt,
  className,
  variant = "light",
  placeholderLabel,
  onLoadComplete,
  fill,
  ...props
}: ImageWithSkeletonProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const imageSrc = typeof src === "string" ? src : "";

  if (!imageSrc || error) {
    return (
      <div
        className={cn(
          "flex h-full w-full items-center justify-center",
          variant === "light" ? "placeholder-surface text-pink-400" : "bg-navy-800/60 text-navy-400",
          fill ? "absolute inset-0" : "",
          className
        )}
      >
        {placeholderLabel ? (
          <span className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">{placeholderLabel}</span>
        ) : (
          <ImageOff className="h-10 w-10" />
        )}
      </div>
    );
  }

  return (
    <div className={cn("relative h-full w-full", fill ? "absolute inset-0" : "")}>
      {loading && (
        <Skeleton
          variant={variant}
          className={cn("absolute inset-0 h-full w-full", variant === "light" ? "rounded-none" : "")}
          rounded="sm"
        />
      )}
      <Image
        src={imageSrc}
        alt={alt}
        fill={fill}
        className={cn(
          "object-cover transition-opacity duration-300",
          loading ? "opacity-0" : "opacity-100",
          className
        )}
        unoptimized={shouldUseUnoptimizedImage(imageSrc)}
        onLoad={() => {
          setLoading(false);
          onLoadComplete?.();
        }}
        onError={() => {
          setLoading(false);
          setError(true);
        }}
        {...props}
      />
    </div>
  );
}
