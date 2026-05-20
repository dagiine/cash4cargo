import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// JWT token үүсгэх helper
function generateToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

// ─── POST /api/auth/register ──────────────────────────────────
// Шинэ хэрэглэгч бүртгэх
router.post("/register", async (req, res) => {
  try {
    const { name, phone, password } = req.body;

    if (!name || !phone || !password) {
      return res.status(400).json({ message: "Бүх талбарыг бөглөнө үү" });
    }

    const exists = await User.findOne({ phone });
    if (exists) {
      return res.status(400).json({ message: "Энэ утасны дугаар бүртгэлтэй байна" });
    }

    const user = await User.create({
      name,
      phone,
      password_hash: password, // pre-save hook hash хийнэ
    });

    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (err) {
    if (err.name === "ValidationError") {
      const msgs = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ message: msgs.join(", ") });
    }
    res.status(500).json({ message: "Серверийн алдаа" });
  }
});

// ─── POST /api/auth/login ─────────────────────────────────────
// Нэвтрэх (утасны дугаар + нууц үг)
router.post("/login", async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ message: "Утасны дугаар болон нууц үг оруулна уу" });
    }

    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(401).json({ message: "Утасны дугаар эсвэл нууц үг буруу" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Утасны дугаар эсвэл нууц үг буруу" });
    }

    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Серверийн алдаа" });
  }
});

// ─── GET /api/auth/me ─────────────────────────────────────────
// Одоогийн нэвтэрсэн хэрэглэгчийн мэдээлэл
router.get("/me", protect, (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      phone: req.user.phone,
      role: req.user.role,
    },
  });
});


// ─── PUT /api/auth/password ───────────────────────────────────
// Одоогийн нэвтэрсэн хэрэглэгчийн нууц үг шинэчлэх
router.put("/password", protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Одоогийн болон шинэ нууц үгийг оруулна уу" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Шинэ нууц үг дор хаяж 6 тэмдэгт байна" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "Хэрэглэгч олдсонгүй" });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: "Одоогийн нууц үг буруу байна" });
    }

    user.password_hash = newPassword; // pre-save hook hash хийнэ
    await user.save();

    res.json({ message: "Нууц үг амжилттай шинэчлэгдлээ" });
  } catch (err) {
    res.status(500).json({ message: "Серверийн алдаа" });
  }
});

export default router;
