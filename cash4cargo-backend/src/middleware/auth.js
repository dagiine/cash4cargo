const jwt = require("jsonwebtoken");
require("dotenv").config();

/**
 * JWT токен шалгах middleware
 */
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Нэвтрэх шаардлагатай" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: "Токен хүчингүй эсвэл хугацаа дууссан" });
  }
}

/**
 * Зөвхөн admin үүргийн хэрэглэгч
 */
function adminOnly(req, res, next) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ error: "Зөвшөөрөл хүрэлцэхгүй" });
  }
  next();
}

module.exports = { authMiddleware, adminOnly };
