import PlaceholderPage from "@/components/shared/PlaceholderPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Use | CredXP",
  description: "CredXP terms of use and platform conditions.",
};

export default function TermsPage() {
  return (
    <PlaceholderPage
      eyebrow="Terms"
      title="Terms of Use"
      description="This section will include CredXP platform terms, usage guidelines, and service conditions."
    />
  );
}
