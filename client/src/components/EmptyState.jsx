import { SearchX } from "lucide-react";

export default function EmptyState({
  title = "No properties found",
  message = "Try adjusting your filters or search query.",
  actionLabel,
  onAction,
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-white/[0.06] bg-slate-900/40 py-20 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-800 border border-white/[0.06]">
        <SearchX className="h-7 w-7 text-slate-500" />
      </div>
      <h3 className="text-lg font-semibold text-slate-300">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-slate-500">{message}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-6 rounded-lg bg-indigo-500 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-600"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
