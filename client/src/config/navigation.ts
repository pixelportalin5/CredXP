/* ============================================================
   Navigation Configuration
   Centralized nav structure for Navbar, Footer, and Sitemap
   ============================================================ */

import type { NavLink } from "@/types/common";

export const mainNavLinks: NavLink[] = [
  {
    href: "/properties",
    label: "Invest",
    children: [
      { href: "/properties?category=pre-leased", label: "Pre-Leased Assets" },
      { href: "/properties?category=investment", label: "Investment Opportunities" },
      { href: "/properties", label: "All Properties" },
    ],
  },
  {
    href: "/properties?category=lease",
    label: "Lease",
    children: [
      { href: "/properties?type=Office+Space", label: "Office Spaces" },
      { href: "/properties?type=Retail/SCO", label: "Retail / SCO" },
      { href: "/properties?type=Warehouse", label: "Warehouses" },
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
    { href: "/properties?category=pre-leased", label: "Invest in Pre-Leased" },
    { href: "/properties?category=lease", label: "Lease Corporate Space" },
    { href: "/coworking", label: "Coworking Spaces" },
    { href: "/properties", label: "All Properties" },
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
