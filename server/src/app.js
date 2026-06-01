const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const errorHandler = require("./middleware/errorHandler");
const adminRoutes = require("./routes/adminRoutes");
const authRoutes = require("./routes/authRoutes");
const contactRoutes = require("./routes/contactRoutes");
const coworkingRoutes = require("./routes/coworkingRoutes");
const enquiryRoutes = require("./routes/enquiryRoutes");
const propertyRoutes = require("./routes/propertyRoutes");
const savedPropertyRoutes = require("./routes/savedPropertyRoutes");

const app = express();

// --------------- Middleware ---------------
app.use(helmet());
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://credxp-mvp.vercel.app",
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
app.use("/api/contact", contactRoutes);
app.use("/api/coworking", coworkingRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/enquiries", enquiryRoutes);
app.use("/api/saved-properties", savedPropertyRoutes);

// --------------- Error Handling ---------------
app.use(errorHandler);

module.exports = app;
