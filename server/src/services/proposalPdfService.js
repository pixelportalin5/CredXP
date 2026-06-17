const proposalExportStore = require("./proposalExportStore");

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";

function getPdfExportSecret() {
  return process.env.PDF_EXPORT_SECRET;
}

async function launchBrowser() {
  const launchArgs = [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-dev-shm-usage",
    "--disable-gpu",
    "--disable-software-rasterizer",
    "--font-render-hinting=none",
  ];

  if (process.env.PUPPETEER_EXECUTABLE_PATH) {
    const puppeteer = require("puppeteer-core");
    return puppeteer.launch({
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
      headless: true,
      args: launchArgs,
    });
  }

  const puppeteer = require("puppeteer");
  return puppeteer.launch({
    headless: true,
    protocolTimeout: 120000,
    args: launchArgs,
  });
}

async function safeCloseBrowser(browser) {
  if (!browser) return;
  try {
    await browser.close();
  } catch {
    // Windows often reports the target is already closed.
  }
}

function proposalPdfFilename(proposal) {
  const safeName = String(proposal.propertyTitle || "proposal")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 60);
  const id = String(proposal._id || "draft").replace(/[^a-zA-Z0-9-]/g, "");
  return `CredXP-Proposal-${safeName || id}.pdf`;
}

async function waitForProposalReady(page) {
  await page.waitForSelector("[data-proposal-document]", { timeout: 45000 });
  await page.waitForSelector("[data-proposal-export-ready='true']", { timeout: 45000 });

  await page.evaluate(async () => {
    if (document.fonts?.ready) {
      await document.fonts.ready;
    }

    await Promise.all(
      Array.from(document.images).map(
        (img) =>
          new Promise((resolve) => {
            if (img.complete) {
              resolve();
              return;
            }
            img.onload = () => resolve();
            img.onerror = () => resolve();
          })
      )
    );
  });
}

async function generateProposalPdfFromToken(token) {
  const pdfExportSecret = getPdfExportSecret();
  if (!pdfExportSecret) {
    throw new Error("PDF_EXPORT_SECRET is not configured on the server.");
  }

  const exportUrl = `${CLIENT_URL.replace(/\/$/, "")}/export/proposal/${token}`;

  let browser;

  try {
    browser = await launchBrowser();
    const page = await browser.newPage();
    await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 1 });

    await page.setExtraHTTPHeaders({
      "x-pdf-export-secret": pdfExportSecret,
    });

    await page.goto(exportUrl, {
      waitUntil: "load",
      timeout: 90000,
    });

    await waitForProposalReady(page);

    await page.emulateMediaType("screen");

    await page.evaluate(() => {
      document.querySelectorAll("nav, footer, header").forEach((node) => node.remove());
      document.body.style.margin = "0";
      document.body.style.padding = "0";
      document.body.style.background = "#ffffff";
      const main = document.querySelector("main");
      if (main) {
        main.style.paddingTop = "0";
        main.style.margin = "0";
      }
    });

    return page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
      scale: 1,
    });
  } catch (error) {
    const message = error?.message || "Unknown Puppeteer error";
    const wrapped = new Error(`PDF generation failed: ${message}`);
    wrapped.statusCode = 503;
    throw wrapped;
  } finally {
    await safeCloseBrowser(browser);
  }
}

async function generateProposalPdf(proposal) {
  const token = proposalExportStore.createExportSession(proposal);
  try {
    const pdfBuffer = await generateProposalPdfFromToken(token);
    return {
      buffer: pdfBuffer,
      filename: proposalPdfFilename(proposal),
    };
  } finally {
    proposalExportStore.deleteExportSession(token);
  }
}

module.exports = {
  generateProposalPdf,
  generateProposalPdfFromToken,
  proposalPdfFilename,
};
