const pool = require("../db/pool");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

function generateToken(user) {
  return jwt.sign(
    { id: user.id, phone: user.phone, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

// POST /api/auth/register
async function register(req, res) {
  const { name, phone, email, password } = req.body;

  if (!phone || !password) {
    return res.status(400).json({ error: "Утасны дугаар болон нууц үг заавал шаардлагатай" });
  }

  if (!/^[6-9]\d{7}$/.test(phone)) {
    return res.status(400).json({ error: "Утасны дугаар буруу байна" });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: "Нууц үг дор хаяж 6 тэмдэгт байна" });
  }

  try {
    const exists = await pool.query(
      "SELECT id FROM users WHERE phone = $1 OR (email = $2 AND $2 IS NOT NULL)",
      [phone, email || null]
    );

    if (exists.rows.length > 0) {
      return res.status(409).json({ error: "Утасны дугаар эсвэл имэйл бүртгэлтэй байна" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (name, phone, email, password)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, phone, email, role, created_at`,
      [name || null, phone, email || null, hashed]
    );

    const user = result.rows[0];
    const token = generateToken(user);

    res.status(201).json({ token, user });
  } catch (err) {
    console.error("Register алдаа:", err.message);
    res.status(500).json({ error: "Серверийн алдаа" });
  }
}

// POST /api/auth/login
async function login(req, res) {
  const { phone, email, password } = req.body;

  const identifier = phone || email;
  if (!identifier || !password) {
    return res.status(400).json({ error: "Нэвтрэх мэдээлэл дутуу байна" });
  }

  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE phone = $1 OR email = $1",
      [identifier]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Хэрэглэгч олдсонгүй" });
    }

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({ error: "Нууц үг буруу байна" });
    }

    const token = generateToken(user);

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Login алдаа:", err.message);
    res.status(500).json({ error: "Серверийн алдаа" });
  }
}

// GET /api/auth/me
async function me(req, res) {
  try {
    const result = await pool.query(
      "SELECT id, name, phone, email, role, created_at FROM users WHERE id = $1",
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Хэрэглэгч олдсонгүй" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Me алдаа:", err.message);
    res.status(500).json({ error: "Серверийн алдаа" });
  }
}

module.exports = { register, login, me };
