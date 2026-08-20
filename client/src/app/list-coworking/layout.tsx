import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "List a Coworking Space",
  description:
    "List coworking and flexible workspace inventory on CredXP and reach corporates looking for premium office rentals.",
  alternates: { canonical: "/list-coworking" },
};

export default function ListCoworkingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
