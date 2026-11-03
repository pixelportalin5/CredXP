/**
 * Emails the CredXP team when someone submits a website form.
 *
 * Uses Resend's HTTP API (Render blocks outbound SMTP on many plans).
 * Environment:
 *   RESEND_API_KEY      required; without it no email is sent (forms still save)
 *   INQUIRY_EMAIL_TO    comma-separated recipients (default credxp5@gmail.com)
 *   INQUIRY_EMAIL_FROM  sender (default "CredXP Website <onboarding@resend.dev>";
 *                       that test sender only delivers to the Resend account's own email)
 */

const DEFAULT_TO = "credxp5@gmail.com";
const DEFAULT_FROM = "CredXP Website <onboarding@resend.dev>";
const SITE_URL = (process.env.CLIENT_URL || "https://www.credxp.com").replace(/\/$/, "");

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function recipients() {
  return String(process.env.INQUIRY_EMAIL_TO || DEFAULT_TO)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function renderTable(rows) {
  const body = rows
    .filter(([, value]) => value !== undefined && value !== null && String(value).trim() !== "")
    .map(
      ([label, value]) =>
        `<tr><td style="padding:6px 12px;color:#64748b;vertical-align:top;white-space:nowrap">${escapeHtml(label)}</td>` +
        `<td style="padding:6px 12px;color:#0f172a;white-space:pre-wrap">${escapeHtml(value)}</td></tr>`
    )
    .join("");
  return `<table style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px">${body}</table>`;
}

async function send({ subject, heading, rows, replyTo }) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    console.warn("[Inquiry email] RESEND_API_KEY not set; skipping email");
    return false;
  }

  const html =
    `<div style="font-family:Arial,sans-serif"><h2 style="color:#0f172a">${escapeHtml(heading)}</h2>` +
    `${renderTable(rows)}<p style="color:#94a3b8;font-size:12px">Sent from the form on ${escapeHtml(SITE_URL)}</p></div>`;
  const text = `${heading}\n\n${rows
    .filter(([, value]) => value)
    .map(([label, value]) => `${label}: ${value}`)
    .join("\n")}`;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.INQUIRY_EMAIL_FROM?.trim() || DEFAULT_FROM,
      to: recipients(),
      subject,
      html,
      text,
      ...(replyTo ? { reply_to: replyTo } : {}),
    }),
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Resend ${response.status}: ${detail.slice(0, 300)}`);
  }
  return true;
}

/** Fire-and-forget: a failed email must never fail the form submission. */
function notify(payload) {
  send(payload).catch((error) => console.error(`[Inquiry email] ${error.message}`));
}

function propertyLink(item) {
  if (!item) return "";
  const id = item.slug || item._id || item.id;
  return id ? `${SITE_URL}/properties/${id}` : "";
}

function notifyEnquiry(enquiry, data = {}) {
  const property = enquiry?.propertyId && typeof enquiry.propertyId === "object" ? enquiry.propertyId : null;
  const coworking =
    enquiry?.coworkingSpaceId && typeof enquiry.coworkingSpaceId === "object" ? enquiry.coworkingSpaceId : null;
  const listing = property?.title || coworking?.name || "";
  notify({
    subject: `New inquiry${listing ? `: ${listing}` : ""} — ${data.customerName || "website visitor"}`,
    heading: "New property inquiry",
    replyTo: data.email,
    rows: [
      ["Name", data.customerName],
      ["Email", data.email],
      ["Phone", data.phone],
      ["Message", data.message],
      ["Property", property?.title],
      ["Coworking space", coworking?.name],
      ["Link", property ? propertyLink(property) : ""],
    ],
  });
}

function notifyContact(data = {}) {
  notify({
    subject: `New contact form message — ${data.fullName || "website visitor"}`,
    heading: "New contact form message",
    replyTo: data.email,
    rows: [
      ["Name", data.fullName],
      ["Email", data.email],
      ["Phone", data.phone],
      ["Company", data.company],
      ["Inquiry type", data.enquiryType],
      ["Message", data.message],
    ],
  });
}

function notifyNewsletter(email) {
  notify({
    subject: `New newsletter subscriber — ${email}`,
    heading: "New newsletter subscriber",
    replyTo: email,
    rows: [["Email", email]],
  });
}

function notifyListingSubmitted(property, user) {
  if (!property) return;
  notify({
    subject: `New property listed on the website — ${property.title || "untitled"}`,
    heading: "New property listing submitted",
    replyTo: user?.email,
    rows: [
      ["Title", property.title],
      ["Type", property.type],
      ["City", property.location?.city],
      ["Address", property.location?.address],
      ["Price", property.price],
      ["Listed by", user?.name],
      ["Their email", user?.email],
      ["Their phone", user?.phone],
      ["Link", propertyLink(property)],
    ],
  });
}

module.exports = { notifyEnquiry, notifyContact, notifyNewsletter, notifyListingSubmitted, send };
