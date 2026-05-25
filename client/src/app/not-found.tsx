import Link from "next/link";
import { Home } from "lucide-react";
import { Button } from "@/components/ui/Button";

/* ============================================================
   404 — Not Found Page
   ============================================================ */

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="text-center">
        <p className="text-6xl font-bold text-accent-500">404</p>
        <h2 className="mt-4 text-2xl font-semibold text-slate-900">Page Not Found</h2>
        <p className="mt-2 text-slate-600">
          The page you are looking for does not exist.
        </p>
        <Link href="/" className="inline-block mt-6">
          <Button variant="primary" size="md" icon={<Home className="h-4 w-4" />}>
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
