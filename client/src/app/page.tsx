import { Landmark } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import CoworkingPartnerMarquee from "@/components/coworking/CoworkingPartnerMarquee";
import ScrollReveal from "@/components/motion/ScrollReveal";
import HomeHeroSection from "./HomeHeroSection";
import HomeStatsSection from "./HomeStatsSection";
import GoalCardsSection from "./GoalCardsSection";
import LeadCaptureBar from "@/components/lead/LeadCaptureBar";
import HomePageClient from "./HomePageClient";
import HomeInsightsSection from "@/components/insights/HomeInsightsSection";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Premium Commercial Real Estate. Delivered.",
  description:
    "Pre-leased investments, enterprise office leasing, coworking aggregation, and institutional-grade property discovery across India's top commercial markets.",
};

export default function HomePage() {
  return (
    <>
      <HomeHeroSection />

      <HomeStatsSection />

      <HomePageClient />

      <GoalCardsSection />

      <section className="border-t border-slate-200 bg-slate-50 py-12 lg:py-14">
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
