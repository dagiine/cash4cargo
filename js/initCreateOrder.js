// js/initCreateOrder.js
import { getSession, saveOrder } from "./auth.js";
// app.js-д хуудас ачаалсны дараа дуудна: initCreateOrder()

// ══ Барааны жагсаалт (state) ══
let coItems = [];
let coNextId = 1;

// ══ INIT — хуудас render болсны дараа дуудна ══
function initCreateOrder() {
  coItems = [];
  coNextId = 1;

  // Нэг анхны мөр нэмнэ
  coAddItem();

  // Хуудас унших үед хадгалагдсан утга байвал сэргээнэ
  coRestorePhone();
}

// ══ УТАСНЫ ДУГААР ══
function coUpdateSub() {
  const phone = document.getElementById('co-phone')?.value?.trim();
  const sub = document.getElementById('co-sub');
  if (!sub) return;
  if (phone && phone.length >= 8) {
    const count = coItems.filter(i => i.name || i.track).length;
    sub.textContent = `${phone} · ${count} захиалга`;
  } else {
    sub.textContent = 'Утасны дугаар оруулна уу';
  }
}

function coRestorePhone() {
  const saved = sessionStorage.getItem('co_phone');
  if (saved) {
    const el = document.getElementById('co-phone');
    if (el) { el.value = saved; coUpdateSub(); }
  }
}

// ══ БАРAA НЭМЭХ ══
function coAddItem() {
  const id = coNextId++;
  coItems.push({ id, track: '', name: '', qty: 1 });
  coRenderItems();
  // Шинэ мөрийн track input-д focus
  setTimeout(() => {
    document.getElementById(`track-${id}`)?.focus();
  }, 50);
}

// ══ БАРAA УСТГАХ ══
function coDeleteItem(id) {
  coItems = coItems.filter(i => i.id !== id);
  coRenderItems();
  coUpdateSub();
}

// ══ УТГА ӨӨРЧЛӨХ ══
function coUpdateItem(id, field, value) {
  const item = coItems.find(i => i.id === id);
  if (!item) return;
  item[field] = field === 'qty' ? (parseInt(value) || 1) : value;
  coUpdateSummary();
  coUpdateSub();
}

// ══ RENDER ══
function coRenderItems() {
  const list = document.getElementById('co-items-list');
  if (!list) return;

  if (coItems.length === 0) {
    list.innerHTML = `
      <div class="co-items-empty" onclick="coAddItem()">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2L2 7v10l10 5 10-5V7L12 2z"/><path d="M12 22V12M2 7l10 5 10-5"/>
        </svg>
        <span>+ Барaa нэмэх</span>
      </div>`;
    coUpdateSummary();
    return;
  }

  list.innerHTML = coItems.map(item => `
    <div class="co-item-row" data-id="${item.id}">

      <div class="co-item-track">
        <input
          class="co-item-input"
          id="track-${item.id}"
          type="text"
          placeholder="Трак код"
          value="${escHtml(item.track)}"
          oninput="coUpdateItem(${item.id}, 'track', this.value)"
        />
      </div>

      <div class="co-item-name">
        <input
          class="co-item-input"
          id="name-${item.id}"
          type="text"
          placeholder="Барааны нэр"
          value="${escHtml(item.name)}"
          oninput="coUpdateItem(${item.id}, 'name', this.value)"
        />
      </div>

      <div class="co-item-qty">
        <input
          class="co-item-input qty-input"
          id="qty-${item.id}"
          type="number"
          min="1"
          value="${item.qty}"
          oninput="coUpdateItem(${item.id}, 'qty', this.value)"
        />
      </div>

      <button class="co-item-del" onclick="coDeleteItem(${item.id})" title="Устгах">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
      </button>

    </div>
  `).join('');

  coUpdateSummary();
}

function coUpdateSummary() {
  const summary = document.getElementById('co-summary');
  const countEl = document.getElementById('co-item-count');
  const qtyEl   = document.getElementById('co-qty-sum');
  if (!summary) return;

  if (coItems.length === 0) {
    summary.style.display = 'none';
    return;
  }

  summary.style.display = '';
  const totalQty = coItems.reduce((s, i) => s + (parseInt(i.qty) || 1), 0);
  if (countEl) countEl.textContent = `${coItems.length} бараа`;
  if (qtyEl)   qtyEl.textContent   = `Нийт ${totalQty} ш`;
}

// ══ ШИНЭ ЗАХИАЛГА ══
function coNewOrder() {
  if (coItems.some(i => i.track || i.name)) {
    if (!confirm('Одоогийн бараануудыг цэвэрлэж шинэ захиалга үүсгэх үү?')) return;
  }
  const phoneEl = document.getElementById('co-phone');
  if (phoneEl) phoneEl.value = '';
  coItems = [];
  coNextId = 1;
  coAddItem();
  coUpdateSub();
  document.getElementById('calc-result')?.style && (document.getElementById('calc-result').style.display = 'none');
}

function coClearAll() {
  if (!confirm('Бүх мэдээллийг цэвэрлэх үү?')) return;
  const phoneEl = document.getElementById('co-phone');
  if (phoneEl) phoneEl.value = '';
  coItems = [];
  coNextId = 1;
  coRenderItems();
  coUpdateSub();
}

// ══ SUBMIT ══
function coSubmit() {
  const phone = document.getElementById('co-phone')?.value?.trim();

  if (!phone || phone.length < 8) {
    alert('Утасны дугаар оруулна уу.');
    document.getElementById('co-phone')?.focus();
    return;
  }

  const validItems = coItems.filter(i => i.name.trim() || i.track.trim());
  if (validItems.length === 0) {
    alert('Дор хаяж нэг барааны мэдээлэл оруулна уу.');
    return;
  }

  // sessionStorage-д хадгалах
  sessionStorage.setItem('co_phone', phone);

  // ── Нэвтэрсэн хэрэглэгч байвал захиалгыг хадгалах ──
  const session = getSession();
  if (session) {
    saveOrder(session.id, {
      phone:     phone,
      items:     validItems,
    });
  }

  console.log('Захиалга:', { phone, items: validItems });
  alert(`Захиалга амжилттай үүслээ!\nУтас: ${phone}\nБараа: ${validItems.length} төрөл`);
}

// ══ ҮНЭ ТООЦООЛУУР ══
function coCalcPrice() {
  const weight = parseFloat(document.getElementById('calc-weight')?.value) || 0;
  const l = parseFloat(document.getElementById('calc-l')?.value) || 0;
  const w = parseFloat(document.getElementById('calc-w')?.value) || 0;
  const h = parseFloat(document.getElementById('calc-h')?.value) || 0;

  if (!weight && (!l || !w || !h)) {
    alert('Жин эсвэл хэмжээ оруулна уу.');
    return;
  }

  const volWeight   = (l * w * h) / 5000;
  const chargeableW = Math.max(weight, volWeight);
  const isVol       = volWeight > weight && volWeight > 0;

  const BASE     = 15000;
  const RATE     = 2500;
  const weightCost = Math.round(chargeableW * RATE);
  const total      = BASE + weightCost;

  const fmt = n => Number(n).toLocaleString('mn-MN');

  const breakdownEl = document.getElementById('calc-breakdown');
  const totalEl     = document.getElementById('calc-total-val');
  const resultEl    = document.getElementById('calc-result');

  if (breakdownEl) {
    breakdownEl.innerHTML = `
      <div class="co-calc-row">
        <span>Тооцоологдох жин${isVol ? ' <span style="font-size:10px;background:#fff3e0;color:#c15a00;padding:1px 5px;border-radius:3px;font-weight:700;margin-left:4px;">Эзэлхүүн</span>' : ''}</span>
        <span>${chargeableW.toFixed(2)} кг</span>
      </div>
      <div class="co-calc-row">
        <span>Суурь төлбөр</span>
        <span>${fmt(BASE)}₮</span>
      </div>
      <div class="co-calc-row">
        <span>Жингийн төлбөр</span>
        <span>${fmt(weightCost)}₮</span>
      </div>
      ${isVol ? `<div class="co-calc-row" style="font-size:11px;color:#aaa;margin-top:2px">
        <span>Бодит жин ${weight.toFixed(2)} кг · Эзэлхүүн ${volWeight.toFixed(2)} кг</span>
      </div>` : ''}
    `;
  }

  if (totalEl)  totalEl.textContent = fmt(total) + '₮';
  if (resultEl) resultEl.style.display = '';
}

// ══ HELPER ══
function escHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// Global-д гаргана (Vanilla JS-д window-с дуудах)
window.coAddItem    = coAddItem;
window.coDeleteItem = coDeleteItem;
window.coUpdateItem = coUpdateItem;
window.coUpdateSub  = coUpdateSub;
window.coNewOrder   = coNewOrder;
window.coClearAll   = coClearAll;
window.coSubmit     = coSubmit;
window.coCalcPrice  = coCalcPrice;

export { initCreateOrder };