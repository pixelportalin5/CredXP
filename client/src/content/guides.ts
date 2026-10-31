/* ============================================================
   Investor & occupier guides
   Plain-English, evergreen explainers. Keep claims factual and
   general; examples are illustrations, not market data.
   Update `reviewed` whenever a guide is checked again.
   ============================================================ */

export interface GuideSection {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
  table?: { headers: string[]; rows: string[][]; caption?: string };
}

export interface GuideFaq {
  question: string;
  answer: string;
}

export interface Guide {
  slug: string;
  title: string;
  metaTitle: string;
  description: string;
  /** Direct answer shown first; written to make sense when quoted on its own. */
  summary: string;
  audience: "Investors" | "Businesses";
  reviewed: string; // ISO date
  sections: GuideSection[];
  faqs: GuideFaq[];
  related: { label: string; href: string }[];
}

const REVIEWED = "2026-10-31";

export const guides: Guide[] = [
  {
    slug: "what-is-pre-leased-commercial-property",
    title: "What Is a Pre-Leased Commercial Property?",
    metaTitle: "What Is Pre-Leased Commercial Property? Benefits & Risks",
    description:
      "A pre-leased (pre-rented) commercial property is an office, shop or building sold with a tenant already paying rent. Learn how it works, the benefits and the risks to check.",
    summary:
      "A pre-leased commercial property is an office, shop or commercial building that is sold with a tenant already in place and paying rent. The buyer takes over the existing lease, so rental income can start from the date of purchase instead of after a search for a tenant. The value of the investment depends heavily on the quality of the tenant and the terms of the lease.",
    audience: "Investors",
    reviewed: REVIEWED,
    sections: [
      {
        heading: "How a pre-leased property purchase works",
        paragraphs: [
          "The seller owns a commercial unit that is already let to a tenant under a lease agreement. When you buy it, ownership transfers to you and the lease continues: the tenant pays rent to you from the agreed date, under the same terms. The terms usually move with the property, so you inherit both the income and the obligations the landlord accepted.",
          "Because the income already exists, pre-leased properties are usually priced with the rent in mind. Sellers and brokers often quote a rental yield: the annual rent as a percentage of the asking price.",
        ],
      },
      {
        heading: "Pre-leased vs vacant commercial property",
        table: {
          headers: ["", "Pre-leased property", "Vacant property"],
          rows: [
            ["Income from day one", "Yes, if the tenant keeps paying", "No, until a tenant is found"],
            ["Price", "Usually reflects the rent being paid", "Usually lower per sq ft for comparable space"],
            ["Choice of tenant", "Already decided by the previous owner", "You choose the tenant and terms"],
            ["Main risk", "Tenant leaves or defaults; lease terms are weak", "Time and cost to find a tenant"],
            ["What to study", "Lease deed, tenant, lock-in, escalation", "Location demand, rents for similar space"],
          ],
        },
      },
      {
        heading: "Why investors buy pre-leased property",
        bullets: [
          "Rental income can begin as soon as the sale completes.",
          "The rent, lease length and escalation are written down, so income is easier to estimate than for a vacant unit.",
          "A tenant with a long remaining lock-in reduces the chance of an early vacancy.",
          "Commercial leases commonly include periodic rent increases (escalation).",
        ],
      },
      {
        heading: "Risks to understand before you buy",
        bullets: [
          "Tenant exit: once the lock-in period ends, the tenant can usually leave with notice, and the unit may stay empty while you find a new tenant.",
          "Tenant default: the tenant may pay late or stop paying. The security deposit covers only a limited period.",
          "Above-market rent: if the current rent is higher than what similar space earns, a replacement tenant may pay less, which lowers the property's value.",
          "Lease quality: an unregistered or poorly drafted lease is harder to enforce.",
          "Title and approvals: problems with ownership, mortgages or building approvals can affect both the sale and the lease.",
          "Liquidity: commercial units can take longer to sell than homes, especially large or unusual ones.",
        ],
        paragraphs: [
          "None of these risks rule out an investment. They are the reason pre-leased property needs careful due diligence rather than a decision based on the yield alone.",
        ],
      },
      {
        heading: "Bank-leased and other tenant types",
        paragraphs: [
          "'Bank-leased' simply means the tenant is a bank branch or ATM. Investors often look for well-known tenants such as banks, large retailers or established companies because they are seen as more likely to pay on time. A well-known name does not remove the need to read the lease: a strong tenant with a short remaining lock-in can still leave soon.",
        ],
      },
    ],
    faqs: [
      {
        question: "Is rental income from a pre-leased property guaranteed?",
        answer:
          "No. The lease sets out the rent the tenant has agreed to pay, but the tenant can default, or leave after the lock-in period ends. Rental income is contractual, not guaranteed.",
      },
      {
        question: "What is the difference between pre-leased and pre-rented property?",
        answer:
          "They mean the same thing: a property sold with a tenant already in place and paying rent.",
      },
      {
        question: "What should I check first in a pre-leased property?",
        answer:
          "Start with the lease deed (rent, start and end dates, lock-in, escalation and exit clauses), the tenant's payment history, and the seller's title documents. See our due diligence checklist for the full list.",
      },
    ],
    related: [
      { label: "How to calculate rental yield (gross vs net)", href: "/guides/rental-yield-gross-vs-net" },
      { label: "Pre-leased property due diligence checklist", href: "/guides/pre-leased-property-due-diligence-checklist" },
      { label: "Browse pre-leased properties for sale", href: "/invest" },
    ],
  },
  {
    slug: "rental-yield-gross-vs-net",
    title: "How to Calculate Rental Yield on Commercial Property (Gross vs Net)",
    metaTitle: "Commercial Rental Yield: Gross vs Net Yield Calculation",
    description:
      "How to calculate gross and net rental yield on a commercial property in India, with a worked example and the costs that separate the two numbers.",
    summary:
      "Gross rental yield is the annual rent divided by the purchase price, shown as a percentage. Net rental yield subtracts the owner's yearly running costs from the rent and adds purchase costs such as stamp duty and fees to the price. Net yield is always lower, and it is the better number for comparing properties.",
    audience: "Investors",
    reviewed: REVIEWED,
    sections: [
      {
        heading: "The formulas",
        bullets: [
          "Gross rental yield = (monthly rent × 12) ÷ purchase price × 100",
          "Net rental yield = (annual rent − annual owner costs) ÷ (purchase price + acquisition costs) × 100",
        ],
        paragraphs: [
          "Yields quoted in listings, including on CredXP, are normally gross yields based on the rent and price shared by the seller. Treat them as a starting point and work out the net yield for any property you are serious about.",
        ],
      },
      {
        heading: "Worked example",
        paragraphs: [
          "The figures below are an illustration to show the method, not market data.",
        ],
        table: {
          headers: ["Item", "Amount"],
          rows: [
            ["Purchase price", "₹1,00,00,000"],
            ["Monthly rent", "₹60,000"],
            ["Annual rent", "₹7,20,000"],
            ["Gross yield", "7.20%"],
            ["Acquisition costs (stamp duty, registration, legal, brokerage), assumed", "₹8,00,000"],
            ["Annual owner costs (property tax, insurance, repairs), assumed", "₹40,000"],
            ["Net yield = (7,20,000 − 40,000) ÷ 1,08,00,000", "6.30%"],
          ],
          caption: "Illustrative example. Your actual costs depend on the property, the state and the deal.",
        },
      },
      {
        heading: "Costs that reduce your real return",
        bullets: [
          "Stamp duty and registration charges on the purchase (set by the state government; check current Haryana rates before you buy).",
          "Legal fees for title checks and documentation, and any brokerage.",
          "Property tax and any maintenance or common-area charges the lease leaves with the owner.",
          "Insurance and repairs that are the landlord's responsibility under the lease.",
          "An allowance for vacancy: months without rent if the tenant leaves and the unit must be re-let.",
          "Income tax on rental income, which depends on your own tax situation.",
        ],
      },
      {
        heading: "Taxes that affect the cash you receive",
        bullets: [
          "TDS on rent: many business tenants deduct tax at source from rent under Section 194-I of the Income-tax Act, so the amount credited to you is lower than the agreed rent. The TDS can be claimed when you file your return.",
          "TDS on purchase: when buying property worth ₹50 lakh or more, the buyer generally deducts 1% TDS from the payment to the seller under Section 194-IA.",
          "GST: rent from commercial property is generally subject to GST, and whether you must register depends on your turnover. Ask a chartered accountant how this applies to you.",
        ],
      },
      {
        heading: "Yield is not the only number that matters",
        paragraphs: [
          "A high yield can signal higher risk: a short remaining lock-in, a weaker tenant, or rent above what the market would pay a new tenant. When comparing two properties, look at net yield together with remaining lock-in, tenant quality, escalation terms and location.",
        ],
      },
    ],
    faqs: [
      {
        question: "What is a good rental yield for commercial property?",
        answer:
          "There is no single good number. Yields vary by location, tenant and lease terms, and a higher yield often comes with higher risk. Compare net yields on similar properties and weigh them against the strength of the lease.",
      },
      {
        question: "Is the yield shown on a listing gross or net?",
        answer:
          "Listing yields are normally gross: annual rent divided by asking price, before costs and taxes. CredXP shows gross yields based on figures shared by the seller.",
      },
      {
        question: "Does rent escalation change the yield?",
        answer:
          "Yes. Yield on your purchase price rises each time the rent escalates. The yield quoted at purchase is based on the current rent only.",
      },
    ],
    related: [
      { label: "Lock-in periods and rent escalation explained", href: "/guides/lock-in-period-and-rent-escalation" },
      { label: "What is a pre-leased commercial property?", href: "/guides/what-is-pre-leased-commercial-property" },
      { label: "Compare investment listings", href: "/invest" },
    ],
  },
  {
    slug: "pre-leased-property-due-diligence-checklist",
    title: "Pre-Leased Property Due Diligence Checklist",
    metaTitle: "Pre-Leased Property Due Diligence Checklist (India)",
    description:
      "A practical checklist for buying a pre-leased office or shop in India: lease, tenant, title, encumbrances, approvals and costs to verify before you pay.",
    summary:
      "Before buying a pre-leased commercial property, verify four things: the lease (rent, lock-in, escalation, exit terms and registration), the tenant (identity and payment record), the title (clear ownership with no undisclosed loans) and the building's approvals. Have a property lawyer review the documents before you sign or pay a deposit.",
    audience: "Investors",
    reviewed: REVIEWED,
    sections: [
      {
        heading: "1. The lease agreement",
        bullets: [
          "Get a full copy of the lease deed and any amendments, not a summary.",
          "Check that the lease is registered. Under the Registration Act, a lease for more than one year must be registered to be fully enforceable.",
          "Note the start date, total term, lock-in period and the notice the tenant must give to leave.",
          "Read the escalation clause: how much the rent rises and how often.",
          "Confirm the security deposit amount, and that it will be transferred to you at sale.",
          "Check who pays maintenance, property tax, insurance and repairs.",
          "Look for clauses that let the tenant exit early, reduce rent, or sublet.",
        ],
      },
      {
        heading: "2. The tenant",
        bullets: [
          "Confirm the tenant's legal name matches the lease.",
          "Ask for proof that rent has been paid: bank statements showing rent credits, and TDS certificates (Form 16A) issued by the tenant.",
          "Ask whether there are rent arrears or disputes.",
          "Consider how much of the building or your income depends on this one tenant.",
          "Ask the seller to arrange a tenant attornment letter, in which the tenant confirms the lease and agrees to pay rent to you.",
        ],
      },
      {
        heading: "3. Title and ownership",
        bullets: [
          "Check the chain of title documents showing how the seller came to own the property.",
          "Search the sub-registrar records for registered sale deeds and mortgages.",
          "If the property is mortgaged, get a no-objection certificate (NOC) from the lender and a plan for closing the loan at sale.",
          "Confirm property tax and maintenance dues are paid up to date.",
          "Check for pending litigation involving the property or the seller.",
        ],
      },
      {
        heading: "4. Building approvals",
        bullets: [
          "Ask for the Occupation Certificate (OC) for the building, issued by the competent authority (in Haryana, DTCP or the municipal corporation, depending on the project).",
          "Confirm the unit is approved for commercial use and the tenant's use matches it.",
          "For projects that fall under RERA, check the registration on the Haryana RERA website (haryanarera.gov.in).",
          "Check fire safety clearance where it applies to the building.",
        ],
      },
      {
        heading: "5. Price and costs",
        bullets: [
          "Work out the net yield, not just the gross yield. See our rental yield guide.",
          "Compare the current rent with rents for similar space nearby. Rent well above market is a risk at renewal.",
          "Budget for stamp duty, registration, legal fees and brokerage.",
          "Plan for TDS: deduct and deposit TDS on the purchase price where Section 194-IA applies.",
        ],
      },
      {
        heading: "Documents to request",
        table: {
          headers: ["Document", "Why it matters"],
          rows: [
            ["Registered lease deed", "Sets out rent, term, lock-in and exit rights"],
            ["Rent receipts and bank statements", "Proves the tenant is paying"],
            ["TDS certificates (Form 16A)", "Independent record of rent paid"],
            ["Title deeds and chain of title", "Proves the seller owns the property"],
            ["Encumbrance search / lender NOC", "Shows there are no undisclosed loans"],
            ["Occupation Certificate", "Shows the building is approved for occupation"],
            ["Latest tax and maintenance receipts", "Shows there are no unpaid dues"],
          ],
        },
        paragraphs: [
          "This checklist is general information, not legal advice. Use a qualified property lawyer for the title and document review.",
        ],
      },
    ],
    faqs: [
      {
        question: "Should the lease on a pre-leased property be registered?",
        answer:
          "Yes. A lease for more than one year must be registered under the Registration Act. An unregistered long lease is harder to enforce, which weakens the income you are paying for.",
      },
      {
        question: "How can I verify that the tenant is really paying rent?",
        answer:
          "Ask for bank statements showing regular rent credits and the TDS certificates (Form 16A) the tenant issues. TDS certificates are useful because they come from the tenant's own tax filings.",
      },
      {
        question: "Where can I check a project's RERA registration in Haryana?",
        answer:
          "On the Haryana Real Estate Regulatory Authority website, haryanarera.gov.in, which lists registered projects and agents.",
      },
    ],
    related: [
      { label: "Lock-in periods and rent escalation explained", href: "/guides/lock-in-period-and-rent-escalation" },
      { label: "How to calculate rental yield", href: "/guides/rental-yield-gross-vs-net" },
      { label: "Talk to a CredXP advisor", href: "/contact" },
    ],
  },
  {
    slug: "lock-in-period-and-rent-escalation",
    title: "Lock-In Period and Rent Escalation in a Commercial Lease",
    metaTitle: "Lock-In Period & Rent Escalation in Commercial Leases",
    description:
      "What a lock-in period and rent escalation mean in a commercial lease, how they affect a pre-leased investment, and a worked escalation example.",
    summary:
      "A lock-in period is the part of a commercial lease during which the tenant cannot end the lease without penalty. Rent escalation is the agreed increase in rent at set intervals, such as 15% every three years. For an investor, the remaining lock-in shows how long the income is protected, and the escalation shows how it is expected to grow.",
    audience: "Investors",
    reviewed: REVIEWED,
    sections: [
      {
        heading: "What a lock-in period means",
        paragraphs: [
          "During the lock-in, the tenant has agreed not to leave. If they do, the lease usually requires them to pay rent for the rest of the lock-in or another agreed penalty. After the lock-in ends, the tenant can typically leave by giving the notice set out in the lease, even if the total lease term is much longer.",
          "What matters to a buyer is the remaining lock-in, not the original one. A nine-year lease with a three-year lock-in that started two years ago has about one year of lock-in left.",
        ],
      },
      {
        heading: "Lease term vs lock-in",
        table: {
          headers: ["Term", "Meaning"],
          rows: [
            ["Lease term", "Total period the lease can run, e.g. 9 years"],
            ["Lock-in period", "Period in which the tenant cannot exit without penalty, e.g. the first 3 years"],
            ["Notice period", "Notice the tenant must give to leave after the lock-in"],
            ["Renewal", "Whether and on what terms the lease can be extended"],
          ],
        },
      },
      {
        heading: "What rent escalation means",
        paragraphs: [
          "Escalation clauses raise the rent at fixed intervals. Common structures are a percentage every year, or a larger percentage every three years. The clause should say exactly when the increase applies and what it is calculated on.",
        ],
      },
      {
        heading: "Worked escalation example",
        paragraphs: ["Illustration: starting rent of ₹60,000 a month with 15% escalation every three years."],
        table: {
          headers: ["Years", "Monthly rent"],
          rows: [
            ["1–3", "₹60,000"],
            ["4–6", "₹69,000"],
            ["7–9", "₹79,350"],
          ],
          caption: "Each increase is applied to the rent of the previous period.",
        },
      },
      {
        heading: "How these terms affect an investment",
        bullets: [
          "A longer remaining lock-in lowers the risk of an early vacancy.",
          "Escalation increases your income over time, but only while the tenant stays.",
          "If the lock-in ends soon after you buy, price the property as if the tenant might leave.",
          "Check whether the landlord is also locked in, and on what grounds either side can terminate early.",
        ],
      },
    ],
    faqs: [
      {
        question: "Can a tenant leave during the lock-in period?",
        answer:
          "A tenant can leave, but the lease usually makes them pay rent for the remaining lock-in or another agreed penalty. The exact consequence depends on the lease wording.",
      },
      {
        question: "What happens when the lock-in period ends?",
        answer:
          "The tenant can usually leave by giving the notice in the lease. Many tenants stay, but the investor should plan for the possibility of a vacancy and re-letting costs.",
      },
      {
        question: "Is 15% escalation every three years standard?",
        answer:
          "It is a commonly seen structure, but escalation terms are negotiated and vary by lease. Always read the actual clause.",
      },
    ],
    related: [
      { label: "Pre-leased property due diligence checklist", href: "/guides/pre-leased-property-due-diligence-checklist" },
      { label: "What is a pre-leased commercial property?", href: "/guides/what-is-pre-leased-commercial-property" },
      { label: "See pre-leased listings with lease details", href: "/invest" },
    ],
  },
  {
    slug: "leasing-office-space-in-gurugram",
    title: "Leasing Office Space in Gurugram: What Businesses Should Check",
    metaTitle: "Leasing Office Space in Gurugram: A Checklist for Businesses",
    description:
      "What to consider before leasing an office in Gurugram: carpet vs super area, total occupancy cost, lease terms, approvals, fit-out and location.",
    summary:
      "Before leasing office space in Gurugram, compare options on total monthly cost (rent plus maintenance, power and parking), not rent alone. Confirm the carpet area you can actually use, the lock-in and escalation terms, the security deposit, and that the building has an Occupation Certificate. Then check commute access for your team.",
    audience: "Businesses",
    reviewed: REVIEWED,
    sections: [
      {
        heading: "Start with your requirement",
        bullets: [
          "Headcount today and expected in two to three years.",
          "Number of workstations, cabins, meeting rooms and any special rooms.",
          "Furnished, warm-shell or bare-shell space, and your fit-out budget.",
          "Preferred locations based on where your team lives and travels from.",
          "Move-in date and how long you want to commit for.",
        ],
        paragraphs: [
          "Sharing this brief at the start lets an advisor shortlist relevant buildings instead of sending every available option.",
        ],
      },
      {
        heading: "Carpet area vs super area",
        paragraphs: [
          "Office rent in Gurugram is often quoted on super (or chargeable) area, which includes a share of common areas such as lobbies and corridors. The area you can actually use is the carpet area. Two offices with the same super area can have different usable space, so ask for the carpet area and compare cost per usable square foot.",
        ],
      },
      {
        heading: "Total cost of occupancy",
        table: {
          headers: ["Cost", "What to ask"],
          rows: [
            ["Rent", "Rate per sq ft, and on which area it is charged"],
            ["Maintenance (CAM)", "Monthly rate, and what it covers"],
            ["Power and backup", "Metering, backup capacity and charges"],
            ["Parking", "Number of included slots and cost of extra slots"],
            ["Security deposit", "Number of months and refund conditions"],
            ["Fit-out", "Who pays, and whether a rent-free fit-out period is offered"],
            ["Taxes", "GST on rent and how it is invoiced"],
          ],
        },
      },
      {
        heading: "Lease terms to negotiate",
        bullets: [
          "Lock-in period and notice period. A shorter lock-in gives your business more flexibility.",
          "Rent escalation: how much and how often.",
          "Rent-free period for fit-out.",
          "Exit, renewal and expansion options, such as first right on adjacent space.",
          "Registration of the lease, and who bears the stamp duty.",
        ],
      },
      {
        heading: "Building checks",
        bullets: [
          "Occupation Certificate and fire safety clearance for the building.",
          "Power backup, lifts, air conditioning and maintenance quality.",
          "Commute: distance to metro or Rapid Metro stations and main roads your team uses.",
          "Parking, food options and security.",
        ],
      },
      {
        heading: "When coworking or a managed office makes sense",
        paragraphs: [
          "If your team is small, growing fast, or unsure of its long-term needs, a coworking or managed office can be quicker to move into, with shorter commitments and no fit-out cost. A conventional lease usually costs less per seat for larger, stable teams.",
        ],
      },
    ],
    faqs: [
      {
        question: "Is office rent in Gurugram charged on carpet area or super area?",
        answer:
          "It is often quoted on super or chargeable area, which includes a share of common areas. Always ask for the carpet area as well, so you can compare usable space.",
      },
      {
        question: "What costs are there besides rent?",
        answer:
          "Typically maintenance charges, power and backup, parking, GST on rent, a refundable security deposit, and fit-out costs unless the space is furnished.",
      },
      {
        question: "How can CredXP help with office leasing?",
        answer:
          "Share your headcount, budget, location and move-in date. A CredXP advisor will shortlist suitable offices, arrange site visits and help with the lease terms.",
      },
    ],
    related: [
      { label: "Office space and shops for rent in Gurugram", href: "/lease" },
      { label: "Coworking and managed offices", href: "/coworking" },
      { label: "Share your space requirement", href: "/contact" },
    ],
  },
];

export function getGuide(slug: string): Guide | undefined {
  return guides.find((guide) => guide.slug === slug);
}
