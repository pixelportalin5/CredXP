import type { Metadata } from "next";
import ComparePageClient from "./ComparePageClient";

export const metadata: Metadata = {
  title: "Compare Properties",
  description:
    "Compare up to three investment properties side by side — price, yield, lease terms, grade, and ROI metrics.",
};

export default function ComparePage() {
  return <ComparePageClient />;
}
