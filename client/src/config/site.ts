/* ============================================================
   Site Configuration
   Single source of truth for all site-wide metadata
   ============================================================ */

export const siteConfig = {
  name: "CredXP",
  tagline: "Premium Commercial Real Estate. Delivered.",
  description:
    "India's premium commercial real estate intelligence platform — pre-leased investments, enterprise office leasing, coworking aggregation, and institutional-grade property discovery.",
  url: "https://credxp.com",
  ogImage: "/og-image.jpg",

  contact: {
    email: "sales@credxp.com",
    phone: "+91 85951 91894",
    whatsapp: "+918595191894",
    address: "Gurugram, Haryana, India",
  },

  social: {
    linkedin: "https://www.linkedin.com/company/thecredxp/",
    twitter: "https://x.com/thecredxp",
    instagram: "https://www.instagram.com/cred.xp/",
    facebook: "https://www.facebook.com/profile.php?id=61552845963690",
  },

  legal: {
    rera: "RERA No.: HRERA-GRG-RELA-1234–2026",
    companyName: "CredXP Prop-Tech Pvt. Ltd.",
    cin: "",
  },

  stats: [
    { value: "50M+", label: "Sq. Ft. Portfolio" },
    { value: "200+", label: "Assets" },
    { value: "150+", label: "Blue-Chip Tenants" },
    { value: "15+", label: "Coworking Partners" },
  ],

  trustPartners: [
    "WeWork",
    "AWFIS",
    "Smartworks",
    "BHIVE",
    "Regus",
  ],
} as const;

export type SiteConfig = typeof siteConfig;
