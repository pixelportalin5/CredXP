import CoworkingPageClient from "./CoworkingPageClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Coworking Spaces – Flexible Workspace Solutions",
  description:
    "Discover coworking and flexible premium office rentals from CredXP partner operators across Gurugram and Delhi NCR.",
  alternates: { canonical: "/coworking" },
};

export default function CoworkingPage() {
  return <CoworkingPageClient />;
}
