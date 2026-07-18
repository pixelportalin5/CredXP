const { join } = require("path");

/**
 * Puppeteer configuration file (auto-detected by the `puppeteer` package).
 *
 * On Render (and similar hosts), the default Chrome cache location
 * (`~/.cache/puppeteer`, e.g. `/opt/render/.cache/puppeteer`) is not
 * guaranteed to persist between the build and runtime environments, and
 * Render caches `node_modules` between deploys — which skips re-running
 * Puppeteer's Chrome download if the cache lives outside `node_modules`.
 *
 * Pointing the cache directory inside `node_modules` means the downloaded
 * Chrome binary is restored along with the rest of `node_modules` on every
 * deploy, so it survives Render's build cache instead of disappearing.
 *
 * @type {import("puppeteer").Configuration}
 */
module.exports = {
  cacheDirectory: join(__dirname, "node_modules", ".puppeteer_cache"),
};
