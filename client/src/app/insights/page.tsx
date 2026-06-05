import type { Metadata } from "next";
import InsightsPageClient from "./InsightsPageClient";

export const metadata: Metadata = {
  title: "Market Insights – CRE Intelligence & Reports",
  description:
    "Stay ahead with market insights, investment analysis, and expert commentary on India's commercial real estate landscape.",
};

export default function InsightsPage() {
  return <InsightsPageClient />;
}
