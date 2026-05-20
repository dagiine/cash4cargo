import express from "express";
import Shipment from "../models/Shipment.js";
import { protect, optionalAuth, adminOnly } from "../middleware/auth.js";

const router = express.Router();

const PHONE_RE = /^[6-9]\d{7}$/;

async function generateTrackingCode() {
  for (let i = 0; i < 20; i++) {
    const code = `MN-${Math.floor(10000 + Math.random() * 90000)}`;
    const exists = await Shipment.exists({ tracking_code: code });
    if (!exists) return code;
  }
  throw new Error("Tracking код үүсгэж чадсангүй");
}


// ─── GET /api/shipments/track/:code ──────────────────────────
// Хэн ч tracking code-оор хайж болно (нэвтрэлт шаардлагагүй)
router.get("/track/:code", async (req, res) => {
  try {
    const code = req.params.code.trim().toUpperCase();
    const shipment = await Shipment.findOne({ tracking_code: code });

    if (!shipment) {
      return res.status(404).json({ message: `"${code}" кодтой ачаа олдсонгүй` });
    }

    res.json(shipment);
  } catch (err) {
    res.status(500).json({ message: "Серверийн алдаа" });
  }
});

// ─── GET /api/shipments/my ───────────────────────────────────
// Нэвтэрсэн хэрэглэгчийн утасны дугаараар БҮГД ачааг хайна
router.get("/my", protect, async (req, res) => {
  try {
    const phone = req.user.phone;

    const shipments = await Shipment.find({ user_phone: phone }).sort({
      createdAt: -1,
    });

    // Нэвтэрсэн үед хоосон байсан ч 200 буцаана — frontend-д ачаа байхгүй гэдгийг мессежээр харуулна
    res.json(shipments);
  } catch (err) {
    res.status(500).json({ message: "Серверийн алдаа" });
  }
});

// ─── GET /api/shipments/by-phone/:phone ──────────────────────
// Зочны утасны дугаараар хайх (нэвтрэлт шаардлагагүй)
router.get("/by-phone/:phone", async (req, res) => {
  try {
    const phone = req.params.phone.trim().replace(/\D/g, "");

    if (!/^[6-9]\d{7}$/.test(phone)) {
      return res.status(400).json({ message: "Утасны дугаар буруу байна" });
    }

    const shipments = await Shipment.find({ user_phone: phone }).sort({
      createdAt: -1,
    });

    if (shipments.length === 0) {
      return res.status(404).json({ message: `"${phone}" дугаартай ачаа олдсонгүй` });
    }

    res.json(shipments);
  } catch (err) {
    res.status(500).json({ message: "Серверийн алдаа" });
  }
});

// ═══════════════════════════════════════════════════════════════
// ADMIN ROUTES — зөвхөн admin хандана
// ═══════════════════════════════════════════════════════════════

// ─── GET /api/shipments ──────────────────────────────────────
// Бүх ачааны жагсаалт
router.get("/", protect, adminOnly, async (req, res) => {
  try {
    const { status, phone, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (phone) filter.user_phone = phone.replace(/\D/g, "");

    const skip = (Number(page) - 1) * Number(limit);
    const [shipments, total] = await Promise.all([
      Shipment.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Shipment.countDocuments(filter),
    ]);

    res.json({ shipments, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ message: "Серверийн алдаа" });
  }
});

// ─── POST /api/shipments ─────────────────────────────────────
// Шинэ ачаа үүсгэх
// - Зочин үед: body.user_phone дугаараар order үүсгэнэ
// - Нэвтэрсэн үед: body.user_phone-г үл тоож req.user.phone дээр order үүсгэнэ
router.post("/", optionalAuth, async (req, res) => {
  try {
    const loggedInPhone = req.user?.phone?.replace(/\D/g, "");
    const guestPhone = String(req.body.user_phone || req.body.receiver_phone || "").replace(/\D/g, "");
    const orderPhone = loggedInPhone || guestPhone;

    if (!PHONE_RE.test(orderPhone)) {
      return res.status(400).json({ message: "Утасны дугаар буруу байна" });
    }

    const status = req.body.status || "Захиалга үүсгэсэн";
    const trackingCode = req.body.tracking_code
      ? String(req.body.tracking_code).trim().toUpperCase()
      : await generateTrackingCode();

    const shipment = await Shipment.create({
      ...req.body,
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
// Ачааны статус шинэчлэх
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
    shipment.status_history.push({
      status,
      description: description || "",
      updatedAt: new Date(),
    });

    await shipment.save();
    res.json(shipment);
  } catch (err) {
    res.status(500).json({ message: "Серверийн алдаа" });
  }
});

// ─── PUT /api/shipments/:id ───────────────────────────────────
// Ачааны мэдээлэл шинэчлэх
router.put("/:id", protect, adminOnly, async (req, res) => {
  try {
    const shipment = await Shipment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!shipment) {
      return res.status(404).json({ message: "Ачаа олдсонгүй" });
    }

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
