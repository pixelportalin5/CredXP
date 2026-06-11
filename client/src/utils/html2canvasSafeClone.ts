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

/** Browser canvas resolves lab()/oklch() to #rrggbb for html2canvas. */
export function toHtml2CanvasSafeColor(value: string): string {
  const trimmed = value.trim();
  if (!trimmed || !MODERN_COLOR_FN.test(trimmed)) return trimmed;

  const ctx = canvasContext();
  if (!ctx) return "#000000";

  try {
    ctx.fillStyle = "#000000";
    ctx.fillStyle = trimmed;
    const resolved = ctx.fillStyle;
    if (resolved && !MODERN_COLOR_FN.test(resolved)) return resolved;
  } catch {
    // fall through
  }

  return "#000000";
}

function sanitizeStyleValue(prop: string, value: string): string {
  if (!value) return value;
  if (!MODERN_COLOR_FN.test(value)) return value;
  if (COLOR_PROPS.has(prop) || prop.endsWith("-color")) {
    return toHtml2CanvasSafeColor(value);
  }
  return value
    .replace(/lab\([^)]*\)/gi, "rgb(0, 0, 0)")
    .replace(/oklch\([^)]*\)/gi, "rgb(0, 0, 0)")
    .replace(/oklab\([^)]*\)/gi, "rgb(0, 0, 0)")
    .replace(/lch\([^)]*\)/gi, "rgb(0, 0, 0)");
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

export function prepareHtml2CanvasClone(
  sourceRoot: HTMLElement,
  clonedDoc: Document,
  clonedRoot: HTMLElement
): { labColorRulesBefore: number; stylesheetsRemoved: number } {
  let labColorRulesBefore = 0;

  clonedDoc.querySelectorAll("style").forEach((node) => {
    if (node.textContent) {
      labColorRulesBefore += countModernColorFns(node.textContent);
    }
  });

  copyComputedStyles(sourceRoot, clonedRoot);
  stripLabFromInlineStyles(clonedRoot);
  stripTailwindClasses(clonedRoot);

  const removed = clonedDoc.querySelectorAll('style, link[rel="stylesheet"]');
  removed.forEach((node) => node.remove());

  return { labColorRulesBefore, stylesheetsRemoved: removed.length };
}

export { MODERN_COLOR_FN, countModernColorFns };
