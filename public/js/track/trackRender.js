// ===============================================
// TRACK RENDER HELPERS
// Track page дээр HTML зурах жижиг function-ууд.
// TrackUI.js-ийг богино байлгахын тулд энд салгав.
// ===============================================

import { formatMoney } from "./trackHelpers.js";

// Order card-уудыг дэлгэц дээр гаргана.
export function renderShipmentCards(resultsEl, shipments) {
  const fragment = document.createDocumentFragment();

  // forEach ашиглаж shipment бүрээр <order-card> үүсгэнэ.
  shipments.forEach((shipment) => {
    const card = document.createElement("order-card");
    card.data = shipment;
    fragment.appendChild(card);
  });

  resultsEl.appendChild(fragment);
}

// Нийт захиалгын товч дүн.
export function createSummaryElement(tracker, shipments) {
  const summary = tracker.summarise(shipments);
  const pending = tracker.pendingOnly(shipments);

  const summaryBox = document.createElement("div");
  summaryBox.className = "track-summary";

  summaryBox.innerHTML = `
    <span>Нийт: <strong>${summary.count}</strong> ачаа</span>
    <span>Нийт жин: <strong>${summary.totalWeight.toFixed(1)} кг</strong></span>
    <span>Нийт үнэ: <strong>${formatMoney(summary.totalPrice)}</strong></span>
    ${getPendingText(pending.length)}
  `;

  return summaryBox;
}

// Хүлээгдэж байгаа ачаа байгаа эсэхийг харуулна.
function getPendingText(pendingCount) {
  if (pendingCount > 0) {
    return `<span class="pending-badge">${pendingCount} хүлээгдэж буй ачаа</span>`;
  }

  return `<span class="delivered-badge">Идэвхтэй хүлээлтгүй</span>`;
}

export function showLoading(resultsEl, text = "Ачааллаж байна...") {
  resultsEl.innerHTML = `
    <div class="track-empty">
      <span class="material-symbols-outlined">progress_activity</span>
      <p>${text}</p>
    </div>
  `;
}

export function showEmpty(resultsEl, query) {
  resultsEl.innerHTML = `
    <div class="track-empty">
      <span class="material-symbols-outlined">search_off</span>
      <p><strong>"${query}"</strong> захиалга олдсонгүй.</p>
      <p class="track-empty__hint">Tracking код эсвэл утасны дугаараа шалгана уу.</p>
    </div>
  `;
}

export function showError(resultsEl, message) {
  resultsEl.innerHTML = `
    <div class="track-empty track-empty--error">
      <span class="material-symbols-outlined">error</span>
      <p>${message}</p>
    </div>
  `;
}
