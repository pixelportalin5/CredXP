"use client";

export default function PropertyCardSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl border border-white/[0.06] bg-slate-900/70">
      <div className="h-52 w-full bg-slate-800" />
      <div className="p-5 space-y-3">
        <div className="h-5 w-3/4 rounded bg-slate-800" />
        <div className="h-4 w-1/2 rounded bg-slate-800/60" />
        <div className="border-t border-white/[0.06] pt-4 flex justify-between">
          <div className="h-5 w-24 rounded bg-indigo-500/10" />
          <div className="h-4 w-16 rounded bg-slate-800/60" />
        </div>
      </div>
    </div>
  );
}
