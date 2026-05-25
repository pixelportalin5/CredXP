import { type ReactNode } from "react";
import { cn } from "@/utils/cn";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

/* ============================================================
   SectionHeader — Reusable Section Title System
   ============================================================ */

interface SectionHeaderProps {
  eyebrow?: string;
  eyebrowIcon?: ReactNode;
  title: string;
  subtitle?: string;
  action?: {
    label: string;
    href: string;
  };
  className?: string;
  align?: "left" | "center";
}

function SectionHeader({
  eyebrow,
  eyebrowIcon,
  title,
  subtitle,
  action,
  className,
  align = "left",
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "mb-10",
        align === "center" && "text-center",
        action && align === "left" && "flex items-end justify-between",
        className
      )}
    >
      <div>
        {eyebrow && (
          <div
            className={cn(
              "mb-2 flex items-center gap-2 text-accent-400",
              align === "center" && "justify-center"
            )}
          >
            {eyebrowIcon}
            <span className="text-xs font-semibold uppercase tracking-widest">
              {eyebrow}
            </span>
          </div>
        )}
        <h2 className="text-2xl font-bold text-navy-50 sm:text-3xl">
          {title}
        </h2>
        {subtitle && (
          <p className={cn(
            "mt-2 text-navy-400",
            align === "center" && "mx-auto max-w-2xl"
          )}>
            {subtitle}
          </p>
        )}
      </div>

      {action && (
        <Link
          href={action.href}
          className="hidden items-center gap-1.5 text-sm font-medium text-accent-400 transition-colors hover:text-accent-300 sm:inline-flex"
        >
          {action.label}
          <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}

export { SectionHeader };
export type { SectionHeaderProps };
