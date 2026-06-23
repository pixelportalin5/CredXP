import PropertyDetailClient from "./PropertyDetailClient";
import JsonLd from "@/components/seo/JsonLd";
import type { Metadata } from "next";
import {
  buildPropertyMetadata,
  buildRealEstateListingJsonLd,
  fetchPropertyForSeo,
} from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const property = await fetchPropertyForSeo(id);
  if (!property) {
    return { title: "Property Not Found" };
  }
  return buildPropertyMetadata(property, id);
}

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const property = await fetchPropertyForSeo(id);

  return (
    <>
      {property ? <JsonLd data={buildRealEstateListingJsonLd(property, id)} /> : null}
      <PropertyDetailClient />
    </>
  );
}
