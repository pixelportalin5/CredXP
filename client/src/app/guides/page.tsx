import Link from "next/link";
import { BookOpen } from "lucide-react";
import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import LeadCaptureBar from "@/components/lead/LeadCaptureBar";
import JsonLd from "@/components/seo/JsonLd";
import { guides } from "@/content/guides";
import { buildBreadcrumbJsonLd, defaultOpenGraph } from "@/lib/seo";

const TITLE = "Commercial Property Investment Guides";
const DESCRIPTION =
  "Plain-English guides to pre-leased commercial property, rental yield, lock-in periods, due diligence and leasing office space in Gurugram.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/guides" },
  openGraph: defaultOpenGraph(`${TITLE} | CredXP`, DESCRIPTION, "/guides"),
};

export default function GuidesPage() {
  const groups = [
    { label: "For investors", items: guides.filter((guide) => guide.audience === "Investors") },
    { label: "For businesses", items: guides.filter((guide) => guide.audience === "Businesses") },
  ];

  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Guides", path: "/guides" },
        ])}
      />
      <section className="blue-hero-bg border-b border-white/10 py-16 text-white lg:py-20">
        <Container size="xl">
          <Badge variant="accent" icon={<BookOpen className="h-3 w-3" />} className="mb-4">
            Guides
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">{TITLE}</h1>
          <p className="mt-3 max-w-2xl text-white/72">{DESCRIPTION}</p>
        </Container>
      </section>

      <section className="py-12 lg:py-16">
        <Container size="xl" className="space-y-12">
          {groups.map((group) => (
            <div key={group.label}>
              <h2 className="text-xl font-semibold text-slate-900">{group.label}</h2>
              <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {group.items.map((guide) => (
                  <Link
                    key={guide.slug}
                    href={`/guides/${guide.slug}`}
                    className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-accent-500/50 hover:shadow-md"
                  >
                    <h3 className="text-lg font-semibold text-slate-900 group-hover:text-accent-500">{guide.title}</h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">{guide.description}</p>
                    <span className="mt-4 text-sm font-medium text-accent-500">Read the guide →</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </Container>
      </section>

      <LeadCaptureBar
        title="Have a specific property in mind?"
        subtitle="Share the details and a CredXP advisor will help you review the lease, tenant and numbers."
      />
    </>
  );
}
