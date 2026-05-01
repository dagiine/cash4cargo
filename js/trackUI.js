import { SHIPMENTS_URL, STATUS_ORDER, STATUS } from "../data/trackingData.js";

class Shipment {
  constructor({ trackCode, phone, status, weight, price }) {
    this.trackCode = trackCode;
    this.phone = phone;
    this.status = status;
    this.weight = weight;
    this.price = price;
  }

  get statusIndex() {
    return STATUS_ORDER.indexOf(this.status);
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
  constructor() {
    this.shipments = [];
  }

  async load() {
    console.log("Fetching shipments from:", SHIPMENTS_URL);

    const response = await fetch(SHIPMENTS_URL);

    if (!response.ok) {
      throw new Error(`Сервер алдаа: ${response.status}`);
    }

    const raw = await response.json();
    console.log("Raw shipment data:", raw);

    this.shipments = raw.map((item) => new Shipment(item));
    console.log("Mapped shipments:", this.shipments);

    return this;
  }

  findByCode(code) {
    const q = code.trim().toUpperCase();
    console.log("Searching by code:", q);

    const result = this.shipments.filter(
      (s) => (s.trackCode || "").toUpperCase() === q
    );

    console.log("Code results:", result);
    return result;
  }

  findByPhone(phone) {
    const q = phone.trim().replace(/\D/g, "");
    console.log("Searching by phone:", q);

    const result = this.shipments.filter(
      (s) => (s.phone || "").replace(/\D/g, "") === q
    );

    console.log("Phone results:", result);
    return result;
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
    this.phoneInput = document.getElementById("track-phone-input");
    this.tabCode = document.getElementById("tab-code");
    this.tabPhone = document.getElementById("tab-phone");

    if (
      !this.resultsEl ||
      !this.searchBtn ||
      !this.codeInput ||
      !this.phoneInput ||
      !this.tabCode ||
      !this.tabPhone
    ) {
      console.error("TrackUI: DOM elements missing");
      return;
    }

    try {
      await this.tracker.load();
      this.bindEvents();
      this.applyHash();
    } catch (err) {
      this.showError("Өгөгдөл ачаалахад алдаа гарлаа: " + err.message);
    }
  }

  bindEvents() {
    this.searchBtn.addEventListener("click", () => this.onSearch());

    [this.codeInput, this.phoneInput].forEach((input) => {
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          this.onSearch();
        }
      });
    });
  }

  applyHash() {
    // URL hash-г авна
    const hash = window.location.hash;
    const queryString = hash.includes("?") ? hash.split("?")[1] : "";
    const params = new URLSearchParams(queryString);

    const type = params.get("type");
    const query = params.get("query");

    console.log("Hash query params:", { type, query });

    if (!query) 
      return;

    if (type === "phone") {
      // phone таб идэвхжүүлнэ
      this.tabPhone.checked = true;
      this.phoneInput.value = query;
    } else {
      // code таб идэвхжүүлнэ
      this.tabCode.checked = true;
      this.codeInput.value = query;
    }

    this.onSearch();
  }

  

  onSearch() {
    // Аль таб сонгогдсон, ямар утгаар хайхыг тодорхойлно
    const byCode = this.tabCode.checked;
    const query = byCode 
      ? this.codeInput.value 
      : this.phoneInput.value;

    console.log("Search mode:", byCode ? "code" : "phone");
    console.log("Query:", query);

    if (!query.trim()) {
      this.showError("Хайлтын утга оруулна уу.");
      return;
    }
    
    let results;

    if (byCode) {
      results = this.tracker.findByCode(query);
    } else {
      results = this.tracker.findByPhone(query);
    }

    if (results.length === 0) {
      this.showEmpty(query);
      return;
    }
    
    this.renderResults(results);
  }

  renderResults(list) {
    const summary = this.tracker.summarise(list);
    const pending = this.tracker.pendingOnly(list);

    const summaryHTML = `
      <div class="track-summary">
        <span>📦 Нийт: <strong>${summary.count}</strong> ачаа</span>
        <span>⚖️ Нийт жин: <strong>${summary.totalWeight.toFixed(1)} кг</strong></span>
        <span>💰 Нийт үнэ: <strong>${summary.totalPrice.toLocaleString("mn-MN")} ₮</strong></span>
        ${
          pending.length > 0
            ? `<span class="pending-badge">🚚 ${pending.length} хүлээгдэж буй ачаа</span>`
            : `<span class="delivered-badge">✅ Бүгд хүргэгдсэн</span>`
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
          <span
            class="step-icon material-symbols-outlined"
            style="color:${done ? meta.color : "#475569"}"
          >
            ${meta.icon}
          </span>
          <span class="step-label">${label}</span>
        </li>
      `;
    }).join("");

    return `
      <article class="track-card">
        <div class="track-card__header">
          <span
            class="material-symbols-outlined"
            style="color:${shipment.meta.color}"
          >
            ${shipment.meta.icon}
          </span>

          <div>
            <h3 class="track-card__code">${shipment.trackCode}</h3>
            <p
              class="track-card__status"
              style="color:${shipment.meta.color}"
            >
              ${shipment.status}
            </p>
          </div>
        </div>

        <ul class="track-steps">
          ${steps}
        </ul>

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
      </article>
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