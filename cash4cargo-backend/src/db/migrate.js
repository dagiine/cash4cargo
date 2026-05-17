const pool = require("./pool");
require("dotenv").config();

async function migrate() {
  const client = await pool.connect();

  try {
    console.log("🔄 Миграц эхэлж байна...");

    await client.query("BEGIN");

    // ─── ХЭРЭГЛЭГЧИД ────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id          SERIAL PRIMARY KEY,
        name        VARCHAR(100),
        phone       VARCHAR(20) UNIQUE NOT NULL,
        email       VARCHAR(150) UNIQUE,
        password    VARCHAR(255) NOT NULL,
        role        VARCHAR(20) DEFAULT 'customer'
                      CHECK (role IN ('customer', 'admin', 'driver')),
        created_at  TIMESTAMPTZ DEFAULT NOW(),
        updated_at  TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // ─── ЗАХИАЛГУУД ─────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id          SERIAL PRIMARY KEY,
        user_id     INTEGER REFERENCES users(id) ON DELETE SET NULL,
        phone       VARCHAR(20) NOT NULL,
        status      VARCHAR(50) DEFAULT 'Захиалга үүсгэсэн'
                      CHECK (status IN (
                        'Захиалга үүсгэсэн',
                        'Хятадын агуулахад',
                        'Замын Үүд дээр',
                        'Улаанбаатарт ирсэн',
                        'Олгогдсон'
                      )),
        created_at  TIMESTAMPTZ DEFAULT NOW(),
        updated_at  TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // ─── ЗАХИАЛГЫН БАРААНЫ МӨРҮҮД ───────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id          SERIAL PRIMARY KEY,
        order_id    INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        track_code  VARCHAR(50) NOT NULL,
        name        VARCHAR(200) NOT NULL,
        qty         INTEGER DEFAULT 1 CHECK (qty > 0),
        created_at  TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // ─── АЧААНЫ МЭДЭЭЛЭЛ (SHIPMENTS) ────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS shipments (
        id              SERIAL PRIMARY KEY,
        track_code      VARCHAR(50) UNIQUE NOT NULL,

        -- Харилцагч
        customer_name   VARCHAR(100),
        customer_phone  VARCHAR(20),
        customer_email  VARCHAR(150),

        -- Баглаа
        weight          NUMERIC(8,2),
        length          NUMERIC(8,2),
        width           NUMERIC(8,2),
        height          NUMERIC(8,2),
        description     TEXT,
        category        VARCHAR(100),

        -- Тээвэр
        from_location   VARCHAR(200),
        to_location     VARCHAR(200),
        method          VARCHAR(100),
        status          VARCHAR(50) DEFAULT 'Захиалга үүсгэсэн'
                          CHECK (status IN (
                            'Захиалга үүсгэсэн',
                            'Хятадын агуулахад',
                            'Замын Үүд дээр',
                            'Улаанбаатарт ирсэн',
                            'Олгогдсон'
                          )),

        -- Төлбөр
        price           NUMERIC(12,2),
        paid            BOOLEAN DEFAULT FALSE,
        payment_method  VARCHAR(50),
        paid_date       DATE,

        created_at      TIMESTAMPTZ DEFAULT NOW(),
        updated_at      TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // ─── СТАТУСЫН ТҮҮХ ───────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS status_history (
        id           SERIAL PRIMARY KEY,
        shipment_id  INTEGER NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
        status       VARCHAR(50) NOT NULL,
        note         TEXT,
        changed_at   TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // ─── ИНДЕКСҮҮД ───────────────────────────────────────────────────
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_shipments_track_code
        ON shipments(track_code);

      CREATE INDEX IF NOT EXISTS idx_shipments_customer_phone
        ON shipments(customer_phone);

      CREATE INDEX IF NOT EXISTS idx_order_items_order_id
        ON order_items(order_id);

      CREATE INDEX IF NOT EXISTS idx_status_history_shipment
        ON status_history(shipment_id);
    `);

    // ─── AUTO-UPDATE TRIGGER ─────────────────────────────────────────
    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    for (const tbl of ["users", "orders", "shipments"]) {
      await client.query(`
        DROP TRIGGER IF EXISTS trg_${tbl}_updated_at ON ${tbl};
        CREATE TRIGGER trg_${tbl}_updated_at
          BEFORE UPDATE ON ${tbl}
          FOR EACH ROW EXECUTE FUNCTION update_updated_at();
      `);
    }

    await client.query("COMMIT");
    console.log("✅ Миграц амжилттай дууслаа!");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Миграц алдаа:", err.message);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch(() => process.exit(1));
