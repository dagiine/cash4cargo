import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Нэвтрэлт шалгах middleware
export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "Нэвтрэх шаардлагатай" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password_hash");

    if (!req.user) {
      return res.status(401).json({ message: "Хэрэглэгч олдсонгүй" });
    }

    next();
  } catch (err) {
    return res.status(401).json({ message: "Token буруу эсвэл хүчингүй" });
  }
};

// Token байвал хэрэглэгчийг уншина, token байхгүй бол зочноор үргэлжлүүлнэ
export const optionalAuth = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  // Зочин хэрэглэгч — order үүсгэхийг зөвшөөрнө
  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password_hash");

    if (!req.user) {
      req.user = null;
      return next();
    }

    next();
  } catch (err) {
    // Public order үүсгэх үед хуучин/буруу token байвал зочин гэж үзээд үргэлжлүүлнэ.
    req.user = null;
    return next();
  }
};

// Admin шалгах middleware
export const adminOnly = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Зөвхөн admin хандах боломжтой" });
  }
  next();
};