import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";
import shipmentRoutes from "./routes/shipments.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Frontend хавтасны зам — .env-д тохируулж болно, эсвэл автоматаар хайна
const FRONTEND_PATH = process.env.FRONTEND_PATH
  || path.join(__dirname, "../cash4cargo-frontend")
  || path.join(__dirname, "../cash4cargo");

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Middleware ───────────────────────────────────────────────
app.use(cors({ origin: "*" }));
app.use(express.json());

// ─── Frontend static файлууд ──────────────────────────────────
app.use(express.static(FRONTEND_PATH));
console.log("📁 Frontend:", FRONTEND_PATH);

// ─── API Routes ──────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/shipments", shipmentRoutes);
app.get("/api/health", (_, res) => res.json({ status: "ok" }));

// SPA fallback
app.get("*", (req, res) => {
  res.sendFile(path.join(FRONTEND_PATH, "index.html"));
});

// ─── Start ───────────────────────────────────────────────────
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 http://localhost:${PORT}`);
  });
});
