import PropertyDetailClient from "./PropertyDetailClient";
import JsonLd from "@/components/seo/JsonLd";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  buildPropertyMetadata,
  buildRealEstateListingJsonLd,
  fetchPropertyForSeo,
  fetchPropertyIdsForSitemap,
} from "@/lib/seo";

export const revalidate = 3600;

export async function generateStaticParams() {
  const ids = await fetchPropertyIdsForSitemap();
  return ids.map((id) => ({ id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
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
  const { id } = await params;
  const { data: property, notFound: missing } = await fetchPropertyForSeo(id);
  if (missing) notFound();

  return (
    <>
      {property ? <JsonLd data={buildRealEstateListingJsonLd(property, id)} /> : null}
      <PropertyDetailClient initialProperty={property} />
    </>
  );
}
