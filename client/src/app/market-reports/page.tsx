import PlaceholderPage from "@/components/shared/PlaceholderPage";
import { placeholderMetadata } from "@/lib/seo";

export const metadata = placeholderMetadata(
  "Market Reports",
  "CredXP commercial real estate market reports."
);

export default function MarketReportsPage() {
  return (
    <PlaceholderPage
      eyebrow="Market Reports"
      title="Market Reports"
      description="Access upcoming market intelligence, rental yield reports, and commercial real estate analysis."
    />
  );
}
