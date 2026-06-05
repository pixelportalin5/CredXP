"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Landmark } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import CoworkingListingForm from "@/components/coworking/CoworkingListingForm";
import { useAuth } from "@/components/providers/AuthProvider";
import { useToast } from "@/components/providers/ToastProvider";
import coworkingService from "@/services/coworking.service";
import type { CoworkingSpace } from "@/types/coworking";

export default function ListCoworkingPage() {
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
          <Landmark className="mx-auto h-10 w-10 text-accent-500" />
          <h1 className="mt-4 text-2xl font-semibold text-slate-900">Login to list coworking space</h1>
          <p className="mt-2 text-sm text-slate-600">Seller authentication is required before publishing coworking listings.</p>
          <Link href="/login?next=/list-coworking" className="mt-6 inline-block">
            <Button>Login / Register</Button>
          </Link>
        </Card>
      </Container>
    );
  }

  const handleSubmit = async (data: Partial<CoworkingSpace>) => {
    try {
      const res = await coworkingService.create(data);
      showToast({ type: "success", title: "Coworking space published", message: "Your listing is now visible publicly." });
      router.push(`/coworking/${res.data._id}`);
    } catch (error) {
      showToast({ type: "error", title: "Unable to publish", message: error instanceof Error ? error.message : "Please review the form." });
    }
  };

  return (
    <>
      <section className="blue-hero-bg border-b border-white/10 py-10 text-white lg:py-14">
        <Container size="lg">
          <Badge variant="accent" icon={<Landmark className="h-3 w-3" />}>Seller Listing</Badge>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">List a Coworking Space</h1>
          <p className="mt-3 max-w-2xl text-white/72">
            Add operator details, location, pricing, amenities, and images. Published listings appear on the coworking marketplace immediately.
          </p>
        </Container>
      </section>
      <Container size="lg" className="py-10 lg:py-14">
        <CoworkingListingForm submitLabel="Publish Coworking Space" onSubmit={handleSubmit} />
      </Container>
    </>
  );
}
