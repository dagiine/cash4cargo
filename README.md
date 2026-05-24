# Cash 4 Cargo

**Cash 4 Cargo** нь Хятад → Монгол чиглэлийн карго илгээмж бүртгэл, хяналтын вэб систем юм.  
Node.js + Express + MongoDB backend, хэрэглэгчийн SPA frontend, мөн admin dashboard-оос бүрдэнэ.

---

## Гол боломжууд

### Хэрэглэгчийн вэб сайт
- Нэвтрэхгүйгээр захиалга үүсгэх боломжтой
- Нэг илгээмж дотор олон бараа бүртгэнэ
- Хяналтын код (`MN-XXXXX`) эсвэл утасны дугаараар илгээмж хайна
- Тээврийн үнэ нийт жингээр автоматаар тооцогдоно
- Нэвтэрсэн хэрэглэгч profile хэсгийг ашиглана
- Admin account-аар нэвтэрвэл автоматаар `/admin` руу шилжинэ

### Admin dashboard
- `/admin` хаягаар нэвтэрнэ
- Бүх илгээмжийг харах, хайх, эрэмбэлэх
- Илгээмжийн төлөв болон нийт жинг засах (жин өөрчлөгдөхөд үнэ дахин бодогдоно)
- FAQ асуулт/хариулт нэмэх, засах, устгах
- Хэрэглэгчдийн жагсаалт харах, эрх солих, устгах

---

## Ашигласан технологи

| Давхарга | Технологи |
|---|---|
| Frontend | Vanilla JS SPA, HTML, CSS |
| Admin | HTML, CSS, JS |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT (JSON Web Token) |
| Нууц үг | bcryptjs |

---

## Project-ийн бүтэц

```text
cash4cargo-backend/
├── admin/                  # Admin dashboard frontend
│   ├── index.html
│   ├── styles.css
│   ├── script.js
│   └── js/
│       └── faqAdmin.js
│
├── public/                 # Хэрэглэгчийн SPA frontend
│   ├── index.html
│   ├── app.js              # Hash-based router
│   ├── styles.css
│   ├── components/         # Header, Footer, OrderCard
│   ├── css/                # Хуудас тус бүрийн CSS
│   ├── js/                 # Page init + track логик
│   ├── pages/              # Хуудасны JS файлууд
│   └── pics/
│
├── config/
│   └── db.js               # MongoDB холболт
│
├── middleware/
│   └── auth.js             # protect / adminOnly / optionalAuth
│
├── models/
│   ├── User.js             # Хэрэглэгчийн схем
│   ├── Shipment.js         # Илгээмжийн схем (sub-doc: items, status_history)
│   ├── Faq.js              # FAQ схем
│   └── FaqCategory.js      # FAQ ангиллын схем
│
├── routes/
│   ├── auth.js             # /api/auth
│   ├── shipments.js        # /api/shipments
│   └── faqs.js             # /api/faqs
│
├── .env.example
├── package.json
├── seed.js                 # Туршилтын өгөгдөл үүсгэгч
└── server.js               # Express сервер
```

---

## Суулгах заавар

### Шаардлагатай зүйлс
- Node.js
- npm
- MongoDB (локал эсвэл MongoDB Atlas)

### Алхам 1 — Dependency суулгах

```bash
cd cash4cargo-backend
npm install
```

### Алхам 2 — Environment тохируулах

`.env.example`-ээс `.env` файл үүсгэнэ:

```bash
# Linux / macOS
cp .env.example .env

# Windows PowerShell
Copy-Item .env.example .env
```

`.env` файлын агуулга:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/cash4cargo
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=7d
SHIPPING_RATE_PER_KG=3500
```

### Алхам 3 — Туршилтын өгөгдөл үүсгэх (заавал биш)

```bash
npm run seed
```

> `seed` командыг олон удаа ажиллуулж болно — одоо байгаа өгөгдлийг устгахгүй, зөвхөн байхгүй default өгөгдлийг нэмнэ.

### Алхам 4 — Server асаах

```bash
# Development (автомат restart)
npm run dev

# Энгийн start
npm start
```

Server амжилттай ассан бол:

```
Хэрэглэгчийн вэб:  http://localhost:5000
Admin panel:        http://localhost:5000/admin
Health check:       http://localhost:5000/api/health
```

---

## Туршилтын account-ууд

| Эрх | Утас | Нууц үг |
|---|---|---|
| Admin | `88000001` | `admin123` |
| Энгийн хэрэглэгч | `99112233` | `password123` |

> Захиалга үүсгэхийн тулд account шаардагдахгүй.

---

## Илгээмжийн төлөвүүд

```
Захиалга үүсгэсэн  →  Хятадын агуулахад  →  Замын Үүд дээр  →  Улаанбаатарт ирсэн  →  Олгогдсон
                                                                                          ↓
                                                                                     Цуцлагдсан
```

Хэрэглэгч зөвхөн **"Захиалга үүсгэсэн"** болон **"Хятадын агуулахад"** төлөвт байх үед цуцалж болно.

---

## API лавлагаа

### Auth — `/api/auth`

| Method | Route | Эрх | Тайлбар |
|---|---|---|---|
| POST | `/register` | Public | Шинэ хэрэглэгч бүртгэх |
| POST | `/login` | Public | Нэвтрэх, JWT token авах |
| GET | `/me` | Нэвтэрсэн | Одоогийн хэрэглэгчийн мэдээлэл |
| PUT | `/password` | Нэвтэрсэн | Нууц үг шинэчлэх |
| GET | `/users` | Admin | Бүх хэрэглэгч харах |
| PUT | `/users/:id/role` | Admin | Хэрэглэгчийн эрх солих |
| DELETE | `/users/:id` | Admin | Хэрэглэгч устгах |

### Shipments — `/api/shipments`

| Method | Route | Эрх | Тайлбар |
|---|---|---|---|
| POST | `/` | Public / optional | Захиалга үүсгэх |
| GET | `/track/:code` | Public | Хяналтын кодоор хайх |
| GET | `/by-phone/:phone` | Public | Утасны дугаараар хайх |
| GET | `/my` | Нэвтэрсэн | Өөрийн илгээмжүүд |
| PUT | `/:id/cancel` | Нэвтэрсэн | Захиалга цуцлах |
| GET | `/` | Admin | Бүх илгээмж (filter, pagination) |
| PUT | `/:id/status` | Admin | Төлөв шинэчлэх |
| PUT | `/:id` | Admin | Нийт жин засах (үнэ автоматаар дахин бодогдоно) |
| DELETE | `/:id` | Admin | Илгээмж устгах |

### FAQs — `/api/faqs`

| Method | Route | Эрх | Тайлбар |
|---|---|---|---|
| GET | `/` | Public | FAQ жагсаалт авах |
| POST | `/` | Admin | FAQ нэмэх |
| PUT | `/:id` | Admin | FAQ засах |
| DELETE | `/:id` | Admin | FAQ устгах |
| GET | `/categories` | Public | FAQ ангиллын жагсаалт |
| POST | `/categories` | Admin | FAQ ангилал нэмэх |

---

## Хөгжүүлэлтийн тэмдэглэл

- `.env` файлыг GitHub-д upload хийхгүй байх — `.gitignore`-д оруулна
- Real deployment хийхэд `JWT_SECRET`-ийг заавал солих
- API route өөрчлөхөд frontend JS болон `admin/script.js`-г хамт шинэчлэх
- `SHIPPING_RATE_PER_KG` environment variable-аар тариф тохируулна (default: 3500 ₮/кг)

---

## Түгээмэл команд

```bash
npm install      # Dependency суулгах
npm run seed     # Туршилтын өгөгдөл нэмэх
npm run dev      # Development mode (nodemon)
npm start        # Production mode
```