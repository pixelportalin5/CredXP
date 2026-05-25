import PropertyDetailClient from "./PropertyDetailClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Property Details",
  description:
    "View detailed information about this premium commercial property — pricing, amenities, location, and more.",
};

export default function PropertyDetailPage() {
  return <PropertyDetailClient />;
}
