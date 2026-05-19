// js/trackUI.js
// Захиалга хайх UI
// — Нэвтэрсэн бол localStorage-ийн захиалгуудыг шууд харуулна
// — Утасны дугаар / track code-оор data.json-с хайна
// — Статусын түүх харуулна

import { SHIPMENTS_URL, STATUS_ORDER, STATUS } from "../data/trackingData.js";
import { getSession, getUserOrders } from "./auth.js";

// ── Нэг ачааны обьект (data.json) ──
class Shipment {
  constructor(raw) {
    this.trackCode     = raw.trackCode || raw.track_code || "";
    this.phone         = raw.phone     || raw.customer?.phone || "";
    this.status        = raw.status    || raw.shipping?.status || "";
    this.weight        = raw.weight    || raw.package?.weight  || 0;
    this.price         = raw.price     || raw.payment?.price   || 0;
    this.statusHistory = raw.shipping?.statusHistory || [];
    this.source        = "shipment"; // data.json-с ирсэн
  }

  get statusIndex() { return STATUS_ORDER.indexOf(this.status); }
  get meta()        { return STATUS[this.status] ?? { icon: "help", color: "#94a3b8" }; }
  get formattedPrice() { return this.price.toLocaleString("mn-MN") + " ₮"; }
  get isDelivered()    { return this.status === "Олгогдсон"; }
}

// ── Нэг localStorage захиалгыг Shipment-тэй ижил интерфейстэй болгох ──
class LocalOrder {
  constructor(raw) {
    this.trackCode     = "#" + String(raw.id).slice(-6);
    this.phone         = raw.phone || "";
    this.status        = raw.status || "Захиалга үүсгэсэн";
    this.weight        = 0;
    this.price         = 0;
    this.statusHistory = raw.statusHistory || [];
    this.items         = raw.items || [];
    this.createdAt     = raw.createdAt || "";
    this.source        = "local"; // localStorage-с ирсэн
  }

  get statusIndex()    { return STATUS_ORDER.indexOf(this.status); }
  get meta()           { return STATUS[this.status] ?? { icon: "help", color: "#94a3b8" }; }
  get formattedPrice() { return "—"; }
  get isDelivered()    { return this.status === "Олгогдсон"; }
}

// ── Ачаа хайгч (data.json) ──
class CargoTracker {
  constructor() { this.shipments = []; }

  async load() {
    const response = await fetch(SHIPMENTS_URL);
    if (!response.ok) throw new Error("Сервер алдаа: " + response.status);
    const raw = await response.json();
    this.shipments = raw.map(function(item) { return new Shipment(item); });
    return this;
  }

  findByCode(code) {
    var q = code.trim().toUpperCase();
    return this.shipments.filter(function(s) {
      return s.trackCode.toUpperCase() === q;
    });
  }

  findByPhone(phone) {
    var q = phone.trim().replace(/\D/g, "");
    return this.shipments.filter(function(s) {
      return s.phone.replace(/\D/g, "") === q;
    });
  }

  summarise(list) {
    return list.reduce(function(acc, s) {
      return {
        totalWeight: acc.totalWeight + s.weight,
        totalPrice:  acc.totalPrice  + s.price,
        count:       acc.count + 1,
      };
    }, { totalWeight: 0, totalPrice: 0, count: 0 });
  }

  pendingOnly(list) {
    return list.filter(function(s) { return !s.isDelivered; });
  }
}

// ── Хайлтын UI ──
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

    try {
      await this.tracker.load();
      this.bindEvents();

      // ── Нэвтэрсэн бол localStorage захиалгуудыг шууд харуулна ──
      var session = getSession();
      if (session) {
        this.showLoggedInOrders(session);
      } else {
        this.applyHash();
      }
    } catch (err) {
      this.showError("Өгөгдөл ачаалахад алдаа гарлаа: " + err.message);
    }
  }

  // ── Нэвтэрсэн хэрэглэгчийн бүх захиалга ──
  showLoggedInOrders(session) {
    var allItems = [];

    // 1. localStorage захиалгууд
    var localOrders = getUserOrders(session.id);
    var localItems  = localOrders.map(function(o) { return new LocalOrder(o); });
    allItems        = allItems.concat(localItems);

    // 2. data.json-с утасны дугаараар
    if (session.phone) {
      var jsonItems = this.tracker.findByPhone(session.phone);
      allItems      = allItems.concat(jsonItems);
    }

    // Дугаар input-д харуулна (хайлт хийх боломжтой байлгана)
    if (session.phone) {
      this.codeInput.value = session.phone;
    }

    if (allItems.length > 0) {
      this.renderResults(allItems, true, session);
    } else {
      // Захиалга байхгүй бол тавтай морилсон мессеж харуулна
      this.resultsEl.innerHTML = `
        <div class="track-welcome-empty">
          <span class="material-symbols-outlined">inbox</span>
          <p>Тавтай морил, <strong>${session.name}</strong>!</p>
          <p class="track-empty__hint">Та одоогоор захиалга үүсгээгүй байна.</p>
          <a href="#/create-order" class="btn">Захиалга үүсгэх</a>
        </div>
      `;
    }
  }

  bindEvents() {
    var self = this;
    this.searchBtn.addEventListener("click", function() { self.onSearch(); });
    this.codeInput.addEventListener("keydown", function(e) {
      if (e.key === "Enter") { e.preventDefault(); self.onSearch(); }
    });
  }

  applyHash() {
    var hash        = window.location.hash;
    var queryString = hash.includes("?") ? hash.split("?")[1] : "";
    var params      = new URLSearchParams(queryString);
    var query       = params.get("query");
    if (!query) return;
    this.codeInput.value = query;
    this.onSearch();
  }

  onSearch() {
    var value = this.codeInput.value.trim().toUpperCase();

    if (!value) { this.showError("Хайх утга оруулна уу."); return; }

    // MN12345 → MN-12345
    if (/^MN\d{5}$/.test(value)) value = value.replace(/^MN/, "MN-");

    var results;

    if (/^MN-\d{5}$/.test(value)) {
      results = this.tracker.findByCode(value);
    } else if (/^[6-9]\d{7}$/.test(value)) {
      results = this.tracker.findByPhone(value);

      // Нэвтэрсэн бол localStorage захиалгуудыг ч нэмнэ
      var session = getSession();
      if (session && value === (session.phone || "").replace(/\D/g, "")) {
        var localOrders = getUserOrders(session.id).map(function(o) { return new LocalOrder(o); });
        results = localOrders.concat(results);
      }
    } else {
      this.showError("Утасны дугаар эсвэл хяналтын код буруу байна.");
      return;
    }

    if (results.length === 0) { this.showEmpty(value); return; }

    var session = getSession();
    this.renderResults(results, false, session);
  }

  // ── Үр дүн render хийх ──
  renderResults(list, isLoggedIn, session) {
    var summary = this.tracker.summarise(list);
    var pending = this.tracker.pendingOnly(list);

    var welcomeHTML = (isLoggedIn && session)
      ? `<p class="track-welcome">Тавтай морил, <strong>${session.name}</strong>! Таны захиалгууд:</p>`
      : "";

    var summaryHTML = `
      ${welcomeHTML}
      <div class="track-summary">
        <span>📦 Нийт: <strong>${list.length}</strong> захиалга</span>
        ${summary.totalWeight > 0 ? `<span>⚖️ Нийт жин: <strong>${summary.totalWeight.toFixed(1)} кг</strong></span>` : ""}
        ${summary.totalPrice > 0  ? `<span>💰 Нийт үнэ: <strong>${summary.totalPrice.toLocaleString("mn-MN")} ₮</strong></span>` : ""}
        ${pending.length > 0
          ? `<span class="pending-badge">🚚 ${pending.length} хүлээгдэж буй</span>`
          : `<span class="delivered-badge">✅ Бүгд хүргэгдсэн</span>`}
      </div>
    `;

    var self  = this;
    var cards = list.map(function(s) { return self.buildCard(s); }).join("");
    this.resultsEl.innerHTML = summaryHTML + cards;
  }

  buildCard(item) {
    // ── Статусын алхмууд ──
    var steps = STATUS_ORDER.map(function(label, i) {
      var done    = i <= item.statusIndex;
      var current = i === item.statusIndex;
      var meta    = STATUS[label] ?? { icon: "help", color: "#94a3b8" };
      return `
        <li class="step ${done ? "done" : ""} ${current ? "current" : ""}">
          <span class="step-icon material-symbols-outlined"
            style="color:${done ? (meta.color || "var(--color-yellow)") : "#475569"}">
            ${meta.icon}
          </span>
          <span class="step-label">${label}</span>
        </li>
      `;
    }).join("");

    // ── Статусын түүх ──
    var historyHTML = "";
    if (item.statusHistory && item.statusHistory.length > 0) {
      var rows = item.statusHistory.map(function(h) {
        return `
          <li>
            <span class="track-history-dot"></span>
            <span>${h.status}</span>
            <span class="track-history-date">${h.date}</span>
          </li>
        `;
      }).join("");
      historyHTML = `
        <details class="track-card__history">
          <summary>Статусын түүх</summary>
          <ul class="track-history-list">${rows}</ul>
        </details>
      `;
    }

    // ── LocalOrder бол бараануудыг жагсаана ──
    var itemsHTML = "";
    if (item.source === "local" && item.items && item.items.length > 0) {
      var rows2 = item.items.map(function(it) {
        return `<li>${it.track ? it.track + " — " : ""}${it.name} × ${it.qty}</li>`;
      }).join("");
      itemsHTML = `
        <details class="track-card__history">
          <summary>Барааны жагсаалт (${item.items.length})</summary>
          <ul class="track-history-list">${rows2}</ul>
        </details>
      `;
    }

    var detailsHTML = `
      <div class="track-card__details">
        ${item.weight > 0 ? `
          <div class="detail-item">
            <span class="material-symbols-outlined">scale</span>
            <span>${item.weight} кг</span>
          </div>` : ""}
        ${item.price > 0 ? `
          <div class="detail-item">
            <span class="material-symbols-outlined">payments</span>
            <span>${item.formattedPrice}</span>
          </div>` : ""}
        <div class="detail-item">
          <span class="material-symbols-outlined">phone_iphone</span>
          <span>${item.phone}</span>
        </div>
        ${item.createdAt ? `
          <div class="detail-item">
            <span class="material-symbols-outlined">calendar_today</span>
            <span>${item.createdAt}</span>
          </div>` : ""}
      </div>
    `;

    return `
      <article class="track-card">
        <div class="track-card__header">
          <span class="material-symbols-outlined"
            style="color:${item.meta.color || "var(--color-yellow)"}">
            ${item.meta.icon}
          </span>
          <div>
            <h3 class="track-card__code">${item.trackCode}</h3>
            <p class="track-card__status"
              style="color:${item.meta.color || "var(--color-yellow)"}">
              ${item.status}
            </p>
          </div>
        </div>

        <ul class="track-steps">${steps}</ul>

        ${historyHTML}
        ${itemsHTML}
        ${detailsHTML}
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