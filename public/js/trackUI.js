import { API_BASE, STATUS_ORDER, STATUS } from "../data/trackingData.js";

class Shipment {
  constructor(data) {
    this.trackCode = data.tracking_code || data.trackCode || "";
    this.phone = data.user_phone || data.receiver_phone || data.phone || "";
    this.status = data.status || "Захиалга үүсгэсэн";
    this.weight = Number(data.total_weight ?? data.weight ?? 0);
    this.price = Number(data.shipping_price ?? data.price ?? 0);
    this.items = Array.isArray(data.items) ? data.items : [];
    this.createdAt = data.createdAt;
  }

  get statusIndex() {
    const index = STATUS_ORDER.indexOf(this.status);
    return index >= 0 ? index : 0;
  }

  get meta() {
    return STATUS[this.status] ?? { icon: "help", color: "#94a3b8" };
  }

  get formattedPrice() {
    return this.price.toLocaleString("mn-MN") + " ₮";
  }

  get isDelivered() {
    return this.status === "Олгогдсон";
  }
}

class CargoTracker {
  async request(path) {
    const response = await fetch(`${API_BASE}${path}`);
    let data = null;

    try {
      data = await response.json();
    } catch (_) {
      data = null;
    }

    if (!response.ok) {
      throw new Error(data?.message || `Сервер алдаа: ${response.status}`);
    }

    return data;
  }

  async findByCode(code) {
    const data = await this.request(`/shipments/track/${encodeURIComponent(code)}`);
    return [new Shipment(data)];
  }

  async findByPhone(phone) {
    const data = await this.request(`/shipments/by-phone/${encodeURIComponent(phone)}`);
    return data.map((item) => new Shipment(item));
  }

  summarise(list) {
    return list.reduce(
      (acc, s) => ({
        totalWeight: acc.totalWeight + s.weight,
        totalPrice: acc.totalPrice + s.price,
        count: acc.count + 1,
      }),
      { totalWeight: 0, totalPrice: 0, count: 0 }
    );
  }

  pendingOnly(list) {
    return list.filter((s) => !s.isDelivered);
  }
}

export class TrackUI {
  constructor() {
    this.tracker = new CargoTracker();
  }

  async init() {
    this.resultsEl = document.getElementById("track-results");
    this.searchBtn = document.querySelector(".form button");
    this.codeInput = document.getElementById("track-code-input");

    if (!this.resultsEl || !this.searchBtn || !this.codeInput) {
      console.error("TrackUI: DOM elements missing");
      return;
    }

    this.bindEvents();
    this.applyHash();
  }

  bindEvents() {
    this.searchBtn.addEventListener("click", () => this.onSearch());

    this.codeInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        this.onSearch();
      }
    });
  }

  applyHash() {
    const hash = window.location.hash;
    const queryString = hash.includes("?") ? hash.split("?")[1] : "";
    const params = new URLSearchParams(queryString);
    const query = params.get("query");

    if (!query) return;

    this.codeInput.value = query;
    this.onSearch();
  }

  async onSearch() {
    let value = this.codeInput.value.trim().toUpperCase();

    if (!value) {
      this.showError("Хайх утга оруулна уу.");
      return;
    }

    if (/^MN\d{5}$/.test(value)) {
      value = value.replace(/^MN/, "MN-");
    }

    try {
      this.showLoading();

      let results;

      if (/^MN-\d{5}$/.test(value)) {
        results = await this.tracker.findByCode(value);
      } else if (/^[6-9]\d{7}$/.test(value)) {
        results = await this.tracker.findByPhone(value);
      } else {
        this.showError("Утасны дугаар эсвэл хяналтын код буруу байна.");
        return;
      }

      if (!results || results.length === 0) {
        this.showEmpty(value);
        return;
      }

      this.renderResults(results);
    } catch (err) {
      this.showError(err.message || "Ачаа хайхад алдаа гарлаа.");
    }
  }

  renderResults(list) {
    const summary = this.tracker.summarise(list);
    const pending = this.tracker.pendingOnly(list);

    const summaryHTML = `
      <div class="track-summary">
        <span>Нийт: <strong>${summary.count}</strong> ачаа</span>
        <span>Нийт жин: <strong>${summary.totalWeight.toFixed(1)} кг</strong></span>
        <span>Нийт үнэ: <strong>${summary.totalPrice.toLocaleString("mn-MN")} ₮</strong></span>
        ${
          pending.length > 0
            ? `<span class="pending-badge">${pending.length} хүлээгдэж буй ачаа</span>`
            : `<span class="delivered-badge">Бүгд хүргэгдсэн</span>`
        }
      </div>
    `;

    const cards = list.map((shipment) => this.buildCard(shipment)).join("");
    this.resultsEl.innerHTML = summaryHTML + cards;
  }

  buildCard(shipment) {
    const steps = STATUS_ORDER.map((label, i) => {
      const done = i <= shipment.statusIndex;
      const current = i === shipment.statusIndex;
      const meta = STATUS[label] ?? { icon: "help", color: "#94a3b8" };

      return `
        <li class="step ${done ? "done" : ""} ${current ? "current" : ""}">
          <span class="step-icon material-symbols-outlined" style="color:${done ? meta.color : "#475569"}">${meta.icon}</span>
          <span class="step-label">${label}</span>
        </li>
      `;
    }).join("");

    const itemsHTML = shipment.items.length
      ? `<div class="track-card__items">${shipment.items.map((item) => `
          <span>${item.item_name || item.name || "Бараа"} × ${item.quantity || 1}</span>
        `).join("")}</div>`
      : "";

    return `
      <article class="track-card">
        <div class="track-card__header">
          <span class="material-symbols-outlined" style="color:${shipment.meta.color}">${shipment.meta.icon}</span>
          <div>
            <h3 class="track-card__code">${shipment.trackCode}</h3>
            <p class="track-card__status" style="color:${shipment.meta.color}">${shipment.status}</p>
          </div>
        </div>

        <ul class="track-steps">${steps}</ul>

        <div class="track-card__details">
          <div class="detail-item">
            <span class="material-symbols-outlined">scale</span>
            <span>${shipment.weight.toFixed(1)} кг</span>
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

        ${itemsHTML}
      </article>
    `;
  }

  showLoading() {
    this.resultsEl.innerHTML = `
      <div class="track-empty">
        <span class="material-symbols-outlined">hourglass_empty</span>
        <p>Хайж байна...</p>
      </div>
    `;
  }

  showEmpty(query) {
    this.resultsEl.innerHTML = `
      <div class="track-empty">
        <span class="material-symbols-outlined">search_off</span>
        <p><strong>"${query}"</strong> гэсэн хайлтаар ачаа олдсонгүй.</p>
        <p class="track-empty__hint">Трак код эсвэл утасны дугаараа шалгана уу.</p>
      </div>
    `;
  }

  showError(msg) {
    this.resultsEl.innerHTML = `
      <div class="track-empty track-empty--error">
        <span class="material-symbols-outlined">error</span>
        <p>${msg}</p>
      </div>
    `;
  }
}
