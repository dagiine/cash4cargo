# Cash 4 Cargo 🚚

Хэрэглэгч хяналтын код эсвэл утасны дугаараараа ачааныхаа байршлыг шалгах, шинэ захиалга үүсгэх, тээвэрлэлтийн зардлыг тооцоолох боломжтой.

---

## Файлын бүтэц

```
cash4cargo/
│
├── index.html                  # Үндсэн HTML
├── app.js                      # Үндсэн router
├── styles.css                  # Global CSS
│
├── components/                 # Бүх хуудсанд давтагдах UI хэсгүүд
│   ├── header.js               # navigation, sign in form
│   ├── header.css              
│   ├── footer.js               # Footer render
│   └── footer.css              
│
├── pages/                      # Хуудас бүрийн HTML template
│   ├── home.js                 # Нүүр хуудас
│   ├── track.js                # Захиалга хянах хуудас
│   ├── create-order.js         # Захиалга үүсгэх хуудас
│   ├── pricing.js              # Үнэ тооцоолох хуудас
│   └── support.js              # Тусламжийн хуудас
│
├── js/                         # Хуудас бүрийн бизнес логик, UI классууд
│   ├── trackUI.js              # CargoTracker, TrackUI класс — ачаа хайх
│   ├── pricingUI.js            # PricingCalculator, PricingUI класс — үнэ тооцоолох
│   ├── initHomePage.js         # Нүүр хуудаснаас захиалгаа хайх, хаяг copy хийх
│   ├── initCreateOrder.js      # Захиалгын форм validation
│   └── initSupportSearch.js    # FAQ хайлт, шүүлт
│
├── css/                        # Хуудас бүрийн тусдаа CSS (динамикаар ачаалагдана)
│   ├── home.css                
│   ├── track.css               
│   ├── track-results.css       # Track үр дүн харуулах
│   ├── create-order.css        
│   ├── pricing.css             
│   └── support.css             
│
├── data/
│   ├── data.json               # Ачааны жишээ өгөгдөл
│   ├── shippingData.js         # Тээвэрлэлтийн аргууд, хориотой барааны жагсаалт, тогтмолууд
│   └── trackingData.js         # Статусын дараалал, дүрс тэмдэгтүүд, JSON URL
│
└── pics/                       # Зураг, лого
```

---

# Cash 4 Cargo — Backend API

Node.js + Express + PostgreSQL backend.

## Бүтэц

```
src/
├── app.js                    # Express програм, routes
├── db/
│   ├── pool.js               # PostgreSQL холболт
│   ├── migrate.js            # Хүснэгт үүсгэх
│   └── seed.js               # Жишээ өгөгдөл
├── middleware/
│   └── auth.js               # JWT шалгалт, admin guard
├── controllers/
│   ├── authController.js     # Нэвтрэх, бүртгэх
│   ├── shipmentController.js # Ачааны CRUD
│   └── orderController.js    # Захиалгын CRUD
└── routes/
    ├── auth.js
    ├── shipments.js
    └── orders.js
```

## Эхлүүлэх

### 1. Суулгах

```bash
npm install
```

### 2. Тохиргоо

```bash
cp .env.example .env
# .env файл засах — DB_HOST, DB_NAME, DB_USER, DB_PASSWORD, JWT_SECRET
```

### 3. PostgreSQL database үүсгэх

```sql
CREATE DATABASE cash4cargo;
```

### 4. Хүснэгт үүсгэх

```bash
npm run migrate
```

### 5. Жишээ өгөгдөл оруулах

```bash
npm run seed
# Admin: phone=99447176  password=admin123
```

### 6. Ажиллуулах

```bash
npm run dev    # development (nodemon)
npm start      # production
```

---

## API Endpoints

### 🔐 Auth

| Method | URL | Тайлбар |
|--------|-----|---------|
| POST | `/api/auth/register` | Бүртгэх |
| POST | `/api/auth/login` | Нэвтрэх |
| GET | `/api/auth/me` | Өөрийн мэдээлэл (token шаардлагатай) |

**Login хүсэлт:**
```json
{ "phone": "99447176", "password": "admin123" }
```

**Хариу:**
```json
{
  "token": "eyJ...",
  "user": { "id": 1, "name": "Админ", "phone": "99447176", "role": "admin" }
}
```

---

### 📦 Shipments (Ачаа)

| Method | URL | Auth | Тайлбар |
|--------|-----|------|---------|
| GET | `/api/shipments/track?query=...` | ❌ | Трак код / утасны дугаараар хайх |
| GET | `/api/shipments` | Admin | Бүх ачааны жагсаалт |
| GET | `/api/shipments/:id` | Admin | Нэг ачааны дэлгэрэнгүй |
| POST | `/api/shipments` | Admin | Шинэ ачаа нэмэх |
| PATCH | `/api/shipments/:id/status` | Admin | Статус шинэчлэх |
| PATCH | `/api/shipments/:id/payment` | Admin | Төлбөр шинэчлэх |
| DELETE | `/api/shipments/:id` | Admin | Устгах |

**Хайлтын жишээ:**
```
GET /api/shipments/track?query=MN-12345
GET /api/shipments/track?query=99112233
```

**Шинэ ачаа нэмэх:**
```json
{
  "track_code": "MN-11111",
  "customer_name": "Болд",
  "customer_phone": "99001122",
  "weight": 3.5,
  "from_location": "Хятад - Эрээн",
  "to_location": "Улаанбаатар",
  "method": "Стандарт",
  "price": 10500
}
```

**Статус шинэчлэх:**
```json
{ "status": "Улаанбаатарт ирсэн", "note": "Агуулахад хүргэгдлээ" }
```

Боломжит статусууд:
- `Захиалга үүсгэсэн`
- `Хятадын агуулахад`
- `Замын Үүд дээр`
- `Улаанбаатарт ирсэн`
- `Олгогдсон`

---

### 📋 Orders (Захиалга)

| Method | URL | Auth | Тайлбар |
|--------|-----|------|---------|
| POST | `/api/orders` | ❌ / optional | Захиалга үүсгэх |
| GET | `/api/orders` | Admin | Бүх захиалга |
| GET | `/api/orders/:id` | Admin | Нэг захиалга |
| PATCH | `/api/orders/:id/status` | Admin | Статус шинэчлэх |

**Захиалга үүсгэх:**
```json
{
  "phone": "99112233",
  "items": [
    { "track_code": "CN-ABC123", "name": "Гутал", "qty": 2 },
    { "track_code": "CN-DEF456", "name": "Цүнх", "qty": 1 }
  ]
}
```

---

## Frontend-тэй холбох

Frontend дахь `data/trackingData.js`-ийн `SHIPMENTS_URL`-г:

```js
// Одоо:
export const SHIPMENTS_URL = "./data/data.json";

// API-тай болгох:
export const SHIPMENTS_URL = "http://localhost:3000/api/shipments/track";
```

`trackUI.js`-ийн `load()` функцийг:
```js
async load(query) {
  const res = await fetch(`http://localhost:3000/api/shipments/track?query=${query}`);
  return res.json();
}
```

`initCreateOrder.js`-ийн submit handler дотор:
```js
await fetch("http://localhost:3000/api/orders", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(newOrder),
});
```

---

## DB схем

```
users         — хэрэглэгчид (customer / admin / driver)
orders        — захиалгын толгой
order_items   — захиалгын барааны мөрүүд
shipments     — ачааны дэлгэрэнгүй мэдээлэл
status_history — статусын өөрчлөлтийн түүх
```
