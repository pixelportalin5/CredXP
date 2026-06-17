"use client";

import Image from "next/image";
import {
  Building2,
  Check,
  MapPin,
  ThumbsDown,
  ThumbsUp,
  User,
  X,
} from "lucide-react";
import {
  DETAIL_FIELD_CONFIG,
  getKeyFeatures,
  OVERVIEW_FIELD_CONFIG,
  TRUST_FOOTER_ITEMS,
  WHO_ARE_WE_COPY,
  emptyDetailFields,
  emptyOverviewFields,
} from "@/constants/proposalDocument";
import { siteConfig } from "@/config/site";
import type { Proposal } from "@/types/proposal";
import { formatDate } from "@/utils/format";
import { getSnapshotValue } from "@/utils/buildProposalDefaults";
import { resolveProposalForDocument } from "@/utils/resolveProposalDocument";
import { toSafeCurrency } from "@/utils/pdfFormat";

const A4_WIDTH = 794;

interface ProposalDocumentProps {
  proposal: Proposal;
  qrDataUrl?: string;
}

function proposalRefId(proposal: Proposal): string {
  const id = String(proposal._id || "");
  const shortId = id.replace(/[^a-zA-Z0-9]/g, "").slice(-6).toUpperCase();
  return shortId ? `CREDXP-${shortId}` : "CREDXP";
}

function displayValue(value?: string, fallback = "—"): string {
  if (!value?.trim()) return fallback;
  return toSafeCurrency(value);
}

export default function ProposalDocument({ proposal, qrDataUrl }: ProposalDocumentProps) {
  const resolved = resolveProposalForDocument(proposal);
  const snapshot = resolved.propertySnapshot;
  const price = getSnapshotValue(snapshot, "price") || "On Request";
  const pricePerSqft = getSnapshotValue(snapshot, "pricePerSqft");
  const description = getSnapshotValue(snapshot, "description") || "No description provided.";
  const propertyType = resolved.propertyType || getSnapshotValue(snapshot, "type");
  const overview = resolved.overviewFields || emptyOverviewFields();
  const details = resolved.detailFields || emptyDetailFields();
  const preparedFor = resolved.preparedFor;
  const research = resolved.agentResearch;
  const pros = Array.isArray(research?.pros) ? research.pros : [];
  const cons = Array.isArray(research?.cons) ? research.cons : [];
  const keyFeatures = getKeyFeatures(propertyType);
  const coverImage = resolved.coverImage;
  const coverImageSrc =
    coverImage?.startsWith("/") && typeof window !== "undefined"
      ? `${window.location.origin}${coverImage}`
      : coverImage;

  const badgeLabel = propertyType?.toUpperCase().includes("PRE-LEASED")
    ? "PRE-LEASED"
    : propertyType?.split(" ")[0]?.toUpperCase() || "PROPERTY";

  const detailItemStyle = (multiline?: boolean) => ({
    width: multiline ? "100%" : "calc((100% - 0.75rem) / 3)",
  });

  return (
    <div
      className="bg-white font-sans text-slate-900"
      style={{ width: A4_WIDTH, maxWidth: A4_WIDTH, margin: "0 auto" }}
      data-proposal-document
    >
      <div className="flex items-stretch border-b border-slate-200">
        <div className="flex items-center px-6 py-4">
          <Image src="/logos/Credxp.webp" alt="CredXP" width={120} height={34} unoptimized className="h-8 w-auto" />
        </div>
        <div
          className="ml-auto flex items-center bg-black px-6 py-3 text-white"
          style={{ clipPath: "polygon(8% 0, 100% 0, 100% 100%, 0 100%)" }}
        >
          <div className="pl-4 text-right">
            <p className="text-[10px] font-bold tracking-[0.2em]">PROPERTY PROPOSAL</p>
            <p className="mt-1 text-[9px] text-slate-300">Prepared on {formatDate(resolved.createdAt)}</p>
            <p className="text-[8px] text-slate-400">Ref: {proposalRefId(resolved)}</p>
          </div>
        </div>
      </div>

      <div className="flex gap-3 px-5 pt-4">
        <div className="min-w-0 flex-[1.1]">
          <div className="mb-2 flex items-center gap-1.5">
            <Building2 className="h-3 w-3 text-red-600" />
            <p className="text-[8px] font-bold uppercase tracking-wider text-red-600">Who Are We</p>
          </div>
          <p className="line-clamp-3 text-[8px] leading-relaxed text-slate-600">{WHO_ARE_WE_COPY}</p>

          <div className="mt-3">
            <span className="inline-block rounded bg-red-600 px-2 py-0.5 text-[7px] font-bold uppercase tracking-wide text-white">
              {badgeLabel}
            </span>
            <h1 className="mt-1.5 line-clamp-2 text-[15px] font-bold uppercase leading-tight text-slate-900">
              {resolved.propertyTitle}
            </h1>
            <p className="mt-1 flex items-center gap-1 text-[9px] text-slate-600">
              <MapPin className="h-3 w-3 shrink-0 text-red-600" />
              <span className="line-clamp-1">{displayValue(overview.location)}</span>
            </p>
            <p className="mt-1 line-clamp-2 text-[8px] leading-relaxed text-slate-500">
              {description.slice(0, 140)}
              {description.length > 140 ? "..." : ""}
            </p>
          </div>
        </div>

        <div className="relative h-[130px] min-w-0 flex-1 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
          {coverImageSrc ? (
            <img src={coverImageSrc} alt="" className="h-full w-full object-cover" crossOrigin="anonymous" />
          ) : (
            <div className="flex h-full items-center justify-center text-[9px] text-slate-400">No image</div>
          )}
        </div>

        <div className="min-w-0 flex-[0.9]">
          <div className="rounded-lg bg-red-600 px-3 py-2.5 text-center text-white">
            <p className="text-[7px] font-semibold uppercase tracking-wider opacity-90">Asking Price</p>
            <p className="mt-0.5 text-[16px] font-bold">{toSafeCurrency(price)}</p>
            {pricePerSqft && <p className="text-[8px] opacity-90">{toSafeCurrency(pricePerSqft)}</p>}
          </div>
          <div className="mt-2 space-y-1.5">
            {keyFeatures.map((feature) => (
              <div
                key={feature.title}
                className="flex items-start gap-1.5 rounded border border-slate-100 bg-slate-50 px-2 py-1"
              >
                <div className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-600" />
                <div>
                  <p className="text-[7px] font-bold text-slate-800">{feature.title}</p>
                  <p className="text-[6px] text-slate-500">{feature.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-3 flex gap-3 px-5">
        <div className="flex-1 rounded-lg border border-slate-200 bg-white p-3">
          <div className="mb-2 rounded bg-red-600 px-2 py-0.5 text-[7px] font-bold uppercase tracking-wide text-white">
            Prepared For
          </div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-50 text-red-600">
              <User className="h-4 w-4" />
            </div>
            <div className="min-w-0 text-[8px] text-slate-700">
              <p className="truncate font-bold text-slate-900">{displayValue(preparedFor?.name)}</p>
              {preparedFor?.email && <p className="truncate">{preparedFor.email}</p>}
              {preparedFor?.phone && <p className="truncate">{preparedFor.phone}</p>}
            </div>
          </div>
        </div>

        <div className="flex-1 rounded-lg border border-red-200 bg-red-50 p-3">
          <div className="mb-2 text-[7px] font-bold uppercase tracking-wide text-red-700">Your Property Advisor</div>
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border-2 border-white bg-slate-200">
              {resolved.agent.avatar ? (
                <img src={resolved.agent.avatar} alt="" className="h-full w-full object-cover" crossOrigin="anonymous" />
              ) : (
                <div className="flex h-full items-center justify-center text-slate-400">
                  <User className="h-5 w-5" />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1 text-[8px] text-slate-700">
              <p className="font-bold text-slate-900">{resolved.agent.name}</p>
              <p className="text-slate-500">Senior Property Consultant</p>
              {resolved.agent.phone && <p>{resolved.agent.phone}</p>}
              {resolved.agent.email && <p className="truncate">{resolved.agent.email}</p>}
              <p className="text-red-600">{siteConfig.url.replace("https://", "")}</p>
            </div>
            {qrDataUrl && (
              <img src={qrDataUrl} alt="Contact QR" className="h-12 w-12 shrink-0 rounded bg-white p-0.5" />
            )}
          </div>
        </div>
      </div>

      <div className="mt-3 px-5">
        <div className="mb-1.5 flex items-center gap-1.5">
          <Building2 className="h-3 w-3 text-red-600" />
          <p className="text-[8px] font-bold uppercase tracking-wider text-red-600">Property Overview</p>
        </div>
        <div className="flex gap-2">
          {OVERVIEW_FIELD_CONFIG.map((field) => (
            <div key={field.key} className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-slate-50 px-2 py-2 text-center">
              <p className="text-[6px] font-semibold uppercase tracking-wide text-slate-500">{field.label}</p>
              <p className="mt-1 line-clamp-2 text-[9px] font-bold text-slate-900">
                {displayValue(overview[field.key])}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 px-5">
        <div className="mb-1.5 flex items-center gap-1.5">
          <Building2 className="h-3 w-3 text-red-600" />
          <p className="text-[8px] font-bold uppercase tracking-wider text-red-600">Property Details</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {DETAIL_FIELD_CONFIG.map((field) => (
            <div
              key={field.key}
              className="rounded border border-slate-200 bg-white px-2 py-1.5"
              style={detailItemStyle(field.multiline)}
            >
              <p className="text-[6px] font-semibold uppercase tracking-wide text-slate-500">{field.label}</p>
              <p
                className={`mt-0.5 font-bold text-slate-900 ${field.multiline ? "line-clamp-2 text-[8px]" : "line-clamp-1 text-[8px]"}`}
              >
                {displayValue(details[field.key])}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 px-5">
        <div className="mb-1.5 flex items-center gap-1.5">
          <Building2 className="h-3 w-3 text-red-600" />
          <p className="text-[8px] font-bold uppercase tracking-wider text-red-600">Property Description</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
          <p className="line-clamp-4 text-[8px] leading-relaxed text-slate-700">{description}</p>
        </div>
      </div>

      {research && (pros.some(Boolean) || cons.some(Boolean)) && (
        <div className="mt-3 px-5">
          <div className="mb-1.5 flex items-center gap-1.5">
            <Building2 className="h-3 w-3 text-red-600" />
            <p className="text-[8px] font-bold uppercase tracking-wider text-red-600">Agent Research</p>
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <div className="mb-1 flex items-center gap-1 text-[8px] font-bold text-green-700">
                <ThumbsUp className="h-3 w-3" /> Pros
              </div>
              <ul className="space-y-0.5">
                {pros.filter(Boolean).map((item) => (
                  <li key={item} className="flex items-start gap-1 text-[7px] text-slate-700">
                    <Check className="mt-0.5 h-2.5 w-2.5 shrink-0 text-green-600" />
                    <span className="line-clamp-1">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex-1">
              <div className="mb-1 flex items-center gap-1 text-[8px] font-bold text-red-700">
                <ThumbsDown className="h-3 w-3" /> Cons
              </div>
              <ul className="space-y-0.5">
                {cons.filter(Boolean).map((item) => (
                  <li key={item} className="flex items-start gap-1 text-[7px] text-slate-700">
                    <X className="mt-0.5 h-2.5 w-2.5 shrink-0 text-red-600" />
                    <span className="line-clamp-1">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="mt-auto px-5 pb-0 pt-2">
        <div className="flex gap-2 border-t border-slate-200 py-2">
          {TRUST_FOOTER_ITEMS.map((item) => (
            <div key={item.label} className="flex-1 text-center">
              <p className="text-[7px] font-bold text-slate-800">{item.label}</p>
              <p className="text-[6px] text-slate-500">{item.sublabel}</p>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between bg-slate-800 px-4 py-2 text-[7px] text-slate-300">
          <span>Shared via CredXP — Premium Commercial Real Estate</span>
          <span className="font-bold text-red-400">credxp.com</span>
          <span>© 2026 {siteConfig.legal.companyName}</span>
        </div>
      </div>
    </div>
  );
}
