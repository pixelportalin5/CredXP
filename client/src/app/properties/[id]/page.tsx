import PropertyDetailClient from "./PropertyDetailClient";
import JsonLd from "@/components/seo/JsonLd";
import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import {
  buildPropertyBreadcrumbJsonLd,
  buildPropertyMetadata,
  buildRealEstateListingJsonLd,
  fetchAllListingsForSeo,
  fetchPropertyForSeo,
  isPropertyAvailable,
} from "@/lib/seo";
import { publicHighlights } from "@/utils/publicHighlights";
import { listingIdFromParam, propertyPath } from "@/utils/listingUrl";
import ListingUnavailableNotice from "@/components/property/ListingUnavailableNotice";

export const revalidate = 3600;

export async function generateStaticParams() {
  const listings = await fetchAllListingsForSeo();
  return listings.map((listing) => ({ id: propertyPath(listing).replace("/properties/", "") }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id: param } = await params;
  const id = listingIdFromParam(param);
  const { data: property } = await fetchPropertyForSeo(id);
  if (!property) {
    return { title: "Property Not Found", robots: { index: false, follow: true } };
  }
  return buildPropertyMetadata(property, id);
}

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: param } = await params;
  const id = listingIdFromParam(param);
  const { data: fetched, notFound: missing } = await fetchPropertyForSeo(id);
  if (missing) notFound();

  // Old /properties/<id> links and outdated slugs move to the readable URL.
  if (fetched) {
    const canonicalPath = propertyPath({ ...fetched, _id: fetched._id || id });
    if (`/properties/${decodeURIComponent(param)}` !== canonicalPath) permanentRedirect(canonicalPath);
  }

  // Keep staff-only broker lines out of the HTML payload sent to the browser.
  const property = fetched ? { ...fetched, highlights: publicHighlights(fetched.highlights) } : null;
  const available = property ? isPropertyAvailable(property) : true;

  return (
    <>
      {property ? (
        <>
          <JsonLd data={buildRealEstateListingJsonLd(property, id)} />
          <JsonLd data={buildPropertyBreadcrumbJsonLd(property, id)} />
        </>
      ) : null}
      {property && !available ? <ListingUnavailableNotice property={property} /> : null}
      <PropertyDetailClient initialProperty={property} />
    </>
  );
}
