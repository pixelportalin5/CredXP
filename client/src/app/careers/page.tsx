import PlaceholderPage from "@/components/shared/PlaceholderPage";
import { placeholderMetadata } from "@/lib/seo";

export const metadata = placeholderMetadata(
  "Careers",
  "CredXP careers and hiring opportunities."
);

export default function CareersPage() {
  return (
    <PlaceholderPage
      eyebrow="Careers"
      title="Careers at CredXP"
      description="Explore upcoming opportunities to build the future of commercial real estate discovery with CredXP."
    />
  );
}
