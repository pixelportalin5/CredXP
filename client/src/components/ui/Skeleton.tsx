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
    <div className="overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-[var(--bg-card)] shadow-sm">
      <Skeleton className="aspect-square w-full" rounded="sm" />
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

function AdminRowSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <Skeleton className="mb-3 h-5 w-1/3 bg-slate-200" />
      <Skeleton className="mb-2 h-4 w-2/3 bg-slate-200" />
      <Skeleton className="h-3 w-1/4 bg-slate-200" />
    </div>
  );
}

function AdminSectionSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: rows }).map((_, index) => (
        <AdminRowSkeleton key={index} />
      ))}
    </div>
  );
}

function FormSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="space-y-2">
          <Skeleton className="h-4 w-32 bg-slate-200" />
          <Skeleton className="h-11 w-full bg-slate-200" rounded="xl" />
        </div>
      ))}
    </div>
  );
}

export { Skeleton, PropertyCardSkeleton, AdminRowSkeleton, AdminSectionSkeleton, FormSkeleton };
export type { SkeletonProps };
