import PlaceholderPage from "@/components/shared/PlaceholderPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog | CredXP",
  description: "CredXP articles and commercial real estate updates.",
};

export default function BlogPage() {
  return (
    <PlaceholderPage
      eyebrow="Blog"
      title="CredXP Blog"
      description="Read upcoming articles on commercial real estate, leasing, coworking, and investment trends."
    />
  );
}
