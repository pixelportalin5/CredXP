import { Suspense } from "react";
import { Building2 } from "lucide-react";
import PropertyDirectoryShell from "@/components/property/PropertyDirectoryShell";
import { Badge } from "@/components/ui/Badge";
import type { Metadata } from "next";

const PAGE_METADATA: Metadata = {
  title: "Invest – Pre-Leased and Investment-Grade Assets",
  description:
    "Browse pre-leased offices, retail shops, and SCO investment opportunities with verified tenants and strong rental yields.",
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

export default function InvestPage() {
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
        basePath="/invest"
        hero={{
          badge: (
            <Badge variant="accent" icon={<Building2 className="h-3 w-3" />}>
              Investment Directory
            </Badge>
          ),
          title: "Pre-Leased and Investment-Grade Assets",
          description:
            "Income-producing offices, retail units, and SCO assets with blue-chip tenants across India's top commercial micromarkets.",
        }}
      />
    </Suspense>
  );
}
