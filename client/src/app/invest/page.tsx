import { Suspense } from "react";
import { Building2 } from "lucide-react";
import PropertyDirectoryShell from "@/components/property/PropertyDirectoryShell";
import { Badge } from "@/components/ui/Badge";
import type { Metadata } from "next";
import { directoryMetadata, fetchDirectoryInitialData } from "@/lib/directoryPage";
import { fetchAllListingsForSeo } from "@/lib/seo";
import { optionsFromListings } from "@/config/filters";

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
  return directoryMetadata(PAGE_METADATA, "/invest", await searchParams);
}

export default async function InvestPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ initialData, initialQuery }, allListings] = await Promise.all([
    fetchDirectoryInitialData("invest", await searchParams),
    fetchAllListingsForSeo(),
  ]);
  const { cities } = optionsFromListings(allListings);

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
        initialQuery={initialQuery}
        cityOptions={cities}
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
