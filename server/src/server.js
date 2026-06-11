require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db");
const { isPostgres } = require("./lib/dbProvider");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB({ required: !isPostgres() });

  app.listen(PORT, () => {
    console.log(`\n🚀 CredXP Server running on http://localhost:${PORT}`);
    console.log(`📡 Environment: ${process.env.NODE_ENV || "development"}\n`);
  });
};

startServer();
