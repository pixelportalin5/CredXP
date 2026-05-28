"use client";

import Image from "next/image";
import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  Landmark,
  ShieldCheck,
  TrendingUp,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { Container } from "@/components/ui/Container";
import { CITIES, PROPERTY_TYPES, PRICE_RANGES } from "@/config/filters";
import heroBackground from "../../../Hero section for credxp.png";

const goalCards = [
  {
    key: "invest",
    icon: <Building2 className="h-6 w-6" />,
    title: "Invest in\nPre-Leased",
  },
  {
    key: "lease",
    icon: <BriefcaseBusiness className="h-6 w-6" />,
    title: "Lease\nCorporate Space",
  },
  {
    key: "coworking",
    icon: <TrendingUp className="h-6 w-6" />,
    title: "Book Partner\nCoworking",
  },
] as const;

const heroBackgrounds: Record<(typeof goalCards)[number]["key"], string | typeof heroBackground> = {
  invest: heroBackground,
  lease: "/hero2.png",
  coworking: "/hero3.png",
};

const SHOW_HERO_SEARCH = false;

export default function HomeHeroSection() {
  const [selectedGoal, setSelectedGoal] = useState<(typeof goalCards)[number]["key"]>("invest");
  const [activeTab, setActiveTab] = useState("All Properties");

  const searchTabs = ["All Properties", "Pre-Leased", "Lease", "Coworking"];
  const activeHeroBackground = heroBackgrounds[selectedGoal];

  return (
    <section className="relative overflow-hidden pt-16 pb-16 lg:min-h-[920px] lg:pt-24 lg:pb-24">
      <Image
        key={selectedGoal}
        src={activeHeroBackground}
        alt="Commercial real estate workspace background"
        fill
        priority={selectedGoal === "invest"}
        sizes="100vw"
        className="object-cover object-center transition-opacity duration-500"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(4,11,26,0.9)_0%,rgba(4,11,26,0.72)_34%,rgba(4,11,26,0.24)_62%,rgba(4,11,26,0.08)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_left_top,rgba(255,255,255,0.22),transparent_28%),linear-gradient(180deg,rgba(3,7,18,0.12),rgba(3,7,18,0.36))]" />

      <Container size="xl" className="relative z-10">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-center">
          <div className="max-w-2xl space-y-8 rounded-[2rem] border border-white/12 bg-slate-950/35 p-7 shadow-2xl backdrop-blur-md sm:p-10 lg:py-12">
            <h1 className="max-w-[620px] text-[3rem] font-extrabold leading-[1.02] tracking-tight text-white lg:text-[4.2rem]">
              Premium Commercial
              <br />
              Real Estate.
              <span className="text-accent-300"> Delivered.</span>
            </h1>

            <p className="max-w-[480px] text-lg leading-relaxed text-white/78">
              Pre-leased investments, Grade A office spaces. Flexible workspaces. All in one place.
            </p>

            <div className="space-y-4">
              <p className="text-xs font-bold uppercase tracking-widest text-white/75">Choose Your Goal</p>
              <div className="grid grid-cols-3 gap-3">
                {goalCards.map((goal) => {
                  const isSelected = selectedGoal === goal.key;
                  return (
                    <button
                      key={goal.key}
                      type="button"
                      onClick={() => setSelectedGoal(goal.key)}
                      className={[
                        "group flex min-h-[120px] flex-col items-start justify-center rounded-2xl border p-4 text-left transition-all duration-300",
                        isSelected
                          ? "border-white/20 bg-white text-slate-900 shadow-lg shadow-black/20"
                          : "border-white/15 bg-white/8 text-white hover:border-white/30 hover:bg-white/12",
                      ].join(" ")}
                    >
                      <div
                        className={[
                          "mb-3 transition-colors",
                          isSelected ? "text-accent-500" : "text-accent-500",
                        ].join(" ")}
                      >
                        {goal.icon}
                      </div>
                      <h3 className="whitespace-pre-line text-sm font-semibold leading-snug">{goal.title}</h3>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 pt-4 text-xs font-semibold text-white/82">
              <span className="flex flex-row items-center gap-2.5">
                <ShieldCheck className="h-6 w-6 text-white/72" />
                <span className="text-left text-[11px] font-bold leading-tight text-white/82">Pre-Leased<br />Blue-chip Tenants</span>
              </span>
              <span className="flex flex-row items-center gap-2.5">
                <MapPin className="h-6 w-6 text-white/72" />
                <span className="text-left text-[11px] font-bold leading-tight text-white/82">Premium<br />Locations (NCR)</span>
              </span>
              <span className="flex flex-row items-center gap-2.5">
                <TrendingUp className="h-6 w-6 text-white/72" />
                <span className="text-left text-[11px] font-bold leading-tight text-white/82">High Rental<br />Yields</span>
              </span>
              <span className="flex flex-row items-center gap-2.5">
                <Landmark className="h-6 w-6 text-white/72" />
                <span className="text-left text-[11px] font-bold leading-tight text-white/82">RERA<br />Registered</span>
              </span>
            </div>
          </div>
        </div>

        {/* Search Bar temporarily hidden. Set SHOW_HERO_SEARCH to true to re-enable. */}
        {SHOW_HERO_SEARCH && (
          <div className="relative z-20 mt-12 w-full lg:mt-16">
            <Card className="mx-auto max-w-6xl rounded-3xl border-white/20 bg-white/92 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
              {/* Tabs */}
              <div className="mb-6 flex flex-wrap items-center gap-6 border-b border-slate-100 pb-2">
                {searchTabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={[
                      "relative pb-2 text-sm font-semibold transition-colors",
                      activeTab === tab ? "text-slate-900" : "text-slate-500 hover:text-slate-900",
                    ].join(" ")}
                  >
                    {tab}
                    {activeTab === tab && (
                      <span className="absolute bottom-0 left-0 h-0.5 w-full bg-slate-900" />
                    )}
                    {activeTab === tab && tab === "All Properties" && (
                      <span className="absolute -inset-x-3 -inset-y-1.5 -z-10 rounded-lg bg-slate-900" />
                    )}
                    {activeTab === tab && tab === "All Properties" && (
                      <span className="pointer-events-none absolute inset-0 flex items-center justify-center pb-2 text-white">{tab}</span>
                    )}
                  </button>
                ))}
              </div>

              <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
                <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Location</label>
                    <Select options={CITIES} placeholder="Select Location" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Property Type</label>
                    <Select options={PROPERTY_TYPES} placeholder="All Types" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Space / Size</label>
                    <Select options={[{ value: "any", label: "Min - Max (sq.ft.)" }]} placeholder="Min - Max (sq.ft.)" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Budget / Price</label>
                    <Select
                      options={PRICE_RANGES.map((range) => ({
                        label: range.label,
                        value: `${range.min}:${range.max}`,
                      }))}
                      placeholder="Min - Max (₹)"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Yield / IRR</label>
                    <Select options={[{ value: "any", label: "Any" }]} placeholder="Any" />
                  </div>
                </div>

                <div className="mt-4 flex flex-col items-center gap-2 lg:mt-0 lg:w-48">
                  <Button variant="primary" size="lg" className="w-full text-base font-semibold shadow-md shadow-accent-500/20">
                    Search Properties
                  </Button>
                  <Link href="/properties" className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900">
                    Advanced Search <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </Card>
          </div>
        )}
      </Container>
    </section>
  );
}