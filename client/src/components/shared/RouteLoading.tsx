/* ============================================================
   Loading — shared spinner for signed-in areas.
   Not used at the app root: a root loading.tsx makes crawlers see
   "Loading…" in place of public page content.
   ============================================================ */

export default function Loading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-accent-500" />
        <p className="text-sm text-slate-500">Loading…</p>
      </div>
    </div>
  );
}
