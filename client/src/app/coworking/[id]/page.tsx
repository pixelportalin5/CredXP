import CoworkingDetailClient from "./CoworkingDetailClient";
import JsonLd from "@/components/seo/JsonLd";
import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import {
  buildCoworkingBreadcrumbJsonLd,
  buildCoworkingJsonLd,
  buildCoworkingMetadata,
  fetchCoworkingForSeo,
  fetchCoworkingForSitemap,
} from "@/lib/seo";
import { coworkingPath, listingIdFromParam } from "@/utils/listingUrl";

export const revalidate = 3600;

export async function generateStaticParams() {
  const spaces = await fetchCoworkingForSitemap();
  return spaces.map((space) =>
    ({ id: coworkingPath({ _id: space.id, title: space.title, location: { city: space.city } }).replace("/coworking/", "") })
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id: param } = await params;
  const id = listingIdFromParam(param);
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
  const { id: param } = await params;
  const id = listingIdFromParam(param);
  const { data: space, notFound: missing } = await fetchCoworkingForSeo(id);
  if (missing) notFound();

  if (space) {
    const canonicalPath = coworkingPath({ ...space, _id: space._id || id });
    if (`/coworking/${decodeURIComponent(param)}` !== canonicalPath) permanentRedirect(canonicalPath);
  }

  return (
    <>
      {space ? (
        <>
          <JsonLd data={buildCoworkingJsonLd(space, id)} />
          <JsonLd data={buildCoworkingBreadcrumbJsonLd(space, id)} />
        </>
      ) : null}
      <CoworkingDetailClient initialSpace={space} />
    </>
  );
}
