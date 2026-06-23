import PlaceholderPage from "@/components/shared/PlaceholderPage";
import { placeholderMetadata } from "@/lib/seo";

export const metadata = placeholderMetadata(
  "Downloads",
  "CredXP downloads, brochures, and documents."
);

export default function DownloadsPage() {
  return (
    <PlaceholderPage
      eyebrow="Downloads"
      title="Downloads"
      description="Access CredXP brochures, market documents, and property resources from this section."
    />
  );
}
