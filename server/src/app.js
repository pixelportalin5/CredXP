const express = require("express");
const compression = require("compression");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const errorHandler = require("./middleware/errorHandler");
const adminRoutes = require("./routes/adminRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const buildStaffProposalRoutes = require("./routes/staffProposalRoutes");
const { authorizeAdmin, authorizeEmployee } = require("./middleware/authMiddleware");
const authRoutes = require("./routes/authRoutes");
const contactRoutes = require("./routes/contactRoutes");
const coworkingRoutes = require("./routes/coworkingRoutes");
const enquiryRoutes = require("./routes/enquiryRoutes");
const propertyRoutes = require("./routes/propertyRoutes");
const savedPropertyRoutes = require("./routes/savedPropertyRoutes");
const insightsRoutes = require("./routes/insightsRoutes");
const proposalRoutes = require("./routes/proposalRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const zohoIntegrationRoutes = require("./routes/zohoIntegrationRoutes");

const app = express();

// --------------- Middleware ---------------
app.use(compression());

// CORS Configuration - Optimized for SEO and Frontend Access
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "https://credxp-mvp.vercel.app",
  "https://cred-xp-frontend.vercel.app",
  "https://aqua-goldfinch-370087.hostingersite.com",
  "https://www.credxp.com",
  "https://credxp.com",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`[CORS] Blocked request from origin: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 200,
  })
);

// Security headers
app.use(helmet());

// Logging
app.use(morgan("dev"));

// Body parser
app.use(express.json({ limit: "8mb" }));
app.use(express.urlencoded({ extended: true, limit: "8mb" }));

// --------------- SEO & Crawling Headers ---------------
// Allow search engines to crawl without blocking
app.use((req, res, next) => {
  res.setHeader("X-Robots-Tag", "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1");
  res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
  next();
});

// --------------- Routes ---------------
const { getDatabaseUrlDiagnostic } = require("./lib/databaseUrlDiagnostics");
const { getDbProvider } = require("./lib/dbProvider");

app.get("/api/health", (req, res) => {
  const db = getDatabaseUrlDiagnostic();
  res.json({
    success: true,
    message: "CredXP API is running",
    dbProvider: getDbProvider(),
    database: {
      urlConfigured: db.isSet,
      protocol: db.protocol,
      postgresUrlValid: db.isValidPostgres,
      hasWrappingQuotes: db.hasWrappingQuotes,
    },
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/employee", employeeRoutes);
app.use("/api/admin/proposals", buildStaffProposalRoutes(authorizeAdmin));
app.use("/api/employee/proposals", buildStaffProposalRoutes(authorizeEmployee));
app.use("/api/contact", contactRoutes);
app.use("/api/coworking", coworkingRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/enquiries", enquiryRoutes);
app.use("/api/saved-properties", savedPropertyRoutes);
app.use("/api/insights", insightsRoutes);
app.use("/api/proposals", proposalRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/integrations/zoho", zohoIntegrationRoutes);

// --------------- 404 Fallback ---------------
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found",
    path: req.path,
  });
});

// --------------- Error Handling ---------------
app.use(errorHandler);

module.exports = app;
