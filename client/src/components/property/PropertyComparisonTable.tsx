"use client";

import Link from "next/link";
import { X } from "lucide-react";
import type { Property } from "@/types/property";
import { buildComparisonRows } from "@/utils/propertyComparisonMetrics";
import { usePropertyComparison } from "@/hooks/usePropertyComparison";

interface PropertyComparisonTableProps {
  properties: Property[];
}

export default function PropertyComparisonTable({ properties }: PropertyComparisonTableProps) {
  const { removeFromCompare } = usePropertyComparison();
  const rows = buildComparisonRows(properties);

  return (
    <div className="hidden overflow-x-auto rounded-[1.75rem] border border-slate-200 bg-white shadow-sm lg:block">
      <table className="min-w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="sticky left-0 z-10 min-w-[180px] bg-slate-50 px-5 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Metric
            </th>
            {properties.map((property) => (
              <th key={property._id} className="min-w-[220px] px-5 py-4 align-top">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Link
                      href={`/properties/${property._id}`}
                      className="line-clamp-2 text-base font-semibold text-slate-900 transition-colors hover:text-accent-500"
                    >
                      {property.title}
                    </Link>
                    <p className="mt-1 text-xs text-slate-500">{property.location.city}</p>
                  </div>
                  <button
                    type="button"
                    aria-label={`Remove ${property.title} from compare`}
                    onClick={() => removeFromCompare(property._id)}
                    className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr
              key={row.key}
              className={index % 2 === 0 ? "bg-white" : "bg-slate-50/60"}
            >
              <td className="sticky left-0 z-10 border-t border-slate-100 bg-inherit px-5 py-4 font-medium text-slate-700">
                {row.label}
              </td>
              {row.values.map((value, valueIndex) => (
                <td
                  key={`${row.key}-${properties[valueIndex]?._id ?? valueIndex}`}
                  className="border-t border-slate-100 px-5 py-4 text-slate-900"
                >
                  {value}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
