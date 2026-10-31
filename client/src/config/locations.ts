/* ============================================================
   Gurugram micro-market pages (/gurugram/<slug>)
   A page is indexed only when it has MIN_INDEXABLE_LISTINGS live
   listings, so areas without inventory never become thin pages.
   Keep intros factual: location and access, not prices or forecasts.
   ============================================================ */

export const MIN_INDEXABLE_LISTINGS = 3;

export interface LocationArea {
  slug: string;
  name: string;
  /** Matched (whole words, case-insensitive) against a listing's micromarket and address. */
  match: string[];
  intro: string;
  access: string[];
}

export const GURUGRAM_AREAS: LocationArea[] = [
  {
    slug: "dlf-phase-1-to-5",
    name: "DLF Phases 1–5",
    match: ["DLF Phase 1", "DLF Phase 2", "DLF Phase 3", "DLF Phase 4", "DLF Phase 5", "DLF City", "Cyber City", "Cyber Hub"],
    intro:
      "The DLF Phases are some of Gurugram's longest-established neighbourhoods, next to DLF Cyber City. Alongside housing they have commercial plots, independent office buildings and high-street shops, which are often bought as pre-leased investments.",
    access: [
      "Close to DLF Cyber City and NH-48",
      "Served by Rapid Metro and Yellow Line stations around Cyber City and MG Road",
      "Short drive to Golf Course Road",
    ],
  },
  {
    slug: "mg-road-sector-28",
    name: "MG Road & Sector 28",
    match: ["MG Road", "Mehrauli-Gurgaon Road", "Sector 28", "Sikanderpur"],
    intro:
      "MG Road (Mehrauli–Gurgaon Road) is one of Gurugram's older commercial corridors, lined with malls, showrooms and office space. Sector 28 sits along it and includes established retail centres.",
    access: [
      "Yellow Line metro stations along MG Road, including MG Road and Sikanderpur",
      "Connects to Golf Course Road and NH-48",
    ],
  },
  {
    slug: "sohna-road-sector-48",
    name: "Sohna Road & Sector 48",
    match: ["Sohna Road", "Sector 48", "Sector 47", "Sector 49", "South City-2", "South City 2", "South City II"],
    intro:
      "Sohna Road runs south from central Gurugram and has grown into a busy office and retail corridor, with commercial complexes such as Iris Tech Park and JMD Megapolis in Sector 48. CredXP's own office is at Iris Tech Park.",
    access: [
      "Direct road link to central Gurugram and towards Sohna",
      "Connects with Golf Course Extension Road and the Southern Peripheral Road",
    ],
  },
  {
    slug: "udyog-vihar",
    name: "Udyog Vihar",
    match: ["Udyog Vihar"],
    intro:
      "Udyog Vihar began as an industrial estate and is now largely occupied by corporate and IT offices, with many independent office buildings on plots.",
    access: ["Next to NH-48 and close to DLF Cyber City", "Near Delhi and the airport by road"],
  },
  {
    slug: "sushant-lok",
    name: "Sushant Lok",
    match: ["Sushant Lok"],
    intro:
      "Sushant Lok is an established mixed-use area in central Gurugram with shops, showrooms and small offices on its commercial streets.",
    access: ["Close to MG Road and Golf Course Road", "Short drive to Yellow Line metro stations"],
  },
  {
    slug: "golf-course-road",
    name: "Golf Course Road & Extension",
    match: ["Golf Course Road", "Golf Course Extension", "Golf Course Ext"],
    intro:
      "Golf Course Road and its southern extension host many of Gurugram's newer office towers and mixed-use developments.",
    access: ["Rapid Metro along Golf Course Road", "Connects to Sohna Road and the Southern Peripheral Road"],
  },
  {
    slug: "southern-peripheral-road",
    name: "Southern Peripheral Road (SPR)",
    match: ["SPR", "Southern Peripheral Road"],
    intro:
      "The Southern Peripheral Road links Golf Course Extension Road and Sohna Road with NH-48, and has a growing number of commercial and mixed-use projects.",
    access: ["Links Golf Course Extension Road, Sohna Road and NH-48"],
  },
];

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const matchers = GURUGRAM_AREAS.map((area) => ({
  area,
  pattern: new RegExp(`(^|[^a-z0-9])(${area.match.map(escapeRegex).join("|")})($|[^a-z0-9])`, "i"),
}));

interface LocatedListing {
  location?: { micromarket?: string; address?: string; city?: string };
}

export function findAreaForProperty(listing: LocatedListing): LocationArea | undefined {
  const city = (listing.location?.city || "").toLowerCase();
  if (city && !/gurgaon|gurugram/.test(city)) return undefined;
  const text = `${listing.location?.micromarket || ""} | ${listing.location?.address || ""}`;
  return matchers.find(({ pattern }) => pattern.test(text))?.area;
}

export function getArea(slug: string): LocationArea | undefined {
  return GURUGRAM_AREAS.find((area) => area.slug === slug);
}
