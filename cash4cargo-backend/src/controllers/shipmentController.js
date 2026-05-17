const pool = require("../db/pool");

// GET /api/shipments/track?query=MN-12345  эсвэл  ?query=99112233
async function trackShipment(req, res) {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ error: "query параметр заавал шаардлагатай" });
  }

  const q = query.trim().toUpperCase();

  let rows;

  try {
    if (/^MN-\d{5}$/.test(q)) {
      // Трак кодоор хайх
      const result = await pool.query(
        `SELECT s.*, 
                json_agg(sh ORDER BY sh.changed_at) AS status_history
         FROM shipments s
         LEFT JOIN status_history sh ON sh.shipment_id = s.id
         WHERE UPPER(s.track_code) = $1
         GROUP BY s.id`,
        [q]
      );
      rows = result.rows;
    } else if (/^[6-9]\d{7}$/.test(query.trim())) {
      // Утасны дугаараар хайх
      const result = await pool.query(
        `SELECT s.*,
                json_agg(sh ORDER BY sh.changed_at) AS status_history
         FROM shipments s
         LEFT JOIN status_history sh ON sh.shipment_id = s.id
         WHERE s.customer_phone = $1
         GROUP BY s.id
         ORDER BY s.created_at DESC`,
        [query.trim()]
      );
      rows = result.rows;
    } else {
      return res.status(400).json({ error: "Трак код эсвэл утасны дугаар буруу байна" });
    }

    if (rows.length === 0) {
      return res.status(404).json({ error: "Ачаа олдсонгүй" });
    }

    // status_history-ийн null утгыг цэвэрлэх
    const data = rows.map((r) => ({
      ...r,
      status_history: (r.status_history || []).filter(Boolean),
    }));

    res.json(data);
  } catch (err) {
    console.error("Track алдаа:", err.message);
    res.status(500).json({ error: "Серверийн алдаа" });
  }
}

// GET /api/shipments  (admin)
async function getAllShipments(req, res) {
  const { page = 1, limit = 20, status, phone } = req.query;
  const offset = (page - 1) * limit;

  const conditions = [];
  const params = [];

  if (status) {
    params.push(status);
    conditions.push(`s.status = $${params.length}`);
  }

  if (phone) {
    params.push(phone);
    conditions.push(`s.customer_phone = $${params.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  try {
    const result = await pool.query(
      `SELECT s.id, s.track_code, s.customer_name, s.customer_phone,
              s.status, s.weight, s.price, s.paid, s.created_at
       FROM shipments s
       ${where}
       ORDER BY s.created_at DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    );

    const total = await pool.query(
      `SELECT COUNT(*) FROM shipments s ${where}`,
      params
    );

    res.json({
      data: result.rows,
      total: parseInt(total.rows[0].count),
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (err) {
    console.error("GetAll алдаа:", err.message);
    res.status(500).json({ error: "Серверийн алдаа" });
  }
}

// GET /api/shipments/:id  (admin)
async function getShipmentById(req, res) {
  try {
    const result = await pool.query(
      `SELECT s.*,
              json_agg(sh ORDER BY sh.changed_at) AS status_history
       FROM shipments s
       LEFT JOIN status_history sh ON sh.shipment_id = s.id
       WHERE s.id = $1
       GROUP BY s.id`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Ачаа олдсонгүй" });
    }

    const row = result.rows[0];
    row.status_history = (row.status_history || []).filter(Boolean);

    res.json(row);
  } catch (err) {
    console.error("GetById алдаа:", err.message);
    res.status(500).json({ error: "Серверийн алдаа" });
  }
}

// POST /api/shipments  (admin)
async function createShipment(req, res) {
  const {
    track_code, customer_name, customer_phone, customer_email,
    weight, length, width, height, description, category,
    from_location, to_location, method,
    price, paid, payment_method, paid_date,
  } = req.body;

  if (!track_code || !customer_phone) {
    return res.status(400).json({ error: "track_code болон customer_phone заавал шаардлагатай" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO shipments (
         track_code, customer_name, customer_phone, customer_email,
         weight, length, width, height, description, category,
         from_location, to_location, method,
         price, paid, payment_method, paid_date
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
       RETURNING *`,
      [
        track_code, customer_name, customer_phone, customer_email,
        weight, length, width, height, description, category,
        from_location, to_location, method,
        price, paid || false, payment_method, paid_date,
      ]
    );

    // Анхны статус бичих
    await pool.query(
      "INSERT INTO status_history (shipment_id, status) VALUES ($1, $2)",
      [result.rows[0].id, "Захиалга үүсгэсэн"]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ error: "Трак код давхардаж байна" });
    }
    console.error("Create алдаа:", err.message);
    res.status(500).json({ error: "Серверийн алдаа" });
  }
}

// PATCH /api/shipments/:id/status  (admin)
async function updateStatus(req, res) {
  const { status, note } = req.body;

  const VALID_STATUSES = [
    "Захиалга үүсгэсэн",
    "Хятадын агуулахад",
    "Замын Үүд дээр",
    "Улаанбаатарт ирсэн",
    "Олгогдсон",
  ];

  if (!status || !VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: "Буруу статус байна" });
  }

  try {
    const result = await pool.query(
      "UPDATE shipments SET status = $1 WHERE id = $2 RETURNING id, track_code, status",
      [status, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Ачаа олдсонгүй" });
    }

    await pool.query(
      "INSERT INTO status_history (shipment_id, status, note) VALUES ($1, $2, $3)",
      [req.params.id, status, note || null]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("UpdateStatus алдаа:", err.message);
    res.status(500).json({ error: "Серверийн алдаа" });
  }
}

// PATCH /api/shipments/:id/payment  (admin)
async function updatePayment(req, res) {
  const { paid, payment_method, paid_date } = req.body;

  try {
    const result = await pool.query(
      `UPDATE shipments
       SET paid = $1, payment_method = $2, paid_date = $3
       WHERE id = $4
       RETURNING id, track_code, paid, payment_method, paid_date`,
      [paid, payment_method, paid_date, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Ачаа олдсонгүй" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("UpdatePayment алдаа:", err.message);
    res.status(500).json({ error: "Серверийн алдаа" });
  }
}

// DELETE /api/shipments/:id  (admin)
async function deleteShipment(req, res) {
  try {
    const result = await pool.query(
      "DELETE FROM shipments WHERE id = $1 RETURNING id",
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Ачаа олдсонгүй" });
    }

    res.json({ message: "Амжилттай устгагдлаа" });
  } catch (err) {
    console.error("Delete алдаа:", err.message);
    res.status(500).json({ error: "Серверийн алдаа" });
  }
}

module.exports = {
  trackShipment,
  getAllShipments,
  getShipmentById,
  createShipment,
  updateStatus,
  updatePayment,
  deleteShipment,
};
