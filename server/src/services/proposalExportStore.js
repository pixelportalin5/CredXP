const crypto = require("crypto");

const TTL_MS = 5 * 60 * 1000;
const store = new Map();

function purgeExpired() {
  const now = Date.now();
  for (const [token, entry] of store.entries()) {
    if (entry.expiresAt <= now) {
      store.delete(token);
    }
  }
}

setInterval(purgeExpired, 60 * 1000).unref();

function createExportSession(proposal) {
  purgeExpired();
  const token = crypto.randomBytes(24).toString("hex");
  store.set(token, {
    proposal,
    expiresAt: Date.now() + TTL_MS,
  });
  return token;
}

function getExportSession(token) {
  purgeExpired();
  const entry = store.get(token);
  if (!entry) return null;
  if (entry.expiresAt <= Date.now()) {
    store.delete(token);
    return null;
  }
  return entry.proposal;
}

function deleteExportSession(token) {
  store.delete(token);
}

module.exports = {
  createExportSession,
  getExportSession,
  deleteExportSession,
};
