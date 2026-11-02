import Link from "next/link";
import { MapPin } from "lucide-react";
import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import LeadCaptureBar from "@/components/lead/LeadCaptureBar";
import JsonLd from "@/components/seo/JsonLd";
import { buildBreadcrumbJsonLd, defaultOpenGraph } from "@/lib/seo";
import { fetchListingsByArea } from "@/lib/locations";

export const revalidate = 3600;

const TITLE = "Commercial Property in Gurugram by Location";
const DESCRIPTION =
  "Pre-leased offices, bank-leased properties and retail/SCO units for sale, and office and retail space for rent, across Gurugram's main commercial areas: DLF Phases, MG Road, Sohna Road, Udyog Vihar and more.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/gurugram" },
  openGraph: defaultOpenGraph(`${TITLE} | CredXP`, DESCRIPTION, "/gurugram"),
};

export default async function GurugramPage() {
  const areas = (await fetchListingsByArea()).filter((group) => group.total > 0).sort((a, b) => b.total - a.total);

  return (
    <>
      <JsonLd data={buildBreadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Gurugram", path: "/gurugram" }])} />
      <section className="blue-hero-bg border-b border-white/10 py-16 text-white lg:py-20">
        <Container size="xl">
          <Badge variant="accent" icon={<MapPin className="h-3 w-3" />} className="mb-4">
            Locations
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">{TITLE}</h1>
          <p className="mt-3 max-w-2xl text-white/72">{DESCRIPTION}</p>
        </Container>
      </section>

      <section className="py-12 lg:py-16">
        <Container size="xl">
          {areas.length === 0 ? (
            <p className="text-slate-600">
              Listings are loading slowly right now. Browse <Link href="/invest" className="text-accent-500 underline">investment listings</Link> or{" "}
              <Link href="/lease" className="text-accent-500 underline">spaces for lease</Link>.
            </p>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {areas.map(({ area, invest, lease }) => (
                <Link
                  key={area.slug}
                  href={`/gurugram/${area.slug}`}
                  className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-accent-500/50 hover:shadow-md"
                >
                  <h2 className="text-lg font-semibold text-slate-900 group-hover:text-accent-500">{area.name}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{area.intro}</p>
                  <p className="mt-4 text-sm font-medium text-slate-800">
                    {invest.length} for investment · {lease.length} for lease
                  </p>
                </Link>
              ))}
            </div>
          )}
        </Container>
      </section>

      <LeadCaptureBar
        title="Looking in a specific part of Gurugram?"
        subtitle="Tell us the area, size and budget, and a CredXP advisor will share matching options."
      />
    </>
  );
}
