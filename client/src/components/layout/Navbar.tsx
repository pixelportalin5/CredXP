"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { UserCircle, LogOut, KeyRound, History, ShieldCheck, ChevronDown, Menu, X } from "lucide-react";
import { mainNavLinks } from "@/config/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { shouldUseUnoptimizedImage } from "@/utils/imageUrl";
import { cn } from "@/utils/cn";
import { isStaff } from "@/utils/roles";
import { getDashboardPathForRole } from "@/utils/staffPortal";

const menuItemClass =
  "flex w-full items-center gap-2.5 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900";

export default function Navbar() {
  const [profileOpen, setProfileOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const dashboardHref =
    getDashboardPathForRole(user?.role) ??
    (user?.role === "seller" ? "/seller/dashboard" : "/user/dashboard");

  useEffect(() => {
    setProfileOpen(false);
    setDrawerOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!profileOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [profileOpen]);

  useEffect(() => {
    if (!drawerOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDrawerOpen(false);
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleEscape);
    };
  }, [drawerOpen]);

  const isActive = (href: string): boolean => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href.split("?")[0]);
  };

  const sellerLinks =
    user?.role === "seller"
      ? [
          { href: "/list-property", label: "List Property" },
          { href: "/seller/dashboard", label: "Dashboard" },
        ]
      : [];

  const mobileLinks = [...mainNavLinks, ...sellerLinks];

  const linkClass = (href: string) =>
    cn(
      "relative py-2 text-[15px] font-semibold transition-colors",
      isActive(href) ? "text-slate-900" : "text-slate-700 hover:text-slate-900"
    );

  const closeProfileMenu = () => setProfileOpen(false);

  return (
    <header className="pointer-events-none fixed top-4 inset-x-4 z-[var(--z-sticky)] mx-auto max-w-[1600px]">
      <nav className="glass-nav-light pointer-events-auto relative rounded-2xl">
        <div className="flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex shrink-0 items-center" id="nav-logo">
            <Image
              src="/logos/Credxp.webp"
              alt="CredXP"
              width={260}
              height={74}
              priority
              className="h-12 w-auto object-contain sm:h-14"
            />
          </Link>

          <div className="hidden flex-1 items-center justify-center gap-8 lg:flex xl:gap-10">
            {mainNavLinks.map((link) => (
              <Link key={link.href + link.label} href={link.href} className={linkClass(link.href)}>
                {link.label}
                {isActive(link.href) && (
                  <span className="absolute -bottom-1 left-1/2 h-0.5 w-5 -translate-x-1/2 rounded-full bg-accent-500" />
                )}
              </Link>
            ))}
            {sellerLinks.map((link) => (
              <Link key={link.href} href={link.href} className={linkClass(link.href)}>
                {link.label}
                {isActive(link.href) && (
                  <span className="absolute -bottom-1 left-1/2 h-0.5 w-5 -translate-x-1/2 rounded-full bg-accent-500" />
                )}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-700 transition-colors hover:bg-slate-50 lg:hidden"
              aria-label={drawerOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={drawerOpen}
              aria-controls="mobile-nav-drawer"
              onClick={() => setDrawerOpen((open) => !open)}
            >
              {drawerOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            {user ? (
              <div
                ref={profileRef}
                className="relative"
                onMouseEnter={() => setProfileOpen(true)}
                onMouseLeave={() => setProfileOpen(false)}
              >
                <div className="flex items-center">
                  <Link
                    href={dashboardHref}
                    className="inline-flex items-center gap-2 rounded-l-lg py-1.5 pl-1 pr-1 text-[15px] font-semibold text-slate-700 transition-colors hover:text-slate-900"
                  >
                    {user.avatar ? (
                      <Image
                        src={user.avatar}
                        alt=""
                        width={32}
                        height={32}
                        unoptimized={shouldUseUnoptimizedImage(user.avatar)}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <UserCircle className="h-5 w-5" />
                    )}
                    <span className="hidden sm:inline">{user.name.split(" ")[0]}</span>
                  </Link>
                  <button
                    type="button"
                    aria-label="Open account menu"
                    aria-expanded={profileOpen}
                    onClick={() => setProfileOpen((open) => !open)}
                    className="inline-flex items-center rounded-r-lg py-1.5 pr-1 pl-0.5 text-slate-500 transition-colors hover:text-slate-900"
                  >
                    <ChevronDown
                      className={cn("h-4 w-4 transition-transform duration-200", profileOpen && "rotate-180")}
                    />
                  </button>
                </div>

                <div
                  className={cn(
                    "absolute right-0 top-full z-50 pt-1.5 transition-all duration-150",
                    profileOpen ? "visible translate-y-0 opacity-100" : "invisible -translate-y-1 opacity-0 pointer-events-none"
                  )}
                >
                  <div className="min-w-[11.5rem] rounded-xl bg-white py-1 shadow-lg ring-1 ring-slate-900/5">
                    {isStaff(user.role) && (
                      <Link href={dashboardHref} onClick={closeProfileMenu} className={menuItemClass}>
                        <ShieldCheck className="h-4 w-4 shrink-0 text-accent-500" />
                        {user.role === "admin" ? "Admin Dashboard" : "Employee Dashboard"}
                      </Link>
                    )}
                    <Link href="/user/credentials" onClick={closeProfileMenu} className={menuItemClass}>
                      <KeyRound className="h-4 w-4 shrink-0 text-accent-500" />
                      User Credentials
                    </Link>
                    <Link href="/user/history" onClick={closeProfileMenu} className={menuItemClass}>
                      <History className="h-4 w-4 shrink-0 text-accent-500" />
                      History
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        closeProfileMenu();
                        logout();
                      }}
                      className={cn(menuItemClass, "text-accent-500 hover:text-accent-600")}
                    >
                      <LogOut className="h-4 w-4 shrink-0 text-accent-500" />
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link
                href="/login"
                className="inline-flex rounded-full bg-accent-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-accent-500/25 transition-all hover:-translate-y-0.5 hover:bg-accent-400 hover:shadow-accent-500/35 sm:px-6 sm:text-[15px]"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </nav>

      {drawerOpen && (
        <div className="pointer-events-auto fixed inset-0 z-[var(--z-overlay)] lg:hidden">
          <div
            className="absolute inset-0 bg-slate-950/30 backdrop-blur-sm transition-opacity"
            onClick={() => setDrawerOpen(false)}
            aria-hidden
          />
          <div
            id="mobile-nav-drawer"
            className="absolute right-0 top-0 flex h-full w-[min(320px,85vw)] animate-[nav-drawer-in_0.3s_ease-out] flex-col border-l border-slate-200 bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500">Menu</p>
              <button
                type="button"
                aria-label="Close navigation menu"
                onClick={() => setDrawerOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-4 py-5">
              {mobileLinks.map((link, index) => (
                <Link
                  key={link.href + link.label}
                  href={link.href}
                  onClick={() => setDrawerOpen(false)}
                  className={cn(
                    "nav-drawer-link rounded-xl px-4 py-3 text-base font-semibold transition-colors",
                    isActive(link.href)
                      ? "bg-accent-500/10 text-accent-600"
                      : "text-slate-800 hover:bg-slate-50"
                  )}
                  style={{ animationDelay: `${index * 60}ms` }}
                >
                  {link.label}
                </Link>
              ))}

              <div className="mt-4 border-t border-slate-200 pt-4">
                {user ? (
                  <>
                    <Link
                      href={dashboardHref}
                      onClick={() => setDrawerOpen(false)}
                      className="nav-drawer-link block rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                      style={{ animationDelay: `${mobileLinks.length * 60}ms` }}
                    >
                      My Dashboard
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setDrawerOpen(false);
                        logout();
                      }}
                      className="nav-drawer-link w-full rounded-xl px-4 py-2.5 text-left text-sm font-medium text-accent-500 hover:bg-accent-500/5"
                      style={{ animationDelay: `${(mobileLinks.length + 1) * 60}ms` }}
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setDrawerOpen(false)}
                    className="nav-drawer-link inline-flex w-full items-center justify-center rounded-xl bg-accent-500 px-4 py-3 text-sm font-bold text-white"
                    style={{ animationDelay: `${mobileLinks.length * 60}ms` }}
                  >
                    Login
                  </Link>
                )}
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
