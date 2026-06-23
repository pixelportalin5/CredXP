import PlaceholderPage from "@/components/shared/PlaceholderPage";
import { placeholderMetadata } from "@/lib/seo";

export const metadata = placeholderMetadata(
  "Partners",
  "CredXP partner network and collaboration opportunities."
);

export default function PartnersPage() {
  return (
    <PlaceholderPage
      eyebrow="Partners"
      title="Partner With CredXP"
      description="Learn about coworking operators, channel partners, and commercial real estate collaborations."
    />
  );
}
