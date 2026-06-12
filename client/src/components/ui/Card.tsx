import { type ReactNode } from "react";
import { cn } from "@/utils/cn";

/* ============================================================
   Card — Design System Primitive
   Premium glassmorphic card surface
   ============================================================ */

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
  as?: "div" | "article" | "section";
}

const paddingStyles: Record<string, string> = {
  none: "",
  sm: "p-4",
  md: "p-5 sm:p-6",
  lg: "p-6 sm:p-8",
};

function Card({
  children,
  className,
  hover = false,
  padding = "md",
  as: Component = "div",
}: CardProps) {
  return (
    <Component
      className={cn(
        "rounded-2xl border border-slate-200/80 bg-[var(--bg-card)] shadow-sm",
        hover && "hover-expand-card relative hover:z-10",
        paddingStyles[padding],
        className
      )}
    >
      {children}
    </Component>
  );
}

function CardHeader({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-4", className)}>
      {children}
    </div>
  );
}

function CardTitle({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <h3 className={cn("text-lg font-semibold text-navy-50", className)}>
      {children}
    </h3>
  );
}

function CardContent({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn(className)}>{children}</div>;
}

export { Card, CardHeader, CardTitle, CardContent };
export type { CardProps };
