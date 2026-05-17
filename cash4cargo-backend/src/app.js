const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes     = require("./routes/auth");
const shipmentRoutes = require("./routes/shipments");
const orderRoutes    = require("./routes/orders");

const app  = express();
const PORT = process.env.PORT || 3000;

// ─── Middleware ──────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.NODE_ENV === "production"
    ? ["https://cash4cargo.mn"]
    : "*",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use("/api/auth",      authRoutes);
app.use("/api/shipments", shipmentRoutes);
app.use("/api/orders",    orderRoutes);

// ─── Health check ─────────────────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// ─── 404 ──────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint олдсонгүй" });
});

// ─── Error handler ────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("Гэнэтийн алдаа:", err.message);
  res.status(500).json({ error: "Серверийн алдаа" });
});

// ─── Start ────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Cash 4 Cargo API → http://localhost:${PORT}`);
  console.log(`   Орчин: ${process.env.NODE_ENV || "development"}`);
});

module.exports = app;
