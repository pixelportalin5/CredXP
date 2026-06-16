import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import type { Proposal } from "@/types/proposal";
import { prepareProposalForPdf } from "@/utils/prepareProposalForPdf";
import { A4_HEIGHT_PX, A4_WIDTH_PX, mountProposalDocument } from "@/utils/renderProposalDocument";

export { toSafeCurrency } from "@/utils/pdfFormat";

const PDF_WIDTH_PT = 595.28;
const PDF_HEIGHT_PT = 841.89;

// ─────────────────────────────────────────────────────────────────────────────
// Tailwind v4 uses oklch()/lab() colors. html2canvas v1 cannot parse these.
// Strategy:
//   1. Mount ProposalDocument in a throwaway container (mode="export")
//   2. BEFORE html2canvas: read getComputedStyle() from the live DOM (which
//      the browser has resolved to rgb()) and bake every property as an inline
//      style directly on the same element. Then strip all class attributes.
//   3. In html2canvas onclone: remove ALL stylesheets (both <style> and <link>)
//      from the cloned document. The clone already inherits the baked inline
//      styles, so html2canvas never has to parse any oklch.
// ─────────────────────────────────────────────────────────────────────────────

const MODERN_COLOR_RE = /(?:lab|oklch|lch|oklab)\(/i;

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function linearSrgbToByte(value: number): number {
  const clamped = clamp01(value);
  const srgb =
    clamped <= 0.0031308
      ? 12.92 * clamped
      : 1.055 * Math.pow(clamped, 1 / 2.4) - 0.055;
  return Math.round(clamp01(srgb) * 255);
}

function normalizeOklchLightness(raw: string): number {
  const value = Number.parseFloat(raw);
  return raw.trim().endsWith("%") ? value / 100 : value;
}

function oklchToRgb(value: string): string | null {
  const match = value.match(/oklch\(\s*([\d.]+%?)\s+([\d.]+)\s+([-\d.]+)(?:deg)?(?:\s*\/\s*([\d.]+%?))?\s*\)/i);
  if (!match) return null;

  const l = normalizeOklchLightness(match[1]);
  const c = Number.parseFloat(match[2]);
  const h = (Number.parseFloat(match[3]) * Math.PI) / 180;
  const alpha = match[4]
    ? match[4].endsWith("%")
      ? Number.parseFloat(match[4]) / 100
      : Number.parseFloat(match[4])
    : 1;

  const a = c * Math.cos(h);
  const b = c * Math.sin(h);

  const lPrime = l + 0.3963377774 * a + 0.2158037573 * b;
  const mPrime = l - 0.1055613458 * a - 0.0638541728 * b;
  const sPrime = l - 0.0894841775 * a - 1.291485548 * b;

  const lCubed = lPrime * lPrime * lPrime;
  const mCubed = mPrime * mPrime * mPrime;
  const sCubed = sPrime * sPrime * sPrime;

  const r = 4.0767416621 * lCubed - 3.3077115913 * mCubed + 0.2309699292 * sCubed;
  const g = -1.2684380046 * lCubed + 2.6097574011 * mCubed - 0.3413193965 * sCubed;
  const blue = -0.0041960863 * lCubed - 0.7034186147 * mCubed + 1.707614701 * sCubed;

  const rgb = `${linearSrgbToByte(r)}, ${linearSrgbToByte(g)}, ${linearSrgbToByte(blue)}`;
  return alpha < 1 ? `rgba(${rgb}, ${clamp01(alpha)})` : `rgb(${rgb})`;
}

function sanitizeModernColorFunctions(value: string, fallback = "rgb(15, 23, 42)"): string {
  return value.replace(
    /(?:oklch|oklab|lab|lch)\((?:[^()]*|\([^()]*\))*\)/gi,
    (color) => oklchToRgb(color) ?? fallback
  );
}

/** Resolve a single oklch/lab color to an html2canvas-safe rgb value. */
function resolveColorToRgb(value: string, kind: "color" | "bg"): string {
  const trimmed = value.trim();
  if (!trimmed || !MODERN_COLOR_RE.test(trimmed)) return trimmed;

  const convertedOklch = oklchToRgb(trimmed);
  if (convertedOklch) return convertedOklch;

  try {
    const probe = document.createElement("span");
    probe.style.position = "fixed";
    probe.style.left = "-9999px";
    probe.style.top = "-9999px";
    probe.style.pointerEvents = "none";
    if (kind === "bg") {
      probe.style.backgroundColor = trimmed;
    } else {
      probe.style.color = trimmed;
    }
    document.body.appendChild(probe);
    const resolved = kind === "bg"
      ? window.getComputedStyle(probe).backgroundColor
      : window.getComputedStyle(probe).color;
    probe.remove();
    if (resolved && !MODERN_COLOR_RE.test(resolved)) return resolved;
  } catch {
    // fall through
  }

  try {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (ctx) {
      ctx.fillStyle = "rgb(255, 0, 255)";
      ctx.clearRect(0, 0, 1, 1);
      ctx.fillStyle = trimmed;
      if (ctx.fillStyle === "rgb(255, 0, 255)" || ctx.fillStyle === "#ff00ff") {
        return kind === "bg" ? "transparent" : "#0f172a";
      }
      ctx.fillRect(0, 0, 1, 1);
      const data = ctx.getImageData(0, 0, 1, 1).data;
      return `rgba(${data[0]}, ${data[1]}, ${data[2]}, ${data[3] / 255})`;
    }
  } catch {
    // fall through
  }

  return kind === "bg" ? "transparent" : "#0f172a";
}

const COLOR_PROP_SET = new Set([
  "color", "background-color",
  "border-top-color", "border-right-color", "border-bottom-color", "border-left-color",
  "outline-color", "text-decoration-color", "column-rule-color",
  "fill", "stroke", "stop-color", "flood-color", "lighting-color",
  "caret-color", "accent-color",
]);

/** Sanitize a single computed CSS value — convert any oklch/lab to rgb. */
function safeCssValue(prop: string, raw: string): string {
  if (!raw || !MODERN_COLOR_RE.test(raw)) return raw;

  if (COLOR_PROP_SET.has(prop) || prop.endsWith("-color")) {
    return resolveColorToRgb(raw, prop === "background-color" ? "bg" : "color");
  }

  // Non-color props (e.g. background-image with gradients) — regex replace,
  // handling up to 2 levels of nested parens: oklch(from var(--x) l c h)
  return sanitizeModernColorFunctions(raw);
}

/**
 * Walk every element under `root` and bake all resolved computed styles as
 * inline styles on the same element. Since we read from getComputedStyle
 * (which the browser has resolved to rgb), this eliminates all oklch/lab.
 *
 * MUTATES `root` — only use on a throwaway DOM subtree.
 */
function bakeComputedStylesInPlace(root: HTMLElement) {
  const els = root.querySelectorAll<HTMLElement | SVGElement>("*");
  const all = [root as HTMLElement | SVGElement, ...Array.from(els)];

  for (const el of all) {
    const cs = window.getComputedStyle(el);
    // getComputedStyle enumerates only longhand properties when indexed
    for (let i = 0; i < cs.length; i++) {
      const prop = cs[i];
      const raw = cs.getPropertyValue(prop);
      if (!raw) continue;
      const value = safeCssValue(prop, raw);
      if (value) {
        try {
          el.style.setProperty(prop, value);
        } catch {
          // Some properties (e.g. webkit internals) can't be set — skip
        }
      }
    }
  }
}

/** Strip all class attributes so no Tailwind rule can override inline styles. */
function stripClasses(root: HTMLElement) {
  root.removeAttribute("class");
  root.querySelectorAll("[class]").forEach((el) => el.removeAttribute("class"));
}

function assertCanvasHasContent(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d");
  if (!ctx || canvas.width === 0 || canvas.height === 0) {
    throw new Error("PDF export failed: empty canvas.");
  }

  const x0 = Math.max(0, Math.floor(canvas.width / 2) - 50);
  const y0 = Math.max(0, Math.floor(canvas.height / 2) - 50);
  const w = Math.min(100, canvas.width - x0);
  const h = Math.min(100, canvas.height - y0);
  const sample = ctx.getImageData(x0, y0, w, h).data;

  for (let i = 0; i < sample.length; i += 4) {
    const r = sample[i], g = sample[i + 1], b = sample[i + 2], a = sample[i + 3];
    if (a > 0 && (r < 250 || g < 250 || b < 250)) return; // non-white pixel found
  }

  throw new Error("PDF export failed: rendered page appears blank.");
}

export async function generateProposalPdf(
  proposal: Proposal,
  options?: { coverImageFallback?: string }
): Promise<jsPDF> {
  const exportProposal = await prepareProposalForPdf(proposal, options);
  const { container, unmount } = await mountProposalDocument(exportProposal);

  try {
    const docRoot = container.querySelector("[data-proposal-document]") as HTMLElement | null;
    const captureEl = docRoot ?? container;
    const captureHeight = Math.max(captureEl.scrollHeight, A4_HEIGHT_PX);

    // ── Phase 1: Bake all computed styles as inline styles on the live DOM ──
    // The container is a throwaway element, so mutating it is safe.
    // After this, every element has explicit inline rgb() styles for every
    // CSS property — no stylesheet rules are needed anymore.
    console.log("[PDF] Baking computed styles…");
    bakeComputedStylesInPlace(captureEl);

    // ── Phase 2: Strip all class attributes ──
    // Prevents any remaining stylesheet rule from overriding our inline styles
    // when html2canvas clones the DOM.
    stripClasses(captureEl);

    // ── Phase 3: html2canvas capture ──
    // The onclone callback removes ALL stylesheets from the clone so
    // html2canvas never encounters oklch/lab during CSS parsing.
    // The inline styles we baked in Phase 1 are preserved in the clone.
    console.log("[PDF] Starting html2canvas capture…");
    const canvas = await html2canvas(captureEl, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      width: A4_WIDTH_PX,
      height: captureHeight,
      windowWidth: A4_WIDTH_PX,
      windowHeight: captureHeight,
      logging: false,
      imageTimeout: 15000,
      onclone: (clonedDoc) => {
        // Nuke external stylesheets (Tailwind bundles).
        clonedDoc.querySelectorAll('link[rel="stylesheet"]').forEach((node) => node.remove());

        // We MUST keep <style> tags so @font-face rules (like Geist) survive,
        // which prevents text from cramping up due to serif fallback fonts.
        // However, html2canvas will choke if it parses oklch() inside them.
        // We sanitize their text content to replace any oklch() with rgb().
        clonedDoc.querySelectorAll("style").forEach((node) => {
          if (node.textContent) {
            node.textContent = sanitizeModernColorFunctions(node.textContent);
          }
        });
      },
    });

    console.log("[PDF] Canvas captured:", canvas.width, "x", canvas.height);
    assertCanvasHasContent(canvas);

    // ── Phase 4: Build the PDF ──
    const doc = new jsPDF({ unit: "pt", format: "a4", compress: true });
    const imageData = canvas.toDataURL("image/jpeg", 0.92);
    const imgWidth = PDF_WIDTH_PT;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    const pageCount = Math.max(1, Math.ceil(imgHeight / PDF_HEIGHT_PT));

    for (let pageIndex = 0; pageIndex < pageCount; pageIndex += 1) {
      if (pageIndex > 0) doc.addPage();
      doc.addImage(
        imageData,
        "JPEG",
        0,
        -pageIndex * PDF_HEIGHT_PT,
        imgWidth,
        imgHeight
      );
    }
    console.log("[PDF] PDF generated successfully");
    return doc;
  } catch (error) {
    console.error("[PDF] Export failed:", error);
    throw error;
  } finally {
    unmount();
  }
}

export async function downloadProposalPdf(
  proposal: Proposal,
  options?: { coverImageFallback?: string }
) {
  const doc = await generateProposalPdf(proposal, options);
  const safeName = proposal.propertyTitle.replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-").slice(0, 60);
  doc.save(`CredXP-Proposal-${safeName || proposal._id}.pdf`);
}

export async function getProposalPdfBlob(
  proposal: Proposal,
  options?: { coverImageFallback?: string }
): Promise<Blob> {
  const doc = await generateProposalPdf(proposal, options);
  return doc.output("blob");
}

export async function getProposalPdfFile(
  proposal: Proposal,
  options?: { coverImageFallback?: string }
): Promise<File> {
  const blob = await getProposalPdfBlob(proposal, options);
  const safeName = proposal.propertyTitle.replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-").slice(0, 60);
  return new File([blob], `CredXP-Proposal-${safeName || proposal._id}.pdf`, { type: "application/pdf" });
}
