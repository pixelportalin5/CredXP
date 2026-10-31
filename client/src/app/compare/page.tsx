import type { Metadata } from "next";
import ComparePageClient from "./ComparePageClient";

export const metadata: Metadata = {
  // Tool / form page with no search value: keep out of the index, follow links.
  robots: { index: false, follow: true },
  title: "Compare Properties",
  description:
    "Compare up to three investment properties side by side — price, yield, lease terms, grade, and ROI metrics.",
  alternates: { canonical: "/compare" },
};

export default function ComparePage() {
  return <ComparePageClient />;
}
