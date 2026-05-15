"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft, MapPin, Ruler, IndianRupee, Tag, TrendingUp,
  Clock, Building2, Send, Phone, Mail, CheckCircle2, ImageOff,
} from "lucide-react";
import propertyService from "@/services/propertyService";

function formatPrice(price) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
}

function PropertyImage({ src, alt, fill, sizes, className, priority }) {
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-slate-800 text-slate-600">
        <ImageOff className="h-8 w-8" />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      sizes={sizes}
      className={className}
      priority={priority}
      onError={() => setError(true)}
    />
  );
}

export default function PropertyDetailClient() {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [formSubmitted, setFormSubmitted] = useState(false);

  useEffect(() => {
    async function fetchProperty() {
      if (!id || id === "undefined" || id === "null") {
        setLoading(false);
        setError("Invalid property ID");
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const res = await propertyService.getById(id);
        setProperty(res.data);
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Property not found");
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchProperty();
  }, [id]);

  const handleContactSubmit = useCallback((e) => {
    e.preventDefault();
    setFormSubmitted(true);
    setTimeout(() => setFormSubmitted(false), 3000);
  }, []);

  // Loading skeleton
  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 animate-pulse">
        <div className="mb-8 h-5 w-40 rounded bg-slate-800" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-5 mb-10">
          <div className="md:col-span-3 h-72 sm:h-80 rounded-2xl bg-slate-800" />
          <div className="md:col-span-2 grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-36 sm:h-[9.5rem] rounded-xl bg-slate-800" />
            ))}
          </div>
        </div>
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="space-y-3">
              <div className="h-6 w-24 rounded-full bg-slate-800" />
              <div className="h-8 w-3/4 rounded bg-slate-800" />
              <div className="h-4 w-1/2 rounded bg-slate-800/60" />
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 rounded-xl bg-slate-800/40" />
              ))}
            </div>
            <div className="h-40 rounded-2xl bg-slate-800/40" />
            <div className="h-32 rounded-2xl bg-slate-800/40" />
          </div>
          <div className="space-y-4">
            <div className="h-48 rounded-2xl bg-slate-800/40" />
            <div className="h-72 rounded-2xl bg-slate-800/40" />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !property) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center px-4">
        <div className="text-center">
          <Building2 className="mx-auto h-12 w-12 text-slate-600" />
          <h2 className="mt-4 text-xl font-bold">Property Not Found</h2>
          <p className="mt-2 max-w-sm text-sm text-slate-400">
            {error || "The property you are looking for does not exist or has been removed."}
          </p>
          <Link
            href="/properties"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Properties
          </Link>
        </div>
      </div>
    );
  }

  const { title, type, location, price, size, amenities, images, status, description, createdAt } = property;
  const displayImages = images && images.length > 0 ? images : [];
  const mainImageSrc = displayImages[activeImage] || displayImages[0] || null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Back Link */}
      <Link
        href="/properties"
        className="mb-8 inline-flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Properties
      </Link>

      {/* Image Gallery */}
      <div className="mb-10 grid grid-cols-1 gap-3 md:grid-cols-5">
        {/* Main Image */}
        <div className="relative md:col-span-3 h-64 sm:h-80 lg:h-96 overflow-hidden rounded-2xl bg-slate-800 border border-white/[0.06]">
          <PropertyImage
            src={mainImageSrc}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, 60vw"
            className="object-cover transition-opacity duration-300"
            priority
          />
          {/* Status badge */}
          <div className="absolute left-4 top-4 z-10">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold backdrop-blur-md ${
                status === "Trending"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
              }`}
            >
              {status === "Trending" ? <TrendingUp className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
              {status}
            </span>
          </div>
        </div>

        {/* Thumbnails */}
        {displayImages.length > 0 && (
          <div className="md:col-span-2 grid grid-cols-2 gap-3">
            {displayImages.slice(0, 4).map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(i)}
                className={`relative h-28 sm:h-36 lg:h-[calc(12rem-0.375rem)] overflow-hidden rounded-xl bg-slate-800 border transition-all duration-200 ${
                  activeImage === i
                    ? "border-indigo-500 ring-2 ring-indigo-500/30"
                    : "border-white/[0.06] hover:border-white/20"
                }`}
              >
                <PropertyImage
                  src={img}
                  alt={`${title} - ${i + 1}`}
                  fill
                  sizes="(max-width: 768px) 25vw, 20vw"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Details Grid */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title & Location */}
          <div>
            <span className="mb-3 inline-block rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300 border border-indigo-500/20">
              {type}
            </span>
            <h1 className="text-2xl font-bold sm:text-3xl leading-tight">{title}</h1>
            <p className="mt-2 flex items-center gap-1.5 text-slate-400">
              <MapPin className="h-4 w-4 shrink-0 text-slate-500" />
              {location.address}, {location.city}, {location.state}
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { icon: IndianRupee, label: "Price/Month", value: formatPrice(price) },
              { icon: Ruler, label: "Area", value: `${size.toLocaleString("en-IN")} sqft` },
              { icon: Tag, label: "Type", value: type },
              { icon: Building2, label: "Status", value: status },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-white/[0.06] bg-slate-900/60 p-4 text-center transition-colors hover:border-white/10"
              >
                <stat.icon className="mx-auto mb-2 h-5 w-5 text-indigo-400" />
                <p className="text-sm font-semibold text-white truncate">{stat.value}</p>
                <p className="text-xs text-slate-500">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Description */}
          <div className="rounded-2xl border border-white/[0.06] bg-slate-900/60 p-6">
            <h2 className="mb-4 text-lg font-semibold">About this Property</h2>
            <p className="text-sm leading-relaxed text-slate-400">{description}</p>
            {createdAt && (
              <p className="mt-4 text-xs text-slate-600">
                Listed on {new Date(createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}
              </p>
            )}
          </div>

          {/* Amenities */}
          {amenities && amenities.length > 0 && (
            <div className="rounded-2xl border border-white/[0.06] bg-slate-900/60 p-6">
              <h2 className="mb-4 text-lg font-semibold">Amenities</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {amenities.map((amenity) => (
                  <div
                    key={amenity}
                    className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-slate-800/50 px-3 py-2.5 text-sm text-slate-300 transition-colors hover:border-white/10"
                  >
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                    {amenity}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="sticky top-24 space-y-6">
            {/* Price Card */}
            <div className="rounded-2xl border border-white/[0.06] bg-slate-900/70 p-6">
              <div className="mb-1 flex items-baseline gap-1 text-3xl font-bold text-indigo-400">
                {formatPrice(price)}
                <span className="text-sm font-normal text-slate-500">/month</span>
              </div>
              <p className="mb-6 text-sm text-slate-500">
                ₹{Math.round(price / size)}/sqft &bull; {size.toLocaleString("en-IN")} sqft
              </p>

              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3 text-slate-400">
                  <Phone className="h-4 w-4 shrink-0 text-slate-500" />
                  +91 98765 43210
                </div>
                <div className="flex items-center gap-3 text-slate-400">
                  <Mail className="h-4 w-4 shrink-0 text-slate-500" />
                  enquiry@credxp.com
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="rounded-2xl border border-white/[0.06] bg-slate-900/70 p-6">
              <h3 className="mb-4 text-base font-semibold">Enquire About This Space</h3>

              {formSubmitted ? (
                <div className="flex flex-col items-center gap-2 py-6 text-center animate-in fade-in">
                  <CheckCircle2 className="h-10 w-10 text-emerald-400" />
                  <p className="font-semibold text-emerald-300">Enquiry Sent!</p>
                  <p className="text-xs text-slate-500">We will get back to you soon.</p>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-3">
                  <input
                    type="text"
                    placeholder="Your Name"
                    required
                    className="w-full rounded-lg border border-white/10 bg-slate-800/80 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition-colors focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20"
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    required
                    className="w-full rounded-lg border border-white/10 bg-slate-800/80 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition-colors focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20"
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    className="w-full rounded-lg border border-white/10 bg-slate-800/80 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition-colors focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20"
                  />
                  <textarea
                    placeholder="Your message..."
                    rows={3}
                    className="w-full rounded-lg border border-white/10 bg-slate-800/80 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 outline-none resize-none transition-colors focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20"
                  />
                  <button
                    type="submit"
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-500 py-2.5 text-sm font-semibold text-white transition-all hover:bg-indigo-600 hover:shadow-lg hover:shadow-indigo-500/20 active:scale-[0.98]"
                  >
                    <Send className="h-4 w-4" />
                    Send Enquiry
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
