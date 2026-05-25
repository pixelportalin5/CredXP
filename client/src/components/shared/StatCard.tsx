import { cn } from "@/utils/cn";
import type { StatItem } from "@/types/common";
import { Building2, Users, BriefcaseBusiness, Landmark } from "lucide-react";
import type { LucideIcon } from "lucide-react";

/* ============================================================
   StatCard — Reusable Statistic Display
   ============================================================ */

interface StatCardProps {
  stat: StatItem;
  className?: string;
  tone?: "light" | "dark";
  icon?: LucideIcon;
}

const statIcons = [Building2, BriefcaseBusiness, Users, Landmark];

function StatCard({ stat, className, tone = "light", icon: Icon = Building2 }: StatCardProps) {

  return (
    <div className={cn("text-center", className, tone === "dark" && "text-white")}>
      {tone === "dark" ? (
        <div className="flex flex-col items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-accent-400">
            <Icon className="h-5 w-5" />
          </div>
          <p className="text-2xl font-semibold tracking-tight text-white lg:text-[2rem]">
            {stat.prefix}
            {stat.value}
            {stat.suffix}
          </p>
          <p className="text-sm text-white/65">{stat.label}</p>
        </div>
      ) : (
        <>
          <p className="text-3xl font-bold text-navy-50 lg:text-4xl">
            {stat.prefix}
            {stat.value}
            {stat.suffix}
          </p>
          <p className="mt-1 text-sm text-navy-400">{stat.label}</p>
        </>
      )}
    </div>
  );
}

interface StatsBarProps {
  stats: StatItem[];
  className?: string;
  tone?: "light" | "dark";
}

function StatsBar({ stats, className, tone = "light" }: StatsBarProps) {
  return (
    <div
      className={cn(
        tone === "dark"
          ? "enterprise-gradient grid grid-cols-2 gap-0 overflow-hidden rounded-[2rem] border border-white/10 text-center shadow-[0_18px_50px_rgba(15,23,42,0.18)] md:grid-cols-4"
          : "grid grid-cols-2 gap-8 text-center md:grid-cols-4",
        className
      )}
    >
      {stats.map((stat, index) => (
        <div
          key={stat.label}
          className={cn(
            tone === "dark" && "px-5 py-6 md:px-6",
            tone === "dark" && index < stats.length - 1 && "border-r border-white/10"
          )}
        >
          <StatCard stat={stat} tone={tone} icon={statIcons[index % statIcons.length]} />
        </div>
      ))}
    </div>
  );
}

export { StatCard, StatsBar };
export type { StatCardProps, StatsBarProps };
