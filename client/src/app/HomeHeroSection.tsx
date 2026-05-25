"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  Landmark,
  Search,
  ShieldCheck,
  TrendingUp,
  MapPin,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Container } from "@/components/ui/Container";
import { CITIES, PROPERTY_TYPES, PRICE_RANGES } from "@/config/filters";

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

export default function HomeHeroSection() {
  const [selectedGoal, setSelectedGoal] = useState<(typeof goalCards)[number]["key"]>("invest");
  const [activeTab, setActiveTab] = useState("All Properties");

  const searchTabs = ["All Properties", "Pre-Leased", "Lease", "Coworking"];

  return (
    <section className="relative pt-16 pb-16 lg:pt-24 lg:pb-24 bg-[radial-gradient(ellipse_at_top_right,rgba(232,93,13,0.05),transparent_50%),linear-gradient(180deg,rgba(255,255,255,1),rgba(248,250,252,0.6))]">
      <Container size="xl" className="relative z-10">
        {/* Hero Grid: Left Content + Right Placeholder */}
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          {/* Left Column */}
          <div className="space-y-8 lg:pr-8">
            <h1 className="max-w-[620px] text-[3rem] font-extrabold leading-[1.02] tracking-tight text-[#0f172a] lg:text-[4.2rem]">
              Premium Commercial
              <br />
              Real Estate.
              <span className="text-accent-500"> Delivered.</span>
            </h1>

            <p className="max-w-[480px] text-lg leading-relaxed text-slate-600">
              Pre-leased investments, Grade A office spaces. Flexible workspaces. All in one place.
            </p>

            <div className="space-y-4">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-900">Choose Your Goal</p>
              <div className="grid grid-cols-3 gap-3">
                {goalCards.map((goal) => {
                  const isSelected = selectedGoal === goal.key;
                  return (
                    <button
                      key={goal.key}
                      type="button"
                      onClick={() => setSelectedGoal(goal.key)}
                      className={[
                        "group flex flex-col items-start justify-center rounded-2xl border p-4 transition-all duration-300 min-h-[120px]",
                        isSelected
                          ? "border-[#0f172a] bg-[#0f172a] text-white shadow-lg shadow-slate-900/20"
                          : "border-slate-200 bg-white text-slate-900 hover:border-accent-500/40 hover:shadow-md",
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
                      <h3 className="text-sm font-semibold text-left leading-snug whitespace-pre-line">{goal.title}</h3>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 pt-4 text-xs font-semibold text-slate-700">
              <span className="flex flex-row items-center gap-2.5">
                <ShieldCheck className="h-6 w-6 text-slate-500" />
                <span className="text-left text-[11px] font-bold leading-tight text-slate-700">Pre-Leased<br />Blue-chip Tenants</span>
              </span>
              <span className="flex flex-row items-center gap-2.5">
                <MapPin className="h-6 w-6 text-slate-500" />
                <span className="text-left text-[11px] font-bold leading-tight text-slate-700">Premium<br />Locations (NCR)</span>
              </span>
              <span className="flex flex-row items-center gap-2.5">
                <TrendingUp className="h-6 w-6 text-slate-500" />
                <span className="text-left text-[11px] font-bold leading-tight text-slate-700">High Rental<br />Yields</span>
              </span>
              <span className="flex flex-row items-center gap-2.5">
                <Landmark className="h-6 w-6 text-slate-500" />
                <span className="text-left text-[11px] font-bold leading-tight text-slate-700">RERA<br />Registered</span>
              </span>
            </div>
          </div>

          {/* Right side Image Placeholder */}
          <div className="hidden lg:flex items-center justify-center h-[540px] w-full rounded-3xl border-2 border-dashed border-slate-300 bg-slate-50/50 backdrop-blur-sm shadow-sm">
            <div className="text-center">
              <Building2 className="mx-auto h-8 w-8 text-slate-400 mb-2" />
              <span className="text-sm font-medium text-slate-500">Building Image Placeholder</span>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mt-12 w-full z-20 lg:mt-16">
          <Card className="mx-auto max-w-6xl border-slate-200/80 bg-white/95 p-6 shadow-2xl backdrop-blur-xl sm:p-8 rounded-3xl">
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
                    <span className="absolute inset-0 text-white flex items-center justify-center pointer-events-none pb-2">{tab}</span>
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
                  <Select options={PRICE_RANGES} placeholder="Min - Max (₹)" />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Yield / IRR</label>
                  <Select options={[{ value: "any", label: "Any" }]} placeholder="Any" />
                </div>
              </div>

              <div className="flex flex-col items-center gap-2 mt-4 lg:mt-0 lg:w-48">
                <Button variant="primary" size="lg" className="w-full text-base font-semibold shadow-md shadow-accent-500/20">
                  Search Properties
                </Button>
                <Link href="/properties" className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1">
                  Advanced Search <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </Container>
    </section>
  );
}