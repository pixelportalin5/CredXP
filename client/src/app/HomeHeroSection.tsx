"use client";

import Image from "next/image";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { Select } from "@/components/ui/Select";
import { Container } from "@/components/ui/Container";
import { CITIES, PROPERTY_TYPES, PRICE_RANGES, SIZE_RANGES, YIELD_RANGES } from "@/config/filters";

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

const heroBackgrounds: Record<(typeof goalCards)[number]["key"], string> = {
  invest: "/images/Hero section for credxp.png",
  lease: "/hero2.jpeg",
  coworking: "/hero3.jpeg",
};

const heroPropertyTypes = [
  ...PROPERTY_TYPES,
  { label: "Coworking Space", value: "Coworking Space" },
];

const parseRange = (range: string) => {
  const [min = "", max = ""] = range.split(":");
  return { min, max };
};

export default function HomeHeroSection() {
  const router = useRouter();
  const [selectedGoal, setSelectedGoal] = useState<(typeof goalCards)[number]["key"]>("invest");
  const [activeTab, setActiveTab] = useState("All Properties");
  const [city, setCity] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [sizeRange, setSizeRange] = useState(":");
  const [priceRange, setPriceRange] = useState(":");
  const [yieldRange, setYieldRange] = useState(":");

  const searchTabs = ["All Properties", "Pre-Leased", "Lease", "Coworking"];
  const activeHeroBackground = heroBackgrounds[selectedGoal];

  const handleHeroSearch = () => {
    const isCoworkingSearch =
      activeTab === "Coworking" ||
      propertyType === "Coworking Space" ||
      propertyType === "Coworking";

    if (isCoworkingSearch) {
      router.push("/coworking");
      return;
    }

    const { min: minSize, max: maxSize } = parseRange(sizeRange);
    const { min: minPrice, max: maxPrice } = parseRange(priceRange);
    const { min: minYield, max: maxYield } = parseRange(yieldRange);
    const params = new URLSearchParams({ page: "1", limit: "6" });
    let basePath = "/invest";

    if (city) params.set("city", city);
    if (propertyType) params.set("type", propertyType);
    if (minSize) params.set("minSize", minSize);
    if (maxSize) params.set("maxSize", maxSize);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);

    if (activeTab === "Lease") {
      basePath = "/lease";
    } else {
      basePath = "/invest";
      if (minYield) params.set("minYield", minYield);
      if (maxYield) params.set("maxYield", maxYield);
      if (activeTab === "Pre-Leased" && !propertyType) params.delete("type");
    }

    const query = params.toString();
    router.push(query ? `${basePath}?${query}` : basePath);
  };

  return (
    <section className="relative overflow-hidden pb-16 pt-28 lg:min-h-[920px] lg:pb-24">
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
              <span className="text-accent-500"> Delivered.</span>
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
                          ? "scale-[1.02] border-white/20 bg-white text-slate-900 shadow-lg shadow-black/20 ring-2 ring-accent-500"
                          : "border-white/15 bg-white/8 text-white opacity-80 hover:border-white/30 hover:bg-white/12 hover:opacity-100",
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

        {/* Search Bar */}
        <div className="relative z-20 mt-12 w-full lg:mt-16">
          <div className="glass-panel mx-auto max-w-6xl rounded-3xl p-6 shadow-2xl sm:p-8">
            <div className="mb-6 flex flex-wrap items-center gap-6 border-b border-white/20 pb-2">
              {searchTabs.map((tab) => {
                const isActiveTab = activeTab === tab;
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={[
                      "relative rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors",
                      isActiveTab
                        ? "bg-slate-900 text-white shadow-sm"
                        : "text-white/75 hover:bg-white/10 hover:text-white",
                    ].join(" ")}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
              <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-white/80">Location</label>
                  <Select className="glass-input rounded-xl text-slate-900" options={CITIES} placeholder="Select Location" value={city} onChange={(event) => setCity(event.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-white/80">Property Type</label>
                  <Select className="glass-input rounded-xl text-slate-900" options={heroPropertyTypes} placeholder="All Types" value={propertyType} onChange={(event) => setPropertyType(event.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-white/80">Space / Size</label>
                  <Select
                    className="glass-input rounded-xl text-slate-900"
                    options={SIZE_RANGES.map((range) => ({
                      label: range.label,
                      value: `${range.min}:${range.max}`,
                    }))}
                    value={sizeRange}
                    onChange={(event) => setSizeRange(event.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-white/80">Budget / Price</label>
                  <Select
                    className="glass-input rounded-xl text-slate-900"
                    options={PRICE_RANGES.map((range) => ({
                      label: range.label,
                      value: `${range.min}:${range.max}`,
                    }))}
                    value={priceRange}
                    onChange={(event) => setPriceRange(event.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-white/80">Yield / IRR</label>
                  <Select
                    className="glass-input rounded-xl text-slate-900"
                    options={YIELD_RANGES.map((range) => ({
                      label: range.label,
                      value: `${range.min}:${range.max}`,
                    }))}
                    value={yieldRange}
                    onChange={(event) => setYieldRange(event.target.value)}
                  />
                </div>
              </div>

              <div className="mt-4 flex flex-col items-center gap-2 lg:mt-0 lg:w-48">
                <Button type="button" variant="primary" size="lg" onClick={handleHeroSearch} className="w-full text-base font-semibold shadow-md shadow-accent-500/20">
                  Search Properties
                </Button>
                <Link
                  href={activeTab === "Lease" ? "/lease" : "/invest"}
                  className="flex items-center gap-1 text-[11px] font-semibold text-white/80 hover:text-white"
                >
                  Advanced Search <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}