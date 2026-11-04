"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { flushSync } from "react-dom";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, BookOpen, Building2, Loader2, MapPin, Search, Users, X } from "lucide-react";
import propertyService from "@/services/property.service";
import coworkingService from "@/services/coworking.service";
import { guides } from "@/content/guides";
import { mainNavLinks } from "@/config/navigation";
import { coworkingPath, propertyPath } from "@/utils/listingUrl";
import { formatPriceCompact } from "@/utils/format";
import { listThumbnailUrl, shouldUseUnoptimizedImage } from "@/utils/imageUrl";
import { cn } from "@/utils/cn";
import type { Property } from "@/types/property";
import type { CoworkingSpace } from "@/types/coworking";

const POPULAR_SEARCHES = ["Bank leased", "Golf Course Road", "Sohna Road", "Cyber City", "Axis Bank", "SCO"];

/** Asset type pages (Invest and Lease menus) whose label matches the query. */
const CATEGORY_LINKS = mainNavLinks.flatMap((link) =>
  (link.children || [])
    .filter((child) => !child.label.startsWith("All "))
    .map((child) => ({ href: child.href, label: child.label, section: link.label }))
);

interface Results {
  properties: Property[];
  coworking: CoworkingSpace[];
}

type ResultLink = { href: string };

function thumbnail(item: { coverImage?: string; images?: string[] }): string {
  return listThumbnailUrl(item.coverImage || item.images?.[0] || "");
}

function placeLine(location?: { address?: string; micromarket?: string; city?: string }): string {
  return [location?.micromarket || location?.address, location?.city].filter(Boolean).join(", ");
}

/**
 * Search button for the header. Clicking it (or pressing / or Ctrl/Cmd+K)
 * expands a search bar across the header; results cover listings,
 * coworking spaces, asset types and guides.
 */
export default function HeaderSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Results | null>(null);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const openRef = useRef(() => {});

  const term = query.trim();
  const lower = term.toLowerCase();
  const categories = term ? CATEGORY_LINKS.filter((c) => c.label.toLowerCase().includes(lower)).slice(0, 3) : [];
  const guideMatches = term.length >= 2 ? guides.filter((g) => g.title.toLowerCase().includes(lower)).slice(0, 3) : [];

  // Keyboard shortcuts: "/" or Ctrl/Cmd+K opens, Escape closes.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing = target && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));
      if ((event.key === "k" && (event.metaKey || event.ctrlKey)) || (event.key === "/" && !typing)) {
        event.preventDefault();
        openRef.current();
      } else if (event.key === "Escape") {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    return () => {
      document.removeEventListener("mousedown", onPointer);
    };
  }, [open]);

  // Debounced search of listings and coworking spaces.
  useEffect(() => {
    if (term.length < 2) return;
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      setLoading(true);
      const [properties, coworking] = await Promise.allSettled([
        propertyService.search({ q: term, limit: 6 }),
        coworkingService.getAll({ q: term, limit: 3 }),
      ]);
      if (cancelled) return;
      setResults({
        properties: properties.status === "fulfilled" ? properties.value.data.properties || [] : [],
        coworking: coworking.status === "fulfilled" ? (coworking.value.data || []).slice(0, 3) : [],
      });
      setActive(-1);
      setLoading(false);
    }, 250);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [term]);

  const shown = term.length >= 2 ? results : null;
  const links: ResultLink[] = [
    ...categories,
    ...(shown?.properties || []).map((p) => ({ href: propertyPath(p) })),
    ...(shown?.coworking || []).map((s) => ({ href: coworkingPath(s) })),
    ...guideMatches.map((g) => ({ href: `/guides/${g.slug}` })),
  ];
  const seeAllHref = `/invest?q=${encodeURIComponent(term)}`;

  const close = () => setOpen(false);
  // Focus inside the tap itself so phones show the keyboard.
  const openSearch = () => {
    flushSync(() => setOpen(true));
    inputRef.current?.focus();
  };
  useEffect(() => {
    openRef.current = openSearch;
  });
  const go = (href: string) => {
    close();
    router.push(href);
  };

  const onInputKey = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!links.length) return;
      const step = event.key === "ArrowDown" ? 1 : -1;
      setActive((index) => (index + step + links.length) % links.length);
    } else if (event.key === "Enter" && term) {
      event.preventDefault();
      go(active >= 0 && links[active] ? links[active].href : seeAllHref);
    }
  };

  let index = -1;
  const rowClass = (i: number) =>
    cn(
      "flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors",
      i === active ? "bg-accent-500/10" : "hover:bg-slate-50"
    );
  const heading = "px-3 pb-1 pt-3 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400";
  const nothingFound = shown && !loading && !links.length;

  return (
    <>
      <button
        type="button"
        aria-label="Search"
        aria-expanded={open}
        onClick={openSearch}
        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900 sm:h-11 sm:w-11"
      >
        <Search className="h-[18px] w-[18px]" />
      </button>

      {/* Expands from the right edge across the whole header bar. */}
      <div
        ref={panelRef}
        role="search"
        inert={!open}
        className={cn("absolute inset-0 z-10", open ? "pointer-events-auto" : "pointer-events-none")}
      >
        <div
          className={cn(
            "flex h-full items-center gap-3 rounded-2xl bg-white px-4 transition-[clip-path,opacity] duration-300 ease-out motion-reduce:transition-none sm:px-6 lg:px-8",
            open ? "opacity-100 [clip-path:inset(0_0_0_0_round_1rem)]" : "opacity-0 [clip-path:inset(0_0_0_92%_round_1rem)]"
          )}
        >
          <Search className="h-5 w-5 shrink-0 text-accent-500" />
          <input
            ref={inputRef}
            type="search"
            value={query}
           
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={onInputKey}
            placeholder="Search properties, locations, tenants, guides…"
            aria-label="Search CredXP"
            // The bar itself shows focus; the site-wide focus ring would draw inside it.
            style={{ outline: "none" }}
            className="h-full min-w-0 flex-1 bg-transparent text-base text-slate-900 placeholder:text-slate-400 sm:text-lg [&::-webkit-search-cancel-button]:hidden"
          />
          {loading && <Loader2 className="h-4 w-4 shrink-0 animate-spin text-slate-400" />}
          <kbd className="hidden rounded-md border border-slate-200 px-1.5 py-0.5 text-[11px] font-semibold text-slate-400 md:inline">Esc</kbd>
          <button
            type="button"
            aria-label="Close search"
           
            onClick={close}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div
          className={cn(
            "absolute inset-x-0 top-full mt-2 origin-top overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl transition-[transform,opacity] duration-300 ease-out motion-reduce:transition-none",
            open ? "translate-y-0 scale-100 opacity-100" : "-translate-y-2 scale-[0.98] opacity-0"
          )}
        >
          <div className="max-h-[min(70vh,560px)] overflow-y-auto p-2">
            {!term && (
              <div className="p-2">
                <p className={heading}>Popular searches</p>
                <div className="flex flex-wrap gap-2 px-3 pb-2 pt-2">
                  {POPULAR_SEARCHES.map((popular) => (
                    <button
                      key={popular}
                      type="button"
                     
                      onClick={() => {
                        setQuery(popular);
                        inputRef.current?.focus();
                      }}
                      className="rounded-full border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:border-accent-500 hover:text-accent-600"
                    >
                      {popular}
                    </button>
                  ))}
                </div>
                <p className={heading}>Browse by asset type</p>
                <div className="grid gap-1 pt-1 sm:grid-cols-2">
                  {CATEGORY_LINKS.map((category) => (
                    <Link key={category.href} href={category.href} onClick={close} className={rowClass(-2)}>
                      <Building2 className="h-4 w-4 text-accent-500" />
                      <span className="text-sm font-semibold text-slate-800">{category.label}</span>
                      <span className="ml-auto text-xs text-slate-400">{category.section}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {term.length === 1 && <p className="px-5 py-6 text-sm text-slate-500">Keep typing…</p>}

            {categories.length > 0 && (
              <section>
                <p className={heading}>Asset types</p>
                {categories.map((category) => {
                  const i = ++index;
                  return (
                    <Link key={category.href} href={category.href} onClick={close} className={rowClass(i)}>
                      <Building2 className="h-4 w-4 text-accent-500" />
                      <span className="text-sm font-semibold text-slate-800">{category.label}</span>
                      <span className="ml-auto text-xs text-slate-400">{category.section}</span>
                    </Link>
                  );
                })}
              </section>
            )}

            {!!shown?.properties.length && (
              <section>
                <p className={heading}>Properties</p>
                {shown.properties.map((property) => {
                  const i = ++index;
                  const image = thumbnail(property);
                  const price = property.financials?.price || property.price;
                  return (
                    <Link key={property._id} href={propertyPath(property)} onClick={close} className={rowClass(i)}>
                      <span className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                        {image ? (
                          <Image src={image} alt="" fill sizes="64px" unoptimized={shouldUseUnoptimizedImage(image)} className="object-cover" />
                        ) : (
                          <Building2 className="absolute inset-0 m-auto h-5 w-5 text-slate-300" />
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-slate-900">{property.title}</span>
                        <span className="mt-0.5 flex items-center gap-1 truncate text-xs text-slate-500">
                          <MapPin className="h-3 w-3 shrink-0" />
                          <span className="truncate">{placeLine(property.location)}</span>
                        </span>
                      </span>
                      <span className="hidden shrink-0 text-right sm:block">
                        {price ? <span className="block text-sm font-bold text-slate-900">{formatPriceCompact(price)}</span> : null}
                        <span className="block text-[11px] font-medium text-accent-600">{property.type}</span>
                      </span>
                    </Link>
                  );
                })}
              </section>
            )}

            {!!shown?.coworking.length && (
              <section>
                <p className={heading}>Coworking</p>
                {shown.coworking.map((space) => {
                  const i = ++index;
                  return (
                    <Link key={space._id} href={coworkingPath(space)} onClick={close} className={rowClass(i)}>
                      <Users className="h-4 w-4 shrink-0 text-accent-500" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-slate-900">{space.title}</span>
                        <span className="block truncate text-xs text-slate-500">{placeLine(space.location)}</span>
                      </span>
                    </Link>
                  );
                })}
              </section>
            )}

            {guideMatches.length > 0 && (
              <section>
                <p className={heading}>Guides</p>
                {guideMatches.map((guide) => {
                  const i = ++index;
                  return (
                    <Link key={guide.slug} href={`/guides/${guide.slug}`} onClick={close} className={rowClass(i)}>
                      <BookOpen className="h-4 w-4 shrink-0 text-accent-500" />
                      <span className="truncate text-sm font-semibold text-slate-800">{guide.title}</span>
                    </Link>
                  );
                })}
              </section>
            )}

            {nothingFound && (
              <p className="px-5 py-6 text-sm text-slate-500">
                No matches for “{term}”. Try a location (e.g. Sohna Road), a tenant (e.g. Axis Bank) or an asset type.
              </p>
            )}

            {term.length >= 2 && (
              <Link
                href={seeAllHref}
                onClick={close}
                className="mt-1 flex items-center justify-between rounded-xl border-t border-slate-100 px-3 py-3 text-sm font-semibold text-accent-600 hover:bg-accent-500/5"
              >
                See all investment results for “{term}”
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
