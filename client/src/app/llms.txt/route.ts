import { siteConfig } from "@/config/site";
import { MIN_INDEXABLE_LISTINGS } from "@/config/locations";
import { fetchListingsByArea } from "@/lib/locations";
import { guides } from "@/content/guides";

// llms.txt (https://llmstxt.org): a plain-text map of the site for AI search crawlers.
export const revalidate = 3600;

export async function GET() {
  // Same rule as the sitemap: only areas with enough listings to be indexable.
  const areas = (await fetchListingsByArea().catch(() => []))
    .filter((group) => group.total >= MIN_INDEXABLE_LISTINGS)
    .map((group) => group.area);
  const base = siteConfig.url.replace(/\/$/, "");
  const body = `# ${siteConfig.name}

> ${siteConfig.description}

${siteConfig.name} lists pre-leased commercial offices, shops and SCO units for investment, office and retail space for lease, and partner coworking spaces, mainly in Gurugram and Delhi NCR. Each listing shows price or rent, size, tenant (where pre-leased) and gross rental yield. Contact: ${siteConfig.contact.email}, ${siteConfig.contact.phone}.

## Listings
- [Invest in pre-leased commercial property](${base}/invest): offices, shops and SCO units with existing tenants
- [Office and retail space for lease](${base}/lease): furnished and bare-shell offices and high-street shops for rent
- [Coworking spaces](${base}/coworking): partner coworking and managed offices
- [Commercial property in Gurugram by location](${base}/gurugram)

## Gurugram locations
${areas.map((area) => `- [${area.name}](${base}/gurugram/${area.slug})`).join("\n")}

## Guides
${guides.map((guide) => `- [${guide.title}](${base}/guides/${guide.slug}): ${guide.description}`).join("\n")}

## Company
- [About ${siteConfig.name}](${base}/about)
- [Contact](${base}/contact)
- [Market insights](${base}/insights)
- [Sitemap](${base}/sitemap.xml)
`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
