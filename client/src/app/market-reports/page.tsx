import PlaceholderPage from "@/components/shared/PlaceholderPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Market Reports | CredXP",
  description: "CredXP commercial real estate market reports.",
};

export default function MarketReportsPage() {
  return (
    <PlaceholderPage
      eyebrow="Market Reports"
      title="Market Reports"
      description="Access upcoming market intelligence, rental yield reports, and commercial real estate analysis."
    />
  );
}
