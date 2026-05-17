const express = require("express");
const router = express.Router();

const {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
} = require("../controllers/orderController");

const { authMiddleware, adminOnly } = require("../middleware/auth");

// ─── Нийтийн (нэвтрэлгүй ч захиалга үүсгэж болно) ─────────────────────────
// Нэвтэрсэн бол user_id холбогдоно, нэвтрээгүй бол null
router.post("/", (req, res, next) => {
  // Нэвтрэлт сонголтоор
  const auth = req.headers.authorization;
  if (auth) {
    authMiddleware(req, res, next);
  } else {
    next();
  }
}, createOrder);

// ─── Admin ──────────────────────────────────────────────────────────────────
router.get("/", authMiddleware, adminOnly, getAllOrders);
router.get("/:id", authMiddleware, adminOnly, getOrderById);
router.patch("/:id/status", authMiddleware, adminOnly, updateOrderStatus);

module.exports = router;
