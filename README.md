# Cash 4 Cargo

**Cash 4 Cargo** нь Хятад → Монгол чиглэлийн карго захиалга үүсгэх, илгээмж хянах, admin талаас төлөв/жин/FAQ/хэрэглэгч удирдах web system юм. Project нь нэг backend server дээр ажиллана: хэрэглэгчийн сайт `/`, admin dashboard `/admin` дээр нээгдэнэ.

## Гол боломжууд

### Хэрэглэгчийн тал

- Хэрэглэгч нэвтрэхгүйгээр захиалга үүсгэж болно.
- Нэг захиалга буюу нэг package дотор олон бараа нэмнэ.
- Нэг package зөвхөн нэг нийт жинтэй байна.
- Шинэ захиалга үүсэх үед төлөв нь **`Захиалга үүсгэсэн`**, нийт жин **`0 кг`**, үнэ **`0 ₮`** гэж хадгалагдана.
- Admin дараа нь бодит жинг оруулах үед үнэ автоматаар бодогдоно.
- Хэрэглэгч track code эсвэл утасны дугаараар захиалгаа хайна.
- Нэвтэрсэн хэрэглэгч `Захиалга хянах` page дээр form бөглөхгүй, өөрийн захиалгуудыг шууд харна.
- `Захиалга үүсгэсэн` болон `Хятадын агуулахад` төлөвтэй үед захиалга цуцлах боломжтой.
- Тусламж/FAQ page дээр category болон асуулт-хариултууд харагдана.

### Admin тал

- Admin `/admin` хаягаар нэвтэрнэ.
- Бүх илгээмжийг харах, хайх, огноогоор эрэмбэлэх боломжтой.
- Илгээмжийн төлөвийг шинэчилнэ.
- Илгээмжийн **нийт жин** засна.
- Жин өөрчлөгдөхөд үнэ автоматаар дахин бодогдоно.
- FAQ category болон асуулт-хариулт нэмэх/устгах боломжтой.
- Хэрэглэгчдийн жагсаалт харах, user устгах, user/admin role солих боломжтой.
- Хэрэглэгч дээр дарахад тухайн хэрэглэгчийн захиалгын түүх харагдана.

## Ашигласан технологи

- Frontend: HTML, CSS, JavaScript SPA
- Web component: `status-badge`, `order-card`, `faq-item`
- Backend: Node.js, Express.js
- Database: MongoDB + Mongoose
- Authentication: JWT token

## Project бүтэц

```text
cash4cargo-backend/
├── admin/                  # Admin dashboard
│   ├── index.html
│   ├── styles.css
│   └── script.js
│
├── public/                 # Хэрэглэгчийн frontend
│   ├── index.html
│   ├── app.js              # SPA router
│   ├── styles.css          # Global custom properties
│   ├── components/         # Web components
│   │   ├── status-badge.js
│   │   ├── status-badge.css
│   │   ├── order-card.js
│   │   ├── order-card.css
│   │   ├── faq-item.js
│   │   └── faq-item.css
│   ├── css/                # Page CSS
│   ├── js/                 # Page JS logic
│   ├── pages/              # Page templates
│   └── pics/               # Images
│
├── config/db.js            # MongoDB холболт
├── middleware/auth.js      # JWT auth + admin check + optional auth
├── models/                 # MongoDB models
├── routes/                 # API routes
├── seed.js                 # Test data нэмэх
├── server.js               # Express server
├── package.json
└── .env.example
```

## Суулгах

```bash
cd cash4cargo-backend
npm install
```

`.env.example`-оос `.env` файл үүсгэнэ.

Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

`.env` жишээ:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/cash4cargo
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=7d
SHIPPING_RATE_PER_KG=3500
```

## Database seed хийх

Test user, admin, жишээ shipment нэмэхийн тулд:

```bash
npm run seed
```

`seed.js` нь байгаа data-г устгахгүй. Байхгүй default data-г л нэмнэ.

## Ажиллуулах

```bash
npm run dev
```

Дараа нь browser дээр:

```text
Хэрэглэгчийн сайт: http://localhost:5000
Admin dashboard:  http://localhost:5000/admin
Health check:     http://localhost:5000/api/health
```

## Test account

Admin:

```text
Утас: 88000001
Нууц үг: admin123
```

Энгийн хэрэглэгч:

```text
Утас: 99112233
Нууц үг: password123
```

## Захиалга үүсэх logic

Хэрэглэгч захиалга үүсгэхэд frontend дараах API руу илгээнэ:

```text
POST /api/shipments
```

Шинэ захиалга үүсэх үед backend дараах байдлаар хадгална:

```js
status: "Захиалга үүсгэсэн"
total_weight: 0
shipping_price: 0
payment_status: "Төлөгдөөгүй"
```

Ингэснээр хэрэглэгч анх захиалга үүсгэх үед жин болон үнэ бодогдохгүй. Admin бодит нийт жинг оруулах үед үнэ автоматаар бодогдоно.

## Үнэ бодох logic

1 кг-ийн үнэ `.env` доторх `SHIPPING_RATE_PER_KG` утгаар бодогдоно.

Жишээ:

```text
SHIPPING_RATE_PER_KG=3500
2 кг × 3500₮ = 7000₮
```

Admin жин засах API:

```text
PUT /api/shipments/:id
```

## Төлөвүүд

```text
Захиалга үүсгэсэн
Хятадын агуулахад
Замын Үүд дээр
Улаанбаатарт ирсэн
Олгогдсон
Цуцлагдсан
```

Төлөв шинэчлэгдэх бүрд `status_history` дотор огноотойгоо хадгалагдана. User талын order card дээр одоогийн төлөвийн доор `Шинэчлэгдсэн: огноо` дараагийн мөрөнд харагдана.

## Web component-ууд

### `status-badge`

Нэг component 3 variant-тай:

```html
<status-badge variant="home"></status-badge>
<status-badge variant="header"></status-badge>
<status-badge variant="timeline"></status-badge>
```

- `home` — нүүр хуудасны steps дээр
- `header` — order card-ийн дээд төлөв дээр
- `timeline` — order card-ийн status timeline дээр

### `order-card`

Track result дээр нэг захиалгын card зурна. Утас, жин, үнэ, барааны жагсаалт, төлөвийн timeline, цуцлах button зэргийг харуулна.

### `faq-item`

Тусламж page дээр нэг FAQ асуулт/хариултыг component хэлбэрээр харуулна.

## API товч жагсаалт

### Auth

| Method | Route | Эрх | Тайлбар |
|---|---|---|---|
| POST | `/api/auth/register` | Public | User бүртгэх |
| POST | `/api/auth/login` | Public | Login, token авах |
| GET | `/api/auth/me` | User | Одоогийн user авах |
| PUT | `/api/auth/password` | User | Нууц үг солих |
| GET | `/api/auth/users` | Admin | User list |
| PUT | `/api/auth/users/:id/role` | Admin | Role солих |
| DELETE | `/api/auth/users/:id` | Admin | User устгах |

### Shipments

| Method | Route | Эрх | Тайлбар |
|---|---|---|---|
| POST | `/api/shipments` | Public / optional login | Шинэ захиалга үүсгэх |
| GET | `/api/shipments/track/:code` | Public | Track code-оор хайх |
| GET | `/api/shipments/by-phone/:phone` | Public | Утсаар хайх |
| GET | `/api/shipments/my` | User | Login хийсэн user-ийн захиалгууд |
| GET | `/api/shipments` | Admin | Бүх shipment авах |
| PUT | `/api/shipments/:id/status` | Admin | Төлөв шинэчлэх |
| PUT | `/api/shipments/:id` | Admin | Нийт жин засах, үнэ дахин бодох |
| PUT | `/api/shipments/:id/cancel` | User/Admin | Захиалга цуцлах |
| DELETE | `/api/shipments/:id` | Admin | Shipment устгах |

### FAQ

| Method | Route | Эрх | Тайлбар |
|---|---|---|---|
| GET | `/api/faqs` | Public | FAQ list авах |
| GET | `/api/faqs/categories` | Public | FAQ category авах |
| POST | `/api/faqs` | Admin | FAQ нэмэх |
| PUT | `/api/faqs/:id` | Admin | FAQ засах |
| DELETE | `/api/faqs/:id` | Admin | FAQ устгах |

## 2 computer дээр адил data харах

`localhost` нь зөвхөн тухайн computer-ийг заадаг. Нөгөө computer дээр адил data харахын тулд нэг computer дээр backend ажиллуулаад нөгөө computer нь тухайн computer-ийн IPv4 address-аар орно.

Жишээ:

```text
Server computer IP: 172.20.10.2
User computer URL:  http://172.20.10.2:5000
Admin URL:          http://172.20.10.2:5000/admin
```

`server.js` дотор listen хэсэг:

```js
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
```

## Алдаа засах

### MongoDB connection error

```text
connect ECONNREFUSED 127.0.0.1:27017
```

MongoDB ажиллаж байгаа эсэх, `.env` доторх `MONGO_URI` зөв эсэхийг шалгана.

### Guest order дээр 401 гарах

Guest order login шаардах ёсгүй. Browser дээр хуучин token хадгалагдсан бол DevTools Console дээр:

```js
localStorage.clear()
```

гээд refresh хийнэ.

### Шинэ захиалга 0 жин/үнэтэй харагдахгүй байвал

1. `routes/shipments.js` шинэчлэгдсэн эсэхийг шалгана.
2. Server-ээ `Ctrl + C` дараад дахин `npm run dev` хийж restart хийнэ.
3. Өмнө нь DB-д хадгалагдсан хуучин shipment бол хуучин утгаа хадгалсан байж болно. Шинээр үүсгэсэн order дээр `total_weight: 0`, `shipping_price: 0` байх ёстой.

### CSS өөрчлөлт харагдахгүй бол

Browser cache цэвэрлэхийн тулд hard refresh хийнэ:

```text
Ctrl + F5
```

Мөн `public/index.html` дээр дараах CSS link байгаа эсэхийг шалгана:

```html
<link rel="stylesheet" href="./components/status-badge.css" />
<link rel="stylesheet" href="./components/faq-item.css" />
<link rel="stylesheet" href="./components/order-card.css" />
```

## Түгээмэл command

```bash
npm install      # package суулгах
npm run seed     # test data нэмэх
npm run dev      # development mode
npm start        # production маягаар асаах
```
