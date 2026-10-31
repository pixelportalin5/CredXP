import Link from "next/link";
import { notFound } from "next/navigation";
import { BookOpen } from "lucide-react";
import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import LeadCaptureBar from "@/components/lead/LeadCaptureBar";
import JsonLd from "@/components/seo/JsonLd";
import { getGuide, guides, type GuideSection } from "@/content/guides";
import { buildBreadcrumbJsonLd, buildGuideJsonLd, defaultOpenGraph } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return guides.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) return {};
  const path = `/guides/${guide.slug}`;
  return {
    title: guide.metaTitle,
    description: guide.description,
    alternates: { canonical: path },
    openGraph: { ...defaultOpenGraph(guide.metaTitle, guide.description, path), type: "article" },
  };
}

function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

function Section({ section }: { section: GuideSection }) {
  return (
    <section className="mt-10">
      <h2 className="text-2xl font-semibold text-slate-900">{section.heading}</h2>
      {section.paragraphs?.map((text) => (
        <p key={text.slice(0, 40)} className="mt-4 leading-relaxed text-slate-700">
          {text}
        </p>
      ))}
      {section.bullets ? (
        <ul className="mt-4 list-disc space-y-2 pl-6 text-slate-700">
          {section.bullets.map((item) => (
            <li key={item.slice(0, 40)} className="leading-relaxed">
              {item}
            </li>
          ))}
        </ul>
      ) : null}
      {section.table ? (
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[480px] border-collapse text-left text-sm">
            {section.table.caption ? (
              <caption className="caption-bottom pt-2 text-left text-xs text-slate-500">{section.table.caption}</caption>
            ) : null}
            <thead>
              <tr className="bg-slate-100">
                {section.table.headers.map((header, index) => (
                  <th key={`${header}-${index}`} className="border border-slate-200 px-3 py-2 font-semibold text-slate-900">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {section.table.rows.map((row) => (
                <tr key={row.join("|")}>
                  {row.map((cell, index) => (
                    <td key={`${index}-${cell}`} className="border border-slate-200 px-3 py-2 text-slate-700">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) notFound();

  const others = guides.filter((item) => item.slug !== guide.slug).slice(0, 3);

  return (
    <>
      <JsonLd data={buildGuideJsonLd(guide)} />
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Guides", path: "/guides" },
          { name: guide.title, path: `/guides/${guide.slug}` },
        ])}
      />

      <section className="blue-hero-bg border-b border-white/10 py-14 text-white lg:py-16">
        <Container size="md">
          <nav aria-label="Breadcrumb" className="mb-4 text-sm text-white/60">
            <Link href="/" className="hover:text-white">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/guides" className="hover:text-white">Guides</Link>
          </nav>
          <Badge variant="accent" icon={<BookOpen className="h-3 w-3" />} className="mb-4">
            {guide.audience === "Investors" ? "Investor guide" : "Business guide"}
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">{guide.title}</h1>
          <p className="mt-4 text-sm text-white/60">
            By the CredXP advisory team · Last reviewed {formatDate(guide.reviewed)}
          </p>
        </Container>
      </section>

      <article className="py-12 lg:py-14">
        <Container size="md">
          <div className="rounded-2xl border border-accent-500/20 bg-accent-500/5 p-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-accent-500">In short</p>
            <p className="mt-2 text-lg leading-relaxed text-slate-800">{guide.summary}</p>
          </div>

          {guide.sections.map((section) => (
            <Section key={section.heading} section={section} />
          ))}

          <section className="mt-12">
            <h2 className="text-2xl font-semibold text-slate-900">Frequently asked questions</h2>
            <div className="mt-5 space-y-6">
              {guide.faqs.map((faq) => (
                <div key={faq.question}>
                  <h3 className="text-lg font-semibold text-slate-900">{faq.question}</h3>
                  <p className="mt-2 leading-relaxed text-slate-700">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-12 rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <h2 className="text-lg font-semibold text-slate-900">Next steps</h2>
            <ul className="mt-3 space-y-2">
              {guide.related.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-accent-500 hover:underline">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <p className="mt-8 text-xs leading-relaxed text-slate-500">
            This guide is general information, not legal, tax or investment advice. Rules and rates change; confirm
            details with a qualified lawyer or chartered accountant before you act. Rental income and returns from
            property are not guaranteed.
          </p>

          <nav aria-label="More guides" className="mt-12 border-t border-slate-200 pt-8">
            <h2 className="text-lg font-semibold text-slate-900">More guides</h2>
            <ul className="mt-3 space-y-2">
              {others.map((item) => (
                <li key={item.slug}>
                  <Link href={`/guides/${item.slug}`} className="text-accent-500 hover:underline">
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </Container>
      </article>

      <LeadCaptureBar
        title={guide.audience === "Investors" ? "Evaluating a pre-leased property?" : "Looking for office space in Gurugram?"}
        subtitle={
          guide.audience === "Investors"
            ? "Send us the listing and a CredXP advisor will help you review the lease, tenant and numbers."
            : "Share your headcount, budget and preferred location, and we will shortlist options."
        }
      />
    </>
  );
}
