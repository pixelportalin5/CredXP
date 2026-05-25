import { Suspense } from "react";
import PropertiesPageClient from "./PropertiesPageClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Properties – Premium Commercial Spaces",
  description:
    "Browse pre-leased offices, enterprise leasing opportunities, retail spaces, and investment-grade commercial properties across India.",
};

export default function PropertiesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-navy-700 border-t-accent-500" />
        </div>
      }
    >
      <PropertiesPageClient />
    </Suspense>
  );
}
