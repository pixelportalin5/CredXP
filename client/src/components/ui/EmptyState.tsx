import { type ReactNode } from "react";
import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/Button";

/* ============================================================
   EmptyState — Reusable Empty/No-Results Component
   ============================================================ */

interface EmptyStateProps {
  icon?: ReactNode;
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

function EmptyState({
  icon,
  title = "No results found",
  message = "Try adjusting your filters or search query.",
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] py-20 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-navy-800 border border-[var(--border-subtle)]">
        {icon || <SearchX className="h-7 w-7 text-navy-500" />}
      </div>
      <h3 className="text-lg font-semibold text-navy-200">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-navy-500">{message}</p>
      {actionLabel && onAction && (
        <Button
          variant="primary"
          size="md"
          onClick={onAction}
          className="mt-6"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export { EmptyState };
export type { EmptyStateProps };
