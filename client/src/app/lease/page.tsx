import { Suspense } from "react";
import { BriefcaseBusiness } from "lucide-react";
import PropertyDirectoryShell from "@/components/property/PropertyDirectoryShell";
import { Badge } from "@/components/ui/Badge";
import type { Metadata } from "next";

const PAGE_METADATA: Metadata = {
  title: "Lease – Office and Retail Spaces for Rent",
  description:
    "Find furnished, bare shell, and high-street office and retail spaces available for lease across premium commercial corridors.",
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

export default function LeasePage() {
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
