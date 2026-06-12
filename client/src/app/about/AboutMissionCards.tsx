"use client";

import { Card } from "@/components/ui/Card";
import ScrollReveal from "@/components/motion/ScrollReveal";
import { Target, Handshake, Globe, ShieldCheck } from "lucide-react";

const missionCards = [
  {
    icon: <Target className="h-6 w-6" />,
    title: "Investment Intelligence",
    description: "Data-driven insights and yield analytics for pre-leased investments and commercial assets.",
  },
  {
    icon: <Handshake className="h-6 w-6" />,
    title: "Enterprise Leasing",
    description: "End-to-end corporate leasing solutions for Grade A office spaces across India's top markets.",
  },
  {
    icon: <Globe className="h-6 w-6" />,
    title: "Coworking Aggregation",
    description: "India's largest flex-space aggregation platform — compare and book from 15+ operators.",
  },
  {
    icon: <ShieldCheck className="h-6 w-6" />,
    title: "Trust & Transparency",
    description: "RERA-compliant, verified properties with complete due-diligence documentation.",
  },
];

export default function AboutMissionCards() {
  return (
    <ScrollReveal stagger className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      {missionCards.map((value) => (
        <Card
          key={value.title}
          hover
          padding="md"
          className="black-section-bg hover-expand-card relative border-white/10 shadow-[0_16px_40px_rgba(15,23,42,0.16)] hover:z-10"
        >
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-accent-400">
            {value.icon}
          </div>
          <h3 className="mb-2 text-lg font-semibold text-white">{value.title}</h3>
          <p className="text-sm leading-relaxed text-white/70">{value.description}</p>
        </Card>
      ))}
    </ScrollReveal>
  );
}
