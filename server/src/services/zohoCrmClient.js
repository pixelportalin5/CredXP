/**
 * Minimal Zoho CRM REST client (API v7) for reading property records.
 *
 * Environment:
 *   ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, ZOHO_REFRESH_TOKEN  (Self Client, scope ZohoCRM.modules.READ,ZohoCRM.settings.fields.READ)
 *   ZOHO_DC               data centre domain suffix: in (default), com, eu, com.au, jp, ca, sa
 *   ZOHO_PROPERTY_MODULE  module API name holding listings (default "Properties")
 */

const API_VERSION = "v7";
const PER_PAGE = 200;
// Zoho allows at most 50 fields per list request.
const MAX_FIELDS_PER_REQUEST = 50;
const REQUEST_TIMEOUT_MS = 30000;

let cachedToken = null;

function getConfig() {
  const dc = String(process.env.ZOHO_DC || "in").trim().replace(/^\./, "");
  return {
    clientId: process.env.ZOHO_CLIENT_ID?.trim(),
    clientSecret: process.env.ZOHO_CLIENT_SECRET?.trim(),
    refreshToken: process.env.ZOHO_REFRESH_TOKEN?.trim(),
    module: String(process.env.ZOHO_PROPERTY_MODULE || "Properties").trim(),
    // Overrides are for a Zoho sandbox or local testing.
    accountsUrl: (process.env.ZOHO_ACCOUNTS_URL || `https://accounts.zoho.${dc}`).replace(/\/$/, ""),
    apiUrl: (process.env.ZOHO_API_URL || `https://www.zohoapis.${dc}/crm/${API_VERSION}`).replace(/\/$/, ""),
    apiHostSuffix: process.env.ZOHO_API_URL ? new URL(process.env.ZOHO_API_URL).hostname : `zohoapis.${dc}`,
  };
}

function isConfigured() {
  const { clientId, clientSecret, refreshToken } = getConfig();
  return Boolean(clientId && clientSecret && refreshToken);
}

class ZohoApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ZohoApiError";
    // Upstream failure, reported to our callers as Bad Gateway.
    this.statusCode = 502;
    this.zohoStatus = status;
  }
}

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function getAccessToken({ forceRefresh = false } = {}) {
  if (!isConfigured()) {
    throw new ZohoApiError("Zoho API is not configured (ZOHO_CLIENT_ID / ZOHO_CLIENT_SECRET / ZOHO_REFRESH_TOKEN)");
  }
  if (!forceRefresh && cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.value;
  }

  const { clientId, clientSecret, refreshToken, accountsUrl } = getConfig();
  const body = new URLSearchParams({
    refresh_token: refreshToken,
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "refresh_token",
  });
  const response = await fetchWithTimeout(`${accountsUrl}/oauth/v2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const json = await response.json().catch(() => ({}));
  if (!response.ok || !json.access_token) {
    // Never log the token request itself: it carries the client secret.
    throw new ZohoApiError(`Zoho token refresh failed: ${json.error || response.status}`, response.status);
  }

  cachedToken = {
    value: json.access_token,
    expiresAt: Date.now() + (Number(json.expires_in) || 3600) * 1000,
  };
  return cachedToken.value;
}

async function zohoGet(path, params = {}, { retried = false } = {}) {
  const { apiUrl } = getConfig();
  const url = new URL(`${apiUrl}${path}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") url.searchParams.set(key, String(value));
  });

  const token = await getAccessToken({ forceRefresh: retried });
  const response = await fetchWithTimeout(url, {
    headers: { Authorization: `Zoho-oauthtoken ${token}` },
  });

  if (response.status === 401 && !retried) {
    return zohoGet(path, params, { retried: true });
  }
  // 204 = no records.
  if (response.status === 204) return { data: [], info: {} };

  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ZohoApiError(`Zoho API ${path} failed: ${json.code || json.message || response.status}`, response.status);
  }
  return json;
}

async function getFieldApiNames() {
  const { module } = getConfig();
  const json = await zohoGet("/settings/fields", { module });
  return (json.fields || []).map((field) => field.api_name).filter(Boolean);
}

/** Full record, all fields. */
async function getRecord(id) {
  const { module } = getConfig();
  const json = await zohoGet(`/${encodeURIComponent(module)}/${encodeURIComponent(id)}`);
  return json.data?.[0] || null;
}

async function listPage(fields, pageToken, page) {
  const { module } = getConfig();
  return zohoGet(`/${encodeURIComponent(module)}`, {
    fields: fields.join(","),
    per_page: PER_PAGE,
    ...(pageToken ? { page_token: pageToken } : { page }),
  });
}

/**
 * Every record in the module with every field. Zoho caps fields per request,
 * so wide modules are read in field chunks and merged by record id.
 */
async function listAllRecords() {
  const allFields = await getFieldApiNames();
  const chunks = [];
  for (let i = 0; i < allFields.length; i += MAX_FIELDS_PER_REQUEST) {
    chunks.push(allFields.slice(i, i + MAX_FIELDS_PER_REQUEST));
  }
  if (chunks.length === 0) chunks.push(["id"]);

  const records = new Map();
  for (const fields of chunks) {
    let page = 1;
    let pageToken;
    for (;;) {
      const json = await listPage(fields, pageToken, page);
      for (const row of json.data || []) {
        records.set(row.id, { ...(records.get(row.id) || {}), ...row });
      }
      const info = json.info || {};
      if (!info.more_records) break;
      pageToken = info.next_page_token;
      page += 1;
    }
  }
  return [...records.values()];
}

/** Auth header for downloading files hosted on the Zoho API domain. */
async function authHeadersFor(url) {
  if (!isConfigured()) return {};
  try {
    if (!new URL(url).hostname.endsWith(getConfig().apiHostSuffix)) return {};
  } catch {
    return {};
  }
  return { Authorization: `Zoho-oauthtoken ${await getAccessToken()}` };
}

module.exports = {
  isConfigured,
  getConfig,
  getRecord,
  listAllRecords,
  authHeadersFor,
  ZohoApiError,
};
