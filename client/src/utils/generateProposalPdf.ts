import { jsPDF } from "jspdf";
import type { Proposal, ProposalField } from "@/types/proposal";
import { formatDate } from "@/utils/format";

// ── Brand palette ──────────────────────────────────────────────────────────
const NAVY = "#0C1A2E";
const AMBER = "#F59E0B";
const SLATE = "#64748B";
const LIGHT = "#F8FAFC";
const BORDER = "#E2E8F0";
const WHITE = "#FFFFFF";
const TEXT = "#1E293B";
const GREEN = "#16A34A";
const GREEN_LIGHT = "#DCFCE7";

const LOGO_PATHS = ["/logos/CredxP.webp", "/logos/Credxp.webp"];
const LOGO_DISPLAY_HEIGHT = 34;

const MARGIN_X = 40;
const FOOTER_HEIGHT = 36;
const HEADER_BAND_HEIGHT = 72;
const AMBER_LINE_HEIGHT = 3;
const CONTENT_START_Y = 95;
const CONTENT_BOTTOM_PAD = 12;

type Rgb = [number, number, number];

let logoDataUrlCache: string | null = null;
let logoAspectRatioCache: number | null = null;

function hexToRgb(hex: string): Rgb {
  const normalized = hex.replace("#", "");
  const value = Number.parseInt(normalized, 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

const C = {
  navy: hexToRgb(NAVY),
  amber: hexToRgb(AMBER),
  slate: hexToRgb(SLATE),
  light: hexToRgb(LIGHT),
  border: hexToRgb(BORDER),
  white: hexToRgb(WHITE),
  text: hexToRgb(TEXT),
  green: hexToRgb(GREEN),
  greenLight: hexToRgb(GREEN_LIGHT),
  white60: [180, 190, 200] as Rgb,
  white55: [170, 180, 192] as Rgb,
  white40: [145, 155, 168] as Rgb,
};

export function toSafeCurrency(value: string): string {
  return value.replace(/₹/g, "Rs.");
}

function wrapText(doc: jsPDF, text: string, maxWidth: number, size: number): string[] {
  doc.setFontSize(size);
  return doc.splitTextToSize(text, maxWidth) as string[];
}

function clipLines(lines: string[], maxLines: number): string[] {
  if (lines.length <= maxLines) return lines;
  const clipped = lines.slice(0, maxLines);
  const last = clipped[maxLines - 1];
  clipped[maxLines - 1] = last.length > 3 ? `${last.slice(0, -3)}...` : `${last}...`;
  return clipped;
}

function snapshotMap(snapshot: ProposalField[]): Map<string, string> {
  return new Map(snapshot.map((field) => [field.key, field.value]));
}

function getField(map: Map<string, string>, key: string, fallback = "—"): string {
  const value = map.get(key);
  return value && value.trim() ? toSafeCurrency(value) : fallback;
}

function proposalRefId(proposal: Proposal): string {
  const shortId = proposal._id.replace(/[^a-zA-Z0-9]/g, "").slice(-6).toUpperCase();
  if (shortId) return `CREDXP-${shortId}`;
  const stamp = new Date(proposal.createdAt).toISOString().slice(0, 10).replace(/-/g, "");
  return `CREDXP-${stamp}`;
}

async function loadCredxpLogo(): Promise<{ dataUrl: string; aspectRatio: number; width: number; height: number } | null> {
  if (logoDataUrlCache && logoAspectRatioCache) {
    const height = LOGO_DISPLAY_HEIGHT;
    const width = height * logoAspectRatioCache;
    return { dataUrl: logoDataUrlCache, aspectRatio: logoAspectRatioCache, width, height };
  }

  for (const path of LOGO_PATHS) {
    const loaded = await new Promise<{ dataUrl: string; aspectRatio: number; width: number; height: number } | null>((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const scale = LOGO_DISPLAY_HEIGHT / img.naturalHeight;
        const width = Math.round(img.naturalWidth * scale);
        const height = LOGO_DISPLAY_HEIGHT;
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(null);
          return;
        }
        ctx.fillStyle = WHITE;
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        logoDataUrlCache = canvas.toDataURL("image/png");
        logoAspectRatioCache = width / height;
        resolve({ dataUrl: logoDataUrlCache, aspectRatio: logoAspectRatioCache, width, height });
      };
      img.onerror = () => resolve(null);
      img.src = path;
    });
    if (loaded) return loaded;
  }

  return null;
}

function drawHeaderBand(
  doc: jsPDF,
  proposal: Proposal,
  logo: { dataUrl: string; aspectRatio: number; width: number; height: number } | null
) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const centerY = HEADER_BAND_HEIGHT / 2;

  let brandPanelWidth = 0;

  if (logo) {
    brandPanelWidth = logo.width + MARGIN_X * 2;
    doc.setFillColor(...C.white);
    doc.rect(0, 0, brandPanelWidth, HEADER_BAND_HEIGHT, "F");

    const logoY = (HEADER_BAND_HEIGHT - logo.height) / 2;
    doc.addImage(logo.dataUrl, "PNG", MARGIN_X, logoY, logo.width, logo.height);

    doc.setDrawColor(...C.border);
    doc.setLineWidth(0.5);
    doc.line(brandPanelWidth, 0, brandPanelWidth, HEADER_BAND_HEIGHT);
  }

  doc.setFillColor(...C.navy);
  doc.rect(brandPanelWidth, 0, pageWidth - brandPanelWidth, HEADER_BAND_HEIGHT, "F");

  if (!logo) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(...C.white);
    doc.text("CredXP", MARGIN_X, centerY - 2);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...C.white60);
    doc.text("Premium Commercial Real Estate", MARGIN_X, centerY + 12);
  }

  const rightX = pageWidth - MARGIN_X;
  const metaCenterY = centerY;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...C.white);
  doc.text("PROPERTY PROPOSAL", rightX, metaCenterY - 10, { align: "right", charSpace: 1.2 });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...C.white55);
  doc.text(`Prepared on ${formatDate(proposal.createdAt)}`, rightX, metaCenterY + 2, { align: "right" });

  doc.setFontSize(7);
  doc.setTextColor(...C.white40);
  doc.text(`Ref: ${proposalRefId(proposal)}`, rightX, metaCenterY + 14, { align: "right" });

  doc.setFillColor(...C.amber);
  doc.rect(0, HEADER_BAND_HEIGHT, pageWidth, AMBER_LINE_HEIGHT, "F");
}

function drawFooterBand(doc: jsPDF) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const footerY = pageHeight - FOOTER_HEIGHT;

  doc.setFillColor(...C.amber);
  doc.rect(0, footerY, pageWidth, 2, "F");

  doc.setFillColor(...C.navy);
  doc.rect(0, footerY + 2, pageWidth, 34, "F");

  const textY = pageHeight - 18;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...C.white60);
  doc.text("Shared via CredXP — Premium Commercial Real Estate", MARGIN_X, textY);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...C.amber);
  doc.text("credxp.com", pageWidth / 2, textY, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...C.white40);
  doc.text("© 2026 CredXP Prop-Tech Pvt. Ltd.", pageWidth - MARGIN_X, textY, { align: "right" });
}

function drawBadge(
  doc: jsPDF,
  x: number,
  y: number,
  label: string,
  fill: Rgb,
  textColor: Rgb,
  border?: Rgb
) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  const paddingX = 10;
  const paddingY = 4;
  const textWidth = doc.getTextWidth(label);
  const width = textWidth + paddingX * 2;
  const height = 8 + paddingY * 2;

  doc.setFillColor(...fill);
  if (border) {
    doc.setDrawColor(...border);
    doc.setLineWidth(0.75);
    doc.roundedRect(x, y, width, height, 4, 4, "FD");
  } else {
    doc.roundedRect(x, y, width, height, 4, 4, "F");
  }

  doc.setTextColor(...textColor);
  doc.text(label, x + paddingX, y + paddingY + 7);
  return width;
}

function drawHorizontalRule(doc: jsPDF, y: number) {
  const pageWidth = doc.internal.pageSize.getWidth();
  doc.setDrawColor(...C.border);
  doc.setLineWidth(0.5);
  doc.line(MARGIN_X, y, pageWidth - MARGIN_X, y);
}

function drawSectionLabel(doc: jsPDF, y: number, label: string): number {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...C.amber);
  doc.text(label.toUpperCase(), MARGIN_X, y, { charSpace: 0.8 });
  return y + 14;
}

function drawMetricTile(
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  label: string,
  value: string,
  showStatusDot = false
) {
  const height = 60;
  doc.setFillColor(...C.light);
  doc.setDrawColor(...C.border);
  doc.setLineWidth(0.75);
  doc.roundedRect(x, y, width, height, 6, 6, "FD");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...C.slate);
  doc.text(label.toUpperCase(), x + width / 2, y + 16, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...C.navy);

  if (showStatusDot) {
    const valueLines = clipLines(wrapText(doc, value, width - 24, 13), 1);
    const displayValue = valueLines[0];
    const valueWidth = doc.getTextWidth(displayValue);
    const dotX = x + width / 2 - valueWidth / 2 - 8;
    doc.setFillColor(...C.green);
    doc.circle(dotX, y + 36, 3, "F");
    doc.text(displayValue, x + width / 2, y + 40, { align: "center" });
  } else {
    const valueLines = clipLines(wrapText(doc, value, width - 16, 13), 2);
    doc.text(valueLines, x + width / 2, y + 36, { align: "center" });
  }
}

function drawDetailCell(
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  height: number,
  label: string,
  value: string
) {
  doc.setFillColor(...C.white);
  doc.setDrawColor(...C.border);
  doc.setLineWidth(0.5);
  doc.roundedRect(x, y, width, height, 4, 4, "FD");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...C.slate);
  doc.text(label.toUpperCase(), x + 10, y + 14);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...C.text);
  const valueLines = clipLines(wrapText(doc, value, width - 20, 10), 2);
  doc.text(valueLines, x + 10, y + 28);
}

export async function generateProposalPdf(proposal: Proposal): Promise<jsPDF> {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const contentWidth = pageWidth - MARGIN_X * 2;
  const maxContentY = pageHeight - FOOTER_HEIGHT - CONTENT_BOTTOM_PAD;

  const fields = snapshotMap(proposal.propertySnapshot);
  const propertyType = getField(fields, "type", "Commercial Property");
  const price = getField(fields, "price", "On Request");
  const pricePerSqft = getField(fields, "pricePerSqft", "");
  const area = getField(fields, "size", "—");
  const status = getField(fields, "status", "—");
  const grade = getField(fields, "grade", "—");
  const description = getField(fields, "description", "No description provided.");
  const hasRera = Boolean(fields.get("reraId")?.trim());

  const logo = await loadCredxpLogo();
  drawHeaderBand(doc, proposal, logo);

  let y = CONTENT_START_Y;

  const ensureSpace = (needed: number) => {
    if (y + needed <= maxContentY) return;
    doc.addPage();
    y = CONTENT_START_Y;
  };

  const titleMaxWidth = 360;
  const titleLines = clipLines(wrapText(doc, proposal.propertyTitle, titleMaxWidth, 20), 2);
  const titleBlockHeight = titleLines.length * 20 * 1.2;

  const priceBoxWidth = 130;
  const priceBoxHeight = 64;
  const priceBoxX = pageWidth - MARGIN_X - priceBoxWidth;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(...C.navy);
  doc.text(titleLines, MARGIN_X, y + 18);

  doc.setFillColor(...C.light);
  doc.setDrawColor(...C.border);
  doc.setLineWidth(0.75);
  doc.roundedRect(priceBoxX, y, priceBoxWidth, priceBoxHeight, 8, 8, "FD");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...C.slate);
  doc.text("ASKING PRICE", priceBoxX + priceBoxWidth / 2, y + 14, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(...C.navy);
  doc.text(price, priceBoxX + priceBoxWidth / 2, y + 34, { align: "center" });

  if (pricePerSqft && pricePerSqft !== "—") {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...C.slate);
    doc.text(pricePerSqft, priceBoxX + priceBoxWidth / 2, y + 50, { align: "center" });
  }

  y += Math.max(titleBlockHeight, priceBoxHeight) + 10;

  let badgeX = MARGIN_X;
  badgeX += drawBadge(doc, badgeX, y, propertyType, C.amber, C.navy) + 8;

  if (hasRera) {
    drawBadge(doc, badgeX, y, "RERA Verified", C.greenLight, C.green, C.green);
  }

  y += 28;
  drawHorizontalRule(doc, y + 8);
  y += 24;

  y = drawSectionLabel(doc, y, "Prepared For");

  const contactHeight = 56;
  ensureSpace(contactHeight + 20);
  doc.setFillColor(...C.light);
  doc.setDrawColor(...C.border);
  doc.setLineWidth(0.75);
  doc.roundedRect(MARGIN_X, y, contentWidth, contactHeight, 6, 6, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...C.text);
  doc.text(proposal.agent.name, MARGIN_X + 16, y + 22);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...C.slate);
  doc.text(proposal.agent.email, MARGIN_X + 16, y + 38);
  if (proposal.agent.phone) {
    doc.text(proposal.agent.phone, MARGIN_X + 16, y + 52);
  }

  y += contactHeight + 24;
  y = drawSectionLabel(doc, y, "Property Overview");

  const tileGap = 10;
  const tileWidth = (contentWidth - tileGap * 3) / 4;
  const tileHeight = 60;
  ensureSpace(tileHeight + 10);

  const metrics: Array<{ label: string; value: string; statusDot?: boolean }> = [
    { label: "Area", value: area },
    { label: "Price / Sqft", value: pricePerSqft || "—" },
    {
      label: "Status",
      value: status,
      statusDot: /recently posted|available/i.test(status),
    },
    { label: "Grade", value: grade },
  ];

  metrics.forEach((metric, index) => {
    const tileX = MARGIN_X + index * (tileWidth + tileGap);
    drawMetricTile(doc, tileX, y, tileWidth, metric.label, metric.value, metric.statusDot);
  });

  y += tileHeight + 24;
  y = drawSectionLabel(doc, y, "Property Details");

  const gridGap = 10;
  const cellWidth = (contentWidth - gridGap * 2) / 3;
  const cellHeight = 52;

  const gridRows: Array<Array<{ label: string; value: string; span?: number }>> = [
    [
      { label: "Building", value: getField(fields, "buildingName") },
      { label: "City", value: getField(fields, "city") },
      { label: "State", value: getField(fields, "state") },
    ],
    [
      { label: "Address", value: getField(fields, "address") },
      { label: "Occupancy", value: getField(fields, "occupancy") },
      { label: "Furnishing", value: getField(fields, "furnishing") },
    ],
    [
      { label: "Property Type", value: propertyType },
      { label: "Highlights", value: getField(fields, "highlights"), span: 2 },
    ],
  ];

  gridRows.forEach((row) => {
    ensureSpace(cellHeight + gridGap);
    let cellX = MARGIN_X;
    row.forEach((cell) => {
      const span = cell.span ?? 1;
      const width = span === 1 ? cellWidth : cellWidth * span + gridGap * (span - 1);
      drawDetailCell(doc, cellX, y, width, cellHeight, cell.label, cell.value);
      cellX += width + gridGap;
    });
    y += cellHeight + gridGap;
  });

  y += 6;
  y = drawSectionLabel(doc, y, "Description");

  const descriptionPadding = 16;
  const descriptionInnerWidth = contentWidth - 32;
  const descriptionLines = wrapText(doc, description, descriptionInnerWidth, 10);
  const descriptionBoxHeight = Math.max(56, descriptionLines.length * 16 + descriptionPadding * 2);

  ensureSpace(descriptionBoxHeight + 10);
  doc.setFillColor(...C.light);
  doc.setDrawColor(...C.border);
  doc.setLineWidth(0.75);
  doc.roundedRect(MARGIN_X, y, contentWidth, descriptionBoxHeight, 6, 6, "FD");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...C.text);

  let descY = y + descriptionPadding + 10;
  descriptionLines.forEach((line) => {
    doc.text(line, MARGIN_X + 16, descY);
    descY += 16;
  });

  const totalPages = doc.getNumberOfPages();
  for (let page = 1; page <= totalPages; page += 1) {
    doc.setPage(page);
    if (page > 1) {
      doc.setFillColor(...C.white);
      doc.rect(0, pageHeight - FOOTER_HEIGHT, pageWidth, FOOTER_HEIGHT, "F");
    }
    drawFooterBand(doc);
  }

  return doc;
}

export async function downloadProposalPdf(proposal: Proposal) {
  const doc = await generateProposalPdf(proposal);
  const safeName = proposal.propertyTitle.replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-").slice(0, 60);
  doc.save(`CredXP-Proposal-${safeName || proposal._id}.pdf`);
}

export async function getProposalPdfBlob(proposal: Proposal): Promise<Blob> {
  const doc = await generateProposalPdf(proposal);
  return doc.output("blob");
}

export async function getProposalPdfFile(proposal: Proposal): Promise<File> {
  const blob = await getProposalPdfBlob(proposal);
  const safeName = proposal.propertyTitle.replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-").slice(0, 60);
  return new File([blob], `CredXP-Proposal-${safeName || proposal._id}.pdf`, { type: "application/pdf" });
}
