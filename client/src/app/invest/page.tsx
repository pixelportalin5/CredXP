import { Suspense } from "react";
import { Building2 } from "lucide-react";
import PropertyDirectoryShell from "@/components/property/PropertyDirectoryShell";
import { Badge } from "@/components/ui/Badge";
import type { Metadata } from "next";
import { fetchPropertyListForSeo } from "@/lib/seo";
import { filtersFromSearchParams, filtersToApiParams } from "@/utils/propertyFilterParams";

export const revalidate = 3600;

const PAGE_METADATA: Metadata = {
  title: "Pre-Leased Commercial Property for Sale in Gurugram",
  description:
    "Browse pre-leased offices, shops and SCO units for sale in Gurugram and Delhi NCR. Compare price, monthly rent, lease terms and gross rental yield, then enquire with a CredXP advisor.",
  alternates: { canonical: "/invest" },
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

export default async function InvestPage() {
  const initialData = await fetchPropertyListForSeo(
    filtersToApiParams(filtersFromSearchParams(new URLSearchParams(), "invest"), "invest")
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
        mode="invest"
        initialData={initialData}
        basePath="/invest"
        hero={{
          badge: (
            <Badge variant="accent" icon={<Building2 className="h-3 w-3" />}>
              Investment Directory
            </Badge>
          ),
          title: "Pre-Leased Commercial Property for Sale in Gurugram",
          description:
            "Offices, shops and SCO units that already have a paying tenant. Yields shown are gross, based on figures shared by the seller; ask us for the lease and title documents before you decide.",
          footnote: { label: "New to pre-leased property? Read the due diligence checklist", href: "/guides/pre-leased-property-due-diligence-checklist" },
        }}
      />
    </Suspense>
  );
}
