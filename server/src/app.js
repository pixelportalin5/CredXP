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

const app = express();

// --------------- Middleware ---------------
app.use(compression());
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "https://credxp-mvp.vercel.app",
      "https://aqua-goldfinch-370087.hostingersite.com",
    ],
    credentials: true,
  })
);
app.use(morgan("dev"));
app.use(express.json({ limit: "8mb" }));
app.use(express.urlencoded({ extended: true, limit: "8mb" }));

// --------------- Routes ---------------
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "CredXP API is running" });
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

// --------------- Error Handling ---------------
app.use(errorHandler);

module.exports = app;
