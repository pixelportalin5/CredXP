import PlaceholderPage from "@/components/shared/PlaceholderPage";
import { placeholderMetadata } from "@/lib/seo";

export const metadata = placeholderMetadata(
  "Blog",
  "CredXP articles and commercial real estate updates."
);

export default function BlogPage() {
  return (
    <PlaceholderPage
      eyebrow="Blog"
      title="CredXP Blog"
      description="Read upcoming articles on commercial real estate, leasing, coworking, and investment trends."
    />
  );
}
