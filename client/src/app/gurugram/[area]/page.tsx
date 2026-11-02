import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin } from "lucide-react";
import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import PropertyCard from "@/components/property/PropertyCard";
import LeadCaptureBar from "@/components/lead/LeadCaptureBar";
import JsonLd from "@/components/seo/JsonLd";
import { GURUGRAM_AREAS, MIN_INDEXABLE_LISTINGS, getArea } from "@/config/locations";
import { absoluteUrl, buildBreadcrumbJsonLd, defaultOpenGraph } from "@/lib/seo";
import { fetchListingsByArea } from "@/lib/locations";
import type { Property } from "@/types/property";
import { propertyPath } from "@/utils/listingUrl";

export const revalidate = 3600;
export const dynamicParams = false;

export function generateStaticParams() {
  return GURUGRAM_AREAS.map((area) => ({ area: area.slug }));
}

async function loadArea(slug: string) {
  const area = getArea(slug);
  if (!area) return null;
  const group = (await fetchListingsByArea()).find((item) => item.area.slug === slug);
  return group ?? { area, invest: [], lease: [], total: 0 };
}

export async function generateMetadata({ params }: { params: Promise<{ area: string }> }): Promise<Metadata> {
  const { area: slug } = await params;
  const group = await loadArea(slug);
  if (!group) return {};
  const { area, invest, lease, total } = group;
  // Drop ", Gurugram" for long area names so the full title stays under ~65 chars.
  const fullTitle = `Commercial Property in ${area.name}, Gurugram`;
  const title = fullTitle.length <= 56 ? fullTitle : `Commercial Property in ${area.name}`;
  const description = `${invest.length} pre-leased and investment listings and ${lease.length} offices and shops for rent in ${area.name}, Gurugram. See price, rent, size and gross yield, then enquire with CredXP.`;
  const path = `/gurugram/${area.slug}`;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: defaultOpenGraph(`${title} | CredXP`, description, path),
    // Thin pages stay out of the index until the area has real inventory.
    ...(total < MIN_INDEXABLE_LISTINGS ? { robots: { index: false, follow: true } } : {}),
  };
}

function ListingGrid({ heading, listings }: { heading: string; listings: Property[] }) {
  if (listings.length === 0) return null;
  return (
    <section className="mt-12">
      <h2 className="text-2xl font-semibold text-slate-900">
        {heading} <span className="text-base font-normal text-slate-500">({listings.length})</span>
      </h2>
      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {listings.map((property) => (
          <PropertyCard key={property._id} property={property} />
        ))}
      </div>
    </section>
  );
}

export default async function AreaPage({ params }: { params: Promise<{ area: string }> }) {
  const { area: slug } = await params;
  const group = await loadArea(slug);
  if (!group) notFound();
  const { area, invest, lease, total } = group;
  const others = GURUGRAM_AREAS.filter((item) => item.slug !== area.slug);

  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Gurugram", path: "/gurugram" },
          { name: area.name, path: `/gurugram/${area.slug}` },
        ])}
      />
      {total > 0 ? (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: `Commercial property listings in ${area.name}, Gurugram`,
            numberOfItems: total,
            itemListElement: [...invest, ...lease].map((property, index) => ({
              "@type": "ListItem",
              position: index + 1,
              url: absoluteUrl(propertyPath(property)),
              name: property.title,
            })),
          }}
        />
      ) : null}

      <section className="blue-hero-bg border-b border-white/10 py-14 text-white lg:py-16">
        <Container size="xl">
          <nav aria-label="Breadcrumb" className="mb-4 text-sm text-white/60">
            <Link href="/" className="hover:text-white">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/gurugram" className="hover:text-white">Gurugram</Link>
          </nav>
          <Badge variant="accent" icon={<MapPin className="h-3 w-3" />} className="mb-4">
            Gurugram location
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Commercial Property in {area.name}, Gurugram
          </h1>
          <p className="mt-4 max-w-3xl leading-relaxed text-white/75">{area.intro}</p>
        </Container>
      </section>

      <Container size="xl" className="py-12 lg:py-14">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-slate-900">Getting there</h2>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-slate-700">
              {area.access.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-700">
            <p className="font-semibold text-slate-900">Live listings here</p>
            <p className="mt-2">{invest.length} for investment</p>
            <p>{lease.length} for lease</p>
            <p className="mt-3 text-xs text-slate-500">Yields shown on listings are gross, based on figures shared by the seller.</p>
          </div>
        </div>

        {total === 0 ? (
          <p className="mt-10 text-slate-700">
            We don&apos;t have live listings in {area.name} right now. Share your requirement below and we&apos;ll tell you
            when something suitable comes up, or browse <Link href="/invest" className="text-accent-500 underline">all investment listings</Link>{" "}
            and <Link href="/lease" className="text-accent-500 underline">spaces for lease</Link>.
          </p>
        ) : null}

        <ListingGrid heading={`Pre-leased and investment property in ${area.name}`} listings={invest} />
        <ListingGrid heading={`Office and retail space for rent in ${area.name}`} listings={lease} />

        <section className="mt-14 rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">Before you decide</h2>
          <ul className="mt-3 space-y-2">
            <li><Link href="/guides/pre-leased-property-due-diligence-checklist" className="text-accent-500 hover:underline">Pre-leased property due diligence checklist</Link></li>
            <li><Link href="/guides/rental-yield-gross-vs-net" className="text-accent-500 hover:underline">How to calculate rental yield (gross vs net)</Link></li>
            <li><Link href="/guides/leasing-office-space-in-gurugram" className="text-accent-500 hover:underline">Leasing office space in Gurugram: what to check</Link></li>
          </ul>
        </section>

        <nav aria-label="Other Gurugram areas" className="mt-10">
          <h2 className="text-lg font-semibold text-slate-900">Other areas in Gurugram</h2>
          <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
            {others.map((item) => (
              <li key={item.slug}>
                <Link href={`/gurugram/${item.slug}`} className="text-accent-500 hover:underline">{item.name}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </Container>

      <LeadCaptureBar
        title={`Looking for space in ${area.name}?`}
        subtitle="Share your size, budget and timeline, and a CredXP advisor will shortlist options for you."
      />
    </>
  );
}
