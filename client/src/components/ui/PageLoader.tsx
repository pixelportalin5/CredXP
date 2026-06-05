interface PageLoaderProps {
  label?: string;
  className?: string;
}

export function PageLoader({ label = "Loading…", className = "min-h-[50vh]" }: PageLoaderProps) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-accent-500" />
        <p className="text-sm text-slate-500">{label}</p>
      </div>
    </div>
  );
}
