"use client";

import Link from "next/link";
import { GitCompare, X } from "lucide-react";
import { usePropertyComparison } from "@/hooks/usePropertyComparison";

export default function CompareFloatingBar() {
  const { count, max, clearCompare } = usePropertyComparison();

  if (count === 0) return null;

  return (
    <div className="fixed bottom-4 left-1/2 z-40 w-[calc(100%-2rem)] max-w-xl -translate-x-1/2">
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-lg">
        <div className="flex items-center gap-2 text-sm text-slate-700">
          <GitCompare className="h-4 w-4 text-accent-500" />
          <span>
            <span className="font-semibold text-slate-900">{count}</span> of {max} selected
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={clearCompare}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100"
            aria-label="Clear compare selection"
          >
            <X className="h-4 w-4" />
          </button>
          <Link
            href="/compare"
            className="inline-flex items-center justify-center rounded-xl bg-accent-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-600"
          >
            Compare
          </Link>
        </div>
      </div>
    </div>
  );
}
