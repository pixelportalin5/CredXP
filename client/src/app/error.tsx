"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";

/* ============================================================
   Error Boundary — Root Error Handler
   ============================================================ */

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-red-500/20 bg-red-500/10">
          <AlertTriangle className="h-8 w-8 text-red-500" />
        </div>
        <h2 className="text-xl font-semibold text-slate-900">Something went wrong</h2>
        <p className="mt-2 text-sm text-slate-600">
          {error?.message || "An unexpected error occurred. Please try again."}
        </p>
        <Button
          variant="primary"
          size="md"
          icon={<RefreshCw className="h-4 w-4" />}
          onClick={reset}
          className="mt-6"
        >
          Try Again
        </Button>
      </div>
    </div>
  );
}
