import type { Metadata } from "next";

export const metadata: Metadata = {
  // Tool / form page with no search value: keep out of the index, follow links.
  robots: { index: false, follow: true },
  title: "List a Commercial Property",
  description:
    "List pre-leased offices, bank-leased properties, retail/SCO units and investment-grade assets on CredXP for qualified buyers and tenants.",
  alternates: { canonical: "/list-property" },
};

export default function ListPropertyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
