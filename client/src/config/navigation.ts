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
    href: "/guides",
    label: "Guides",
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
    { href: "/gurugram", label: "Gurugram Locations" },
    { href: "/list-property", label: "List Your Property" },
  ],
  company: [
    { href: "/about", label: "About Us" },
    { href: "/contact", label: "Contact" },
  ],
  resources: [
    // Downloads, Blog, Market Reports, Careers and Partners are placeholder pages;
    // link them again once they have content.
    { href: "/guides", label: "Investor Guides" },
    { href: "/guides/pre-leased-property-due-diligence-checklist", label: "Due Diligence Checklist" },
    { href: "/insights", label: "Market Insights" },
  ],
  legal: [
    { href: "/support", label: "Support" },
    { href: "/privacy-policy", label: "Privacy Policy" },
    { href: "/terms", label: "Terms & Conditions" },
  ],
} as const;
