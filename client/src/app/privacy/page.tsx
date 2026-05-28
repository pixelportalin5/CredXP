import PlaceholderPage from "@/components/shared/PlaceholderPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | CredXP",
  description: "CredXP privacy policy and data handling practices.",
};

export default function PrivacyPage() {
  return (
    <PlaceholderPage
      eyebrow="Privacy"
      title="Privacy Policy"
      description="Our privacy policy page will outline how CredXP handles user, seller, and enquiry information."
    />
  );
}
