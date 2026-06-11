"use client";

import { GitCompare } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/providers/ToastProvider";
import { usePropertyComparison } from "@/hooks/usePropertyComparison";
import { cn } from "@/utils/cn";

interface ComparePropertyButtonProps {
  propertyId: string;
  variant?: "card" | "detail";
  className?: string;
}

export default function ComparePropertyButton({
  propertyId,
  variant = "detail",
  className,
}: ComparePropertyButtonProps) {
  const { isInCompare, toggleCompare, max } = usePropertyComparison();
  const { showToast } = useToast();
  const selected = isInCompare(propertyId);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    event.preventDefault();

    const result = toggleCompare(propertyId);
    if (!result.ok) {
      if (result.reason === "max") {
        showToast({
          type: "info",
          title: "Compare limit reached",
          message: `You can compare up to ${max} properties. Remove one to add another.`,
        });
      }
      return;
    }

    if (result.action === "added") {
      showToast({
        type: "success",
        title: "Added to compare",
        message: "View your comparison on the Compare page.",
      });
    } else {
      showToast({ type: "success", title: "Removed from compare" });
    }
  };

  if (variant === "card") {
    return (
      <button
        type="button"
        aria-label={selected ? "Remove from compare" : "Add to compare"}
        aria-pressed={selected}
        onClick={handleClick}
        className={cn(
          "absolute left-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white/95 text-slate-500 shadow-sm transition-colors hover:border-accent-500/30 hover:text-accent-500",
          selected && "border-accent-500/30 bg-accent-500/10 text-accent-500",
          className
        )}
      >
        <GitCompare className="h-4 w-4" />
      </button>
    );
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="md"
      icon={<GitCompare className="h-4 w-4" />}
      onClick={handleClick}
      className={cn(
        "border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50",
        selected && "border-accent-500/30 bg-accent-500/5 text-accent-600",
        className
      )}
    >
      {selected ? "In Compare" : "Compare"}
    </Button>
  );
}
