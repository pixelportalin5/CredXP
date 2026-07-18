"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageLoader } from "@/components/ui/PageLoader";
import ProposalForm from "@/components/proposal/ProposalForm";
import { useAuth } from "@/components/providers/AuthProvider";
import propertyService from "@/services/property.service";
import { isStaff } from "@/utils/roles";
import type { Property } from "@/types/property";

export default function CreateProposalPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [property, setProperty] = useState<Property | null>(null);
  const [availableProperties, setAvailableProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user || !isStaff(user.role)) {
      router.replace(id ? `/properties/${id}` : "/invest");
      return;
    }

    async function fetchData() {
      try {
        setLoading(true);
        const [propertyRes, listRes] = await Promise.all([
          propertyService.getById(id),
          propertyService.getAll({ limit: 500 }),
        ]);
        setProperty(propertyRes.data);
        setAvailableProperties(listRes.data.properties || []);
      } catch {
        router.replace(`/properties/${id}`);
      } finally {
        setLoading(false);
      }
    }

    if (id) void fetchData();
  }, [authLoading, user, id, router]);

  if (authLoading || loading) return <PageLoader label="Loading proposal…" />;
  if (!user || !property || !isStaff(user.role)) return null;

  return (
    <ProposalForm
      user={user}
      backHref={`/properties/${property._id}`}
      initialProperty={property}
      availableProperties={availableProperties}
    />
  );
}
