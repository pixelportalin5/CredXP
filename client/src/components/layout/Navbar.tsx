"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X, ArrowRight } from "lucide-react";
import { mainNavLinks } from "@/config/navigation";
import { Button } from "@/components/ui/Button";
import { cn } from "@/utils/cn";

/* ============================================================
   Navbar — Enterprise Navigation
   ============================================================ */

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileOpenPath, setMobileOpenPath] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  // Track scroll for navbar background
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isMobileMenuOpen = mobileOpen && mobileOpenPath === pathname;

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isMobileMenuOpen]);

  const isActive = (href: string): boolean => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href.split("?")[0]);
  };

  return (
    <nav
      className={cn(
        "sticky top-0 z-[var(--z-sticky)] border-b border-slate-200/45 transition-all duration-300",
        scrolled
          ? "bg-white/88 backdrop-blur-xl"
          : "bg-white/82 backdrop-blur-lg"
      )}
    >
      <div className="mx-auto flex h-24 w-full max-w-[1600px] items-center justify-between px-4 sm:px-6 lg:px-12">
        {/* Logo */}
        <Link
          href="/"
          className="flex flex-col items-start leading-none text-slate-900"
          id="nav-logo"
        >
          <span className="text-[2.5rem] font-black tracking-[-0.06em] sm:text-[3rem]">
            Cred<span className="text-accent-500">Xp</span>
          </span>
          <span className="mt-1 text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-slate-700">
            Commercial Real Estate
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden flex-1 items-center justify-center gap-10 lg:flex">
          {mainNavLinks.map((link) => (
            <Link
              key={link.href + link.label}
              href={link.href}
              className={cn(
                "relative py-2 text-[15px] font-semibold transition-colors",
                isActive(link.href)
                  ? "text-slate-900"
                  : "text-slate-700 hover:text-slate-900"
              )}
            >
              {link.label}
              {isActive(link.href) && (
                <span className="absolute -bottom-1 left-1/2 h-0.5 w-5 -translate-x-1/2 rounded-full bg-accent-500" />
              )}
            </Link>
          ))}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-6">
          <Link href="/contact" className="hidden text-[15px] font-semibold text-slate-700 hover:text-slate-900 lg:block">
            Login / Register
          </Link>

          {/* Menu Button (Desktop & Mobile) */}
          <button
            onClick={() => {
              if (isMobileMenuOpen) {
                setMobileOpen(false);
                setMobileOpenPath(null);
                return;
              }
              setMobileOpen(true);
              setMobileOpenPath(pathname);
            }}
            className="rounded-lg p-2 text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900"
            aria-label="Toggle menu"
            id="mobile-menu-toggle"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 top-16 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-slate-950/20 backdrop-blur-sm"
            onClick={() => {
              setMobileOpen(false);
              setMobileOpenPath(null);
            }}
          />
          <div className="relative h-full w-full max-w-sm overflow-y-auto border-r border-slate-200 bg-white shadow-2xl">
            <div className="p-6 space-y-1">
              {mainNavLinks.map((link) => (
                <Link
                  key={link.href + link.label}
                  href={link.href}
                  onClick={() => {
                    setMobileOpen(false);
                    setMobileOpenPath(null);
                  }}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                    isActive(link.href)
                      ? "border-l-2 border-accent-500 bg-accent-500/10 text-slate-900"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  )}
                >
                  {link.label}
                </Link>
              ))}

              <div className="mt-6 space-y-3 border-t border-slate-200 pt-6">
                <Link href="/contact" className="block">
                  <Button variant="outline" size="md" fullWidth>
                    Login / Register
                  </Button>
                </Link>
                <Link href="/properties" className="block">
                  <Button variant="primary" size="md" fullWidth iconRight={<ArrowRight className="h-4 w-4" />}>
                    Explore Properties
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
