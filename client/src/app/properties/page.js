import { Suspense } from "react";
import PropertiesPageClient from "./PropertiesPageClient";

export const metadata = {
  title: "Properties – CredXP",
  description:
    "Browse premium commercial spaces, offices, and shops for lease in Bangalore.",
};

export default function PropertiesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-indigo-500" />
        </div>
      }
    >
      <PropertiesPageClient />
    </Suspense>
  );
}
