import Image from "next/image";
import { Mail, Phone, UserCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/utils/cn";
import type { Proposal, ProposalAgent, ProposalField } from "@/types/proposal";

const FULL_WIDTH_FIELDS = new Set(["description", "highlights"]);

interface ProposalPreviewProps {
  propertyTitle: string;
  agent: ProposalAgent;
  fields: ProposalField[];
}

export default function ProposalPreview({ propertyTitle, agent, fields }: ProposalPreviewProps) {
  return (
    <div className="space-y-6">
      <Card padding="lg" className="border-slate-200 bg-white shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-500">Your Details</p>
        <div className="mt-4 flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-slate-400">
            {agent.avatar ? (
              <Image src={agent.avatar} alt="" width={56} height={56} unoptimized className="h-full w-full object-cover" />
            ) : (
              <UserCircle className="h-8 w-8" />
            )}
          </div>
          <div className="space-y-1 text-sm text-slate-700">
            <p className="text-base font-semibold text-slate-900">{agent.name}</p>
            <p className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-slate-400" />{agent.email}</p>
            {agent.phone && <p className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-slate-400" />{agent.phone}</p>}
          </div>
        </div>
      </Card>

      <Card padding="lg" className="border-slate-200 bg-white shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-500">Property Details</p>
        <h2 className="mt-2 text-xl font-semibold text-slate-900">{propertyTitle}</h2>
        <dl className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {fields.map((field) => (
            <div
              key={field.key}
              className={cn(
                "rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3.5",
                FULL_WIDTH_FIELDS.has(field.key) && "sm:col-span-2 lg:col-span-3"
              )}
            >
              <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{field.label}</dt>
              <dd className="mt-1.5 text-sm font-medium leading-6 text-slate-900">{field.value}</dd>
            </div>
          ))}
        </dl>
      </Card>
    </div>
  );
}

export function PublicProposalView({ proposal }: { proposal: Proposal }) {
  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="mx-auto max-w-3xl px-4">
        <div className="mb-8 text-center">
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-accent-500">CredXP</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">Property Proposal</h1>
          <p className="mt-2 text-sm text-slate-600">{proposal.propertyTitle}</p>
        </div>
        <ProposalPreview
          propertyTitle={proposal.propertyTitle}
          agent={proposal.agent}
          fields={proposal.propertySnapshot}
        />
      </div>
    </div>
  );
}
