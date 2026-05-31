"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { History } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { useAuth } from "@/components/providers/AuthProvider";
import { useToast } from "@/components/providers/ToastProvider";
import enquiryService from "@/services/enquiry.service";
import { formatDate, formatPriceCompact } from "@/utils/format";
import type { Enquiry } from "@/types/enquiry";

function getProperty(enquiry: Enquiry) {
  return typeof enquiry.propertyId === "string" ? null : enquiry.propertyId;
}

export default function UserHistoryPage() {
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const [history, setHistory] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;

    async function fetchHistory() {
      try {
        setLoading(true);
        const res = await enquiryService.getMyEnquiries({ status: "closed" });
        setHistory(res.data);
      } catch (error) {
        showToast({ type: "error", title: "History unavailable", message: error instanceof Error ? error.message : "Please try again." });
      } finally {
        setLoading(false);
      }
    }

    void fetchHistory();
  }, [user, showToast]);

  if (authLoading || loading) return <div className="min-h-[50vh]" />;

  if (!user) {
    return (
      <Container size="sm" className="py-16">
        <Card padding="lg" className="border-slate-200 bg-white text-center shadow-sm">
          <h1 className="text-2xl font-semibold text-slate-900">Login required</h1>
          <p className="mt-2 text-sm text-slate-600">Login to view your enquiry history.</p>
          <Link href="/login?next=/user/history" className="mt-6 inline-block">
            <Button>Login</Button>
          </Link>
        </Card>
      </Container>
    );
  }

  return (
    <>
      <section className="blue-hero-bg border-b border-white/10 py-12 text-white lg:py-16">
        <Container size="lg">
          <Badge variant="accent" icon={<History className="h-3 w-3" />}>History</Badge>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Enquiry History</h1>
          <p className="mt-3 max-w-2xl text-white/72">
            Closed enquiries appear here after the seller contacts you and marks the enquiry complete.
          </p>
        </Container>
      </section>

      <Container size="lg" className="py-10 lg:py-14">
        <div className="space-y-4">
          {history.length === 0 ? (
            <Card padding="lg" className="border-slate-200 bg-white text-center shadow-sm">
              <p className="text-sm text-slate-600">No history yet.</p>
            </Card>
          ) : history.map((enquiry) => {
            const property = getProperty(enquiry);
            return (
              <Card key={enquiry._id} padding="md" className="border-slate-200 bg-white shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="font-semibold text-slate-900">{property?.title || "Deleted property"}</h2>
                    {property && (
                      <p className="mt-1 text-sm text-slate-600">
                        {property.location.city} • {formatPriceCompact(property.price)}
                      </p>
                    )}
                    {enquiry.message && (
                      <p className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm leading-6 text-slate-600">
                        {enquiry.message}
                      </p>
                    )}
                  </div>
                  <Badge variant="success" size="sm">
                    Closed {enquiry.closedAt ? formatDate(enquiry.closedAt) : formatDate(enquiry.updatedAt)}
                  </Badge>
                </div>
              </Card>
            );
          })}
        </div>
      </Container>
    </>
  );
}
