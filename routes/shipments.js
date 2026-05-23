import express from "express";
import Shipment from "../models/Shipment.js";
import { protect, optionalAuth, adminOnly } from "../middleware/auth.js";

// Express router үүсгэж байна.
// Энэ файл дотор /api/shipments холбоотой бүх route-ууд байрлана.
const router = express.Router();

// Монгол утасны дугаар шалгах regex.
// 6, 7, 8, 9-өөр эхэлсэн нийт 8 оронтой дугаар байх ёстой.
const PHONE_RE = /^[6-9]\d{7}$/;

// 1 кг тутмын тээврийн үнэ.
// .env файлд SHIPPING_RATE_PER_KG байвал түүнийг авна.
// Байхгүй бол default-аар 3500₮ гэж үзнэ.
const SHIPPING_RATE_PER_KG = Number(process.env.SHIPPING_RATE_PER_KG || 3500);

// Захиалга цуцлах боломжтой төлөвүүд.
// Зөвхөн энэ 2 төлөв дээр хэрэглэгч захиалгаа цуцалж болно.
const CANCEL_ALLOWED_STATUSES = [
  "Захиалга үүсгэсэн",
  "Хятадын агуулахад",
];

// Утасны дугаар цэвэрлэх функц.
// Жишээ нь: "9911-2233" → "99112233"
// Үсэг, зай, тэмдэгтүүдийг устгаад зөвхөн тоо үлдээнэ.
function cleanPhone(value = "") {
  return String(value).replace(/\D/g, "");
}

// Захиалгын бараануудыг backend-д хадгалахад тохиромжтой хэлбэрт оруулна.
// Frontend-ээс ирсэн items array-г шалгаж, зөв бүтэцтэй болгож буцаана.
function normalizeItems(items = []) {
  // items нь array биш байвал хоосон array болгоно.
  const safeItems = Array.isArray(items) ? items : [];

  return safeItems
    .map((item) => ({
      // item_name байхгүй бол name-ийг авна.
      // Аль аль нь байхгүй бол "Бараа" гэж default нэр өгнө.
      item_name: String(item.item_name || item.name || "Бараа").trim(),

      // quantity нь хамгийн багадаа 1 байна.
      // Хэрэглэгч 0 эсвэл буруу утга явуулсан ч 1 болгоно.
      quantity: Math.max(1, Number(item.quantity || 1)),

      // Барааны нэмэлт тайлбар.
      // Байхгүй бол хоосон string хадгална.
      description: item.description || "",

      // Нэг илгээмж нэг л нийт жинтэй.
      // Тиймээс бараа тус бүр дээр жин хадгалахгүй.
      weight: 0,

      // Бараа тус бүр дээр үнэ хадгалахгүй.
      // Нийт үнэ нь нийт жингээс бодогдоно.
      price: 0,
    }))
    // item_name хоосон болсон барааг устгана.
    .filter((item) => item.item_name);
}

// Request body-оос нийт жинг авах функц.
// Frontend эсвэл admin өөр өөр нэрээр weight явуулж магадгүй тул
// total_weight, package_weight, weight гэсэн 3 боломжийг шалгаж байна.
function getPackageWeight(body = {}) {
  const value = Number(
    body.total_weight ?? body.package_weight ?? body.weight ?? 0
  );

  // Хэрэв жин зөв тоо бол 2 орны нарийвчлалтай буцаана.
  // Буруу утга байвал 0 буцаана.
  return Number.isFinite(value) ? Number(value.toFixed(2)) : 0;
}

// Нийт жингээс тээврийн үнийг бодох функц.
// Жишээ: 2кг * 3500₮ = 7000₮
function calculateTotalsFromWeight(weight = 0) {
  const total_weight = Number(Number(weight || 0).toFixed(2));

  return {
    total_weight,
    shipping_price: Math.round(total_weight * SHIPPING_RATE_PER_KG),
  };
}

// Tracking code автоматаар үүсгэх функц.
// Жишээ code: MN-12345
async function generateTrackingCode() {
  // Давхцахаас сэргийлж 20 удаа оролдлого хийнэ.
  for (let i = 0; i < 20; i++) {
    const code = `MN-${Math.floor(10000 + Math.random() * 90000)}`;

    // Ийм tracking_code өмнө нь DB-д байгаа эсэхийг шалгана.
    const exists = await Shipment.exists({ tracking_code: code });

    // Давхцаагүй бол code-оо буцаана.
    if (!exists) return code;
  }

  // 20 удаа оролдоод бүгд давхцвал error үүсгэнэ.
  throw new Error("Tracking код үүсгэж чадсангүй");
}

// ─────────────────────────────────────────────────────────────
// GET /api/shipments/track/:code
// Tracking code ашиглаж нэг ачаа хайх route.
// Жишээ: GET /api/shipments/track/MN-12345
// ─────────────────────────────────────────────────────────────
router.get("/track/:code", async (req, res) => {
  try {
    // URL params-аас code авна.
    // trim() → зай арилгана.
    // toUpperCase() → жижиг үсгийг том болгоно.
    const code = req.params.code.trim().toUpperCase();

    // DB-ээс tracking_code таарсан нэг shipment хайна.
    const shipment = await Shipment.findOne({ tracking_code: code });

    // Ачаа олдохгүй бол 404 response буцаана.
    if (!shipment) {
      return res.status(404).json({
        message: `"${code}" кодтой ачаа олдсонгүй`,
      });
    }

    // Олдвол shipment мэдээллийг JSON хэлбэрээр буцаана.
    res.json(shipment);
  } catch (err) {
    // Сервер дээр алдаа гарвал 500 response буцаана.
    res.status(500).json({ message: "Серверийн алдаа" });
  }
});

// ─────────────────────────────────────────────────────────────
// GET /api/shipments/my
// Нэвтэрсэн хэрэглэгч өөрийн бүх захиалгыг харах route.
// Энэ route protect middleware ашиглаж байгаа тул login шаардлагатай.
// ─────────────────────────────────────────────────────────────
router.get("/my", protect, async (req, res) => {
  try {
    // Query дээр sort=oldest гэж ирвэл хуучнаас шинэ рүү эрэмбэлнэ.
    // Үгүй бол default-аар шинээс хуучин руу эрэмбэлнэ.
    const sortOrder = req.query.sort === "oldest" ? 1 : -1;

    // Login хийсэн хэрэглэгчийн утсаар бүх shipment-ийг хайна.
    const shipments = await Shipment.find({ user_phone: req.user.phone }).sort({
      createdAt: sortOrder,
    });

    // Олдсон shipments array-г буцаана.
    res.json(shipments);
  } catch (err) {
    res.status(500).json({ message: "Серверийн алдаа" });
  }
});

// ─────────────────────────────────────────────────────────────
// GET /api/shipments/by-phone/:phone
// Утасны дугаараар ачаанууд хайх route.
// Guest хэрэглэгч login хийхгүйгээр утсаар хайж болно.
// Жишээ: GET /api/shipments/by-phone/99112233
// ─────────────────────────────────────────────────────────────
router.get("/by-phone/:phone", async (req, res) => {
  try {
    // URL params-аас phone авж, зөвхөн тоо үлдээнэ.
    const phone = cleanPhone(req.params.phone);

    // Эрэмбэлэх дараалал.
    const sortOrder = req.query.sort === "oldest" ? 1 : -1;

    // Утасны дугаар 8 оронтой, 6-9 хооронд эхэлсэн эсэхийг шалгана.
    if (!PHONE_RE.test(phone)) {
      return res.status(400).json({
        message: "Утасны дугаар буруу байна",
      });
    }

    // DB-ээс тухайн утасны дугаартай бүх ачааг хайна.
    const shipments = await Shipment.find({ user_phone: phone }).sort({
      createdAt: sortOrder,
    });

    // Нэг ч ачаа олдохгүй бол 404 буцаана.
    if (shipments.length === 0) {
      return res.status(404).json({
        message: `"${phone}" дугаартай ачаа олдсонгүй`,
      });
    }

    // Олдсон ачаануудыг буцаана.
    res.json(shipments);
  } catch (err) {
    res.status(500).json({ message: "Серверийн алдаа" });
  }
});

// ─────────────────────────────────────────────────────────────
// PUT /api/shipments/:id/cancel
// Нэвтэрсэн хэрэглэгч өөрийн захиалгыг цуцлах route.
// Зөвхөн "Захиалга үүсгэсэн" болон "Хятадын агуулахад" үед цуцална.
// ─────────────────────────────────────────────────────────────
router.put("/:id/cancel", protect, async (req, res) => {
  try {
    // URL params-аас id авч shipment хайна.
    const shipment = await Shipment.findById(req.params.id);

    // Shipment олдохгүй бол 404 буцаана.
    if (!shipment) {
      return res.status(404).json({
        message: "Ачаа олдсонгүй",
      });
    }

    // Захиалгын утас login хийсэн хэрэглэгчийн утастай таарах ёстой.
    // Харин admin бол бусдын захиалгыг цуцалж болно.
    if (shipment.user_phone !== req.user.phone && req.user.role !== "admin") {
      return res.status(403).json({
        message: "Энэ захиалгыг цуцлах эрхгүй байна",
      });
    }

    // Одоогийн shipment.status нь цуцлах боломжтой төлөв мөн эсэхийг шалгана.
    if (!CANCEL_ALLOWED_STATUSES.includes(shipment.status)) {
      return res.status(400).json({
        message:
          "Энэ төлөв дээр захиалга цуцлах боломжгүй. Зөвхөн 'Захиалга үүсгэсэн' болон 'Хятадын агуулахад' үед цуцална.",
      });
    }

    // Shipment-ийн үндсэн status-ийг "Цуцлагдсан" болгоно.
    shipment.status = "Цуцлагдсан";

    // Status history-д цуцалсан тухай тэмдэглэл нэмнэ.
    shipment.status_history.push({
      status: "Цуцлагдсан",
      description: req.body?.description || "Хэрэглэгч захиалгаа цуцалсан",
      updatedAt: new Date(),
    });

    // Өөрчлөлтийг DB-д хадгална.
    await shipment.save();

    // Шинэчлэгдсэн shipment-ийг буцаана.
    res.json(shipment);
  } catch (err) {
    res.status(500).json({ message: "Серверийн алдаа" });
  }
});

// ═══════════════════════════════════════════════════════════════
// ADMIN ROUTES
// Доорх route-ууд зөвхөн admin хэрэглэгчид зориулагдсан.
// protect → login хийсэн эсэхийг шалгана.
// adminOnly → role нь admin эсэхийг шалгана.
// ═══════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────
// GET /api/shipments
// Admin бүх захиалгыг харах, filter хийх route.
// Query example:
// /api/shipments?status=Хятадын агуулахад&phone=99112233&page=1&limit=20&sort=newest
// ─────────────────────────────────────────────────────────────
router.get("/", protect, adminOnly, async (req, res) => {
  try {
    // Query string-ээс filter болон pagination-ийн утгуудыг авна.
    const {
      status,
      phone,
      page = 1,
      limit = 100,
      sort = "newest",
    } = req.query;

    // MongoDB filter object.
    const filter = {};

    // sort=oldest бол хуучнаас шинэ рүү, бусад үед шинээс хуучин руу.
    const sortOrder = sort === "oldest" ? 1 : -1;

    // status ирсэн бол filter дээр нэмнэ.
    if (status) filter.status = status;

    // phone ирсэн бол цэвэрлээд filter дээр нэмнэ.
    if (phone) filter.user_phone = cleanPhone(phone);

    // Pagination хийхийн тулд хэдэн document алгасахыг бодно.
    // Жишээ: page=2, limit=10 бол эхний 10-г алгасаад дараагийн 10-г авна.
    const skip = (Number(page) - 1) * Number(limit);

    // Promise.all ашиглаж 2 query-г зэрэг ажиллуулна:
    // 1. shipments авах
    // 2. нийт хэдэн shipment байгааг тоолох
    const [shipments, total] = await Promise.all([
      Shipment.find(filter)
        .sort({ createdAt: sortOrder })
        .skip(skip)
        .limit(Number(limit)),

      Shipment.countDocuments(filter),
    ]);

    // Admin panel-д хэрэгтэй байдлаар data буцаана.
    res.json({
      shipments,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    res.status(500).json({ message: "Серверийн алдаа" });
  }
});

// ─────────────────────────────────────────────────────────────
// POST /api/shipments
// Шинэ захиалга үүсгэх route.
// optionalAuth ашиглаж байгаа тул login хийсэн ч болно, login хийгээгүй ч болно.
// Guest хэрэглэгч захиалга үүсгэж чадна.
// Чухал: Шинэ захиалга үргэлж "Захиалга үүсгэсэн" төлөвтэй,
// нийт жин 0, тээврийн үнэ 0 гэж DB-д хадгалагдана.
// Admin дараа нь нийт жин оруулах үед л үнэ бодогдоно.
// ─────────────────────────────────────────────────────────────
router.post("/", optionalAuth, async (req, res) => {
  try {
    // Хэрэв хэрэглэгч login хийсэн бол req.user.phone-оос утас авна.
    const loggedInPhone = cleanPhone(req.user?.phone || "");

    // Body дээр user_phone эсвэл receiver_phone ирсэн бол түүнийг авна.
    const bodyPhone = cleanPhone(
      req.body.user_phone || req.body.receiver_phone || ""
    );

    // Admin бол bodyPhone ашиглана.
    // Энгийн хэрэглэгч бол login хийсэн утас эсвэл bodyPhone ашиглана.
    const orderPhone =
      req.user?.role === "admin" ? bodyPhone : loggedInPhone || bodyPhone;

    // Утасны дугаар буруу бол захиалга үүсгэхгүй.
    if (!PHONE_RE.test(orderPhone)) {
      return res.status(400).json({
        message: "Утасны дугаар буруу байна",
      });
    }

    // Frontend-ээс ирсэн бараануудыг цэвэрлэж, зөв бүтэцтэй болгоно.
    const items = normalizeItems(req.body.items);

    // Дор хаяж 1 бараа байх ёстой.
    if (!items.length) {
      return res.status(400).json({
        message: "Дор хаяж нэг бараа нэмнэ үү",
      });
    }

    // Шинэ захиалга үүсэх үед хэрэглэгч/admin body-оор status, weight, price явуулсан ч
    // шууд ашиглахгүй. Ингэснээр захиалга анх үүсэхэд жин/үнэ 0 хэвээр байна.
    const status = "Захиалга үүсгэсэн";
    const totals = {
      total_weight: 0,
      shipping_price: 0,
    };

    // Хэрэв body дээр tracking_code ирсэн бол түүнийг ашиглана.
    // Ирэхгүй бол автоматаар tracking code үүсгэнэ.
    const trackingCode = req.body.tracking_code
      ? String(req.body.tracking_code).trim().toUpperCase()
      : await generateTrackingCode();

    // Shipment document үүсгэж DB-д хадгална.
    // Энд ...req.body гэж тарааж хадгалахгүй. Учир нь body дотор ирсэн
    // total_weight/shipping_price/status санамсаргүйгээр 0 утгыг дарахаас хамгаална.
    const shipment = await Shipment.create({
      items,
      ...totals,

      // Захиалагчийн утас.
      user_phone: orderPhone,

      // Хүлээн авагчийн утас.
      receiver_phone: orderPhone,

      // Tracking code.
      tracking_code: trackingCode,

      // Илгээгч/хүлээн авагчийн нэр.
      sender_name: req.body.sender_name || req.user?.name || "Захиалагч",
      receiver_name: req.body.receiver_name || req.user?.name || "Захиалагч",

      // Захиалга анх үүсэх төлөв.
      status,

      // Анх үүсэхэд төлөгдөөгүй гэж хадгална.
      payment_status: "Төлөгдөөгүй",

      // Захиалга үүсэх үед status history эхэлнэ.
      status_history: [
        {
          status,
          description: "Захиалга бүртгэгдлээ",
          updatedAt: new Date(),
        },
      ],
    });

    // Амжилттай үүссэн shipment-ийг 201 status-тэй буцаана.
    res.status(201).json(shipment);
  } catch (err) {
    // Mongoose validation error гарвал бүх message-ийг нэгтгээд буцаана.
    if (err.name === "ValidationError") {
      const msgs = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({
        message: msgs.join(", "),
      });
    }

    // Duplicate key error.
    // Жишээ нь tracking_code давхардвал 11000 error гарна.
    if (err.code === 11000) {
      return res.status(400).json({
        message: "Энэ tracking код бүртгэлтэй байна",
      });
    }

    // Бусад серверийн алдаа.
    res.status(500).json({
      message: "Серверийн алдаа",
    });
  }
});

// ─────────────────────────────────────────────────────────────
// PUT /api/shipments/:id/status
// Admin shipment-ийн status шинэчлэх route.
// Жишээ status: "Хятадын агуулахад", "Замын Үүд дээр", "Улаанбаатарт ирсэн"
// ─────────────────────────────────────────────────────────────
router.put("/:id/status", protect, adminOnly, async (req, res) => {
  try {
    // Body-оос status болон description авна.
    const { status, description } = req.body;

    // Status заавал байх ёстой.
    if (!status) {
      return res.status(400).json({
        message: "Статус оруулна уу",
      });
    }

    // Shipment-ийг id-аар хайна.
    const shipment = await Shipment.findById(req.params.id);

    // Олдохгүй бол 404 буцаана.
    if (!shipment) {
      return res.status(404).json({
        message: "Ачаа олдсонгүй",
      });
    }

    // Үндсэн status-ийг шинэчилнэ.
    shipment.status = status;

    // Status history-д шинэ status нэмнэ.
    shipment.status_history.push({
      status,
      description: description || "",
      updatedAt: new Date(),
    });

    // DB-д хадгална.
    await shipment.save();

    // Шинэчлэгдсэн shipment буцаана.
    res.json(shipment);
  } catch (err) {
    res.status(500).json({
      message: "Серверийн алдаа",
    });
  }
});

// ─────────────────────────────────────────────────────────────
// PUT /api/shipments/:id
// Admin ачааны нийт жин засах route.
// Жин өөрчлөгдвөл тээврийн үнэ автоматаар дахин бодогдоно.
// ─────────────────────────────────────────────────────────────
router.put("/:id", protect, adminOnly, async (req, res) => {
  try {
    // Shipment-ийг id-аар хайна.
    const shipment = await Shipment.findById(req.params.id);

    // Олдохгүй бол 404 буцаана.
    if (!shipment) {
      return res.status(404).json({
        message: "Ачаа олдсонгүй",
      });
    }

    // Admin энэ endpoint-оор зөвхөн илгээмжийн НИЙТ ЖИН-г засна.
    // Үнэ нь нийт жингээс автоматаар дахин бодогдоно.
    const packageWeight = getPackageWeight(req.body);

    // Жин 0 эсвэл түүнээс бага байж болохгүй.
    if (packageWeight <= 0) {
      return res.status(400).json({
        message: "Шинэ нийт жинг оруулна уу",
      });
    }

    // Шинэ жингээс үнэ дахин бодно.
    const totals = calculateTotalsFromWeight(packageWeight);

    // Shipment дээр нийт жин болон үнийг шинэчилнэ.
    shipment.total_weight = totals.total_weight;
    shipment.shipping_price = totals.shipping_price;

    // Хэрэв admin description бичсэн бол status_history-д тэмдэглэл болгон нэмнэ.
    if (req.body.description) {
      shipment.status_history.push({
        status: shipment.status,
        description: req.body.description,
        updatedAt: new Date(),
      });
    }

    // Өөрчлөлтийг хадгална.
    await shipment.save();

    // Шинэчлэгдсэн shipment буцаана.
    res.json(shipment);
  } catch (err) {
    // Validation error байвал дэлгэрэнгүй message буцаана.
    if (err.name === "ValidationError") {
      const msgs = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({
        message: msgs.join(", "),
      });
    }

    // Бусад серверийн алдаа.
    res.status(500).json({
      message: "Серверийн алдаа",
    });
  }
});

// ─────────────────────────────────────────────────────────────
// DELETE /api/shipments/:id
// Admin shipment устгах route.
// ─────────────────────────────────────────────────────────────
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    // Shipment-ийг id-аар хайж устгана.
    const shipment = await Shipment.findByIdAndDelete(req.params.id);

    // Хэрэв ийм id-тай shipment байхгүй бол 404 буцаана.
    if (!shipment) {
      return res.status(404).json({
        message: "Ачаа олдсонгүй",
      });
    }

    // Амжилттай устсан message буцаана.
    res.json({
      message: "Ачаа устгагдлаа",
    });
  } catch (err) {
    res.status(500).json({
      message: "Серверийн алдаа",
    });
  }
});

// Энэ router-ийг server.js дээр import хийж ашиглана.
// Жишээ:
// app.use("/api/shipments", shipmentRoutes);
export default router;