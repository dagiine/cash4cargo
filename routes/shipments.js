import express from "express";
import Shipment from "../models/Shipment.js";
import { protect, optionalAuth, adminOnly } from "../middleware/auth.js";

const router = express.Router();
const PHONE_RE = /^[6-9]\d{7}$/;
const SHIPPING_RATE_PER_KG = Number(process.env.SHIPPING_RATE_PER_KG || 3500);
const CANCEL_ALLOWED_STATUSES = ["Захиалга үүсгэсэн", "Хятадын агуулахад"];

function cleanPhone(value = "") {
  return String(value).replace(/\D/g, "");
}

function normalizeItems(items = []) {
  const safeItems = Array.isArray(items) ? items : [];

  return safeItems
    .map((item) => ({
      item_name: String(item.item_name || item.name || "Бараа").trim(),
      quantity: Math.max(1, Number(item.quantity || 1)),
      description: item.description || "",
      // Нэг илгээмж нэг л нийт жинтэй. Бараа тус бүр дээр жин/үнэ хадгалахгүй.
      weight: 0,
      price: 0,
    }))
    .filter((item) => item.item_name);
}

function getPackageWeight(body = {}) {
  const value = Number(body.total_weight ?? body.package_weight ?? body.weight ?? 0);
  return Number.isFinite(value) ? Number(value.toFixed(2)) : 0;
}

function calculateTotalsFromWeight(weight = 0) {
  const total_weight = Number(Number(weight || 0).toFixed(2));
  return {
    total_weight,
    shipping_price: Math.round(total_weight * SHIPPING_RATE_PER_KG),
  };
}

function calculateTotals(items = []) {
  const total_weight = items.reduce((sum, item) => sum + Number(item.weight || 0), 0);
  const shipping_price = items.reduce((sum, item) => sum + Number(item.price || 0), 0);
  return {
    total_weight: Number(total_weight.toFixed(2)),
    shipping_price,
  };
}

async function generateTrackingCode() {
  for (let i = 0; i < 20; i++) {
    const code = `MN-${Math.floor(10000 + Math.random() * 90000)}`;
    const exists = await Shipment.exists({ tracking_code: code });
    if (!exists) return code;
  }
  throw new Error("Tracking код үүсгэж чадсангүй");
}

// ─── GET /api/shipments/track/:code ──────────────────────────
router.get("/track/:code", async (req, res) => {
  try {
    const code = req.params.code.trim().toUpperCase();
    const shipment = await Shipment.findOne({ tracking_code: code });

    if (!shipment) {
      return res.status(404).json({ message: `"${code}" дугаартай ачаа олдсонгүй` });
    }

    res.json(shipment);
  } catch (err) {
    res.status(500).json({ message: "Серверийн алдаа" });
  }
});

// ─── GET /api/shipments/my ───────────────────────────────────
router.get("/my", protect, async (req, res) => {
  try {
    const sortOrder = req.query.sort === "oldest" ? 1 : -1;
    const shipments = await Shipment.find({ user_phone: req.user.phone }).sort({ createdAt: sortOrder });
    res.json(shipments);
  } catch (err) {
    res.status(500).json({ message: "Серверийн алдаа" });
  }
});

// ─── GET /api/shipments/by-phone/:phone ──────────────────────
router.get("/by-phone/:phone", async (req, res) => {
  try {
    const phone = cleanPhone(req.params.phone);
    const sortOrder = req.query.sort === "oldest" ? 1 : -1;

    if (!PHONE_RE.test(phone)) {
      return res.status(400).json({ message: "Утасны дугаар буруу байна" });
    }

    const shipments = await Shipment.find({ user_phone: phone }).sort({ createdAt: sortOrder });

    if (shipments.length === 0) {
      return res.status(404).json({ message: `"${phone}" дугаартай ачаа олдсонгүй` });
    }

    res.json(shipments);
  } catch (err) {
    res.status(500).json({ message: "Серверийн алдаа" });
  }
});


// ─── PUT /api/shipments/:id/cancel ──────────────────────────
// Нэвтэрсэн хэрэглэгч өөрийн захиалгыг эхний 2 төлөв дээр цуцлах боломжтой.
router.put("/:id/cancel", protect, async (req, res) => {
  try {
    const shipment = await Shipment.findById(req.params.id);

    if (!shipment) {
      return res.status(404).json({ message: "Ачаа олдсонгүй" });
    }

    if (shipment.user_phone !== req.user.phone && req.user.role !== "admin") {
      return res.status(403).json({ message: "Энэ захиалгыг цуцлах эрхгүй байна" });
    }

    if (!CANCEL_ALLOWED_STATUSES.includes(shipment.status)) {
      return res.status(400).json({
        message: "Энэ төлөв дээр захиалга цуцлах боломжгүй. Зөвхөн 'Захиалга үүсгэсэн' болон 'Хятадын агуулахад' үед цуцална.",
      });
    }

    shipment.status = "Цуцлагдсан";
    shipment.status_history.push({
      status: "Цуцлагдсан",
      description: req.body?.description || "Хэрэглэгч захиалгаа цуцалсан",
      updatedAt: new Date(),
    });

    await shipment.save();
    res.json(shipment);
  } catch (err) {
    res.status(500).json({ message: "Серверийн алдаа" });
  }
});

// ═══════════════════════════════════════════════════════════════
// ADMIN ROUTES
// ═══════════════════════════════════════════════════════════════

// ─── GET /api/shipments ──────────────────────────────────────
router.get("/", protect, adminOnly, async (req, res) => {
  try {
    const { status, phone, page = 1, limit = 100, sort = "newest" } = req.query;
    const filter = {};
    const sortOrder = sort === "oldest" ? 1 : -1;

    if (status) filter.status = status;
    if (phone) filter.user_phone = cleanPhone(phone);

    const skip = (Number(page) - 1) * Number(limit);
    const [shipments, total] = await Promise.all([
      Shipment.find(filter).sort({ createdAt: sortOrder }).skip(skip).limit(Number(limit)),
      Shipment.countDocuments(filter),
    ]);

    res.json({ shipments, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ message: "Серверийн алдаа" });
  }
});

// ─── POST /api/shipments ─────────────────────────────────────
router.post("/", optionalAuth, async (req, res) => {
  try {
    const loggedInPhone = cleanPhone(req.user?.phone || "");
    const bodyPhone = cleanPhone(req.body.user_phone || req.body.receiver_phone || "");
    const orderPhone = req.user?.role === "admin" ? bodyPhone : loggedInPhone || bodyPhone;

    if (!PHONE_RE.test(orderPhone)) {
      return res.status(400).json({ message: "Утасны дугаар буруу байна" });
    }

    const items = normalizeItems(req.body.items);
    if (!items.length) {
      return res.status(400).json({ message: "Дор хаяж нэг бараа нэмнэ үү" });
    }

    // Public user захиалга үүсгэх үед жин оруулахгүй байж болно.
    // Admin дараа нь нийт жинг оруулмагц үнэ автоматаар бодогдоно.
    const packageWeight = getPackageWeight(req.body);
    const totals = calculateTotalsFromWeight(packageWeight);
    const status = req.body.status || "Захиалга үүсгэсэн";
    const trackingCode = req.body.tracking_code
      ? String(req.body.tracking_code).trim().toUpperCase()
      : await generateTrackingCode();

    const shipment = await Shipment.create({
      ...req.body,
      items,
      ...totals,
      user_phone: orderPhone,
      receiver_phone: orderPhone,
      tracking_code: trackingCode,
      sender_name: req.body.sender_name || req.user?.name || "Захиалагч",
      receiver_name: req.body.receiver_name || req.user?.name || "Захиалагч",
      status,
      status_history: [
        {
          status,
          description: "Захиалга бүртгэгдлээ",
          updatedAt: new Date(),
        },
      ],
    });

    res.status(201).json(shipment);
  } catch (err) {
    if (err.name === "ValidationError") {
      const msgs = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ message: msgs.join(", ") });
    }
    if (err.code === 11000) {
      return res.status(400).json({ message: "Энэ tracking код бүртгэлтэй байна" });
    }
    res.status(500).json({ message: "Серверийн алдаа" });
  }
});

// ─── PUT /api/shipments/:id/status ───────────────────────────
router.put("/:id/status", protect, adminOnly, async (req, res) => {
  try {
    const { status, description } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Статус оруулна уу" });
    }

    const shipment = await Shipment.findById(req.params.id);
    if (!shipment) {
      return res.status(404).json({ message: "Ачаа олдсонгүй" });
    }

    shipment.status = status;
    shipment.status_history.push({ status, description: description || "", updatedAt: new Date() });

    await shipment.save();
    res.json(shipment);
  } catch (err) {
    res.status(500).json({ message: "Серверийн алдаа" });
  }
});

// ─── PUT /api/shipments/:id ───────────────────────────────────
// Admin ачааны мэдээлэл засах. Жин өөрчлөгдвөл үнэ автоматаар дахин бодогдоно.
router.put("/:id", protect, adminOnly, async (req, res) => {
  try {
    const shipment = await Shipment.findById(req.params.id);
    if (!shipment) {
      return res.status(404).json({ message: "Ачаа олдсонгүй" });
    }

    // Admin энэ endpoint-оор зөвхөн илгээмжийн НИЙТ ЖИН-г засна.
    // Үнэ нь нийт жингээс автоматаар дахин бодогдоно.
    const packageWeight = getPackageWeight(req.body);
    if (packageWeight <= 0) {
      return res.status(400).json({ message: "Шинэ нийт жинг оруулна уу" });
    }

    const totals = calculateTotalsFromWeight(packageWeight);
    shipment.total_weight = totals.total_weight;
    shipment.shipping_price = totals.shipping_price;

    if (req.body.description) {
      shipment.status_history.push({
        status: shipment.status,
        description: req.body.description,
        updatedAt: new Date(),
      });
    }

    await shipment.save();
    res.json(shipment);
  } catch (err) {
    if (err.name === "ValidationError") {
      const msgs = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ message: msgs.join(", ") });
    }
    res.status(500).json({ message: "Серверийн алдаа" });
  }
});

// ─── DELETE /api/shipments/:id ───────────────────────────────
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    const shipment = await Shipment.findByIdAndDelete(req.params.id);
    if (!shipment) {
      return res.status(404).json({ message: "Ачаа олдсонгүй" });
    }
    res.json({ message: "Ачаа устгагдлаа" });
  } catch (err) {
    res.status(500).json({ message: "Серверийн алдаа" });
  }
});

export default router;