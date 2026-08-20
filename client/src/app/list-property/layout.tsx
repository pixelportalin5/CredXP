import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "List a Commercial Property",
  description:
    "List pre-leased commercial shops, premium offices, and investment-grade assets on CredXP for qualified buyers and tenants.",
  alternates: { canonical: "/list-property" },
};

export default function ListPropertyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
