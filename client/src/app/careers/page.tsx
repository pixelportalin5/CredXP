import PlaceholderPage from "@/components/shared/PlaceholderPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Careers | CredXP",
  description: "CredXP careers and hiring opportunities.",
};

export default function CareersPage() {
  return (
    <PlaceholderPage
      eyebrow="Careers"
      title="Careers at CredXP"
      description="Explore upcoming opportunities to build the future of commercial real estate discovery with CredXP."
    />
  );
}
