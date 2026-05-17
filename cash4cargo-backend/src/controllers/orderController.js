const pool = require("../db/pool");

// POST /api/orders  (нийтийн — нэвтрэлгүй захиалга үүсгэх)
async function createOrder(req, res) {
  const { phone, items } = req.body;

  if (!phone || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "phone болон items заавал шаардлагатай" });
  }

  if (!/^[6-9]\d{7}$/.test(phone)) {
    return res.status(400).json({ error: "Утасны дугаар буруу байна" });
  }

  for (const item of items) {
    if (!item.track_code || !item.name) {
      return res.status(400).json({ error: "Бараа бүрийн track_code болон name заавал шаардлагатай" });
    }
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Хэрэглэгч нэвтэрсэн бол холбох
    const userId = req.user?.id || null;

    const orderResult = await client.query(
      "INSERT INTO orders (user_id, phone) VALUES ($1, $2) RETURNING *",
      [userId, phone]
    );

    const orderId = orderResult.rows[0].id;

    for (const item of items) {
      await client.query(
        "INSERT INTO order_items (order_id, track_code, name, qty) VALUES ($1, $2, $3, $4)",
        [orderId, item.track_code.trim(), item.name.trim(), item.qty || 1]
      );
    }

    await client.query("COMMIT");

    const full = await pool.query(
      `SELECT o.*, json_agg(oi ORDER BY oi.id) AS items
       FROM orders o
       JOIN order_items oi ON oi.order_id = o.id
       WHERE o.id = $1
       GROUP BY o.id`,
      [orderId]
    );

    res.status(201).json(full.rows[0]);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("CreateOrder алдаа:", err.message);
    res.status(500).json({ error: "Серверийн алдаа" });
  } finally {
    client.release();
  }
}

// GET /api/orders  (admin)
async function getAllOrders(req, res) {
  const { page = 1, limit = 20, status, phone } = req.query;
  const offset = (page - 1) * limit;

  const conditions = [];
  const params = [];

  if (status) {
    params.push(status);
    conditions.push(`o.status = $${params.length}`);
  }
  if (phone) {
    params.push(phone);
    conditions.push(`o.phone = $${params.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  try {
    const result = await pool.query(
      `SELECT o.id, o.phone, o.status, o.created_at,
              COUNT(oi.id)::int AS item_count
       FROM orders o
       LEFT JOIN order_items oi ON oi.order_id = o.id
       ${where}
       GROUP BY o.id
       ORDER BY o.created_at DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    );

    const total = await pool.query(
      `SELECT COUNT(*) FROM orders o ${where}`, params
    );

    res.json({
      data: result.rows,
      total: parseInt(total.rows[0].count),
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (err) {
    console.error("GetAllOrders алдаа:", err.message);
    res.status(500).json({ error: "Серверийн алдаа" });
  }
}

// GET /api/orders/:id  (admin эсвэл өөрийн захиалга)
async function getOrderById(req, res) {
  try {
    const result = await pool.query(
      `SELECT o.*, json_agg(oi ORDER BY oi.id) AS items
       FROM orders o
       JOIN order_items oi ON oi.order_id = o.id
       WHERE o.id = $1
       GROUP BY o.id`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Захиалга олдсонгүй" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("GetOrderById алдаа:", err.message);
    res.status(500).json({ error: "Серверийн алдаа" });
  }
}

// PATCH /api/orders/:id/status  (admin)
async function updateOrderStatus(req, res) {
  const { status } = req.body;
  const VALID = [
    "Захиалга үүсгэсэн",
    "Хятадын агуулахад",
    "Замын Үүд дээр",
    "Улаанбаатарт ирсэн",
    "Олгогдсон",
  ];

  if (!VALID.includes(status)) {
    return res.status(400).json({ error: "Буруу статус байна" });
  }

  try {
    const result = await pool.query(
      "UPDATE orders SET status = $1 WHERE id = $2 RETURNING id, status",
      [status, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Захиалга олдсонгүй" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("UpdateOrderStatus алдаа:", err.message);
    res.status(500).json({ error: "Серверийн алдаа" });
  }
}

module.exports = { createOrder, getAllOrders, getOrderById, updateOrderStatus };
