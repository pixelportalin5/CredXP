import { cn } from "@/utils/cn";

/* ============================================================
   Skeleton — Design System Primitive
   Premium loading placeholder with shimmer effect
   ============================================================ */

interface SkeletonProps {
  className?: string;
  width?: string;
  height?: string;
  rounded?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
}

function Skeleton({ className, width, height, rounded = "lg" }: SkeletonProps) {
  const roundedStyles: Record<string, string> = {
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    xl: "rounded-xl",
    "2xl": "rounded-2xl",
    full: "rounded-full",
  };

  return (
    <div
      className={cn(
        "animate-pulse bg-navy-800/60",
        roundedStyles[rounded],
        className
      )}
      style={{ width, height }}
    />
  );
}

/** Pre-composed card skeleton matching PropertyCard dimensions */
function PropertyCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)]">
      <Skeleton className="h-52 w-full" rounded="sm" />
      <div className="space-y-3 p-5">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex items-center justify-between border-t border-[var(--border-subtle)] pt-4">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </div>
  );
}

export { Skeleton, PropertyCardSkeleton };
export type { SkeletonProps };
