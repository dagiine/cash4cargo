// ===============================================
// ЗАХИАЛГА ҮҮСГЭХ ХУУДАСНЫ JS
// Энэ файл create-order page дээр ажиллана.
// Гол үүрэг: event listener холбох, inline onclick function-уудыг window дээр тавих.
// Жижиг helper logic-уудыг ./create-order/createOrderHelpers.js файл руу салгасан.
// ===============================================

import { shipmentAPI, getSession } from "./api.js";
import { PRICE_PER_KG, addItem, buildPayload, getPhone, money, removeItem, renderItems, resetItems, setSub, setupPhoneField, updateItem, updateSummary, validateOrder } from "./create-order/createOrderHelpers.js";

// Жин/урт/өргөн/өндөр input-ийн id-ууд.
// Array болгосноор давталтаар event listener нэмэхэд амар байна.
const CALC_INPUT_IDS = ["calc-weight", "calc-l", "calc-w", "calc-h"];

// Create order page нээгдэхэд хамгийн түрүүнд ажиллах initializer function.
export function initCreateOrder() {
  const list = document.getElementById("co-items-list");

  // Энэ page биш бол цааш ажиллуулахгүй.
  if (!list) return;

  connectItemInputEvents(list);
  connectItemRemoveEvents(list);
  connectCalculatorEvents();

  setupPhoneField();
  renderItems();
  window.coUpdateSub();
}

// ===============================================
// ITEM INPUT EVENT-ҮҮД
// ===============================================

// Item input дээр бичих бүрд item array-г шинэчилнэ.
function connectItemInputEvents(list) {
  list.addEventListener("input", (event) => {
    const index = event.target.dataset.index;
    const field = event.target.dataset.field;

    if (index === undefined || !field) return;

    updateItem(index, field, event.target.value);
    updateSummary();
  });
}

// X товч дарвал тухайн item-ийг устгана.
function connectItemRemoveEvents(list) {
  list.addEventListener("click", (event) => {
    const removeIndex = event.target.dataset.remove;

    if (removeIndex === undefined) return;

    removeItem(removeIndex);
    renderItems();
  });
}

// Жин/урт/өргөн/өндөр өөрчлөгдөхөд үнэ дахин тооцно.
function connectCalculatorEvents() {
  CALC_INPUT_IDS.forEach((id) => {
    document.getElementById(id)?.addEventListener("input", window.coCalcPrice);
  });
}

// ===============================================
// INLINE HTML-ЭЭС ДУУДАГДАХ FUNCTION-УУД
// HTML дотор onclick/oninput ашигласан тул эдгээрийг window дээр тавьж байна.
// ===============================================

// Утасны дугаарын доорх тайлбарыг шинэчилнэ.
window.coUpdateSub = function coUpdateSub() {
  const phone = getPhone();
  const session = getSession();

  if (session?.user?.phone) {
    setSub(`${phone} дугаартай хэрэглэгч дээр захиалга бүртгэнэ`);
    return;
  }

  const message = phone
    ? `${phone} дугаартай захиалга бүртгэнэ`
    : "Нэвтрэх шаардлагагүйгээр утасны дугаараа оруулаад захиалга үүсгээрэй";

  setSub(message);
};

// Шинэ барааны мөр нэмнэ.
window.coAddItem = function coAddItem() {
  addItem();
  renderItems();
};

// Form-ийг цэвэрлэж анхны байдалд оруулна.
window.coClearAll = function coClearAll() {
  if (!getSession()?.user?.phone) {
    const phoneInput = document.getElementById("co-phone");
    if (phoneInput) phoneInput.value = "";
  }

  clearCalculatorInputs();
  resetItems();
  renderItems();
  window.coUpdateSub();
  hideCalculatorResult();
};

// Шинэ захиалга эхлүүлэх shortcut.
window.coNewOrder = function coNewOrder() {
  window.coClearAll();

  if (!getSession()?.user?.phone) {
    document.getElementById("co-phone")?.focus();
  }
};

// Жин болон эзлэхүүн жингээр тээврийн үнийг тооцно.
// Энэ тооцоо зөвхөн хэрэглэгчид ойролцоо үнэ харуулах зориулалттай.
window.coCalcPrice = function coCalcPrice() {
  const weight = Number(document.getElementById("calc-weight")?.value || 0);
  const length = Number(document.getElementById("calc-l")?.value || 0);
  const width = Number(document.getElementById("calc-w")?.value || 0);
  const height = Number(document.getElementById("calc-h")?.value || 0);

  const volumetricWeight = length && width && height
    ? (length * width * height) / 6000
    : 0;

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

// Захиалга submit хийх function.
// Validation амжилттай бол backend рүү POST /api/shipments request явуулна.
window.coSubmit = async function coSubmit() {
  if (!validateOrder()) return;

  const button = document.getElementById("co-submit-btn");
  const oldText = button?.innerHTML;

  try {
    setSubmitLoading(button, true);
    const shipment = await shipmentAPI.create(buildPayload());

    setSub(`Захиалга амжилттай үүслээ. Код: ${shipment.tracking_code}`, false);
    window.coClearAll();

    window.location.hash = `#/track?query=${encodeURIComponent(shipment.tracking_code)}`;
  } catch (err) {
    setSub(err.message || "Захиалга үүсгэхэд алдаа гарлаа.", true);
  } finally {
    setSubmitLoading(button, false, oldText);
  }
};

// ===============================================
// ЖИЖИГ ТУСЛАХ FUNCTION-УУД
// ===============================================

// Calculator input-уудыг хоосолно.
function clearCalculatorInputs() {
  CALC_INPUT_IDS.forEach((id) => {
    const input = document.getElementById(id);
    if (input) input.value = "";
  });
}

// Тооцооллын үр дүнг нууж өгнө.
function hideCalculatorResult() {
  const result = document.getElementById("calc-result");

  if (result) {
    result.style.display = "none";
  }
}

// Submit button-г loading байдалтай болгоно.
function setSubmitLoading(button, isLoading, oldText = "") {
  if (!button) return;

  button.disabled = isLoading;
  button.innerHTML = isLoading ? "Илгээж байна..." : oldText;
}
