import Link from "next/link";
import { Container } from "@/components/ui/Container";
import type { Property } from "@/types/property";
import { getListingDirectoryPath } from "@/utils/propertyFilterParams";
import { findAreaForProperty } from "@/config/locations";

/** Shown on sold, paused or withdrawn listings so old links still help visitors. */
export default function ListingUnavailableNotice({ property }: { property: Property }) {
  const directory = getListingDirectoryPath(property);
  const area = findAreaForProperty(property);
  const sold = property.listingStatus === "sold";

  return (
    <div role="status" className="border-b border-amber-200 bg-amber-50">
      <Container className="flex flex-col gap-2 py-4 text-sm text-amber-900 sm:flex-row sm:items-center sm:justify-between">
        <p>
          <strong>{sold ? "This property has been sold." : "This listing is no longer available."}</strong>{" "}
          The details below are kept for reference only.
        </p>
        <div className="flex flex-wrap gap-4 font-medium">
          {area ? (
            <Link href={`/gurugram/${area.slug}`} className="underline hover:no-underline">
              Similar spaces in {area.name}
            </Link>
          ) : null}
          <Link href={directory} className="underline hover:no-underline">
            {directory === "/lease" ? "All spaces for lease" : "All investment listings"}
          </Link>
        </div>
      </Container>
    </div>
  );
}
