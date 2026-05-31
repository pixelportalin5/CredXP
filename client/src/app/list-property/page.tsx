"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, Upload } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import PropertyListingForm from "@/components/property/PropertyListingForm";
import { useAuth } from "@/components/providers/AuthProvider";
import { useToast } from "@/components/providers/ToastProvider";
import propertyService from "@/services/property.service";
import type { Property } from "@/types/property";

export default function ListPropertyPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { showToast } = useToast();

  if (loading) {
    return <div className="min-h-[50vh]" />;
  }

  if (!user) {
    return (
      <Container size="sm" className="py-16">
        <Card padding="lg" className="border-slate-200 bg-white text-center shadow-sm">
          <Building2 className="mx-auto h-10 w-10 text-accent-500" />
          <h1 className="mt-4 text-2xl font-semibold text-slate-900">Login to list your property</h1>
          <p className="mt-2 text-sm text-slate-600">Seller authentication is required before publishing listings.</p>
          <Link href="/login?next=/list-property" className="mt-6 inline-block">
            <Button>Login / Register</Button>
          </Link>
        </Card>
      </Container>
    );
  }

  const handleSubmit = async (data: Partial<Property>) => {
    try {
      const res = await propertyService.create(data);
      showToast({ type: "success", title: "Property published", message: "Your listing is now visible publicly." });
      router.push(`/properties/${res.data._id}`);
    } catch (error) {
      showToast({ type: "error", title: "Unable to publish", message: error instanceof Error ? error.message : "Please review the form." });
    }
  };

  return (
    <>
      <section className="blue-hero-bg border-b border-white/10 py-10 text-white lg:py-14">
        <Container size="lg">
          <Badge variant="accent" icon={<Building2 className="h-3 w-3" />}>Seller Listing</Badge>
          <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">List a Commercial Property</h1>
              <p className="mt-3 max-w-2xl text-white/72">
                Add all required property details and exactly three images. Published active listings become visible in public browsing immediately.
              </p>
            </div>
            <Link href="/list-property/bulk-upload">
              <Button icon={<Upload className="h-4 w-4" />} className="!bg-white !text-slate-950 hover:!bg-slate-100">
                Bulk Upload
              </Button>
            </Link>
          </div>
        </Container>
      </section>
      <Container size="lg" className="py-10 lg:py-14">
        <PropertyListingForm onSubmit={handleSubmit} />
      </Container>
    </>
  );
}
