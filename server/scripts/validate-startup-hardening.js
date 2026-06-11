#!/usr/bin/env node
/**
 * Validates Mongo boot dependency hardening:
 * - DB_PROVIDER=postgres → server starts without Mongo
 * - DB_PROVIDER=mongo → server requires Mongo
 */

const { spawn } = require("child_process");
const http = require("http");
const path = require("path");

require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const SERVER_PATH = path.join(__dirname, "..", "src", "server.js");
const PORT = 5099;

function waitForHealth(timeoutMs = 15000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const poll = () => {
      const req = http.get(`http://127.0.0.1:${PORT}/api/health`, (res) => {
        res.resume();
        if (res.statusCode === 200) resolve({ ms: Date.now() - start });
        else if (Date.now() - start > timeoutMs) reject(new Error(`HTTP ${res.statusCode}`));
        else setTimeout(poll, 300);
      });
      req.on("error", () => {
        if (Date.now() - start > timeoutMs) reject(new Error("Health check timed out"));
        else setTimeout(poll, 300);
      });
    };
    poll();
  });
}

function runServer(env, expectExit = false) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [SERVER_PATH], {
      env: { ...process.env, PORT: String(PORT), ...env },
      cwd: path.join(__dirname, ".."),
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    const timer = setTimeout(() => {
      child.kill();
      resolve({ outcome: "timeout", stdout, stderr, code: null });
    }, expectExit ? 12000 : 20000);

    child.on("exit", (code) => {
      clearTimeout(timer);
      resolve({ outcome: "exit", stdout, stderr, code });
    });

    child.on("error", (error) => {
      clearTimeout(timer);
      resolve({ outcome: "error", stdout, stderr, error: error.message });
    });

    if (!expectExit) {
      waitForHealth()
        .then((health) => {
          child.kill();
          resolve({ outcome: "healthy", stdout, stderr, healthMs: health.ms, code: null });
        })
        .catch((error) => {
          child.kill();
          resolve({ outcome: "unhealthy", stdout, stderr, error: error.message, code: null });
        });
    }
  });
}

async function main() {
  const results = [];

  console.log("[validate-startup] Test 1: DB_PROVIDER=postgres, invalid MONGODB_URI");
  const postgresRun = await runServer({
    DB_PROVIDER: "postgres",
    MONGODB_URI: "mongodb://127.0.0.1:1/invalid-should-not-be-used",
    DATABASE_URL: process.env.DATABASE_URL,
  });
  const postgresPass =
    postgresRun.outcome === "healthy" &&
    stdoutIncludes(postgresRun.stdout, "MongoDB boot connection skipped") &&
    !stdoutIncludes(postgresRun.stdout, "MongoDB Connected:");
  results.push({
    name: "postgres_starts_without_mongo",
    pass: postgresPass,
    outcome: postgresRun.outcome,
    healthMs: postgresRun.healthMs,
    detail: postgresPass ? null : postgresRun.error || postgresRun.stdout.slice(-500),
  });

  console.log("[validate-startup] Test 2: DB_PROVIDER=mongo, invalid MONGODB_URI (must fail)");
  const mongoFailRun = await runServer(
    {
      DB_PROVIDER: "mongo",
      MONGODB_URI: "mongodb://127.0.0.1:1/invalid-must-fail",
    },
    true
  );
  const mongoFailPass = mongoFailRun.outcome === "exit" && mongoFailRun.code !== 0;
  results.push({
    name: "mongo_exits_when_mongo_unavailable",
    pass: mongoFailPass,
    exitCode: mongoFailRun.code,
    detail: mongoFailPass ? null : `outcome=${mongoFailRun.outcome}`,
  });

  if (process.env.MONGODB_URI) {
    console.log("[validate-startup] Test 3: DB_PROVIDER=mongo, real MONGODB_URI");
    const mongoOkRun = await runServer({
      DB_PROVIDER: "mongo",
      MONGODB_URI: process.env.MONGODB_URI,
      DATABASE_URL: process.env.DATABASE_URL,
    });
    const mongoOkPass =
      mongoOkRun.outcome === "healthy" && stdoutIncludes(mongoOkRun.stdout, "MongoDB Connected:");
    results.push({
      name: "mongo_starts_with_mongo",
      pass: mongoOkPass,
      outcome: mongoOkRun.outcome,
      healthMs: mongoOkRun.healthMs,
      detail: mongoOkPass ? null : mongoOkRun.error || mongoOkRun.stdout.slice(-500),
    });
  } else {
    results.push({
      name: "mongo_starts_with_mongo",
      pass: null,
      skipped: true,
      detail: "MONGODB_URI not set in .env",
    });
  }

  console.log("\n--- Results ---");
  console.log(JSON.stringify(results, null, 2));

  const failed = results.some((r) => r.pass === false);
  process.exit(failed ? 1 : 0);
}

function stdoutIncludes(stdout, text) {
  return stdout.includes(text);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
