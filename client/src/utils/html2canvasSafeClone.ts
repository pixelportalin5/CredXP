const MODERN_COLOR_FN = /(?:lab|oklch|lch|oklab)\(/i;

/** Avoid shorthands — they may embed lab() from Tailwind v4 computed styles. */
const INLINE_PROPS = [
  "display",
  "position",
  "top",
  "right",
  "bottom",
  "left",
  "width",
  "height",
  "min-width",
  "min-height",
  "max-width",
  "max-height",
  "margin-top",
  "margin-right",
  "margin-bottom",
  "margin-left",
  "padding-top",
  "padding-right",
  "padding-bottom",
  "padding-left",
  "border-top-width",
  "border-right-width",
  "border-bottom-width",
  "border-left-width",
  "border-top-style",
  "border-right-style",
  "border-bottom-style",
  "border-left-style",
  "border-top-color",
  "border-right-color",
  "border-bottom-color",
  "border-left-color",
  "border-radius",
  "border-top-left-radius",
  "border-top-right-radius",
  "border-bottom-left-radius",
  "border-bottom-right-radius",
  "background-color",
  "background-image",
  "background-size",
  "background-position",
  "background-repeat",
  "color",
  "font-family",
  "font-size",
  "font-weight",
  "font-style",
  "line-height",
  "letter-spacing",
  "text-align",
  "text-transform",
  "text-decoration",
  "flex-direction",
  "flex-wrap",
  "flex-grow",
  "flex-shrink",
  "flex-basis",
  "align-items",
  "align-content",
  "align-self",
  "justify-content",
  "justify-items",
  "justify-self",
  "gap",
  "row-gap",
  "column-gap",
  "grid-template-columns",
  "grid-template-rows",
  "grid-column",
  "grid-row",
  "overflow",
  "overflow-x",
  "overflow-y",
  "opacity",
  "visibility",
  "box-sizing",
  "object-fit",
  "object-position",
  "clip-path",
  "white-space",
  "word-break",
  "vertical-align",
  "list-style-type",
  "fill",
  "stroke",
  "text-overflow",
  "word-wrap",
  "overflow-wrap",
  "-webkit-line-clamp",
  "-webkit-box-orient",
  "box-orient",
  "z-index",
  "transform",
  "order",
];

const COLOR_PROPS = new Set([
  "color",
  "background-color",
  "border-top-color",
  "border-right-color",
  "border-bottom-color",
  "border-left-color",
  "outline-color",
  "fill",
  "stroke",
]);

let colorCanvas: HTMLCanvasElement | null = null;

function canvasContext(): CanvasRenderingContext2D | null {
  if (typeof document === "undefined") return null;
  if (!colorCanvas) colorCanvas = document.createElement("canvas");
  return colorCanvas.getContext("2d");
}

/** Resolve lab()/oklch() via a live DOM probe — canvas fillStyle often fails and returned #000000. */
export function toHtml2CanvasSafeColor(value: string, kind: "color" | "background" = "color"): string {
  const trimmed = value.trim();
  if (!trimmed || !MODERN_COLOR_FN.test(trimmed)) return trimmed;

  if (typeof document !== "undefined") {
    try {
      const probe = document.createElement("span");
      probe.style.display = "none";
      probe.style.position = "fixed";
      probe.style.pointerEvents = "none";
      if (kind === "background") {
        probe.style.backgroundColor = trimmed;
      } else {
        probe.style.color = trimmed;
      }
      document.body.appendChild(probe);
      const cs = window.getComputedStyle(probe);
      const resolved = kind === "background" ? cs.backgroundColor : cs.color;
      probe.remove();
      if (resolved && !MODERN_COLOR_FN.test(resolved)) return resolved;
    } catch {
      // fall through to canvas
    }
  }

  const ctx = canvasContext();
  if (!ctx) return kind === "background" ? "transparent" : "#000000";

  try {
    ctx.fillStyle = "#000000";
    ctx.fillStyle = trimmed;
    const resolved = ctx.fillStyle;
    if (resolved && !MODERN_COLOR_FN.test(resolved)) return resolved;
  } catch {
    // fall through
  }

  return kind === "background" ? "transparent" : "#64748b";
}

function colorKindForProp(prop: string): "color" | "background" {
  if (prop === "background-color") return "background";
  return "color";
}

function sanitizeStyleValue(prop: string, value: string): string {
  if (!value) return value;
  if (!MODERN_COLOR_FN.test(value)) return value;
  if (COLOR_PROPS.has(prop) || prop.endsWith("-color")) {
    return toHtml2CanvasSafeColor(value, colorKindForProp(prop));
  }
  return value
    .replace(/lab\([^)]*\)/gi, "rgb(100, 116, 139)")
    .replace(/oklch\([^)]*\)/gi, "rgb(100, 116, 139)")
    .replace(/oklab\([^)]*\)/gi, "rgb(100, 116, 139)")
    .replace(/lch\([^)]*\)/gi, "rgb(100, 116, 139)");
}

function countModernColorFns(cssText: string): number {
  const matches = cssText.match(/(?:lab|oklch|lch|oklab)\(/gi);
  return matches?.length ?? 0;
}

function applyComputedStyles(source: Element, target: Element) {
  const computed = window.getComputedStyle(source);
  const styleTarget =
    target instanceof HTMLElement || target instanceof SVGElement
      ? (target as HTMLElement | SVGElement)
      : null;
  if (!styleTarget) return;

  for (const prop of INLINE_PROPS) {
    const raw = computed.getPropertyValue(prop);
    if (!raw) continue;
    const value = sanitizeStyleValue(prop, raw);
    if (value) {
      styleTarget.style.setProperty(prop, value, computed.getPropertyPriority(prop));
    }
  }
}

/** Inline every resolved computed property (canvas-safe) so PDF export survives stylesheet removal. */
function inlineAllComputedStyles(source: Element, target: Element) {
  const computed = window.getComputedStyle(source);
  const styleTarget =
    target instanceof HTMLElement || target instanceof SVGElement
      ? (target as HTMLElement | SVGElement)
      : null;
  if (!styleTarget) return;

  for (let i = 0; i < computed.length; i += 1) {
    const prop = computed[i];
    const raw = computed.getPropertyValue(prop);
    if (!raw) continue;
    const value = sanitizeStyleValue(prop, raw);
    if (value) {
      styleTarget.style.setProperty(prop, value, computed.getPropertyPriority(prop));
    }
  }
}

function copyInlineStyleAttributes(sourceRoot: Element, targetRoot: Element) {
  const sourceNodes: Element[] = [];
  const targetNodes: Element[] = [];

  walkElements(sourceRoot, (el) => sourceNodes.push(el));
  walkElements(targetRoot, (el) => targetNodes.push(el));

  const count = Math.min(sourceNodes.length, targetNodes.length);
  for (let i = 0; i < count; i += 1) {
    const source = sourceNodes[i] as HTMLElement;
    const target = targetNodes[i] as HTMLElement;
    if (!source?.style || !target?.style) continue;
    if (source.style.cssText) {
      target.style.cssText = source.style.cssText;
    }
  }
}

function removeAllDocumentStyles(clonedDoc: Document) {
  clonedDoc.querySelectorAll('style, link[rel="stylesheet"]').forEach((node) => node.remove());
}

type StylesheetSnapshot = {
  el: Element;
  media: string | null;
  linkDisabled: boolean;
};

/** Disable page stylesheets so html2canvas does not parse Tailwind v4 lab()/oklch() rules. */
export async function withPageStylesheetsDisabled<T>(run: () => Promise<T>): Promise<T> {
  if (typeof document === "undefined") return run();

  const nodes = Array.from(document.querySelectorAll("style, link[rel=\"stylesheet\"]"));
  const snapshot: StylesheetSnapshot[] = nodes.map((el) => ({
    el,
    media: el.getAttribute("media"),
    linkDisabled: el instanceof HTMLLinkElement ? el.disabled : false,
  }));

  nodes.forEach((el) => {
    if (el instanceof HTMLLinkElement) {
      el.disabled = true;
    } else {
      el.setAttribute("media", "notall");
    }
  });

  try {
    return await run();
  } finally {
    snapshot.forEach(({ el, media, linkDisabled }) => {
      if (el instanceof HTMLLinkElement) {
        el.disabled = linkDisabled;
      } else if (media) {
        el.setAttribute("media", media);
      } else {
        el.removeAttribute("media");
      }
    });
  }
}

function walkElements(root: ParentNode, callback: (el: Element) => void) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
  let current = walker.currentNode as Element | null;
  while (current) {
    callback(current);
    current = walker.nextNode() as Element | null;
  }
}

function copyComputedStyles(sourceRoot: Element, targetRoot: Element) {
  const sourceNodes: Element[] = [];
  const targetNodes: Element[] = [];

  walkElements(sourceRoot, (el) => sourceNodes.push(el));
  walkElements(targetRoot, (el) => targetNodes.push(el));

  const count = Math.min(sourceNodes.length, targetNodes.length);
  for (let i = 0; i < count; i += 1) {
    applyComputedStyles(sourceNodes[i], targetNodes[i]);
  }
}

function stripTailwindClasses(root: HTMLElement) {
  walkElements(root, (el) => {
    el.removeAttribute("class");
  });
}

function stripLabFromInlineStyles(root: Element) {
  root.querySelectorAll<HTMLElement>("[style]").forEach((el) => {
    const style = el.style;
    for (let i = style.length - 1; i >= 0; i -= 1) {
      const prop = style.item(i);
      const raw = style.getPropertyValue(prop);
      if (!raw || !MODERN_COLOR_FN.test(raw)) continue;
      const safe = sanitizeStyleValue(prop, raw);
      style.setProperty(prop, safe, style.getPropertyPriority(prop));
    }
  });
}

/**
 * html2canvas cannot parse Tailwind v4 lab()/oklch() colors.
 * Inline computed styles as canvas-safe RGB and remove global stylesheets.
 */
/** Prepare live DOM node before html2canvas reads it (mutates element; only use on throwaway export nodes). */
export function prepareHtml2CanvasElement(root: HTMLElement) {
  copyComputedStyles(root, root);
  stripLabFromInlineStyles(root);
  stripTailwindClasses(root);
}

/**
 * Replace oklch/oklab/lab/lch color functions in raw CSS text with a safe rgb fallback.
 * Handles nested parentheses (e.g. `oklch(from var(--color-red) l c h)`) by using
 * a balanced-paren match: consumes up to 2 levels of nesting inside the outer parens.
 */
function sanitizeCssText(css: string): string {
  // Matches: fn-name( anything including balanced inner parens, up to depth 2 )
  const balancedFn = /(?:oklch|oklab|lab|lch)\((?:[^()]*|\([^()]*\))*\)/gi;
  return css.replace(balancedFn, "rgb(100,116,139)");
}

function sanitizeAllStylesheets(clonedDoc: Document) {
  clonedDoc.querySelectorAll("style").forEach((node) => {
    if (node.textContent) {
      node.textContent = sanitizeCssText(node.textContent);
    }
  });
}

export function prepareHtml2CanvasClone(
  sourceRoot: HTMLElement,
  clonedDoc: Document,
  clonedRoot: HTMLElement,
  { stripClasses = true }: { stripClasses?: boolean } = {}
): { labColorRulesBefore: number; stylesheetsRemoved: number } {
  let labColorRulesBefore = 0;

  clonedDoc.querySelectorAll("style").forEach((node) => {
    if (node.textContent) {
      labColorRulesBefore += countModernColorFns(node.textContent);
    }
  });

  copyComputedStyles(sourceRoot, clonedRoot);
  stripLabFromInlineStyles(clonedRoot);
  if (stripClasses) {
    stripTailwindClasses(clonedRoot);
  }

  sanitizeAllStylesheets(clonedDoc);

  const removed = clonedDoc.querySelectorAll('link[rel="stylesheet"]');
  removed.forEach((node) => node.remove());

  return { labColorRulesBefore, stylesheetsRemoved: removed.length };
}

/** Proposal PDF: fully inline Tailwind computed styles, then capture without stylesheets. */
export function prepareProposalHtml2CanvasElement(root: HTMLElement) {
  root.style.opacity = "1";
  root.style.visibility = "visible";

  let sanitizedToBlack = 0;
  walkElements(root, (el) => {
    applyComputedStyles(el, el);
    if (el instanceof HTMLElement || el instanceof SVGElement) {
      const style = (el as HTMLElement).style;
      if (style.opacity === "0") style.opacity = "1";
      if (style.visibility === "hidden") style.visibility = "visible";
      const bg = style.backgroundColor;
      if (bg === "rgb(0, 0, 0)" || bg === "#000000") sanitizedToBlack += 1;
    }
  });
  stripLabFromInlineStyles(root);
  stripTailwindClasses(root);

  // #region agent log
  if (typeof fetch !== "undefined") {
    fetch("http://127.0.0.1:7638/ingest/531824bf-0a14-482f-b510-6252707575d1", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "412ec5" },
      body: JSON.stringify({
        sessionId: "412ec5",
        hypothesisId: "C",
        location: "html2canvasSafeClone.ts:prepareProposalHtml2CanvasElement",
        message: "Color sanitization produced black backgrounds",
        data: { sanitizedToBlack },
        runId: "post-fix",
        timestamp: Date.now(),
      }),
    }).catch(() => {});
  }
  // #endregion
}

export function prepareProposalHtml2CanvasClone(
  sourceRoot: HTMLElement,
  clonedDoc: Document,
  clonedRoot: HTMLElement
) {
  copyInlineStyleAttributes(sourceRoot, clonedRoot);
  stripLabFromInlineStyles(clonedRoot);
  sanitizeAllStylesheets(clonedDoc);
  clonedDoc.querySelectorAll('link[rel="stylesheet"]').forEach((node) => node.remove());
  return { labColorRulesBefore: 0, stylesheetsRemoved: 0 };
}

/**
 * Copy resolved computed styles (rgb-safe, no oklch) from a live source element tree
 * to a structurally identical target tree (e.g., the html2canvas clone).
 * Uses the partial INLINE_PROPS list.
 */
export function copyComputedStylesDeep(source: HTMLElement, target: HTMLElement) {
  copyComputedStyles(source, target);
  stripLabFromInlineStyles(target);
}

/**
 * Walk source (live) and target (cloned) element trees in parallel and inline EVERY
 * resolved computed CSS property as a canvas-safe inline style on the target.
 * This is the gold-standard approach: the browser has already resolved all oklch/lab
 * colors to rgb on the live element, so we get accurate colors without any regex hacks.
 *
 * IMPORTANT: `source` must be the exact same subtree that html2canvas is capturing
 * (e.g. captureEl), not a parent wrapper, so that node indices align 1-to-1.
 */
export function inlineAllComputedStylesDeep(source: HTMLElement, target: HTMLElement) {
  const sourceNodes: Element[] = [];
  const targetNodes: Element[] = [];

  walkElements(source, (el) => sourceNodes.push(el));
  walkElements(target, (el) => targetNodes.push(el));

  const count = Math.min(sourceNodes.length, targetNodes.length);
  for (let i = 0; i < count; i += 1) {
    inlineAllComputedStyles(sourceNodes[i], targetNodes[i]);
  }
}

/**
 * Remove all class attributes from every element in the tree.
 * This prevents Tailwind v4 oklch() rules from being applied even if stylesheets remain.
 */
export function stripAllClasses(root: HTMLElement) {
  stripTailwindClasses(root);
}

/**
 * Sanitize oklch()/lab() color functions in all <style> tag text content.
 * Use this instead of removeAllStylesheets when you need to preserve @font-face rules.
 * External <link rel="stylesheet"> entries are NOT touched — remove those separately.
 */
export function sanitizeStyleElements(doc: Document) {
  sanitizeAllStylesheets(doc);
}

/**
 * Remove only external <link rel="stylesheet"> elements from a document.
 * Preserves <style> tags (and their @font-face rules) for correct font rendering.
 */
export function removeExternalStylesheets(doc: Document) {
  doc.querySelectorAll('link[rel="stylesheet"]').forEach((node) => node.remove());
}

/**
 * Remove all <style> and <link rel="stylesheet"> elements from a document.
 */
export function removeAllStylesheets(doc: Document) {
  doc.querySelectorAll('style, link[rel="stylesheet"]').forEach((node) => node.remove());
}

export { MODERN_COLOR_FN, countModernColorFns };
