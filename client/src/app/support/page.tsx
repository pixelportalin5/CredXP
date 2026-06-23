import PlaceholderPage from "@/components/shared/PlaceholderPage";
import { placeholderMetadata } from "@/lib/seo";

export const metadata = placeholderMetadata(
  "Support",
  "CredXP support resources and assistance."
);

export default function SupportPage() {
  return (
    <PlaceholderPage
      eyebrow="Support"
      title="Support Center"
      description="Find help for property discovery, seller listings, enquiries, and account support."
    />
  );
}
