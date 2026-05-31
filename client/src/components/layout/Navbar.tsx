"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X, UserCircle, LogOut, KeyRound, History, ShieldCheck } from "lucide-react";
import { mainNavLinks } from "@/config/navigation";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/components/providers/AuthProvider";
import { cn } from "@/utils/cn";

/* ============================================================
   Navbar — Enterprise Navigation
   ============================================================ */

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileOpenPath, setMobileOpenPath] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

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

  const sellerLinks = user?.role === "seller" ? [
    { href: "/list-property", label: "List Property" },
    { href: "/seller/dashboard", label: "Dashboard" },
  ] : [];
  const dashboardHref = user?.role === "admin" ? "/admin/dashboard" : user?.role === "seller" ? "/seller/dashboard" : "/user/dashboard";

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
          className="flex items-center"
          id="nav-logo"
        >
          <Image
            src="/logos/Credxp.webp"
            alt="CredXP"
            width={260}
            height={74}
            priority
            className="h-14 w-auto object-contain sm:h-16"
          />
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
          {sellerLinks.map((link) => (
            <Link
              key={link.href}
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
          {user ? (
            <div className="hidden items-center gap-3 lg:flex">
              <Link href={dashboardHref} className="inline-flex items-center gap-2 text-[15px] font-semibold text-slate-700 hover:text-slate-900">
                <UserCircle className="h-5 w-5" />
                {user.name.split(" ")[0]}
              </Link>
              <button
                type="button"
                onClick={logout}
                className="inline-flex items-center gap-1.5 text-[15px] font-semibold text-slate-500 hover:text-slate-900"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="hidden rounded-full bg-red-600 px-6 py-2.5 text-[15px] font-bold text-white shadow-lg shadow-red-600/25 transition-all hover:-translate-y-0.5 hover:bg-red-500 hover:shadow-red-600/35 lg:inline-flex"
            >
              Login
            </Link>
          )}

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

      {/* Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="absolute right-4 top-full z-50 mt-2 w-[min(28rem,calc(100vw-2rem))]">
          <div className="max-h-[calc(100vh-7rem)] overflow-y-auto rounded-3xl border border-slate-200 bg-white shadow-2xl">
            <div className="p-6 space-y-1">
              {user && (
                <div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  {user.role === "admin" && (
                    <Link
                      href="/admin/dashboard"
                      onClick={() => {
                        setMobileOpen(false);
                        setMobileOpenPath(null);
                      }}
                      className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900"
                    >
                      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-500/10 text-accent-500">
                        <ShieldCheck className="h-3.5 w-3.5" />
                      </span>
                      Admin Dashboard
                    </Link>
                  )}
                  <Link
                    href="/user/credentials"
                    onClick={() => {
                      setMobileOpen(false);
                      setMobileOpenPath(null);
                    }}
                    className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-500/10 text-accent-500">
                      <KeyRound className="h-3.5 w-3.5" />
                    </span>
                    User Credentials
                  </Link>
                  <Link
                    href="/user/history"
                    onClick={() => {
                      setMobileOpen(false);
                      setMobileOpenPath(null);
                    }}
                    className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-500/10 text-accent-500">
                      <History className="h-3.5 w-3.5" />
                    </span>
                    History
                  </Link>
                </div>
              )}

              {!user && (
                <Link href="/login" className="block">
                  <Button variant="danger" size="md" fullWidth>
                    Login
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
