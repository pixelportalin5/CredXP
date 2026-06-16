import { createRoot, type Root } from "react-dom/client";
import ProposalDocument from "@/components/proposal/ProposalDocument";
import type { Proposal } from "@/types/proposal";
import { generateAgentQrDataUrl } from "@/utils/proposalQrCode";

const A4_WIDTH_PX = 794;
const A4_HEIGHT_PX = 1123;

function waitForImages(container: HTMLElement, timeoutMs = 8000): Promise<void> {
  const images = Array.from(container.querySelectorAll("img"));
  if (images.length === 0) return Promise.resolve();

  return Promise.all(
    images.map(
      (img) =>
        new Promise<void>((resolve) => {
          const done = () => resolve();
          const timer = window.setTimeout(done, timeoutMs);
          if (img.complete) {
            window.clearTimeout(timer);
            resolve();
            return;
          }
          img.onload = () => {
            window.clearTimeout(timer);
            done();
          };
          img.onerror = () => {
            window.clearTimeout(timer);
            done();
          };
        })
    )
  ).then(() => undefined);
}

export async function mountProposalDocument(proposal: Proposal): Promise<{
  container: HTMLDivElement;
  unmount: () => void;
}> {
  const qrDataUrl = await generateAgentQrDataUrl(proposal.agent);

  const container = document.createElement("div");
  container.setAttribute("data-proposal-pdf-root", "true");
  // Must stay on-screen with opacity 1 — html2canvas skips hidden/off-screen nodes (blank PDF).
  container.style.position = "fixed";
  container.style.left = "0";
  container.style.top = "0";
  container.style.opacity = "1";
  container.style.visibility = "visible";
  container.style.pointerEvents = "none";
  container.style.width = `${A4_WIDTH_PX}px`;
  container.style.height = "auto";
  container.style.minHeight = `${A4_HEIGHT_PX}px`;
  container.style.overflow = "visible";
  container.style.background = "#ffffff";
  container.style.zIndex = "2147483646";
  document.body.appendChild(container);

  let root: Root | null = createRoot(container);
  root.render(
    <ProposalDocument proposal={proposal} qrDataUrl={qrDataUrl} mode="export" />
  );

  // Wait for React to commit the initial render
  await new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)));
  await new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)));
  // Wait for images (cover photo, logo, agent avatar, QR code)
  await waitForImages(container);
  // Wait for web fonts to be ready
  if (typeof document !== "undefined" && document.fonts?.ready) {
    await document.fonts.ready;
  }
  // Extra animation frames to let layout fully settle (e.g. CSS transitions)
  await new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)));
  await new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)));
  await new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)));
  // Additional timer to ensure any async layout side-effects finish
  await new Promise((resolve) => setTimeout(resolve, 500));

  return {
    container,
    unmount: () => {
      root?.unmount();
      root = null;
      container.remove();
    },
  };
}

export { A4_WIDTH_PX, A4_HEIGHT_PX };
