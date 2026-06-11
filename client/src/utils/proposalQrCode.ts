import QRCode from "qrcode";
import type { ProposalAgent } from "@/types/proposal";

function buildVCard(agent: ProposalAgent): string {
  const lines = ["BEGIN:VCARD", "VERSION:3.0", `FN:CredXP - ${agent.name}`];
  if (agent.phone) lines.push(`TEL:${agent.phone}`);
  if (agent.email) lines.push(`EMAIL:${agent.email}`);
  lines.push("END:VCARD");
  return lines.join("\n");
}

export async function generateAgentQrDataUrl(agent: ProposalAgent): Promise<string> {
  return QRCode.toDataURL(buildVCard(agent), {
    margin: 1,
    width: 120,
    color: { dark: "#000000", light: "#ffffff" },
  });
}
