const Parser = require("rss-parser");

const parser = new Parser({
  timeout: 10000,
  headers: { "User-Agent": "CredXP/1.0" },
  customFields: {
    item: [
      ["media:content", "mediaContent", { keepArray: true }],
      ["media:thumbnail", "mediaThumbnail", { keepArray: true }],
      ["content:encoded", "contentEncoded"],
    ],
  },
});

let cache = { items: [], fetchedAt: 0 };

const FALLBACK_ITEMS = [
  {
    id: "fallback-1",
    category: "Market Update",
    title: "Gurugram Grade A absorption continues to outpace supply",
    excerpt: "Commercial real estate activity remains strong across NCR micro-markets.",
    date: new Date().toISOString(),
    imageUrl: "",
    sourceUrl: "/insights",
  },
  {
    id: "fallback-2",
    category: "Investment",
    title: "Pre-leased assets remain the strongest risk-adjusted entry point",
    excerpt: "Investor demand is concentrating around income-generating office and retail assets.",
    date: new Date(Date.now() - 5 * 86400000).toISOString(),
    imageUrl: "",
    sourceUrl: "/insights",
  },
  {
    id: "fallback-3",
    category: "Coworking",
    title: "Enterprise demand is consolidating around managed office models",
    excerpt: "Flexible workspace operators continue to expand across Gurugram corridors.",
    date: new Date(Date.now() - 10 * 86400000).toISOString(),
    imageUrl: "",
    sourceUrl: "/insights",
  },
];

function getFeedUrls() {
  const raw = process.env.INSIGHTS_RSS_FEEDS || "";
  return raw.split(",").map((url) => url.trim()).filter(Boolean);
}

function inferCategory(text = "") {
  const value = text.toLowerCase();
  if (value.includes("cowork") || value.includes("flex") || value.includes("workspace")) return "Coworking";
  if (value.includes("invest") || value.includes("yield") || value.includes("return")) return "Investment";
  return "Market Update";
}

function decodeHtml(value = "") {
  return String(value)
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function pickUrl(value) {
  if (!value) return "";
  if (typeof value === "string" && /^https?:\/\//i.test(value)) return decodeHtml(value);
  if (typeof value === "object") {
    const nested = value.$?.url || value.url || value.href;
    if (typeof nested === "string" && /^https?:\/\//i.test(nested)) return decodeHtml(nested);
  }
  return "";
}

function extractImageFromHtml(html = "") {
  const patterns = [
    /<img[^>]+src=["']([^"']+)["']/i,
    /<img[^>]+data-src=["']([^"']+)["']/i,
  ];

  for (const pattern of patterns) {
    const match = String(html).match(pattern);
    if (match?.[1]) return decodeHtml(match[1]);
  }

  return "";
}

function upgradeImageUrl(url = "") {
  const decoded = decodeHtml(url);
  if (!decoded) return "";

  const b2bMatch = decoded.match(/etb2bimg\.com\/thumb\/img-size-\d+\/(\d+)\.cms/i);
  if (b2bMatch) {
    return `https://etimg.etb2bimg.com/photo/${b2bMatch[1]}.cms`;
  }

  const msidMatch = decoded.match(/etb2bimg\.com\/thumb\/msid-(\d+)/i);
  if (msidMatch) {
    return `https://etimg.etb2bimg.com/photo/${msidMatch[1]}.cms`;
  }

  if (decoded.includes("img.etimg.com/thumb/")) {
    return decoded
      .replace(/width-\d+,height-\d+/gi, "width-1200,height-800")
      .replace(/width-\d+/gi, "width-1200");
  }

  if (decoded.includes("moneycontrol.com") && decoded.includes("/thumb/")) {
    return decoded.replace("/thumb/", "/large/");
  }

  return decoded;
}

function extractImage(item) {
  if (Array.isArray(item.mediaContent)) {
    for (const entry of item.mediaContent) {
      const url = pickUrl(entry);
      if (url) return url;
    }
  }

  if (Array.isArray(item.mediaThumbnail)) {
    for (const entry of item.mediaThumbnail) {
      const url = pickUrl(entry);
      if (url) return url;
    }
  }

  if (item.enclosure?.url && /image|jpeg|jpg|png|webp/i.test(item.enclosure.type || item.enclosure.url)) {
    return pickUrl(item.enclosure.url);
  }

  const htmlSources = [item.content, item.contentEncoded, item.summary, item["content:encoded"]];
  for (const html of htmlSources) {
    const url = extractImageFromHtml(html);
    if (url) return url;
  }

  return "";
}

async function fetchOgImage(url) {
  if (!url || !/^https?:\/\//i.test(url)) return "";

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const response = await fetch(url, {
      headers: { "User-Agent": "CredXP/1.0" },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) return "";

    const html = await response.text();
    const patterns = [
      /<meta[^>]+property=["']og:image(?::secure_url)?["'][^>]+content=["']([^"']+)["']/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image(?::secure_url)?["']/i,
      /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i,
    ];

    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match?.[1]) return decodeHtml(match[1]);
    }
  } catch {
    return "";
  }

  return "";
}

async function enrichArticleImages(items, maxFetches = 12) {
  const targets = items
    .filter((item) => item.sourceUrl.startsWith("http"))
    .slice(0, maxFetches);

  if (!targets.length) return items;

  const enriched = await Promise.all(
    targets.map(async (item) => {
      const ogImage = upgradeImageUrl(await fetchOgImage(item.sourceUrl));
      const imageUrl = ogImage || item.imageUrl || "";
      return { id: item.id, imageUrl };
    })
  );

  const enrichedMap = new Map(enriched.map((item) => [item.id, item.imageUrl]));
  return items.map((item) => ({
    ...item,
    imageUrl: upgradeImageUrl(enrichedMap.get(item.id) || item.imageUrl || ""),
  }));
}

function normalizeItem(item, feedTitle = "") {
  const title = item.title?.trim() || "Untitled";
  const sourceUrl = item.link || item.guid || "";
  const excerpt = (item.contentSnippet || item.summary || item.content || "")
    .replace(/<[^>]+>/g, "")
    .trim()
    .slice(0, 180);
  const date = item.isoDate || item.pubDate || new Date().toISOString();

  const rawImage = extractImage(item);

  return {
    id: sourceUrl || `${feedTitle}-${title}`,
    category: inferCategory(`${feedTitle} ${title} ${excerpt}`),
    title,
    excerpt,
    date,
    imageUrl: upgradeImageUrl(rawImage),
    sourceUrl,
  };
}

async function fetchInsights(limit = 6) {
  const ttl = Number(process.env.INSIGHTS_CACHE_TTL_MS || 900000);
  const feedUrls = getFeedUrls();

  if (cache.items.length && Date.now() - cache.fetchedAt < ttl) {
    return cache.items.slice(0, limit);
  }

  if (!feedUrls.length) {
    return FALLBACK_ITEMS.slice(0, limit);
  }

  try {
    const results = await Promise.all(
      feedUrls.map(async (url) => {
        try {
          const feed = await parser.parseURL(url);
          return (feed.items || []).map((item) => normalizeItem(item, feed.title || ""));
        } catch {
          return [];
        }
      })
    );

    const merged = results
      .flat()
      .filter((item) => item.title && item.sourceUrl)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const unique = [];
    const seen = new Set();
    for (const item of merged) {
      const key = item.sourceUrl || item.title;
      if (seen.has(key)) continue;
      seen.add(key);
      unique.push(item);
    }

    if (unique.length) {
      const withImages = await enrichArticleImages(unique, Math.max(limit * 2, 12));
      cache = { items: withImages, fetchedAt: Date.now() };
      return withImages.slice(0, limit);
    }
  } catch {
    // fall through to cache/fallback
  }

  if (cache.items.length) return cache.items.slice(0, limit);
  return FALLBACK_ITEMS.slice(0, limit);
}

module.exports = { fetchInsights };
