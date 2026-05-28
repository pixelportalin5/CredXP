import PlaceholderPage from "@/components/shared/PlaceholderPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Downloads | CredXP",
  description: "CredXP downloads, brochures, and documents.",
};

export default function DownloadsPage() {
  return (
    <PlaceholderPage
      eyebrow="Downloads"
      title="Downloads"
      description="Access CredXP brochures, market documents, and property resources from this section."
    />
  );
}
