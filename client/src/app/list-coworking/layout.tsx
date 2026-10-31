import type { Metadata } from "next";

export const metadata: Metadata = {
  // Tool / form page with no search value: keep out of the index, follow links.
  robots: { index: false, follow: true },
  title: "List a Coworking Space",
  description:
    "List coworking and flexible workspace inventory on CredXP and reach corporates looking for premium office rentals.",
  alternates: { canonical: "/list-coworking" },
};

export default function ListCoworkingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
