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
  container.style.position = "fixed";
  container.style.left = "-10000px";
  container.style.top = "0";
  container.style.width = `${A4_WIDTH_PX}px`;
  container.style.height = `${A4_HEIGHT_PX}px`;
  container.style.overflow = "hidden";
  container.style.background = "#ffffff";
  container.style.zIndex = "-1";
  document.body.appendChild(container);

  let root: Root | null = createRoot(container);
  root.render(
    <ProposalDocument proposal={proposal} qrDataUrl={qrDataUrl} mode="export" />
  );

  await new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)));
  await waitForImages(container);
  await new Promise((resolve) => setTimeout(resolve, 150));

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
