import { shipmentAPI, getSession } from "./api.js";

const PRICE_PER_KG = 3500;

let coItems = [
  { trackCode: "", name: "", qty: 1 },
];

function money(amount) {
  return Number(amount || 0).toLocaleString("mn-MN") + " ₮";
}

function getPhone() {
  const session = getSession();
  if (session?.user?.phone) {
    return String(session.user.phone).replace(/\D/g, "");
  }
  return document.getElementById("co-phone")?.value.trim() || "";
}

function getWeight() {
  const weight = Number(document.getElementById("calc-weight")?.value || 0);
  return weight > 0 ? weight : Math.max(coItems.length, 1) * 0.1;
}

function updateSummary() {
  const summary = document.getElementById("co-summary");
  const itemCount = document.getElementById("co-item-count");
  const qtySum = document.getElementById("co-qty-sum");

  if (!summary || !itemCount || !qtySum) return;

  const totalQty = coItems.reduce((sum, item) => sum + Number(item.qty || 0), 0);
  summary.style.display = coItems.length ? "flex" : "none";
  itemCount.textContent = `${coItems.length} бараа`;
  qtySum.textContent = `Нийт ${totalQty} ш`;
}

function renderItems() {
  const list = document.getElementById("co-items-list");
  if (!list) return;

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

function setSub(text, isError = false) {
  const sub = document.getElementById("co-sub");
  if (!sub) return;
  sub.textContent = text;
  sub.style.color = isError ? "var(--color--error, #ef4444)" : "";
}

function validateOrder() {
  const phone = getPhone();

  if (!/^[6-9]\d{7}$/.test(phone)) {
    setSub("Утасны дугаар буруу байна. Жишээ: 99112233", true);
    return false;
  }

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

function buildPayload() {
  const phone = getPhone();
  const totalWeight = getWeight();
  const shippingPrice = Math.ceil(totalWeight * PRICE_PER_KG);
  return {
    user_phone: phone,
    receiver_phone: phone,
    sender_name: getSession()?.user?.name || "Захиалагч",
    receiver_name: getSession()?.user?.name || "Захиалагч",
    total_weight: totalWeight,
    shipping_price: shippingPrice,
    status: "Захиалга үүсгэсэн",
    payment_status: "Төлөгдөөгүй",
    items: coItems.map((item) => ({
      item_name: item.name.trim(),
      quantity: Number(item.qty),
      description: `Трак код: ${item.trackCode.trim()}`,
    })),
  };
}

export function initCreateOrder() {
  const list = document.getElementById("co-items-list");
  const calcInputs = ["calc-weight", "calc-l", "calc-w", "calc-h"];

  if (!list) return;

  list.addEventListener("input", (event) => {
    const index = event.target.dataset.index;
    const field = event.target.dataset.field;

    if (index === undefined || !field) return;

    coItems[index][field] = field === "qty"
      ? Math.max(1, Number(event.target.value || 1))
      : event.target.value;

    updateSummary();
  });

  list.addEventListener("click", (event) => {
    const removeIndex = event.target.dataset.remove;
    if (removeIndex === undefined) return;

    coItems.splice(Number(removeIndex), 1);
    if (!coItems.length) coItems.push({ trackCode: "", name: "", qty: 1 });
    renderItems();
  });

  calcInputs.forEach((id) => {
    document.getElementById(id)?.addEventListener("input", window.coCalcPrice);
  });

  const session = getSession();
  const phoneLabel = document.getElementById("co-phone-label");
  const phoneWrap = document.getElementById("co-phone-wrap");
  const phoneInput = document.getElementById("co-phone");

  if (session?.user?.phone) {
    if (phoneLabel) phoneLabel.style.display = "none";
    if (phoneWrap) phoneWrap.style.display = "none";
    if (phoneInput) phoneInput.value = String(session.user.phone).replace(/\D/g, "");
  } else {
    if (phoneLabel) phoneLabel.style.display = "";
    if (phoneWrap) phoneWrap.style.display = "";
  }

  renderItems();
  window.coUpdateSub();
}

window.coUpdateSub = function coUpdateSub() {
  const phone = getPhone();
  const session = getSession();
  if (session?.user?.phone) {
    setSub(`${phone} дугаартай хэрэглэгч дээр захиалга бүртгэнэ`);
  } else {
    setSub(phone ? `${phone} дугаартай захиалга бүртгэнэ` : "Нэвтрээгүй бол утасны дугаараа оруулаад захиалга үүсгэнэ");
  }
};

window.coAddItem = function coAddItem() {
  coItems.push({ trackCode: "", name: "", qty: 1 });
  renderItems();
};

window.coClearAll = function coClearAll() {
  if (!getSession()?.user?.phone) document.getElementById("co-phone").value = "";
  document.getElementById("calc-weight").value = "";
  document.getElementById("calc-l").value = "";
  document.getElementById("calc-w").value = "";
  document.getElementById("calc-h").value = "";
  coItems = [{ trackCode: "", name: "", qty: 1 }];
  renderItems();
  window.coUpdateSub();

  const result = document.getElementById("calc-result");
  if (result) result.style.display = "none";
};

window.coNewOrder = function coNewOrder() {
  window.coClearAll();
  if (!getSession()?.user?.phone) document.getElementById("co-phone")?.focus();
};

window.coCalcPrice = function coCalcPrice() {
  const weight = Number(document.getElementById("calc-weight")?.value || 0);
  const l = Number(document.getElementById("calc-l")?.value || 0);
  const w = Number(document.getElementById("calc-w")?.value || 0);
  const h = Number(document.getElementById("calc-h")?.value || 0);
  const volumetricWeight = l && w && h ? (l * w * h) / 6000 : 0;
  const finalWeight = Math.max(weight, volumetricWeight);
  const total = Math.ceil(finalWeight * PRICE_PER_KG);

  const result = document.getElementById("calc-result");
  const breakdown = document.getElementById("calc-breakdown");
  const totalVal = document.getElementById("calc-total-val");

  if (!result || !breakdown || !totalVal) return;

  if (!finalWeight) {
    result.style.display = "none";
    return;
  }

  result.style.display = "block";
  breakdown.innerHTML = `
    <span>Бодит жин: ${weight.toFixed(1)} кг</span>
    <span>Эзлэхүүн жин: ${volumetricWeight.toFixed(1)} кг</span>
    <span>Тооцох жин: ${finalWeight.toFixed(1)} кг</span>
  `;
  totalVal.textContent = money(total);
};

window.coSubmit = async function coSubmit() {
  if (!validateOrder()) return;

  const button = document.getElementById("co-submit-btn");
  const oldText = button?.innerHTML;

  try {
    if (button) {
      button.disabled = true;
      button.textContent = "Илгээж байна...";
    }

    const shipment = await shipmentAPI.create(buildPayload());
    setSub(`Захиалга амжилттай үүслээ. Код: ${shipment.tracking_code}`, false);
    window.coClearAll();
    window.location.hash = `#/track?query=${encodeURIComponent(shipment.tracking_code)}`;
  } catch (err) {
    setSub(err.message || "Захиалга үүсгэхэд алдаа гарлаа.", true);
  } finally {
    if (button) {
      button.disabled = false;
      button.innerHTML = oldText;
    }
  }
};
