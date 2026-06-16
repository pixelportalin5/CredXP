import type { Proposal } from "@/types/proposal";
import { isDataImageUrl, isRemoteImageUrl } from "@/utils/imageUrl";

const LARGE_DATA_URL_THRESHOLD = 50_000;
const EXPORT_COVER_MAX_WIDTH = 480;

function resolveProposalCoverImage(proposal: Proposal): string | undefined {
  const direct = proposal.coverImage?.trim();
  if (direct) return direct;
  return undefined;
}

async function compressDataUrlCover(src: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => {
      const scale = Math.min(1, EXPORT_COVER_MAX_WIDTH / Math.max(img.naturalWidth, 1));
      const width = Math.max(1, Math.round(img.naturalWidth * scale));
      const height = Math.max(1, Math.round(img.naturalHeight * scale));
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(src);
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", 0.82));
    };
    img.onerror = () => resolve("");
    img.src = src;
  });
}

async function normalizeCoverForExport(coverImage?: string): Promise<string | undefined> {
  if (!coverImage?.trim()) return undefined;

  if (isRemoteImageUrl(coverImage) && !isDataImageUrl(coverImage)) {
    return coverImage;
  }

  if (isDataImageUrl(coverImage)) {
    if (coverImage.length > LARGE_DATA_URL_THRESHOLD) {
      return (await compressDataUrlCover(coverImage)) || undefined;
    }
    return coverImage;
  }

  return coverImage;
}

function normalizeAgentAvatar(avatar?: string): string | undefined {
  if (!avatar?.trim()) return undefined;
  if (isDataImageUrl(avatar) && avatar.length > LARGE_DATA_URL_THRESHOLD) {
    return undefined;
  }
  return avatar;
}

export async function prepareProposalForPdf(
  proposal: Proposal,
  options?: { coverImageFallback?: string }
): Promise<Proposal> {
  const resolvedCover =
    resolveProposalCoverImage(proposal) || options?.coverImageFallback?.trim() || undefined;

  const [coverImage, avatar] = await Promise.all([
    normalizeCoverForExport(resolvedCover),
    Promise.resolve(normalizeAgentAvatar(proposal.agent?.avatar)),
  ]);

  const pros = Array.isArray(proposal.agentResearch?.pros) ? proposal.agentResearch.pros : [];
  const cons = Array.isArray(proposal.agentResearch?.cons) ? proposal.agentResearch.cons : [];

  return {
    ...proposal,
    coverImage,
    agent: {
      ...proposal.agent,
      avatar,
    },
    agentResearch: proposal.agentResearch
      ? {
          pros: [pros[0] || "", pros[1] || "", pros[2] || ""] as [string, string, string],
          cons: [cons[0] || "", cons[1] || "", cons[2] || ""] as [string, string, string],
        }
      : undefined,
  };
}
