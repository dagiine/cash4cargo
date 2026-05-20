import { shipmentAPI, getSession } from "./api.js";

let coItems = [];
let coNextId = 1;

export function initCreateOrder() {
  coItems = [];
  coNextId = 1;
  coAddItem();
  coRestorePhone();
}

function coGetOrderPhone() {
  const session = getSession();
  if (session?.user?.phone) {
    return String(session.user.phone).replace(/\D/g, "");
  }
  return String(document.getElementById("co-phone")?.value || "").replace(/\D/g, "");
}

function coUpdateSub() {
  const session = getSession();
  const phone = coGetOrderPhone();
  const sub = document.getElementById("co-sub");
  if (!sub) return;

  const count = coItems.filter(i => i.name || i.track).length;

  if (session?.user?.phone) {
    sub.textContent = `${phone} дугаартай хэрэглэгч дээр ${count} захиалга нэмнэ`;
  } else if (phone && phone.length >= 8) {
    sub.textContent = `${phone} · ${count} захиалга`;
  } else {
    sub.textContent = "Нэвтрээгүй бол утасны дугаараа оруулаад захиалга үүсгэнэ";
  }
}

function coRestorePhone() {
  const session = getSession();
  const phoneLabel = document.getElementById("co-phone-label");
  const phoneWrap = document.getElementById("co-phone-wrap");
  const phoneInput = document.getElementById("co-phone");

  if (session?.user?.phone) {
    // Нэвтэрсэн үед утас оруулах хэсгийг нууж, session-ийн дугаарыг автоматаар ашиглана
    if (phoneLabel) phoneLabel.style.display = "none";
    if (phoneWrap) phoneWrap.style.display = "none";
    if (phoneInput) phoneInput.value = String(session.user.phone).replace(/\D/g, "");
    coUpdateSub();
    return;
  }

  // Зочин үед утас оруулах хэсгийг харуулна
  if (phoneLabel) phoneLabel.style.display = "";
  if (phoneWrap) phoneWrap.style.display = "";

  const saved = sessionStorage.getItem("co_phone");
  if (saved && phoneInput) {
    phoneInput.value = saved;
  }
  coUpdateSub();
}

function coAddItem() {
  const id = coNextId++;
  coItems.push({ id, track: "", name: "", qty: 1, weight: 0, price: 0 });
  coRenderItems();
  setTimeout(() => document.getElementById(`track-${id}`)?.focus(), 50);
}

function coDeleteItem(id) {
  coItems = coItems.filter(i => i.id !== id);
  coRenderItems();
  coUpdateSub();
}

function coUpdateItem(id, field, value) {
  const item = coItems.find(i => i.id === id);
  if (!item) return;
  if (field === "qty" || field === "weight" || field === "price") {
    item[field] = parseFloat(value) || 0;
  } else {
    item[field] = value;
  }
  coUpdateSummary();
  coUpdateSub();
}

function coRenderItems() {
  const list = document.getElementById("co-items-list");
  if (!list) return;

  if (coItems.length === 0) {
    list.innerHTML = `
      <div class="co-items-empty" onclick="coAddItem()">
        <span class="material-symbols-outlined">inventory_2</span>
        <span>+ Барaa нэмэх</span>
      </div>`;
    coUpdateSummary();
    return;
  }

  list.innerHTML = coItems.map(item => `
    <div class="co-item-row" data-id="${item.id}">
      <div class="co-item-track">
        <input class="co-item-input" id="track-${item.id}" type="text"
          placeholder="Трак код" value="${escHtml(item.track)}"
          oninput="coUpdateItem(${item.id}, 'track', this.value)" />
      </div>
      <div class="co-item-name">
        <input class="co-item-input" id="name-${item.id}" type="text"
          placeholder="Барааны нэр" value="${escHtml(item.name)}"
          oninput="coUpdateItem(${item.id}, 'name', this.value)" />
      </div>
      <div class="co-item-qty">
        <input class="co-item-input qty-input" id="qty-${item.id}" type="number"
          min="1" value="${item.qty}"
          oninput="coUpdateItem(${item.id}, 'qty', this.value)" />
      </div>
      <div class="co-item-qty">
        <input class="co-item-input" id="weight-${item.id}" type="number"
          min="0" step="0.1" placeholder="кг" value="${item.weight || ""}"
          oninput="coUpdateItem(${item.id}, 'weight', this.value)" />
      </div>
      <div class="co-item-qty">
        <input class="co-item-input" id="price-${item.id}" type="number"
          min="0" placeholder="₮" value="${item.price || ""}"
          oninput="coUpdateItem(${item.id}, 'price', this.value)" />
      </div>
      <button class="co-item-del" onclick="coDeleteItem(${item.id})" title="Устгах">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          stroke-width="2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
      </button>
    </div>
  `).join("");

  coUpdateSummary();
}

function coUpdateSummary() {
  const summary  = document.getElementById("co-summary");
  const countEl  = document.getElementById("co-item-count");
  const qtyEl    = document.getElementById("co-qty-sum");
  const weightEl = document.getElementById("co-weight-sum");
  if (!summary) return;
  if (coItems.length === 0) { summary.style.display = "none"; return; }

  summary.style.display = "";
  const totalQty    = coItems.reduce((s, i) => s + (parseInt(i.qty)    || 1),   0);
  const totalWeight = coItems.reduce((s, i) => s + (parseFloat(i.weight) || 0), 0);
  if (countEl)  countEl.textContent  = `${coItems.length} бараа`;
  if (qtyEl)    qtyEl.textContent    = `Нийт ${totalQty} ш`;
  if (weightEl) weightEl.textContent = `${totalWeight.toFixed(1)} кг`;
}

function coNewOrder() {
  if (coItems.some(i => i.name || i.track)) {
    if (!confirm("Одоогийн бараануудыг цэвэрлэж шинэ захиалга үүсгэх үү?")) return;
  }
  const session = getSession();
  const phoneEl = document.getElementById("co-phone");
  if (!session?.user?.phone && phoneEl) phoneEl.value = "";
  coItems = []; coNextId = 1;
  coAddItem(); coRestorePhone();
}

function coClearAll() {
  if (!confirm("Бүх мэдээллийг цэвэрлэх үү?")) return;
  const session = getSession();
  const phoneEl = document.getElementById("co-phone");
  if (!session?.user?.phone && phoneEl) phoneEl.value = "";
  coItems = []; coNextId = 1;
  coRenderItems(); coRestorePhone();
}

// ── SUBMIT — Backend-д илгээнэ ────────────────────────────────
async function coSubmit() {
  const session = getSession();
  const phone = coGetOrderPhone();
  const submitBtn = document.getElementById("co-submit-btn");

  if (!phone || !/^[6-9]\d{7}$/.test(phone)) {
    showToast("Утасны дугаар буруу байна (8 оронтой, 6-9 эхэлнэ)", "error");
    if (!session?.user?.phone) document.getElementById("co-phone")?.focus();
    return;
  }

  const validItems = coItems.filter(i => i.name.trim() || i.track.trim());
  if (validItems.length === 0) {
    showToast("Дор хаяж нэг барааны мэдээлэл оруулна уу", "error");
    return;
  }

  // Жин тооцоолно
  const totalWeight  = validItems.reduce((s, i) => s + (parseFloat(i.weight) || 0), 0);
  const totalPrice   = validItems.reduce((s, i) => s + (parseFloat(i.price)  || 0), 0);
  const shippingPrice = Math.round(15000 + totalWeight * 2500);

  // Tracking code-г backend давхцахгүйгээр үүсгэнэ
  const payload = {
    user_phone:      phone,
    sender_name:     session?.user?.name || "Захиалагч",
    receiver_name:   session?.user?.name || "Захиалагч",
    receiver_phone:  phone,
    items: validItems.map(i => ({
      item_name:   i.name || i.track || "Бараа",
      quantity:    parseInt(i.qty)     || 1,
      weight:      parseFloat(i.weight) || 0,
      price:       parseFloat(i.price)  || 0,
      description: i.track || "",
    })),
    total_weight:   totalWeight || 1,
    shipping_price: shippingPrice,
    status:         "Захиалга үүсгэсэн",
    payment_status: "Төлөгдөөгүй",
  };

  // Товчийг disable хийнэ
  if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = "Илгээж байна..."; }

  try {
    const data = await shipmentAPI.create(payload);
    const savedTrackingCode = data.tracking_code;

    if (!session?.user?.phone) {
      sessionStorage.setItem("co_phone", phone);
    }

    showToast(`✅ Захиалга амжилттай үүслээ! Трак код: ${savedTrackingCode}`, "success");

    // 2 секундын дараа track хуудас руу шилжинэ
    setTimeout(() => {
      window.location.hash = `#/track?type=code&query=${savedTrackingCode}`;
    }, 2000);

    // Формыг цэвэрлэнэ
    coItems = []; coNextId = 1;
    coAddItem(); coRestorePhone();

  } catch (err) {
    showToast("Алдаа: " + err.message, "error");
  } finally {
    if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = "Захиалга үүсгэх"; }
  }
}

// ── ҮНЭ ТООЦООЛУУР ───────────────────────────────────────────
function coCalcPrice() {
  const weight = parseFloat(document.getElementById("calc-weight")?.value) || 0;
  const l = parseFloat(document.getElementById("calc-l")?.value) || 0;
  const w = parseFloat(document.getElementById("calc-w")?.value) || 0;
  const h = parseFloat(document.getElementById("calc-h")?.value) || 0;

  if (!weight && (!l || !w || !h)) { alert("Жин эсвэл хэмжээ оруулна уу."); return; }

  const volWeight   = (l * w * h) / 5000;
  const chargeableW = Math.max(weight, volWeight);
  const isVol       = volWeight > weight && volWeight > 0;
  const BASE        = 15000;
  const RATE        = 2500;
  const total       = Math.round(BASE + chargeableW * RATE);
  const fmt         = n => Number(n).toLocaleString("mn-MN");

  const breakdownEl = document.getElementById("calc-breakdown");
  const totalEl     = document.getElementById("calc-total-val");
  const resultEl    = document.getElementById("calc-result");

  if (breakdownEl) {
    breakdownEl.innerHTML = `
      <div class="co-calc-row"><span>Тооцоологдох жин</span><span>${chargeableW.toFixed(2)} кг</span></div>
      <div class="co-calc-row"><span>Суурь төлбөр</span><span>${fmt(BASE)}₮</span></div>
      <div class="co-calc-row"><span>Жингийн төлбөр</span><span>${fmt(Math.round(chargeableW * RATE))}₮</span></div>
      ${isVol ? `<div class="co-calc-row" style="font-size:11px;color:#aaa">
        <span>Бодит ${weight.toFixed(2)}кг · Эзэлхүүн ${volWeight.toFixed(2)}кг</span></div>` : ""}`;
  }
  if (totalEl)  totalEl.textContent  = fmt(total) + "₮";
  if (resultEl) resultEl.style.display = "";
}

// ── Toast мессеж ──────────────────────────────────────────────
function showToast(msg, type = "success") {
  let toast = document.getElementById("co-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "co-toast";
    toast.style.cssText = `
      position:fixed; bottom:24px; left:50%; transform:translateX(-50%);
      padding:12px 24px; border-radius:8px; font-size:14px; font-weight:500;
      z-index:9999; transition:opacity 0.3s; max-width:90vw; text-align:center;
      box-shadow:0 4px 12px rgba(0,0,0,0.15);`;
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.background = type === "error" ? "#ef4444" : "#22c55e";
  toast.style.color = "#fff";
  toast.style.opacity = "1";
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => { toast.style.opacity = "0"; }, 3500);
}

function escHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;").replace(/"/g, "&quot;")
    .replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Global-д гаргана
window.coAddItem    = coAddItem;
window.coDeleteItem = coDeleteItem;
window.coUpdateItem = coUpdateItem;
window.coUpdateSub  = coUpdateSub;
window.coNewOrder   = coNewOrder;
window.coClearAll   = coClearAll;
window.coSubmit     = coSubmit;
window.coCalcPrice  = coCalcPrice;
