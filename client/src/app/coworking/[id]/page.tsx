import CoworkingDetailClient from "./CoworkingDetailClient";
import JsonLd from "@/components/seo/JsonLd";
import type { Metadata } from "next";
import {
  buildCoworkingJsonLd,
  buildCoworkingMetadata,
  fetchCoworkingForSeo,
} from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const space = await fetchCoworkingForSeo(id);
  if (!space) {
    return { title: "Coworking Space Not Found" };
  }
  return buildCoworkingMetadata(space, id);
}

export default async function CoworkingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const space = await fetchCoworkingForSeo(id);

  return (
    <>
      {space ? <JsonLd data={buildCoworkingJsonLd(space, id)} /> : null}
      <CoworkingDetailClient />
    </>
  );
}
