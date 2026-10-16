import CoworkingPageClient from "./CoworkingPageClient";
import type { Metadata } from "next";
import { fetchCoworkingListForSeo } from "@/lib/seo";
import { DEFAULT_COWORKING_FILTERS } from "./defaults";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Coworking Spaces – Flexible Workspace Solutions",
  description:
    "Discover coworking and flexible premium office rentals from CredXP partner operators across Gurugram and Delhi NCR.",
  alternates: { canonical: "/coworking" },
};

export default async function CoworkingPage() {
  const initialSpaces = await fetchCoworkingListForSeo({ ...DEFAULT_COWORKING_FILTERS });
  return <CoworkingPageClient initialSpaces={initialSpaces} />;
}
