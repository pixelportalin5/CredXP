"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { UserCircle, LogOut, KeyRound, History, ShieldCheck, ChevronDown } from "lucide-react";
import { mainNavLinks } from "@/config/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { cn } from "@/utils/cn";
import { isStaff } from "@/utils/roles";
import { getDashboardPathForRole } from "@/utils/staffPortal";

const menuItemClass =
  "flex w-full items-center gap-2.5 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900";

export default function Navbar() {
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const dashboardHref =
    getDashboardPathForRole(user?.role) ??
    (user?.role === "seller" ? "/seller/dashboard" : "/user/dashboard");

  useEffect(() => {
    setProfileOpen(false);
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

          <div className="flex items-center">
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
                        unoptimized
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <UserCircle className="h-5 w-5" />
                    )}
                    {user.name.split(" ")[0]}
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
                className="inline-flex rounded-full bg-accent-500 px-6 py-2.5 text-[15px] font-bold text-white shadow-lg shadow-accent-500/25 transition-all hover:-translate-y-0.5 hover:bg-accent-400 hover:shadow-accent-500/35"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
