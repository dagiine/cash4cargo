const express = require("express");
const router = express.Router();

const { register, login, me } = require("../controllers/authController");
const { authMiddleware, adminOnly } = require("../middleware/auth");

// Нийтийн
router.post("/register", register);
router.post("/login", login);

// Нэвтэрсэн хэрэглэгч
router.get("/me", authMiddleware, me);

module.exports = router;
