import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";
import shipmentRoutes from "./routes/shipments.js";
import faqRoutes from "./routes/faqs.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Public user frontend + admin dashboard
const FRONTEND_PATH = process.env.FRONTEND_PATH || path.join(__dirname, "public");
const ADMIN_PATH = process.env.ADMIN_PATH || path.join(__dirname, "admin");

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ───────────────────────────────────────────────
app.use(cors({ origin: "*" }));
app.use(express.json());

// ─── API Routes ──────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/shipments", shipmentRoutes);
app.use("/api/faqs", faqRoutes);
app.get("/api/health", (_, res) => res.json({ status: "ok" }));

// ─── Static frontends ────────────────────────────────────────
app.use("/admin", express.static(ADMIN_PATH));
app.use(express.static(FRONTEND_PATH));

console.log("📁 User frontend:", FRONTEND_PATH);
console.log("📁 Admin frontend:", ADMIN_PATH);

// Admin fallback
app.get("/admin/*", (req, res) => {
  res.sendFile(path.join(ADMIN_PATH, "index.html"));
});

// Public SPA fallback
app.get("*", (req, res) => {
  res.sendFile(path.join(FRONTEND_PATH, "index.html"));
});

// ─── Start ───────────────────────────────────────────────────
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 http://localhost:${PORT}`);
    console.log(`🔐 Admin: http://localhost:${PORT}/admin`);
  });
});
