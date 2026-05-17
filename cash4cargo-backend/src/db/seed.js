const pool = require("./pool");
const bcrypt = require("bcryptjs");
require("dotenv").config();

async function seed() {
  const client = await pool.connect();

  try {
    console.log("🌱 Seed өгөгдөл оруулж байна...");

    await client.query("BEGIN");

    // ─── ADMIN ХЭРЭГЛЭГЧ ─────────────────────────────────────────────
    const hashedPassword = await bcrypt.hash("admin123", 10);

    await client.query(`
      INSERT INTO users (name, phone, email, password, role)
      VALUES ('Админ', '99447176', 'admin@cash4cargo.mn', $1, 'admin')
      ON CONFLICT (phone) DO NOTHING;
    `, [hashedPassword]);

    // ─── ЖИШЭЭ АЧААНЫ МЭДЭЭЛЭЛ ──────────────────────────────────────
    const shipments = [
      {
        track_code: "MN-12345",
        customer_name: "Бат",
        customer_phone: "99112233",
        customer_email: "bat@example.com",
        weight: 12.5,
        length: 40, width: 30, height: 25,
        description: "Гутал",
        category: "Хувцас",
        from_location: "Хятад - Бээжин агуулах",
        to_location: "Улаанбаатар салбар",
        method: "Стандарт",
        status: "Улаанбаатарт ирсэн",
        price: 35000,
        paid: true,
        payment_method: "QPay",
        paid_date: "2026-05-05",
      },
      {
        track_code: "MN-67890",
        customer_name: "Сараа",
        customer_phone: "99447176",
        customer_email: "saraa@example.com",
        weight: 5.0,
        length: 30, width: 20, height: 15,
        description: "Цүнх",
        category: "Аксессуар",
        from_location: "Хятад - Гуанжоу",
        to_location: "Улаанбаатар",
        method: "Экспресс",
        status: "Замын Үүд дээр",
        price: 15000,
        paid: false,
        payment_method: null,
        paid_date: null,
      },
    ];

    for (const s of shipments) {
      const res = await client.query(`
        INSERT INTO shipments (
          track_code, customer_name, customer_phone, customer_email,
          weight, length, width, height, description, category,
          from_location, to_location, method, status,
          price, paid, payment_method, paid_date
        ) VALUES (
          $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18
        )
        ON CONFLICT (track_code) DO NOTHING
        RETURNING id;
      `, [
        s.track_code, s.customer_name, s.customer_phone, s.customer_email,
        s.weight, s.length, s.width, s.height, s.description, s.category,
        s.from_location, s.to_location, s.method, s.status,
        s.price, s.paid, s.payment_method, s.paid_date,
      ]);

      // Статусын түүх нэмэх
      if (res.rows.length > 0) {
        const sid = res.rows[0].id;
        const histories = {
          "MN-12345": [
            { status: "Хятадын агуулахад", changed_at: "2026-05-01 10:20" },
            { status: "Замын Үүд дээр",    changed_at: "2026-05-03 15:00" },
            { status: "Улаанбаатарт ирсэн", changed_at: "2026-05-05 09:30" },
          ],
          "MN-67890": [
            { status: "Хятадын агуулахад", changed_at: "2026-05-02 08:00" },
            { status: "Замын Үүд дээр",    changed_at: "2026-05-04 14:00" },
          ],
        };

        for (const h of (histories[s.track_code] || [])) {
          await client.query(`
            INSERT INTO status_history (shipment_id, status, changed_at)
            VALUES ($1, $2, $3);
          `, [sid, h.status, h.changed_at]);
        }
      }
    }

    await client.query("COMMIT");
    console.log("✅ Seed амжилттай дууслаа!");
    console.log("   👤 Admin: phone=99447176  password=admin123");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Seed алдаа:", err.message);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch(() => process.exit(1));
