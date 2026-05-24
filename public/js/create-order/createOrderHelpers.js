// ===============================================
// CREATE ORDER HELPER FUNCTIONS
// Энэ файл нь захиалга үүсгэх page-ийн жижиг туслах function-уудыг хадгална.
// HTML/CSS өөрчлөхгүйгээр initCreateOrder.js-ийг богино, ойлгомжтой болгохын тулд салгасан.
// ===============================================

import { getSession } from "../api.js";

// 1 кг тутамд тооцох үнэ.
// Хэрвээ үнэ өөрчлөгдвөл зөвхөн энэ тоог солино.
export const PRICE_PER_KG = 3500;

// Захиалгад нэмэгдэж байгаа бараануудыг түр хадгалах array.
// Нэг package дотор олон бараа байж болно.
let coItems = [
  { trackCode: "", name: "", qty: 1 },
];

// Тоог Монгол мөнгөний форматтай болгоно.
// Жишээ: 3500 -> 3,500 ₮
export function money(amount) {
  return Number(amount || 0).toLocaleString("mn-MN") + " ₮";
}

// Одоогийн item array-г буцаана.
// Шууд coItems-г өөр file-оос өөрчлөхгүй байхын тулд ийм function ашиглаж байна.
export function getItems() {
  return coItems;
}

// Шинэ барааны мөр нэмнэ.
export function addItem() {
  coItems.push({ trackCode: "", name: "", qty: 1 });
}

// Барааны мөр устгана.
// Хэрвээ бүх бараа устчихвал нэг хоосон мөр буцааж үлдээнэ.
export function removeItem(index) {
  coItems.splice(Number(index), 1);

  if (!coItems.length) {
    coItems.push({ trackCode: "", name: "", qty: 1 });
  }
}

// Барааны input өөрчлөгдөх үед coItems array-г шинэчилнэ.
export function updateItem(index, field, value) {
  if (!coItems[index]) return;

  if (field === "qty") {
    coItems[index][field] = Math.max(1, Number(value || 1));
    return;
  }

  coItems[index][field] = value;
}

// Form-ийг цэвэрлэх үед item array-г анхны байдалд оруулна.
export function resetItems() {
  coItems = [
    { trackCode: "", name: "", qty: 1 },
  ];
}

// Утасны дугаар авах function.
// Login хийсэн бол user-ийн утсыг авна.
// Login хийгээгүй бол form input-оос авна.
export function getPhone() {
  const session = getSession();

  if (session?.user?.phone) {
    return String(session.user.phone).replace(/\D/g, "");
  }

  return document.getElementById("co-phone")?.value.trim() || "";
}

// Form-ийн тайлбар/алдааны message харуулна.
export function setSub(text, isError = false) {
  const sub = document.getElementById("co-sub");

  if (!sub) return;

  sub.textContent = text;
  sub.style.color = isError ? "var(--color--error, #ef4444)" : "";
}

// Доод талын summary хэсгийг шинэчилнэ.
// Жишээ: 3 бараа, нийт 5 ш.
export function updateSummary() {
  const summary = document.getElementById("co-summary");
  const itemCount = document.getElementById("co-item-count");
  const qtySum = document.getElementById("co-qty-sum");

  if (!summary || !itemCount || !qtySum) return;

  // reduce ашиглаад бүх item-ийн тоо ширхэгийг нийлүүлж байна.
  const totalQty = coItems.reduce((sum, item) => {
    return sum + Number(item.qty || 0);
  }, 0);

  summary.style.display = coItems.length ? "flex" : "none";
  itemCount.textContent = `${coItems.length} бараа`;
  qtySum.textContent = `Нийт ${totalQty} ш`;
}

// Item input-уудыг дэлгэц дээр дахин зурна.
// coItems array өөрчлөгдөх бүрд энэ function дуудагдана.
export function renderItems() {
  const list = document.getElementById("co-items-list");

  if (!list) return;

  // map ашиглаад item бүрийг HTML мөр болгон хувиргаж байна.
  list.innerHTML = coItems.map((item, index) => `
    <div class="co-item-row">
      <div class="co-item-track">
        <input
          class="co-item-input"
          value="${item.trackCode}"
          placeholder="Трак код"
          data-index="${index}"
          data-field="trackCode"
        />
      </div>

      <div class="co-item-name">
        <input
          class="co-item-input"
          value="${item.name}"
          placeholder="Барааны нэр"
          data-index="${index}"
          data-field="name"
        />
      </div>

      <div class="co-item-qty">
        <input
          class="co-item-input qty-input"
          type="number"
          min="1"
          value="${item.qty}"
          data-index="${index}"
          data-field="qty"
        />
      </div>

      ${coItems.length > 1
        ? `<button class="co-item-del" type="button" data-remove="${index}">×</button>`
        : `<span style="width:30px"></span>`
      }
    </div>
  `).join("");

  updateSummary();
}

// Submit хийхээс өмнө form зөв бөглөгдсөн эсэхийг шалгана.
export function validateOrder() {
  const phone = getPhone();

  if (!/^[6-9]\d{7}$/.test(phone)) {
    setSub("Утасны дугаар буруу байна. Жишээ: 99112233", true);
    return false;
  }

  // some ашиглаад аль нэг мөр хоосон эсэхийг шалгаж байна.
  const hasEmptyTrack = coItems.some((item) => !item.trackCode.trim());
  const hasEmptyName = coItems.some((item) => !item.name.trim());
  const hasBadQty = coItems.some((item) => Number(item.qty) < 1);

  if (hasEmptyTrack) {
    setSub("Бараа бүрийн трак кодыг бөглөнө үү.", true);
    return false;
  }

  if (hasEmptyName) {
    setSub("Бараа бүрийн нэрийг бөглөнө үү.", true);
    return false;
  }

  if (hasBadQty) {
    setSub("Барааны тоо ширхэг 1-ээс их байна.", true);
    return false;
  }

  return true;
}

// Backend рүү илгээх data-г бэлдэнэ.
// Захиалга анх үүсэхдээ жин/үнэгүй байна.
// Admin бодит жинг оруулсны дараа үнэ автоматаар бодогдоно.
export function buildPayload() {
  const session = getSession();
  const phone = getPhone();

  return {
    user_phone: phone,
    receiver_phone: phone,
    sender_name: session?.user?.name || "Захиалагч",
    receiver_name: session?.user?.name || "Захиалагч",
    total_weight: 0,
    shipping_price: 0,
    status: "Захиалга үүсгэсэн",
    payment_status: "Төлөгдөөгүй",

    // map ашиглаад frontend item-уудыг backend-д хэрэгтэй хэлбэрт оруулж байна.
    items: coItems.map((item) => ({
      item_name: item.name.trim(),
      quantity: Number(item.qty),
      description: `Трак код: ${item.trackCode.trim()}`,
    })),
  };
}

// Login хийсэн user бол утасны input-ийг нууж, өөрийн дугаарыг ашиглана.
export function setupPhoneField() {
  const session = getSession();
  const phoneLabel = document.getElementById("co-phone-label");
  const phoneWrap = document.getElementById("co-phone-wrap");
  const phoneInput = document.getElementById("co-phone");

  if (session?.user?.phone) {
    if (phoneLabel) phoneLabel.style.display = "none";
    if (phoneWrap) phoneWrap.style.display = "none";
    if (phoneInput) phoneInput.value = String(session.user.phone).replace(/\D/g, "");
    return;
  }

  if (phoneLabel) phoneLabel.style.display = "";
  if (phoneWrap) phoneWrap.style.display = "";
}
