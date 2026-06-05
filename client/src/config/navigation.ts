/* ============================================================
   Navigation Configuration
   Centralized nav structure for Navbar, Footer, and Sitemap
   ============================================================ */

import type { NavLink } from "@/types/common";

export const mainNavLinks: NavLink[] = [
  {
    href: "/invest",
    label: "Invest",
    children: [
      { href: "/invest?type=Pre-Leased+Office", label: "Pre-Leased Offices" },
      { href: "/invest?type=Shop", label: "Pre-Leased Shops" },
      { href: "/invest", label: "All Investments" },
    ],
  },
  {
    href: "/lease",
    label: "Lease",
    children: [
      { href: "/lease?type=Office+Space", label: "Office Spaces" },
      { href: "/lease?type=Shop", label: "Retail Shops" },
      { href: "/lease", label: "All Lease Listings" },
    ],
  },
  {
    href: "/coworking",
    label: "Coworking",
  },
  {
    href: "/insights",
    label: "Insights",
  },
  {
    href: "/about",
    label: "About Us",
  },
  {
    href: "/contact",
    label: "Contact",
  },
];

export const footerLinks = {
  explore: [
    { href: "/invest", label: "Invest in Pre-Leased" },
    { href: "/lease", label: "Lease Corporate Space" },
    { href: "/coworking", label: "Coworking Spaces" },
    { href: "/invest", label: "Investment Directory" },
  ],
  company: [
    { href: "/about", label: "About Us" },
    { href: "/contact", label: "Contact" },
    { href: "/careers", label: "Careers" },
    { href: "/partners", label: "Our Partners" },
  ],
  resources: [
    { href: "/insights", label: "Insights" },
    { href: "/downloads", label: "Downloads" },
    { href: "/blog", label: "Blog" },
    { href: "/market-reports", label: "Market Reports" },
  ],
  legal: [
    { href: "/support", label: "Support" },
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/terms", label: "Terms & Conditions" },
  ],
} as const;
