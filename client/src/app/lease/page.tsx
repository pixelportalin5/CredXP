import { Suspense } from "react";
import { BriefcaseBusiness } from "lucide-react";
import PropertyDirectoryShell from "@/components/property/PropertyDirectoryShell";
import { Badge } from "@/components/ui/Badge";
import type { Metadata } from "next";
import { directoryMetadata, fetchDirectoryInitialData } from "@/lib/directoryPage";
import { fetchAllListingsForSeo } from "@/lib/seo";
import { optionsFromListings } from "@/config/filters";

export const revalidate = 3600;

const PAGE_METADATA: Metadata = {
  title: "Office Space & Retail / SCO for Rent in Gurugram",
  description:
    "Find office space, furnished suites, bare-shell floors and retail/SCO units for rent in Gurugram and Delhi NCR. Share your space requirement and a CredXP advisor will shortlist options.",
  alternates: { canonical: "/lease" },
};

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  return directoryMetadata(PAGE_METADATA, "/lease", await searchParams);
}

export default async function LeasePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ initialData, initialQuery }, allListings] = await Promise.all([
    fetchDirectoryInitialData("lease", await searchParams),
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
        mode="lease"
        initialData={initialData}
        initialQuery={initialQuery}
        cityOptions={cities}
        basePath="/lease"
        hero={{
          badge: (
            <Badge variant="accent" icon={<BriefcaseBusiness className="h-3 w-3" />}>
              Leasing Directory
            </Badge>
          ),
          title: "Office Space & Retail / SCO for Rent in Gurugram",
          footnote: { label: "Leasing an office? See what to check first", href: "/guides/leasing-office-space-in-gurugram" },
          description:
            "Furnished offices, bare shell floors, and high-street retail units ready for enterprise occupancy and brand expansion.",
        }}
      />
    </Suspense>
  );
}
