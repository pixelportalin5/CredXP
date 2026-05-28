import PlaceholderPage from "@/components/shared/PlaceholderPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Partners | CredXP",
  description: "CredXP partner network and collaboration opportunities.",
};

export default function PartnersPage() {
  return (
    <PlaceholderPage
      eyebrow="Partners"
      title="Partner With CredXP"
      description="Learn about coworking operators, channel partners, and commercial real estate collaborations."
    />
  );
}
