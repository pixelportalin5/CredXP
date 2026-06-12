"use client";

import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { useInView } from "@/hooks/useInView";
import { useCountUp } from "@/hooks/useCountUp";
import { cn } from "@/utils/cn";

export interface AnimatedStatItem {
  label: string;
  value?: string;
  prefix?: string;
  suffix?: string;
  numericValue?: number;
  icon?: LucideIcon;
  note?: string;
}

interface AnimatedStatsGridProps {
  stats: AnimatedStatItem[];
  variant?: "dark-bar" | "dark-card" | "light";
  className?: string;
  columns?: 2 | 4;
}

export function parseStatValue(value: string): { numeric: number; prefix: string; suffix: string } {
  const match = value.match(/^([^0-9]*)([0-9.]+)(.*)$/);
  if (!match) return { numeric: 0, prefix: "", suffix: value };
  return { numeric: Number(match[2]), prefix: match[1], suffix: match[3] };
}

function AnimatedStatValue({
  stat,
  variant,
  icon: Icon,
}: {
  stat: AnimatedStatItem;
  variant: AnimatedStatsGridProps["variant"];
  icon?: LucideIcon;
}) {
  const [ref, inView] = useInView<HTMLDivElement>({ once: false });
  const parsed = stat.value ? parseStatValue(stat.value) : null;
  const hasNumeric = stat.numericValue !== undefined;
  const numericEnd = stat.numericValue ?? parsed?.numeric ?? 0;
  const prefix = stat.prefix ?? parsed?.prefix ?? "";
  const suffix = stat.suffix ?? parsed?.suffix ?? "";
  const count = useCountUp({ end: numericEnd, enabled: inView && (hasNumeric || (parsed?.numeric ?? 0) > 0) });
  const displayValue =
    hasNumeric || (parsed && parsed.numeric > 0)
      ? `${prefix}${count}${suffix}`
      : stat.value ?? "—";

  if (variant === "dark-bar") {
    return (
      <div ref={ref} className="flex flex-col items-center gap-2 px-5 py-6 text-center text-white md:px-6">
        {Icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-accent-400 transition-shadow duration-500 group-data-[visible=true]:shadow-[0_0_20px_rgba(239,68,68,0.35)]">
            <Icon className="h-5 w-5" />
          </div>
        )}
        <p className="text-2xl font-semibold tracking-tight text-white lg:text-[2rem]">{displayValue}</p>
        <p className="text-sm text-white/65">{stat.label}</p>
      </div>
    );
  }

  if (variant === "dark-card") {
    return (
      <Card
        padding="md"
        hover
        className="black-section-bg hover-expand-card relative border-white/10 shadow-[0_16px_40px_rgba(15,23,42,0.16)] hover:z-10"
      >
        <div ref={ref}>
          <p className="text-xs uppercase tracking-[0.18em] text-white/60">{stat.label}</p>
          <p className="mt-2 text-2xl font-semibold text-white">{displayValue}</p>
          {stat.note && <p className="mt-1 text-sm text-white/70">{stat.note}</p>}
        </div>
      </Card>
    );
  }

  return (
    <div ref={ref} className="text-center">
      <p className="text-3xl font-bold text-navy-50 lg:text-4xl">{displayValue}</p>
      <p className="mt-1 text-sm text-navy-400">{stat.label}</p>
    </div>
  );
}

export default function AnimatedStatsGrid({
  stats,
  variant = "dark-bar",
  className,
  columns = 4,
}: AnimatedStatsGridProps) {
  if (variant === "dark-bar") {
    return (
      <div
        className={cn(
          "group enterprise-gradient grid grid-cols-2 gap-0 overflow-hidden rounded-[2rem] border border-white/10 text-center shadow-[0_18px_50px_rgba(15,23,42,0.18)]",
          columns === 4 && "md:grid-cols-4",
          className
        )}
      >
        {stats.map((stat, index) => (
          <div key={stat.label} className={cn(index < stats.length - 1 && "border-r border-white/10")}>
            <AnimatedStatValue stat={stat} variant={variant} icon={stat.icon} />
          </div>
        ))}
      </div>
    );
  }

  if (variant === "dark-card") {
    return (
      <div
        className={cn(
          "grid gap-4",
          columns === 4 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-2",
          className
        )}
      >
        {stats.map((stat) => (
          <AnimatedStatValue key={stat.label} stat={stat} variant={variant} icon={stat.icon} />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-8 text-center",
        columns === 4 && "md:grid-cols-4",
        className
      )}
    >
      {stats.map((stat) => (
        <AnimatedStatValue key={stat.label} stat={stat} variant={variant} icon={stat.icon} />
      ))}
    </div>
  );
}
