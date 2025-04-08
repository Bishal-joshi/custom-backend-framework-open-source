#!/usr/bin/env node

import * as path from "path";
import * as fs from "fs";
import { PoolProvider } from "../provider/pool";

// migration.js (CommonJS version)
const glob = require("glob");

// Get current working directory
const cwd = process.cwd();

// 1. Load all .js files in the user's project (except node_modules)
const files = glob.sync(path.join(cwd, "**/*.js"), {
  ignore: "**/node_modules/**",
});

for (const file of files) {
  try {
    // Dynamically import the file, but it won't execute its top-level code unless it's invoked
    const module = require(file);

    // Optionally, check for specific exports that may indicate an automatic server start or side effects
    if (module && typeof module.startServer === "function") {
      console.log(
        `Module ${file} was imported, but the server won't start unless explicitly called.`
      );
    } else {
      console.log(`Module ${file} was imported successfully.`);
    }
  } catch (err) {
    console.error(`Failed to load ${file}:`, err.message);
  }
}
console.log("Pool initialized successfully.", PoolProvider.getInstance());

const pool = PoolProvider.getPool();

if (!pool) {
  console.error("❌ Pool not initialized. Please check your configuration.");
  process.exit(1);
}
// const pool = new Pool({
//   host: "localhost",
//   port: 5432,
//   user: "framework",
//   password: "mysecretpassword",
//   database: "framework_db",
// });

// export default pool;

// const MIGRATIONS_DIR = path.join(__dirname, "migrations");
const MIGRATIONS_DIR = path.join(process.cwd(), "migrations");

async function runMigrations() {
  const files = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((file) => file.endsWith(".sql"))
    .sort(); // Ensure they're run in order like 001, 002, etc.

  for (const file of files) {
    const filePath = path.join(MIGRATIONS_DIR, file);
    const sql = fs.readFileSync(filePath, "utf-8");
    console.log(`🟡 Running migration: ${file}`);
    try {
      await pool.query(sql);
      console.log(`✅ Migration ${file} applied successfully.`);
    } catch (err) {
      console.error(`❌ Failed to apply migration ${file}:`, err);
      break; // Stop on failure
    }
  }

  await pool.end();
  process.exit(1);
}

runMigrations();
