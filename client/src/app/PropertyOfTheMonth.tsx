"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, animate, motion } from "framer-motion";
import {
  Award,
  Banknote,
  BarChart3,
  Building2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Crown,
  Home,
  KeyRound,
  MapPin,
  PiggyBank,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { Container } from "@/components/ui/Container";

/* ── Constants ── */
const PRELEASED_INVESTMENT = 8_300_000; // ₹83 Lakhs
const MIN_INVESTMENT = PRELEASED_INVESTMENT;
const MAX_INVESTMENT = 50_000_000; // ₹5 Crores
const STEP_INVESTMENT = 100_000; // ₹1 Lakh
const MIN_YEARS = 1;
const MAX_YEARS = 9;

const FD_RATE = 0.08;
const PLOT_RATE = 0.1;
const SPAZE_APPRECIATION_RATE = 0.08;
const BASE_RENT_YIELD = 0.0675; // 6.75% of investment per year
const RENT_ESCALATION = 1.15; // +15% every 3 years

const SLIDE_INTERVAL_MS = 4500;

/* ── Helpers ── */
function formatINR(value: number): string {
  if (value === 0) return "₹0";
  if (value >= 10_000_000) {
    const cr = value / 10_000_000;
    return `₹${cr.toFixed(cr >= 10 ? 1 : 2)} Cr`;
  }
  const lakhs = value / 100_000;
  return `₹${Number.isInteger(lakhs) ? lakhs.toFixed(0) : lakhs.toFixed(1)} L`;
}

function totalRentCollected(principal: number, years: number): number {
  let total = 0;
  for (let year = 1; year <= years; year++) {
    const escalationBlock = Math.floor((year - 1) / 3);
    total += principal * BASE_RENT_YIELD * Math.pow(RENT_ESCALATION, escalationBlock);
  }
  return total;
}

/* ── Animated currency counter ── */
function AnimatedINR({ value, className }: { value: number; className?: string }) {
  const [display, setDisplay] = useState(value);
  const prev = useRef(value);

  useEffect(() => {
    const controls = animate(prev.current, value, {
      duration: 0.55,
      ease: "easeOut",
      onUpdate: (latest) => setDisplay(latest),
    });
    prev.current = value;
    return () => controls.stop();
  }, [value]);

  return <span className={className}>{formatINR(display)}</span>;
}

/* ── Static content ── */
const slides = [
  {
    src: "/images/spaze/spaze-corporate-park1.webp",
    alt: "Spaze Corporate Park — signature glass facade",
    caption: "Signature Glass Facade",
  },
  {
    src: "/images/spaze/spaze-corporate-park2.webp",
    alt: "Spaze Corporate Park — tower view from the boulevard",
    caption: "Iconic Tower on SPR Boulevard",
  },
  {
    src: "/images/spaze/spaze-corporate-park3.jpg",
    alt: "Spaze Corporate Park — premium furnished office interiors",
    caption: "Premium Furnished Interiors",
  },
  {
    src: "/images/spaze/spaze-corporate-park4.webp",
    alt: "Spaze Corporate Park — ready-to-work meeting spaces",
    caption: "Ready-to-Work Office Suites",
  },
];

const propertyDetails = [
  { icon: Building2, label: "Type", value: "Pre-Leased Commercial Office", highlight: false },
  { icon: MapPin, label: "Location", value: "SPR Gurgaon", highlight: false },
  { icon: KeyRound, label: "Ownership", value: "Independent, Lockable Unit", highlight: false },
  { icon: Home, label: "Bareshell Property", value: "Starts from ₹60 L", highlight: true },
  { icon: Banknote, label: "Pre-Leased Property", value: "Starts from ₹83 L", highlight: true },
  {
    icon: TrendingUp,
    label: "Pre-Leased Returns",
    value: "₹48,000/month rent · 9 yr lease · 3 yr lock-in",
    highlight: true,
  },
];

const keyFeatures = [
  "Pre-leased asset with rental income from day one",
  "Prime SPR Gurgaon location with high growth corridors",
  "Zero vacancy risk — tenant already locked in",
  "Strong capital appreciation potential",
  "True passive income generation",
  "Hassle-free, fully managed investment",
];

const revealViewport = { once: true, amount: 0.15 } as const;

const blockReveal = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const } },
};

/* ── Image slider ── */
function PropertySlider() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, SLIDE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [paused]);

  const goTo = (next: number) => setIndex((next + slides.length) % slides.length);

  return (
    <div
      className="group relative mx-auto w-full max-w-[320px] lg:mx-0"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Gradient frame */}
      <div className="rounded-2xl bg-gradient-to-br from-yellow-400/60 via-white/10 to-accent-500/50 p-[1.5px] shadow-[0_16px_60px_rgba(250,204,21,0.12)]">
        <div className="relative aspect-square overflow-hidden rounded-[calc(1rem-1.5px)] bg-slate-950">
          <AnimatePresence mode="popLayout">
            <motion.div
              key={index}
              className="absolute inset-0"
              initial={{ opacity: 0, scale: 1.06 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <Image
                src={slides[index].src}
                alt={slides[index].alt}
                fill
                sizes="(max-width: 1024px) 320px, 320px"
                className="object-cover"
                priority={index === 0}
              />
            </motion.div>
          </AnimatePresence>

          {/* Overlays */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/25" />

          {/* Top badges */}
          <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-full bg-yellow-400 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-950 shadow-lg shadow-yellow-400/30">
              <Sparkles className="h-2.5 w-2.5" />
              Pre-Leased
            </span>
          </div>

          {/* Counter */}
          <span className="absolute right-3 top-3 rounded-full border border-white/25 bg-black/45 px-2 py-0.5 text-[10px] font-bold tabular-nums text-white backdrop-blur-md">
            {index + 1} / {slides.length}
          </span>

          {/* Caption + dots */}
          <div className="absolute inset-x-3 bottom-3">
            <AnimatePresence mode="wait">
              <motion.p
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.35 }}
                className="text-xs font-bold text-white drop-shadow-md"
              >
                {slides[index].caption}
              </motion.p>
            </AnimatePresence>
            <div className="mt-2 flex gap-1">
              {slides.map((slide, dotIndex) => (
                <button
                  key={slide.src}
                  type="button"
                  aria-label={`Go to slide ${dotIndex + 1}`}
                  onClick={() => goTo(dotIndex)}
                  className={[
                    "h-1 rounded-full transition-all duration-500",
                    dotIndex === index ? "w-6 bg-yellow-400" : "w-2.5 bg-white/35 hover:bg-white/60",
                  ].join(" ")}
                />
              ))}
            </div>
          </div>

          {/* Arrows */}
          <button
            type="button"
            aria-label="Previous image"
            onClick={() => goTo(index - 1)}
            className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white opacity-0 backdrop-blur-md transition-all hover:border-yellow-400/60 hover:bg-black/60 hover:text-yellow-400 group-hover:opacity-100"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Next image"
            onClick={() => goTo(index + 1)}
            className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white opacity-0 backdrop-blur-md transition-all hover:border-yellow-400/60 hover:bg-black/60 hover:text-yellow-400 group-hover:opacity-100"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Thumbnail strip */}
      <div className="mt-2 grid grid-cols-4 gap-2">
        {slides.map((slide, thumbIndex) => (
          <button
            key={slide.src}
            type="button"
            aria-label={`Show ${slide.caption}`}
            onClick={() => goTo(thumbIndex)}
            className={[
              "relative aspect-square overflow-hidden rounded-lg border-2 transition-all duration-300",
              thumbIndex === index
                ? "border-yellow-400 shadow-[0_0_14px_rgba(250,204,21,0.35)]"
                : "border-white/10 opacity-55 hover:border-white/40 hover:opacity-90",
            ].join(" ")}
          >
            <Image src={slide.src} alt={slide.alt} fill sizes="80px" className="object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}

export default function PropertyOfTheMonth() {
  const [investment, setInvestment] = useState(PRELEASED_INVESTMENT);
  const [years, setYears] = useState(MAX_YEARS);

  const results = useMemo(() => {
    const fdValue = investment * Math.pow(1 + FD_RATE, years);
    const plotValue = investment * Math.pow(1 + PLOT_RATE, years);
    const appreciatedValue = investment * Math.pow(1 + SPAZE_APPRECIATION_RATE, years);
    const rentCollected = totalRentCollected(investment, years);
    const spazeValue = appreciatedValue + rentCollected;
    return { fdValue, plotValue, spazeValue, appreciatedValue, rentCollected };
  }, [investment, years]);

  const maxValue = Math.max(results.fdValue, results.plotValue, results.spazeValue);

  const outcomes = [
    {
      key: "fd",
      icon: PiggyBank,
      title: "Fixed Deposit",
      subtitle: "8% p.a. compounded",
      assetLabel: "Deposit Value",
      assetValue: results.fdValue,
      rentValue: 0,
      total: results.fdValue,
      dominant: false,
    },
    {
      key: "spaze",
      icon: Building2,
      title: "Spaze Corporate Park",
      subtitle: "Rent + 8% p.a. appreciation",
      assetLabel: "Property Value",
      assetValue: results.appreciatedValue,
      rentValue: results.rentCollected,
      total: results.spazeValue,
      dominant: true,
    },
    {
      key: "plot",
      icon: Home,
      title: "Residential Plot",
      subtitle: "10% p.a. appreciation",
      assetLabel: "Plot Value",
      assetValue: results.plotValue,
      rentValue: 0,
      total: results.plotValue,
      dominant: false,
    },
  ];

  return (
    <section className="relative overflow-hidden bg-[#050608] py-12 lg:py-16">
      {/* Dotted texture */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:26px_26px]" />

      {/* Breathing glow orbs */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -left-32 top-8 h-96 w-96 rounded-full bg-accent-500/15 blur-[110px]"
        animate={{ scale: [1, 1.25, 1], opacity: [0.5, 0.85, 0.5] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -right-24 bottom-10 h-[28rem] w-[28rem] rounded-full bg-yellow-400/10 blur-[130px]"
        animate={{ scale: [1.15, 1, 1.15], opacity: [0.6, 0.9, 0.6] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-yellow-400/40 to-transparent" />

      <Container size="xl" className="relative">
        {/* Section header */}
        <motion.div
          variants={blockReveal}
          initial="hidden"
          whileInView="visible"
          viewport={revealViewport}
          className="mx-auto mb-8 max-w-3xl text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-yellow-400/40 bg-yellow-400/10 px-4 py-1.5 text-xs font-extrabold uppercase tracking-widest text-yellow-400 shadow-[0_0_24px_rgba(250,204,21,0.15)]">
            <motion.span
              className="h-2 w-2 rounded-full bg-yellow-400"
              animate={{ opacity: [1, 0.3, 1], scale: [1, 0.8, 1] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            />
            <Award className="h-3.5 w-3.5" />
            Property of the Month
          </span>
          <h2 className="mt-4 bg-gradient-to-r from-white via-yellow-100 to-yellow-400 bg-clip-text text-2xl font-extrabold tracking-tight text-transparent sm:text-3xl lg:text-4xl">
            Spaze Corporate Park
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-white/60">
            A pre-leased, income-generating commercial asset in Gurgaon&apos;s fastest-appreciating
            corridor — earning from day one.
          </p>
        </motion.div>

        {/* ── Row 1: Slider + Highlights ── */}
        <div className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)] lg:items-start">
          <motion.div variants={blockReveal} initial="hidden" whileInView="visible" viewport={revealViewport}>
            <PropertySlider />
          </motion.div>

          <motion.div
            variants={blockReveal}
            initial="hidden"
            whileInView="visible"
            viewport={revealViewport}
            className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-2xl backdrop-blur-xl sm:p-6"
          >
            <h3 className="text-base font-bold text-white sm:text-lg">Property Highlights</h3>

            <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
              {propertyDetails.map((detail) => {
                const Icon = detail.icon;
                return (
                  <div
                    key={detail.label}
                    className={[
                      "rounded-xl border p-3 transition-all duration-300 hover:-translate-y-0.5",
                      detail.highlight
                        ? "border-yellow-400/30 bg-yellow-400/[0.06] hover:border-yellow-400/60 hover:shadow-[0_8px_28px_rgba(250,204,21,0.15)]"
                        : "border-white/8 bg-white/[0.04] hover:border-white/20",
                    ].join(" ")}
                  >
                    <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-white/50">
                      <Icon className={["h-3 w-3 shrink-0", detail.highlight ? "text-yellow-400" : "text-accent-500"].join(" ")} />
                      {detail.label}
                    </div>
                    <p
                      className={[
                        "mt-1 font-bold leading-snug",
                        detail.highlight ? "text-base text-yellow-400" : "text-[13px] text-white",
                      ].join(" ")}
                    >
                      {detail.value}
                    </p>
                  </div>
                );
              })}
            </div>

            <h4 className="mt-5 text-xs font-bold uppercase tracking-widest text-white/70">
              Key Features &amp; Benefits
            </h4>
            <ul className="mt-3 grid gap-x-5 gap-y-2 sm:grid-cols-2">
              {keyFeatures.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-[13px] leading-relaxed text-white/80">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-yellow-400" />
                  {feature}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* ── Row 2: Smart Investment Calculator ── */}
        <motion.div
          variants={blockReveal}
          initial="hidden"
          whileInView="visible"
          viewport={revealViewport}
          className="relative mt-6 overflow-hidden rounded-2xl border border-yellow-400/25 bg-white/[0.05] p-5 shadow-[0_0_80px_rgba(250,204,21,0.1)] backdrop-blur-xl sm:p-6 lg:p-8"
        >
          <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-yellow-400/70 to-transparent" />
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-yellow-400/10 blur-3xl" />

          <div className="flex flex-col gap-6 lg:flex-row lg:gap-10">
            {/* Inputs */}
            <div className="lg:w-[34%]">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-400/15 text-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.2)]">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white sm:text-lg">Smart Investment Calculator</h3>
                  <p className="text-[11px] text-white/55">Compare your wealth outcome across asset classes</p>
                </div>
              </div>

              <div className="mt-6 space-y-5">
                <div>
                  <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-white/60">
                    <span>Investment Amount</span>
                    <AnimatedINR
                      value={investment}
                      className="text-base font-extrabold normal-case tracking-normal text-yellow-400"
                    />
                  </div>
                  <input
                    type="range"
                    min={MIN_INVESTMENT}
                    max={MAX_INVESTMENT}
                    step={STEP_INVESTMENT}
                    value={investment}
                    onChange={(event) => setInvestment(Number(event.target.value))}
                    aria-label="Investment amount"
                    className="mt-2.5 w-full cursor-pointer accent-yellow-400"
                  />
                  <div className="mt-1 flex justify-between text-[10px] font-semibold text-white/40">
                    <span>Pre-Leased {formatINR(PRELEASED_INVESTMENT)}</span>
                    <span>{formatINR(MAX_INVESTMENT)}</span>
                  </div>
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setInvestment(PRELEASED_INVESTMENT)}
                      className={[
                        "rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider transition-colors",
                        investment === PRELEASED_INVESTMENT
                          ? "border-yellow-400/60 bg-yellow-400/15 text-yellow-400"
                          : "border-white/15 bg-white/[0.04] text-white/60 hover:border-white/30 hover:text-white",
                      ].join(" ")}
                    >
                      Pre-Leased from ₹83 L
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-white/60">
                    <span>Time Horizon</span>
                    <span className="text-base font-extrabold normal-case tracking-normal text-yellow-400">
                      {years} {years === 1 ? "Year" : "Years"}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={MIN_YEARS}
                    max={MAX_YEARS}
                    step={1}
                    value={years}
                    onChange={(event) => setYears(Number(event.target.value))}
                    aria-label="Time horizon in years"
                    className="mt-2.5 w-full cursor-pointer accent-yellow-400"
                  />
                  <div className="mt-1 flex justify-between text-[10px] font-semibold text-white/40">
                    <span>1 Year</span>
                    <span>9 Years</span>
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3.5 text-[11px] leading-relaxed text-white/55">
                  Bareshell starts from <span className="font-bold text-yellow-400">₹60 L</span>. Pre-leased
                  starts from <span className="font-bold text-yellow-400">₹83 L</span> with{" "}
                  <span className="font-bold text-yellow-400">₹48,000/month</span> rent, 9-year lease and
                  3-year lock-in. Yield starts at <span className="font-bold text-yellow-400">6.75% p.a.</span>{" "}
                  and escalates <span className="font-bold text-yellow-400">15% every 3 years</span>.
                </div>
              </div>
            </div>

            {/* Outcomes */}
            <div className="flex-1">
              <p className="text-[11px] font-bold uppercase tracking-widest text-white/55">
                Projected Wealth After {years} {years === 1 ? "Year" : "Years"}
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-3 sm:items-end">
                {outcomes.map((outcome) => {
                  const Icon = outcome.icon;
                  const growthPct = Math.round((outcome.total / investment - 1) * 100);
                  const assetBarPct = (outcome.assetValue / maxValue) * 100;
                  const rentBarPct = (outcome.rentValue / maxValue) * 100;

                  return (
                    <div
                      key={outcome.key}
                      className={[
                        "relative flex flex-col rounded-2xl border p-4 transition-all duration-300",
                        outcome.dominant
                          ? "border-yellow-400/50 bg-gradient-to-b from-yellow-400/[0.12] to-transparent shadow-[0_0_50px_rgba(250,204,21,0.18)] sm:-translate-y-2.5 sm:scale-[1.04]"
                          : "border-white/10 bg-white/[0.03]",
                      ].join(" ")}
                    >
                      {outcome.dominant && (
                        <span className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 whitespace-nowrap rounded-full bg-yellow-400 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-950 shadow-lg shadow-yellow-400/40">
                          <Crown className="h-3 w-3" />
                          Clear Winner
                        </span>
                      )}

                      <div className="flex items-center gap-2">
                        <div
                          className={[
                            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                            outcome.dominant ? "bg-yellow-400/20 text-yellow-400" : "bg-white/8 text-white/60",
                          ].join(" ")}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p
                            className={[
                              "font-bold leading-tight",
                              outcome.dominant ? "text-sm text-white" : "text-[13px] text-white/85",
                            ].join(" ")}
                          >
                            {outcome.title}
                          </p>
                          <p className="text-[10px] text-white/45">{outcome.subtitle}</p>
                        </div>
                      </div>

                      {/* Total + growth pill */}
                      <div className="mt-3 flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
                        <AnimatedINR
                          value={outcome.total}
                          className={[
                            "whitespace-nowrap font-extrabold tabular-nums",
                            outcome.dominant
                              ? "text-xl text-yellow-400 drop-shadow-[0_0_16px_rgba(250,204,21,0.5)] xl:text-2xl"
                              : "text-lg text-white/85",
                          ].join(" ")}
                        />
                        <span
                          className={[
                            "inline-flex shrink-0 items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-extrabold tabular-nums",
                            outcome.dominant
                              ? "bg-yellow-400/15 text-yellow-400"
                              : "bg-white/8 text-white/55",
                          ].join(" ")}
                        >
                          <TrendingUp className="h-2.5 w-2.5" />
                          +{growthPct}%
                        </span>
                      </div>

                      {/* Stacked comparison bar: asset value + rent earned */}
                      <div className="mt-3 flex h-2.5 w-full gap-0.5 overflow-hidden rounded-full bg-white/[0.06]">
                        <motion.div
                          className={
                            outcome.dominant
                              ? "h-full rounded-l-full bg-gradient-to-r from-yellow-600 to-yellow-400"
                              : "h-full rounded-l-full bg-gradient-to-r from-white/30 to-white/45"
                          }
                          initial={false}
                          animate={{ width: `${assetBarPct}%` }}
                          transition={{ duration: 0.6, ease: "easeOut" }}
                        />
                        {outcome.rentValue > 0 && (
                          <motion.div
                            className="h-full rounded-r-full bg-gradient-to-r from-emerald-400 to-emerald-300 shadow-[0_0_10px_rgba(52,211,153,0.6)]"
                            initial={false}
                            animate={{ width: `${rentBarPct}%` }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                          />
                        )}
                      </div>

                      {/* Breakdown rows */}
                      <div className="mt-3 space-y-1.5 border-t border-white/8 pt-3">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="flex items-center gap-1.5 text-white/50">
                            <span
                              className={[
                                "h-1.5 w-1.5 rounded-full",
                                outcome.dominant ? "bg-yellow-400" : "bg-white/40",
                              ].join(" ")}
                            />
                            {outcome.assetLabel}
                          </span>
                          <AnimatedINR
                            value={outcome.assetValue}
                            className={[
                              "font-bold tabular-nums",
                              outcome.dominant ? "text-yellow-400" : "text-white/80",
                            ].join(" ")}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="flex items-center gap-1.5 text-white/50">
                            <span
                              className={[
                                "h-1.5 w-1.5 rounded-full",
                                outcome.rentValue > 0 ? "bg-emerald-400" : "bg-white/20",
                              ].join(" ")}
                            />
                            Total Rent Earned
                          </span>
                          {outcome.rentValue > 0 ? (
                            <AnimatedINR
                              value={outcome.rentValue}
                              className="font-bold tabular-nums text-emerald-400"
                            />
                          ) : (
                            <span className="font-bold tabular-nums text-white/35">₹0</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <p className="mt-5 text-center text-sm font-extrabold tracking-tight text-white sm:text-base">
                Enjoy <span className="text-yellow-400">guaranteed rentals</span> plus{" "}
                <span className="text-yellow-400">capital appreciation</span>.
              </p>
            </div>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
