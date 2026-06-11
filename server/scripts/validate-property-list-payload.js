#!/usr/bin/env node
/**
 * Measures property list endpoint payload size and latency under DB_PROVIDER=postgres.
 */

require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });

const http = require("http");

const QUERY = "/api/properties?page=1&limit=20&sort=newest&category=investment";
const PORT = process.env.PORT || 5000;

function measureHttp() {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const req = http.get(
      {
        hostname: "127.0.0.1",
        port: PORT,
        path: QUERY,
        timeout: 30000,
      },
      (res) => {
        const chunks = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => {
          const body = Buffer.concat(chunks);
          resolve({
            status: res.statusCode,
            sizeBytes: body.length,
            sizeKb: Math.round(body.length / 1024),
            totalMs: Date.now() - start,
            hasBase64: body.includes("data:image/"),
            propertyCount: (() => {
              try {
                const json = JSON.parse(body.toString("utf8"));
                return json?.data?.properties?.length ?? 0;
              } catch {
                return 0;
              }
            })(),
          });
        });
      }
    );
    req.on("error", reject);
    req.on("timeout", () => {
      req.destroy();
      reject(new Error("HTTP request timed out after 30s"));
    });
  });
}

async function measureService() {
  process.env.DB_PROVIDER = process.env.DB_PROVIDER || "postgres";
  const propertyService = require("../src/services/propertyService");

  const start = Date.now();
  const result = await propertyService.getAll({
    page: 1,
    limit: 20,
    sort: "newest",
    category: "investment",
  });
  const json = JSON.stringify({ success: true, data: result });
  return {
    sizeBytes: Buffer.byteLength(json, "utf8"),
    sizeKb: Math.round(Buffer.byteLength(json, "utf8") / 1024),
    totalMs: Date.now() - start,
    hasBase64: json.includes("data:image/"),
    propertyCount: result.properties?.length ?? 0,
  };
}

async function main() {
  console.log(`DB_PROVIDER=${process.env.DB_PROVIDER || "mongo"}`);
  console.log("\n--- Service-layer measurement ---");
  const service = await measureService();
  console.log(JSON.stringify(service, null, 2));

  console.log("\n--- HTTP measurement (server must be running) ---");
  try {
    const httpResult = await measureHttp();
    console.log(JSON.stringify(httpResult, null, 2));
  } catch (error) {
    console.log(`Skipped HTTP test: ${error.message}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
