import PlaceholderPage from "@/components/shared/PlaceholderPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Support | CredXP",
  description: "CredXP support resources and assistance.",
};

export default function SupportPage() {
  return (
    <PlaceholderPage
      eyebrow="Support"
      title="Support Center"
      description="Find help for property discovery, seller listings, enquiries, and account support."
    />
  );
}
