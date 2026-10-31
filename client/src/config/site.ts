/* ============================================================
   Site Configuration
   Single source of truth for all site-wide metadata
   ============================================================ */

export const siteConfig = {
  name: "CredXP",
  tagline: "Premium Commercial Real Estate. Delivered.",
  description:
    "CredXP is a Gurugram-based commercial real estate advisory and marketplace for pre-leased commercial property, office spaces for sale or lease, retail shops and coworking across Delhi NCR.",
  keywords: [
    "commercial real estate services",
    "pre-leased commercial shops",
    "premium office rentals",
    "office space for rent",
    "pre-leased office investment",
    "retail shops for investment",
    "SCO plots",
    "coworking spaces Gurugram",
    "commercial property India",
  ],
  url: "https://www.credxp.com",
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
    // Owner to supply the real HRERA registration number. Left empty, nothing is shown.
    rera: "",
    companyName: "CredXP Prop-Tech Pvt. Ltd.",
    cin: "",
  },

  trustPartners: [
    "WeWork",
    "AWFIS",
    "Smartworks",
    "BHIVE",
    "Regus",
  ],
} as const;

export type SiteConfig = typeof siteConfig;
