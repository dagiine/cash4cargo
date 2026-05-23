# Cash 4 Cargo

**Cash 4 Cargo** нь Хятад → Монгол чиглэлийн карго илгээмж бүртгэл, хяналтын вэб систем юм. Энэхүү project нь хэрэглэгчийн нүүр хуудас, admin dashboard, мөн Node.js + Express + MongoDB backend-ээс бүрдэнэ.

## Гол боломжууд

### Хэрэглэгчийн вэб сайт

- Хэрэглэгч нэвтрэхгүйгээр захиалга үүсгэж болно.
- Нэг илгээмж/багц дотор олон бараа бүртгэж болно.
- Нэг илгээмж зөвхөн нэг нийт жинтэй байна.
- Тээврийн үнэ илгээмжийн нийт жингээр автоматаар тооцогдоно.
- Хэрэглэгч хяналтын код эсвэл утасны дугаараар илгээмжээ хайж болно.
- FAQ буюу түгээмэл асуултууд admin талаас удирдагдаж, хэрэглэгчийн тусламжийн хуудсанд харагдана.
- Хэрэглэгч хүсвэл нэвтэрч өөрийн profile хэсгийг ашиглаж болно.
- Нэвтэрсэн хэрэглэгчийн нэр header хэсэгт profile shortcut байдлаар харагдана.

### Admin dashboard

- Admin `/admin` хаягаар нэвтэрнэ.
- Dashboard статистик харна.
- Бүх илгээмжийг харах, хайх боломжтой.
- Илгээмжийг огноогоор эрэмбэлнэ.
- Илгээмжийн төлөв шинэчилнэ.
- Илгээмжийн нийт жинг засна.
- Жин өөрчлөгдөхөд үнэ дахин тооцогдоно.
- FAQ асуулт, хариулт нэмэх/засах/устгах боломжтой.
- Хэрэглэгчдийн жагсаалтыг харна.
- Хэрэглэгчийн account устгана.
- Хэрэглэгчийн эрхийг `user` эсвэл `admin` болгож өөрчилнө.

## Ашигласан технологи

- Frontend: HTML, CSS, JavaScript SPA
- Admin: HTML, CSS, JavaScript
- Backend: Node.js, Express.js
- Database: MongoDB + Mongoose
- Authentication: JWT

## Project-ийн бүтэц

```text
cash4cargo-backend/
├── admin/                  # Admin dashboard frontend
│   ├── index.html
│   ├── styles.css
│   └── script.js
│
├── public/                 # Хэрэглэгчийн веб frontend
│   ├── index.html
│   ├── app.js
│   ├── styles.css
│   ├── components/
│   ├── css/
│   ├── js/
│   ├── pages/
│   ├── data/
│   └── pics/
│
├── config/
│   └── db.js               # MongoDB холболт
│
├── middleware/
│   └── auth.js             # JWT auth, admin check, optional auth
│
├── models/
│   ├── User.js
│   ├── Shipment.js
│   └── Faq.js
│
├── routes/
│   ├── auth.js
│   ├── shipments.js
│   └── faqs.js
│
├── .env.example
├── package.json
├── seed.js
└── server.js
```

## Шаардлагатай зүйлс

Project ажиллуулахын өмнө дараах зүйлс суусан байх хэрэгтэй:

- Node.js
- npm
- MongoDB

Backend асаахаас өмнө MongoDB ажиллаж байх ёстой.

Default MongoDB URL:

```text
mongodb://localhost:27017/cash4cargo
```

## Суулгах заавар

Terminal эсвэл PowerShell дээр backend folder руу орно:

```bash
cd cash4cargo-backend
npm install
```

`.env` файл үүсгэнэ. `.env.example` файлаас хуулж болно:

```bash
cp .env.example .env
```

Windows PowerShell дээр:

```powershell
Copy-Item .env.example .env
```

`.env` файл дараах байдлаар харагдана:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/cash4cargo
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=7d
```

## Туршилтын өгөгдөл үүсгэх

Test хэрэглэгч, илгээмж, FAQ өгөгдөл үүсгэхийн тулд нэг удаа дараах командыг ажиллуулна:

```bash
npm run seed
```

## Project ажиллуулах

Development mode:

```bash
npm run dev
```

Энгийн start mode:

```bash
npm start
```

Server амжилттай ассан бол дараах хаягуудаар орно:

```text
Хэрэглэгчийн веб: http://localhost:5000
Admin panel:       http://localhost:5000/admin
Health check:      http://localhost:5000/api/health
```

## Туршилтын account-ууд

### Admin

```text
Утас:   88000001
Нууц үг: admin123
```

### Энгийн хэрэглэгч

```text
Утас:   99112233
Нууц үг: password123
```

> Захиалга үүсгэхийн тулд хэрэглэгч заавал account-тай байх шаардлагагүй.

## Чухал хэрэглэгчийн flow

### Нэвтрэхгүйгээр захиалга үүсгэх

Хэрэглэгч public website дээрээс нэвтрэхгүйгээр захиалга үүсгэж болно.

Захиалгын form дараах API руу өгөгдөл илгээнэ:

```text
POST /api/shipments
```

Нэг илгээмж олон бараатай байж болно. Гэхдээ тухайн илгээмж зөвхөн нэг нийт жинтэй байна.

Жишээ:

```text
Илгээмж/багц:
- Бараа 1: Уруулын будаг
- Бараа 2: Даашинз
- Бараа 3: Утасны гэр
- Нийт жин: 2.5 кг
```

Үнэ тухайн нийт жингээр тооцогдоно.

### Нэвтэрсэн хэрэглэгчийн харагдах байдал

Энгийн хэрэглэгч нэвтэрвэл:

- Header дээр login button-ийн оронд profile shortcut гарна.
- Profile page рүү орж болно.
- Нууц үгээ шинэчилж болно.
- Системээс гарах боломжтой.
- Захиалга үүсгэх үед нэвтэрсэн хэрэглэгчийн утасны дугаар автоматаар ашиглагдаж болно.

### Admin login redirect

Admin account-аар public login form дээр нэвтэрвэл website автоматаар дараах хаяг руу шилжинэ:

```text
/admin
```

## API товч танилцуулга

### Auth routes

Base path:

```text
/api/auth
```

| Method | Route | Хандах эрх | Тайлбар |
|---|---|---|---|
| POST | `/register` | Public | Шинэ хэрэглэгч бүртгэх |
| POST | `/login` | Public | Нэвтрэх, token авах |
| GET | `/me` | Нэвтэрсэн хэрэглэгч | Одоогийн хэрэглэгчийн мэдээлэл авах |
| PUT | `/password` | Нэвтэрсэн хэрэглэгч | Нууц үг шинэчлэх |
| GET | `/users` | Admin | Бүх хэрэглэгч харах |
| PUT | `/users/:id/role` | Admin | Хэрэглэгчийн эрх солих |
| DELETE | `/users/:id` | Admin | Хэрэглэгч устгах |

### Shipment routes

Base path:

```text
/api/shipments
```

| Method | Route | Хандах эрх | Тайлбар |
|---|---|---|---|
| POST | `/` | Public / optional login | Илгээмж/захиалга үүсгэх |
| GET | `/track/:code` | Public | Хяналтын кодоор хайх |
| GET | `/by-phone/:phone` | Public | Утасны дугаараар илгээмж хайх |
| GET | `/my` | Нэвтэрсэн хэрэглэгч | Нэвтэрсэн хэрэглэгчийн илгээмжүүд |
| GET | `/` | Admin | Бүх илгээмж харах |
| PUT | `/:id/status` | Admin | Илгээмжийн төлөв шинэчлэх |
| PUT | `/:id` | Admin | Backend зөвшөөрсөн жин/мэдээлэл шинэчлэх |
| DELETE | `/:id` | Admin | Илгээмж устгах |

### FAQ routes

Base path:

```text
/api/faqs
```

| Method | Route | Хандах эрх | Тайлбар |
|---|---|---|---|
| GET | `/` | Public | FAQ жагсаалт авах |
| POST | `/` | Admin | FAQ нэмэх |
| PUT | `/:id` | Admin | FAQ засах |
| DELETE | `/:id` | Admin | FAQ устгах |

## Илгээмжийн төлөвүүд

Project дээр дараах Монгол төлөвүүд ашиглагдана:

```text
Захиалга үүсгэсэн
Хятадын агуулахад
Замын Үүд дээр
Улаанбаатарт ирсэн
Олгогдсон
```

Admin dashboard дээрээс илгээмжийн төлөвийг шинэчилж болно.

## FAQ холболт

Admin FAQ болон хэрэглэгчийн FAQ нь нэг backend API ашигладаг.

Admin FAQ нэмэх/засах хэсэг:

```text
http://localhost:5000/admin
```

Хэрэглэгчийн тусламжийн хуудас дараах API-аас FAQ авна:

```text
GET /api/faqs
```

Тиймээс admin дээр нэмсэн FAQ public support/FAQ page дээр харагдах ёстой.

## Алдаа засах зөвлөмж

### 1. MongoDB connection error

Алдааны жишээ:

```text
connect ECONNREFUSED 127.0.0.1:27017
```

Засах:

- MongoDB суусан эсэхийг шалгана.
- MongoDB service ажиллаж байгаа эсэхийг шалгана.
- `.env` доторх `MONGO_URI` зөв эсэхийг шалгана.

### 2. Guest хэрэглэгч захиалга үүсгэхэд 401 Unauthorized гарах

Guest order creation нь login шаардах ёсгүй.

Browser дээр хадгалагдсан хуучин token устгахын тулд DevTools Console дээр:

```js
localStorage.clear()
```

Дараа нь website-аа refresh хийгээд нэвтрэхгүйгээр дахин захиалга үүсгээд үзнэ.

### 3. Admin login хийсэн ч admin dashboard нээгдэхгүй байх

Admin account ашиглана:

```text
88000001 / admin123
```

Шаардлагатай бол гараар дараах хаягийг нээнэ:

```text
http://localhost:5000/admin
```

Мөн хуучин localStorage token устгаж болно:

```js
localStorage.clear()
```

### 4. Port already in use

Хэрвээ `5000` port ашиглагдаж байгаа бол `.env` файл дээр port-оо солино:

```env
PORT=5001
```

Дараа нь дараах хаягаар орно:

```text
http://localhost:5001
```

## Хөгжүүлэлтийн тэмдэглэл

- GitHub руу upload хийхдээ жинхэнэ secret key-г `.env` файлтай хамт битгий upload хийгээрэй.
- Real deployment хийхээс өмнө `JWT_SECRET`-ээ заавал солино.
- API route өөрчилбөл public frontend JS болон admin `script.js` файлыг хамт шинэчилнэ.
- Admin FAQ өөрчлөхөд user FAQ page database-аас шинэ мэдээллээ авах ёстой.
- Guest order creation public хэвээр байх ёстой.

## Түгээмэл command-ууд

```bash
npm install      # dependency суулгах
npm run seed     # test data үүсгэх
npm run dev      # nodemon-оор ажиллуулах
npm start        # энгийнээр ажиллуулах
```
