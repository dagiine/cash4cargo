const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || "cash4cargo",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD,
});

pool.on("connect", () => {
  console.log("✅ PostgreSQL-тэй амжилттай холбогдлоо");
});

pool.on("error", (err) => {
  console.error("❌ PostgreSQL алдаа:", err.message);
  process.exit(1);
});

module.exports = pool;
