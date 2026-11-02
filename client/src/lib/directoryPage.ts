import type { Metadata } from "next";
import { fetchPropertyListForSeo } from "@/lib/seo";
import { filtersFromSearchParams, filtersToApiParams, type PropertyDirectoryMode } from "@/utils/propertyFilterParams";

type RawSearchParams = Record<string, string | string[] | undefined>;

/**
 * Indexing policy for /invest and /lease:
 * - no parameters or only ?page=N → server-rendered and indexable (self-canonical)
 * - any filter, sort or search → noindex, follow (canonical stays on the clean page)
 */
export function readDirectoryRequest(params: RawSearchParams) {
  const keys = Object.keys(params);
  const pageValue = typeof params.page === "string" ? Number(params.page) : NaN;
  const onlyPage = keys.length === 1 && keys[0] === "page" && Number.isInteger(pageValue) && pageValue > 1;
  const page = onlyPage ? pageValue : 1;
  const indexable = keys.length === 0 || onlyPage;
  return { page, indexable, initialQuery: onlyPage ? `page=${page}` : "" };
}

export function directoryMetadata(base: Metadata, basePath: string, params: RawSearchParams): Metadata {
  const { page, indexable } = readDirectoryRequest(params);
  if (!indexable) return { ...base, robots: { index: false, follow: true } };
  if (page === 1) return base;
  return {
    ...base,
    title: `${String(base.title)} – Page ${page}`,
    // Unique per page so paginated URLs don't share page 1's description.
    description: `Page ${page} of listings. ${String(base.description ?? "")}`.trim(),
    alternates: { canonical: `${basePath}?page=${page}` },
  };
}

export async function fetchDirectoryInitialData(mode: PropertyDirectoryMode, params: RawSearchParams) {
  const { page, indexable, initialQuery } = readDirectoryRequest(params);
  if (!indexable) return { initialData: null, initialQuery: "" };
  const apiParams = filtersToApiParams(filtersFromSearchParams(new URLSearchParams(), mode), mode);
  const initialData = await fetchPropertyListForSeo({ ...apiParams, page });
  return { initialData, initialQuery };
}
