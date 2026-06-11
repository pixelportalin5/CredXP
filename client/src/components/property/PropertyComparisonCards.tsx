"use client";

import Link from "next/link";
import { X } from "lucide-react";
import type { Property } from "@/types/property";
import { buildComparisonRows } from "@/utils/propertyComparisonMetrics";
import { usePropertyComparison } from "@/hooks/usePropertyComparison";

interface PropertyComparisonCardsProps {
  properties: Property[];
}

export default function PropertyComparisonCards({ properties }: PropertyComparisonCardsProps) {
  const { removeFromCompare } = usePropertyComparison();
  const rows = buildComparisonRows(properties);

  return (
    <div className="space-y-4 lg:hidden">
      {properties.map((property, propertyIndex) => (
        <article
          key={property._id}
          className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm"
        >
          <div className="flex items-start justify-between gap-3 border-b border-slate-100 bg-slate-50 px-4 py-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Property {propertyIndex + 1}
              </p>
              <Link
                href={`/properties/${property._id}`}
                className="mt-1 block text-lg font-semibold text-slate-900 transition-colors hover:text-accent-500"
              >
                {property.title}
              </Link>
              <p className="mt-1 text-sm text-slate-600">{property.location.city}</p>
            </div>
            <button
              type="button"
              aria-label={`Remove ${property.title} from compare`}
              onClick={() => removeFromCompare(property._id)}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <dl className="divide-y divide-slate-100">
            {rows.map((row) => (
              <div key={`${property._id}-${row.key}`} className="grid grid-cols-[minmax(0,42%)_1fr] gap-3 px-4 py-3">
                <dt className="text-sm font-medium text-slate-600">{row.label}</dt>
                <dd className="text-sm font-semibold text-slate-900">{row.values[propertyIndex]}</dd>
              </div>
            ))}
          </dl>
        </article>
      ))}
    </div>
  );
}
