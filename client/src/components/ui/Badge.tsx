import { type ReactNode } from "react";
import { cn } from "@/utils/cn";

/* ============================================================
   Badge — Design System Primitive
   ============================================================ */

type BadgeVariant =
  | "default"
  | "accent"
  | "success"
  | "warning"
  | "error"
  | "info"
  | "outline"
  | "pre-leased";

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  icon?: ReactNode;
  className?: string;
  size?: "sm" | "md";
}

const variantStyles: Record<BadgeVariant, string> = {
  default:
    "bg-navy-800/80 text-navy-200 border-[var(--border-default)]",
  accent:
    "bg-accent-500/12 text-accent-300 border-accent-500/25",
  success:
    "bg-emerald-500/12 text-emerald-300 border-emerald-500/25",
  warning:
    "bg-amber-500/12 text-amber-300 border-amber-500/25",
  error:
    "bg-red-500/12 text-red-300 border-red-500/25",
  info:
    "bg-blue-500/12 text-blue-300 border-blue-500/25",
  outline:
    "bg-transparent text-navy-300 border-[var(--border-default)]",
  "pre-leased":
    "bg-accent-500/15 text-accent-200 border-accent-500/30",
};

const sizeStyles: Record<"sm" | "md", string> = {
  sm: "px-2 py-0.5 text-[10px]",
  md: "px-2.5 py-1 text-xs",
};

function Badge({
  children,
  variant = "default",
  icon,
  className,
  size = "md",
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border font-semibold backdrop-blur-sm",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {icon}
      {children}
    </span>
  );
}

export { Badge };
export type { BadgeProps, BadgeVariant };
