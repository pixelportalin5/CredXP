import CoworkingPageClient from "./CoworkingPageClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Coworking Spaces – Flexible Workspace Solutions",
  description:
    "Discover and book coworking spaces from CredXP partner operators in Gurugram.",
  alternates: { canonical: "/coworking" },
};

export default function CoworkingPage() {
  return <CoworkingPageClient />;
}
