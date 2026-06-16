"use client";

import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, Landmark, TrendingUp } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import ScrollReveal from "@/components/motion/ScrollReveal";

const goalCards = [
  {
    icon: <TrendingUp className="h-10 w-10" />,
    title: "Invest in Pre-Leased",
    description: "Secure income-producing assets with blue-chip occupiers.",
    href: "/invest",
    cta: "Explore Investments",
  },
  {
    icon: <BriefcaseBusiness className="h-10 w-10" />,
    title: "Lease Corporate Space",
    description: "Structured office solutions for enterprise teams and growth.",
    href: "/lease",
    cta: "Explore Leasing",
  },
  {
    icon: <Landmark className="h-10 w-10" />,
    title: "Book Partner Coworking",
    description: "Flexible workspace inventory across India's leading operators.",
    href: "/coworking",
    cta: "Explore Coworking",
  },
];

export default function GoalCardsSection() {
  return (
    <section className="border-t border-slate-200 py-10 lg:py-20">
      <Container size="xl">
        <ScrollReveal>
          <SectionHeader
            eyebrow="Explore"
            eyebrowIcon={<Landmark className="h-4 w-4" />}
            title="Explore by What You Need"
            subtitle="Whether you are investing, leasing, or booking flex space, the platform is organized around real enterprise use cases."
            align="center"
          />
        </ScrollReveal>

        <ScrollReveal stagger className="mt-8 grid gap-4 sm:mt-10 sm:gap-6 md:grid-cols-3">
          {goalCards.map((item) => (
            <div
              key={item.title}
              className="hover-expand-card group relative flex min-h-[132px] flex-col rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm hover:z-10 hover:border-accent-500/30 hover:ring-1 hover:ring-accent-500/20 sm:min-h-[148px] sm:rounded-3xl sm:p-6"
            >
              <div className="flex items-start gap-4 sm:gap-5">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-accent-500/10 text-accent-500 transition-colors duration-300 group-hover:bg-accent-500 group-hover:text-white sm:h-20 sm:w-20 sm:rounded-2xl">
                  {item.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
                  <Link
                    href={item.href}
                    className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-accent-500 hover:text-accent-600"
                  >
                    {item.cta}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </ScrollReveal>
      </Container>
    </section>
  );
}
