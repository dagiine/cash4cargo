

import { CargoTracker } from "./CargoTracker.js";
import { STATUS_ORDER, STATUS_META } from "./data.js";

// ─────────────────────────────────────────────
//  TrackUI – DOM-тай ажиллах класс
// ─────────────────────────────────────────────
class TrackUI {
  constructor() {
    this.tracker    = new CargoTracker();
    this.resultsEl  = document.getElementById("track-results");
    this.searchBtn  = document.querySelector(".form-box button[type='submit']");
    this.codeInput  = document.querySelector(".tab-panel--code  input");
    this.phoneInput = document.querySelector(".tab-panel--phone input");
    this.tabCode    = document.getElementById("tab-code");
  }

  async init() {
    try {
      await this.tracker.load();
      this.#bindEvents();
    } catch (err) {
      this.#showError("Өгөгдөл ачаалахад алдаа гарлаа: " + err.message);
    }
  }

  // Товчны event handler холбох
  #bindEvents() {
    this.searchBtn.addEventListener("click", () => this.#onSearch());
    // Enter дарахад ч хайх
    [this.codeInput, this.phoneInput].forEach((inp) =>
      inp?.addEventListener("keydown", (e) => {
        if (e.key === "Enter") this.#onSearch();
      })
    );
  }

  #onSearch() {
    const byCode  = this.tabCode.checked;
    const query   = byCode
      ? this.codeInput.value
      : this.phoneInput.value;

    if (!query.trim()) {
      this.#showError("Хайлтын утга оруулна уу.");
      return;
    }

    const results = byCode
      ? this.tracker.findByCode(query)
      : this.tracker.findByPhone(query);

    if (results.length === 0) {
      this.#showEmpty(query);
    } else {
      this.#renderResults(results);
    }
  }

  // ── DOM солих: хайлтын үр дүн ─────────────
  #renderResults(list) {
    const summary = this.tracker.summarise(list);
    const pending = this.tracker.pendingOnly(list);

    // map → карт бүрийн HTML
    const cards = list
      .map((s) => this.#buildCard(s))
      .join("");

    // reduce-н үр дүн харуулах
    const summaryHTML = `
      <div class="track-summary">
        <span>📦 Нийт: <strong>${summary.count}</strong> ачаа</span>
        <span>⚖️ Нийт жин: <strong>${summary.totalWeight.toFixed(1)} кг</strong></span>
        <span>💰 Нийт үнэ: <strong>${summary.totalPrice.toLocaleString("mn-MN")} ₮</strong></span>
        ${pending.length > 0
          ? `<span class="pending-badge">🚚 ${pending.length} хүлээгдэж буй ачаа</span>`
          : `<span class="delivered-badge">✅ Бүгд хүргэгдсэн</span>`}
      </div>`;

    this.resultsEl.innerHTML = summaryHTML + cards;
    this.resultsEl.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // Нэг ачааны карт HTML
  #buildCard(shipment) {
    const steps = STATUS_ORDER.map((label, i) => {
      const done    = i <= shipment.statusIndex;
      const current = i === shipment.statusIndex;
      const meta    = STATUS_META[label];
      return `
        <li class="step ${done ? "done" : ""} ${current ? "current" : ""}">
          <span class="step-icon material-symbols-outlined"
                style="color:${done ? meta.color : "#475569"}">${meta.icon}</span>
          <span class="step-label">${label}</span>
        </li>`;
    }).join("");

    return `
      <article class="track-card">
        <div class="track-card__header">
          <span class="material-symbols-outlined" style="color:${shipment.meta.color}">
            ${shipment.meta.icon}
          </span>
          <div>
            <h3 class="track-card__code">${shipment.trackCode}</h3>
            <p class="track-card__status" style="color:${shipment.meta.color}">
              ${shipment.status}
            </p>
          </div>
        </div>

        <ul class="track-steps">${steps}</ul>

        <div class="track-card__details">
          <div class="detail-item">
            <span class="material-symbols-outlined">scale</span>
            <span>${shipment.weight} кг</span>
          </div>
          <div class="detail-item">
            <span class="material-symbols-outlined">payments</span>
            <span>${shipment.formattedPrice}</span>
          </div>
          <div class="detail-item">
            <span class="material-symbols-outlined">phone_iphone</span>
            <span>${shipment.phone}</span>
          </div>
        </div>
      </article>`;
  }

  #showEmpty(query) {
    this.resultsEl.innerHTML = `
      <div class="track-empty">
        <span class="material-symbols-outlined">search_off</span>
        <p><strong>"${query}"</strong> гэсэн хайлтаар ачаа олдсонгүй.</p>
        <p class="track-empty__hint">Трак-код эсвэл утасны дугаараа шалгана уу.</p>
      </div>`;
  }

  #showError(msg) {
    this.resultsEl.innerHTML = `
      <div class="track-empty track-empty--error">
        <span class="material-symbols-outlined">error</span>
        <p>${msg}</p>
      </div>`;
  }
}

// ── Entry point ───────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  new TrackUI().init();
});
