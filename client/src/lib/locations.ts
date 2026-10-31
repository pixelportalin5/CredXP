import { GURUGRAM_AREAS, findAreaForProperty, type LocationArea } from "@/config/locations";
import { fetchAllListingsForSeo } from "@/lib/seo";
import type { Property } from "@/types/property";
import { getListingDirectoryPath } from "@/utils/propertyFilterParams";

export interface AreaListings {
  area: LocationArea;
  invest: Property[];
  lease: Property[];
  total: number;
}

/** Groups live listings by Gurugram micro-market. Areas with no listings are included with total 0. */
export async function fetchListingsByArea(): Promise<AreaListings[]> {
  const listings = await fetchAllListingsForSeo();
  const groups = new Map<string, AreaListings>(
    GURUGRAM_AREAS.map((area) => [area.slug, { area, invest: [], lease: [], total: 0 }])
  );
  for (const listing of listings) {
    const area = findAreaForProperty(listing);
    if (!area) continue;
    const group = groups.get(area.slug)!;
    if (getListingDirectoryPath(listing) === "/lease") group.lease.push(listing);
    else group.invest.push(listing);
    group.total += 1;
  }
  return [...groups.values()];
}
