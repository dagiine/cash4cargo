import { STATUS_ORDER, STATUS } from "../data/trackingData.js";
import { shipmentAPI, isLoggedIn } from "./api.js";

class Shipment {
  constructor(raw) {
    this.trackCode     = raw.tracking_code  || raw.trackCode  || "";
    this.phone         = raw.user_phone     || raw.phone      || "";
    this.status        = raw.status         || "";
    this.weight        = raw.total_weight   || raw.weight     || 0;
    this.price         = raw.shipping_price || raw.price      || 0;
    this.paymentStatus = raw.payment_status || "";
    this.estimatedDelivery = raw.estimated_delivery
      ? new Date(raw.estimated_delivery) : null;
  }

  get statusIndex() { return STATUS_ORDER.indexOf(this.status); }
  get meta()        { return STATUS[this.status] ?? { icon: "help", color: "#94a3b8" }; }
  get formattedPrice() { return this.price.toLocaleString("mn-MN") + " ₮"; }
  get isDelivered() { return this.status === "Олгогдсон"; }
}

export class TrackUI {
  constructor() { this.shipments = []; }

  async init() {
    this.resultsEl = document.getElementById("track-results");
    this.searchBtn = document.querySelector(".form button");
    this.codeInput = document.getElementById("track-code-input");

    if (!this.resultsEl) return;

    if (isLoggedIn()) {
      await this.loadMyShipments();
    } else {
      this.bindEvents();
      this.applyHash();
    }
  }

  async loadMyShipments() {
    this.showLoading();
    try {
      const raw  = await shipmentAPI.myShipments();
      const list = raw.map((r) => new Shipment(r));
      if (list.length === 0) {
        this.showEmpty("таны дугаар");
      } else {
        this.renderResults(list);
      }
      this.bindEvents();
    } catch (err) {
      this.showError("Ачаа ачаалахад алдаа гарлаа: " + err.message);
      this.bindEvents();
    }
  }

  bindEvents() {
    if (!this.searchBtn || !this.codeInput) return;
    this.searchBtn.addEventListener("click", () => this.onSearch());
    this.codeInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") { e.preventDefault(); this.onSearch(); }
    });
  }

  applyHash() {
    const hash = window.location.hash;
    const queryString = hash.includes("?") ? hash.split("?")[1] : "";
    const params = new URLSearchParams(queryString);
    const query  = params.get("query");
    if (!query) return;
    if (this.codeInput) this.codeInput.value = query;
    this.onSearch();
  }

  async onSearch() {
    let value = (this.codeInput?.value || "").trim().toUpperCase();
    if (!value) { this.showError("Хайх утга оруулна уу."); return; }
    if (/^MN\d{5}$/.test(value)) value = value.replace(/^MN/, "MN-");
    this.showLoading();
    try {
      let rawList;
      if (/^MN-\d{5}$/.test(value)) {
        rawList = [await shipmentAPI.trackByCode(value)];
      } else if (/^[6-9]\d{7}$/.test(value)) {
        rawList = await shipmentAPI.trackByPhone(value);
      } else {
        this.showError("Утасны дугаар эсвэл хяналтын код буруу байна."); return;
      }
      const list = rawList.map((r) => new Shipment(r));
      list.length === 0 ? this.showEmpty(value) : this.renderResults(list);
    } catch (err) {
      this.showEmpty(value, err.message);
    }
  }

  renderResults(list) {
    const totalWeight = list.reduce((a, s) => a + s.weight, 0);
    const totalPrice  = list.reduce((a, s) => a + s.price,  0);
    const pending     = list.filter((s) => !s.isDelivered);

    const summaryHTML = `
      <div class="track-summary">
        <span>📦 Нийт: <strong>${list.length}</strong> ачаа</span>
        <span>⚖️ Нийт жин: <strong>${totalWeight.toFixed(1)} кг</strong></span>
        <span>💰 Нийт үнэ: <strong>${totalPrice.toLocaleString("mn-MN")} ₮</strong></span>
        ${pending.length > 0
          ? `<span class="pending-badge">🚚 ${pending.length} хүлээгдэж буй ачаа</span>`
          : `<span class="delivered-badge">✅ Бүгд хүргэгдсэн</span>`}
      </div>`;

    const cards = list.map((s) => this.buildCard(s)).join("");
    this.resultsEl.innerHTML = summaryHTML + cards;
  }

  buildCard(shipment) {
    const steps = STATUS_ORDER.map((label, i) => {
      const done    = i <= shipment.statusIndex;
      const current = i === shipment.statusIndex;
      const meta    = STATUS[label] ?? { icon: "help", color: "#94a3b8" };
      return `
        <li class="step ${done ? "done" : ""} ${current ? "current" : ""}">
          <span class="step-icon material-symbols-outlined"
            style="color:${done ? (meta.color || "#4f83cc") : "#475569"}"
          >${meta.icon}</span>
          <span class="step-label">${label}</span>
        </li>`;
    }).join("");

    const paymentBadge = shipment.paymentStatus
      ? `<span class="payment-badge ${shipment.paymentStatus === "Төлөгдсөн" ? "paid" : "unpaid"}">
           ${shipment.paymentStatus === "Төлөгдсөн" ? "✅ Төлөгдсөн" : "⏳ Төлөгдөөгүй"}
         </span>` : "";

    const deliveryLine = shipment.estimatedDelivery
      ? `<div class="detail-item">
           <span class="material-symbols-outlined">calendar_month</span>
           <span>Хүргэх огноо: ${shipment.estimatedDelivery.toLocaleDateString("mn-MN")}</span>
         </div>` : "";

    return `
      <article class="track-card">
        <div class="track-card__header">
          <span class="material-symbols-outlined"
            style="color:${shipment.meta.color || "#4f83cc"}">${shipment.meta.icon}</span>
          <div>
            <h3 class="track-card__code">${shipment.trackCode}</h3>
            <p class="track-card__status" style="color:${shipment.meta.color || "#4f83cc"}">
              ${shipment.status}</p>
          </div>
          ${paymentBadge}
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
          ${deliveryLine}
        </div>
      </article>`;
  }

  showLoading() {
    this.resultsEl.innerHTML = `
      <div class="track-empty">
        <span class="material-symbols-outlined">progress_activity</span>
        <p>Ачаа хайж байна...</p>
      </div>`;
  }

  showEmpty(query, hint = "") {
    this.resultsEl.innerHTML = `
      <div class="track-empty">
        <span class="material-symbols-outlined">search_off</span>
        <p><strong>"${query}"</strong> гэсэн хайлтаар ачаа олдсонгүй.</p>
        <p class="track-empty__hint">${hint || "Трак код эсвэл утасны дугаараа шалгана уу."}</p>
      </div>`;
  }

  showError(msg) {
    this.resultsEl.innerHTML = `
      <div class="track-empty track-empty--error">
        <span class="material-symbols-outlined">error</span>
        <p>${msg}</p>
      </div>`;
  }
}
