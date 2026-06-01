import CoworkingDetailClient from "./CoworkingDetailClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Coworking Space Details",
  description: "View coworking space details, amenities, pricing, and enquiry options.",
};

export default function CoworkingDetailPage() {
  return <CoworkingDetailClient />;
}
