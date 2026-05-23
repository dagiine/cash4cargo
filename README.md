# Cash 4 Cargo — Node.js + MongoDB Backend

## Төслийн бүтэц

```
cash4cargo-backend/         ← Node.js сервер
├── server.js               ← Entry point
├── seed.js                 ← MongoDB жишээ өгөгдөл оруулах
├── .env.example            ← Орчны хувьсагчид
├── config/
│   └── db.js               ← MongoDB холболт
├── middleware/
│   └── auth.js             ← JWT protect + adminOnly
├── models/
│   ├── User.js             ← Хэрэглэгчийн схем
│   └── Shipment.js         ← Ачааны схем
└── routes/
    ├── auth.js             ← /api/auth/*
    └── shipments.js        ← /api/shipments/*

cash4cargo-frontend/        ← Одоо байгаа frontend (шинэчлэгдсэн)
├── app.js                  ← Нэвтэрсэн үед → /track руу шилжинэ
├── js/
│   ├── api.js              ← Backend-тай харилцах helper
│   └── trackUI.js          ← Нэвтэрсэн үед автоматаар утасны дугаараар хайна
└── components/
    └── header.js           ← Нэвтрэх/Бүртгүүлэх/Гарах + хэрэглэгчийн нэр
```

---

## Backend суурилуулах

### 1. Хуулж авах

```bash
cd cash4cargo-backend
cp .env.example .env
```

### 2. `.env` засах

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/cash4cargo
JWT_SECRET=өөрийн_нууц_түлхүүр_энд
JWT_EXPIRES_IN=7d
```

### 3. Package суулгах

```bash
npm install
```

### 4. MongoDB эхлүүлэх

```bash
# Local MongoDB
mongod

# Эсвэл MongoDB Atlas URL-г .env-д тавина
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/cash4cargo
```

### 5. Жишээ өгөгдөл оруулах

```bash
node seed.js
```

Seed-ийн дараах нэвтрэх мэдээлэл:
| Утас | Нууц үг | Дүр |
|------|---------|-----|
| 99112233 | password123 | user (2 ачаа) |
| 99447176 | password123 | user (1 ачаа) |
| 88000001 | admin123 | admin |

### 6. Сервер ажиллуулах

```bash
npm start          # production
npm run dev        # nodemon (dev)
```

---

## API Endpoints

### Auth
| Method | URL | Тайлбар |
|--------|-----|---------|
| POST | `/api/auth/register` | Бүртгүүлэх |
| POST | `/api/auth/login` | Нэвтрэх |
| GET  | `/api/auth/me` | Одоогийн хэрэглэгч (Bearer token) |

### Shipments
| Method | URL | Нэвтрэлт | Тайлбар |
|--------|-----|----------|---------|
| GET | `/api/shipments/track/:code` | — | Tracking code-оор хайх |
| GET | `/api/shipments/by-phone/:phone` | — | Зочин утасны дугаараар хайх |
| GET | `/api/shipments/my` | ✅ User | Нэвтэрсэн хэрэглэгчийн БҮГД ачаа |
| GET | `/api/shipments` | ✅ Admin | Бүх ачааны жагсаалт |
| POST | `/api/shipments` | ✅ Admin | Шинэ ачаа нэмэх |
| PUT | `/api/shipments/:id/status` | ✅ Admin | Статус шинэчлэх |
| PUT | `/api/shipments/:id` | ✅ Admin | Ачаа засах |
| DELETE | `/api/shipments/:id` | ✅ Admin | Ачаа устгах |

---

## Frontend өөрчлөлтүүд

### 1. Нэвтэрсэн үед home харуулахгүй
`app.js` доторх routing логик:
```js
if (cleanHash === "#/" && isLoggedIn()) {
  window.location.hash = "#/track";
  return;
}
```

### 2. Track хуудас — автомат ачаалалт
Нэвтэрсэн хэрэглэгч `/track` хуудас нээхэд:
- `GET /api/shipments/my` дуудна
- Утасны дугаараар бүх ачааг нь автоматаар харуулна
- Хайлтын талбар ажилласаар байна (tracking code-оор хайх боломжтой)

### 3. Header — хэрэглэгчийн нэр + Гарах товч
Нэвтэрсний дараа header дээр:
```
[Хэрэглэгчийн нэр] [Гарах]
```

---

## Frontend API холбох

`cash4cargo-frontend/js/api.js` дотор:
```js
export const API_BASE = "http://localhost:5000/api";
```

Production deploy хийхдээ энэ URL-г өөрийн серверийн хаягаар сол.

---

## MongoDB схем

### User
```
name, phone (unique), password_hash (bcrypt), role (user/admin)
```

### Shipment
```
user_phone, tracking_code (unique, MN-XXXXX),
sender_name, receiver_name, receiver_phone,
origin_country, destination_country,
items[], total_weight, shipping_price,
status, payment_status,
status_history[], estimated_delivery
```
