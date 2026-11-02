import { Landmark } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import CoworkingPartnerMarquee from "@/components/coworking/CoworkingPartnerMarquee";
import ScrollReveal from "@/components/motion/ScrollReveal";
import HomeHeroSection from "./HomeHeroSection";
import PropertyOfTheMonth from "./PropertyOfTheMonth";
import HomeStatsSection from "./HomeStatsSection";
import GoalCardsSection from "./GoalCardsSection";
import LeadCaptureBar from "@/components/lead/LeadCaptureBar";
import HomePageClient from "./HomePageClient";
import HomeGuidesSection from "@/components/insights/HomeGuidesSection";
import type { Metadata } from "next";
import { defaultOpenGraph, fetchAllListingsForSeo, fetchCoworkingListForSeo, fetchListingCountsForSeo, fetchPropertyListForSeo } from "@/lib/seo";
import { optionsFromListings } from "@/config/filters";

export const revalidate = 3600;

// Must match the "all-properties" tab query in HomePageClient.
const HOME_FEATURED_QUERY = { page: 1, limit: 20, sort: "newest", category: "investment" };
const HOME_COWORKING_QUERY = { limit: 4, sort: "featured" };

const HOME_TITLE = "Pre-Leased Commercial Property & Office Space in Gurugram";
const HOME_DESCRIPTION =
  "Buy pre-leased offices, bank-leased properties and retail/SCO units, or lease office and retail space in Gurugram and Delhi NCR. See rent, lease terms and gross yield for each listing, then talk to a CredXP advisor.";

export const metadata: Metadata = {
  title: HOME_TITLE,
  description: HOME_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: defaultOpenGraph(
    "CredXP | Pre-Leased Commercial Property & Office Space in Gurugram",
    "Buy pre-leased offices, bank-leased properties and retail/SCO units, or lease commercial space in Gurugram and Delhi NCR, with rent, lease terms and gross yield shown for each listing.",
    "/"
  ),
};

export default async function HomePage() {
  const [featured, coworkingSpaces, listingCounts, allListings] = await Promise.all([
    fetchPropertyListForSeo(HOME_FEATURED_QUERY),
    fetchCoworkingListForSeo(HOME_COWORKING_QUERY),
    fetchListingCountsForSeo(),
    fetchAllListingsForSeo(),
  ]);
  const filterOptions = optionsFromListings(allListings);

  return (
    <>
      <HomeHeroSection cities={filterOptions.cities} propertyTypes={filterOptions.types} />

      <PropertyOfTheMonth />

      <HomeStatsSection counts={listingCounts} />

      <HomePageClient
        initialProperties={featured?.properties ?? null}
        initialCoworkingSpaces={coworkingSpaces}
      />

      <GoalCardsSection />

      <section className="border-t border-slate-200 bg-slate-50 py-10 lg:py-14">
        <Container size="xl">
          <ScrollReveal>
            <SectionHeader
              eyebrow="Coworking"
              eyebrowIcon={<Landmark className="h-4 w-4" />}
              title="Our Trusted Partners (Coworking & Flex Space)"
              subtitle="Logos shown here are the actual partner brands and workspace networks."
              action={{ label: "View Coworking", href: "/coworking" }}
            />
          </ScrollReveal>

          <CoworkingPartnerMarquee />
        </Container>
      </section>

      <HomeGuidesSection />

      <LeadCaptureBar />
    </>
  );
}
