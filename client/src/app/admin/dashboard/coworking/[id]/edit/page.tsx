"use client";

import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Landmark, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { PageLoader } from "@/components/ui/PageLoader";
import { FormSkeleton } from "@/components/ui/Skeleton";
import CoworkingListingForm from "@/components/coworking/CoworkingListingForm";
import { useAuth } from "@/components/providers/AuthProvider";
import { useToast } from "@/components/providers/ToastProvider";
import adminService from "@/services/admin.service";
import coworkingService from "@/services/coworking.service";
import type { CoworkingSpace } from "@/types/coworking";

export default function AdminEditCoworkingPage() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const dashboardHref = searchParams.get("from") === "coworking"
    ? "/admin/dashboard?section=coworking"
    : "/admin/dashboard";
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const [space, setSpace] = useState<CoworkingSpace | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== "admin" || !id) return;

    async function fetchSpace() {
      try {
        setLoading(true);
        const res = await coworkingService.getById(id);
        setSpace(res.data);
      } catch (error) {
        showToast({
          type: "error",
          title: "Coworking space unavailable",
          message: error instanceof Error ? error.message : "Please try again.",
        });
      } finally {
        setLoading(false);
      }
    }

    void fetchSpace();
  }, [user, id, showToast]);

  const handleSubmit = async (data: Partial<CoworkingSpace>) => {
    if (!space) return;

    try {
      await adminService.updateCoworkingSpace(space._id, data);
      showToast({ type: "success", title: "Coworking space updated" });
      router.push(dashboardHref);
    } catch (error) {
      showToast({
        type: "error",
        title: "Coworking save failed",
        message: error instanceof Error ? error.message : "Please review the listing.",
      });
    }
  };

  if (authLoading) {
    return <PageLoader label="Checking access…" />;
  }

  if (!user || user.role !== "admin") {
    return (
      <Container size="sm" className="py-16">
        <Card padding="lg" className="border-slate-200 bg-white text-center shadow-sm">
          <ShieldCheck className="mx-auto h-10 w-10 text-slate-400" />
          <h1 className="mt-4 text-2xl font-semibold text-slate-900">Admin access required</h1>
          <p className="mt-2 text-sm text-slate-600">Login with an admin account to edit coworking spaces.</p>
          <Link href="/login?next=/admin/dashboard" className="mt-6 inline-block">
            <Button>Login</Button>
          </Link>
        </Card>
      </Container>
    );
  }

  return (
    <>
      <section className="blue-hero-bg border-b border-white/10 py-10 text-white lg:py-14">
        <Container size="lg">
          <Badge variant="accent" icon={<ShieldCheck className="h-3 w-3" />}>Admin Console</Badge>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Edit Coworking Space</h1>
          <p className="mt-3 max-w-2xl text-white/72">{space?.title || "Loading coworking details…"}</p>
        </Container>
      </section>

      <Container size="lg" className="py-10 lg:py-14">
        <Link
          href={dashboardHref}
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Coworking
        </Link>

        {loading ? (
          <Card padding="lg" className="border-slate-200 bg-white shadow-sm">
            <FormSkeleton />
          </Card>
        ) : !space ? (
          <Card padding="lg" className="border-slate-200 bg-white text-center shadow-sm">
            <Landmark className="mx-auto h-10 w-10 text-slate-400" />
            <h2 className="mt-4 text-xl font-semibold text-slate-900">Coworking space not found</h2>
            <p className="mt-2 text-sm text-slate-600">This listing does not exist or has been removed.</p>
          </Card>
        ) : (
          <Card padding="lg" className="border-slate-200 bg-white shadow-sm">
            <CoworkingListingForm
              initialSpace={space}
              submitLabel="Save Coworking Space"
              onSubmit={handleSubmit}
            />
          </Card>
        )}
      </Container>
    </>
  );
}
