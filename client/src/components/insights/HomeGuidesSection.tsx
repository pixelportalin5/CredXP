import Link from "next/link";
import { BookOpen } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { guides } from "@/content/guides";

const FEATURED = [
  "what-is-pre-leased-commercial-property",
  "rental-yield-gross-vs-net",
  "pre-leased-property-due-diligence-checklist",
];

/** Server-rendered, so crawlers see links to CredXP's own guides on the homepage. */
export default function HomeGuidesSection() {
  const items = FEATURED.map((slug) => guides.find((guide) => guide.slug === slug)).filter(
    (guide): guide is (typeof guides)[number] => Boolean(guide)
  );

  return (
    <section className="border-t border-slate-200 py-16 lg:py-20">
      <Container size="xl">
        <SectionHeader
          eyebrow="Investor Guides"
          eyebrowIcon={<BookOpen className="h-4 w-4" />}
          title="Understand Pre-Leased Property Before You Buy"
          subtitle="Plain-English guides on yields, leases and due diligence, written by the CredXP team."
          action={{ label: "All Guides", href: "/guides" }}
        />
        <div className="grid gap-6 md:grid-cols-3">
          {items.map((guide) => (
            <Link
              key={guide.slug}
              href={`/guides/${guide.slug}`}
              className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-accent-500/50 hover:shadow-md"
            >
              <h3 className="text-lg font-semibold text-slate-900 group-hover:text-accent-500">{guide.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">{guide.summary.split(". ")[0]}.</p>
              <span className="mt-4 text-sm font-medium text-accent-500">Read the guide →</span>
            </Link>
          ))}
        </div>
        <p className="mt-6 text-sm text-slate-600">
          Looking for property in a particular area? Browse{" "}
          <Link href="/gurugram" className="font-medium text-accent-500 hover:underline">
            commercial property in Gurugram by location
          </Link>
          .
        </p>
      </Container>
    </section>
  );
}
