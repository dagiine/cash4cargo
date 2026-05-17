const express = require("express");
const router = express.Router();

const {
  trackShipment,
  getAllShipments,
  getShipmentById,
  createShipment,
  updateStatus,
  updatePayment,
  deleteShipment,
} = require("../controllers/shipmentController");

const { authMiddleware, adminOnly } = require("../middleware/auth");

// ─── Нийтийн ───────────────────────────────────────────────────────────────
// GET /api/shipments/track?query=MN-12345
router.get("/track", trackShipment);

// ─── Admin үүрэгтэй хэрэглэгчид ────────────────────────────────────────────
router.use(authMiddleware, adminOnly);

router.get("/", getAllShipments);
router.get("/:id", getShipmentById);
router.post("/", createShipment);
router.patch("/:id/status", updateStatus);
router.patch("/:id/payment", updatePayment);
router.delete("/:id", deleteShipment);

module.exports = router;
