const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const errorHandler = require("./middleware/errorHandler");
const propertyRoutes = require("./routes/propertyRoutes");

const app = express();

// --------------- Middleware ---------------
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --------------- Routes ---------------
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "CredXP API is running" });
});

app.use("/api/properties", propertyRoutes);

// --------------- Error Handling ---------------
app.use(errorHandler);

module.exports = app;
