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
