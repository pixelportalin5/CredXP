import CoworkingDetailClient from "./CoworkingDetailClient";
import JsonLd from "@/components/seo/JsonLd";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  buildCoworkingJsonLd,
  buildCoworkingMetadata,
  fetchCoworkingForSeo,
  fetchCoworkingIdsForSitemap,
} from "@/lib/seo";

export const revalidate = 3600;

export async function generateStaticParams() {
  const ids = await fetchCoworkingIdsForSitemap();
  return ids.map((id) => ({ id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const { data: space } = await fetchCoworkingForSeo(id);
  if (!space) {
    return { title: "Coworking Space Not Found", robots: { index: false, follow: true } };
  }
  return buildCoworkingMetadata(space, id);
}

export default async function CoworkingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { data: space, notFound: missing } = await fetchCoworkingForSeo(id);
  if (missing) notFound();

  return (
    <>
      {space ? <JsonLd data={buildCoworkingJsonLd(space, id)} /> : null}
      <CoworkingDetailClient initialSpace={space} />
    </>
  );
}
