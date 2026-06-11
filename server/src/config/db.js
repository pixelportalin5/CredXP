const mongoose = require("mongoose");
const { isPostgres } = require("../lib/dbProvider");

/**
 * @param {{ required?: boolean }} [options]
 * - required defaults to true (seeds, scripts).
 * - server boot passes required: !isPostgres() so postgres cutover can run without Mongo.
 */
const connectDB = async (options = {}) => {
  const required = options.required ?? true;

  if (!required) {
    console.log("DB_PROVIDER=postgres — MongoDB boot connection skipped");
    return null;
  }

  if (!process.env.MONGODB_URI) {
    console.error("MongoDB Connection Error: MONGODB_URI is not set");
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 8000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
