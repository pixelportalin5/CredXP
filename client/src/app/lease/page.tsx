import { Suspense } from "react";
import { BriefcaseBusiness } from "lucide-react";
import PropertyDirectoryShell from "@/components/property/PropertyDirectoryShell";
import { Badge } from "@/components/ui/Badge";
import type { Metadata } from "next";
import { fetchPropertyListForSeo } from "@/lib/seo";
import { filtersFromSearchParams, filtersToApiParams } from "@/utils/propertyFilterParams";

export const revalidate = 3600;

const PAGE_METADATA: Metadata = {
  title: "Premium Office Rentals & Retail Space for Lease",
  description:
    "Find premium office rentals, high-street retail shops, furnished suites, and bare-shell commercial space for lease across India's top business corridors.",
  alternates: { canonical: "/lease" },
};

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const params = await searchParams;
  const hasFilters = Object.keys(params).length > 0;
  return hasFilters
    ? { ...PAGE_METADATA, robots: { index: false, follow: true } }
    : PAGE_METADATA;
}

export default async function LeasePage() {
  const initialData = await fetchPropertyListForSeo(
    filtersToApiParams(filtersFromSearchParams(new URLSearchParams(), "lease"), "lease")
  );

  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-navy-700 border-t-accent-500" />
        </div>
      }
    >
      <PropertyDirectoryShell
        mode="lease"
        initialData={initialData}
        basePath="/lease"
        hero={{
          badge: (
            <Badge variant="accent" icon={<BriefcaseBusiness className="h-3 w-3" />}>
              Leasing Directory
            </Badge>
          ),
          title: "Office and Retail Spaces for Lease",
          description:
            "Furnished offices, bare shell floors, and high-street retail units ready for enterprise occupancy and brand expansion.",
        }}
      />
    </Suspense>
  );
}
