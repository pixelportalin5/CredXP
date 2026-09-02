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
import HomeInsightsSection from "@/components/insights/HomeInsightsSection";
import type { Metadata } from "next";
import { defaultOpenGraph } from "@/lib/seo";

const HOME_TITLE = "Commercial Real Estate, Pre-Leased Shops & Premium Office Rentals";
const HOME_DESCRIPTION =
  "Discover pre-leased commercial shops, premium office rentals, SCO investments, and enterprise office leasing with CredXP — India's commercial real estate marketplace.";

export const metadata: Metadata = {
  title: HOME_TITLE,
  description: HOME_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: defaultOpenGraph(
    "CredXP | Pre-Leased Commercial Shops & Premium Office Rentals",
    "Buy pre-leased commercial shops and lease premium offices across Gurugram, Delhi NCR, and India's top business districts.",
    "/"
  ),
};

export default function HomePage() {
  return (
    <>
      <HomeHeroSection />

      <PropertyOfTheMonth />

      <HomeStatsSection />

      <HomePageClient />

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

      <HomeInsightsSection />

      <LeadCaptureBar />
    </>
  );
}
