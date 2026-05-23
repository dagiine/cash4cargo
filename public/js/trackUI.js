// ===============================================
// TRACK PAGE JS
// Энэ файл Захиалга хянах page дээр ажиллана.
// Үүрэг: track code/phone-оор хайх, login хийсэн user-ийн захиалгыг шууд харуулах, захиалга цуцлах.
// ===============================================

import { getSession, shipmentAPI } from "./api.js";

// Энэ 2 төлөв дээр user өөрөө захиалгаа цуцалж болно.
const CANCEL_ALLOWED_STATUSES = [
  "Захиалга үүсгэсэн",
  "Хятадын агуулахад",
  "Хятад дахь агуулахад",
  "Хятад агуулахад",
];

// Timeline дээр status-ууд ямар дарааллаар харагдахыг заана.
const STATUS_ORDER = [
  "Захиалга үүсгэсэн",
  "Хятадын агуулахад",
  "Замын Үүд дээр",
  "Улаанбаатарт ирсэн",
  "Олгогдсон",
];

// Status бүрийн icon болон өнгө.
const STATUS = {
  "Захиалга үүсгэсэн": { icon: "send", color: "var(--color-brown)" },
  "Хятадын агуулахад": { icon: "inventory_2", color: "var(--color-brown)" },
  "Замын Үүд дээр": { icon: "local_shipping", color: "var(--color-brown)" },
  "Улаанбаатарт ирсэн": { icon: "warehouse", color: "var(--color-brown)" },
  "Олгогдсон": { icon: "check_circle", color: "var(--color-brown)" },
  "Цуцлагдсан": { icon: "cancel", color: "var(--color-brown)" },
};

// Үнэ formatлах helper.
function money(amount) {
  return Number(amount || 0).toLocaleString("mn-MN") + " ₮";
}

// Date-г уншигдах format болгоно.
function formatDate(value) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleDateString("mn-MN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

// Backend заримдаа array, заримдаа object буцааж болно.
// Энэ function ямар ч хэлбэрийг array болгож нэг хэвэнд оруулна.
function normalizeList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.shipments)) return data.shipments;
  if (Array.isArray(data?.data)) return data.data;
  if (data) return [data];
  return [];
}

// HTML attribute дотор text аюулгүй бичих helper.
function escapeAttr(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

// Array/object data-г attribute дотор хийхийн тулд encode хийнэ.
function encodeData(value) {
  return encodeURIComponent(JSON.stringify(value || []));
}

// ===============================================
// SHIPMENT CLASS
// Backend-ээс ирсэн shipment data-г frontend-д ашиглахад амар object болгож хувиргана.
// Энэ class шинэ nested JSON болон хуучин flat backend data хоёуланг нь уншина.
// ===============================================
class Shipment {
  constructor(data = {}) {
    const customer = data.customer || {};
    const packageInfo = data.package || {};
    const shipping = data.shipping || {};
    const payment = data.payment || {};
    const timestamps = data.timestamps || {};

    // Энэ class нь 2 төрлийн data-г зэрэг уншина:
    // 1) Чиний шинэ nested JSON: customer/package/shipping/payment/timestamps
    // 2) Backend MongoDB-ийн flat data: user_phone/tracking_code/items/status гэх мэт
    this.raw = data;
    this.id = data._id || data.id || "";
    this.trackCode = data.tracking_code || data.trackCode || "";

    this.customerName = customer.name || data.receiver_name || data.sender_name || "Захиалагч";
    this.phone = customer.phone || data.user_phone || data.receiver_phone || data.phone || "";
    this.email = customer.email || data.email || "";

    this.status = shipping.status || data.status || "Захиалга үүсгэсэн";
    this.statusHistory = shipping.statusHistory || data.status_history || [];

    // Шинэ захиалга дээр admin жин оруулаагүй байдаг.
    // Тиймээс хуучин DB дээр санамсаргүй weight/price байвал user талд 0 гэж харуулна.
    const isNewOrder = this.status === "Захиалга үүсгэсэн";

    this.weight = isNewOrder ? 0 : Number(packageInfo.weight ?? data.total_weight ?? data.weight ?? 0);
    this.length = Number(packageInfo.length ?? data.length ?? 0);
    this.width = Number(packageInfo.width ?? data.width ?? 0);
    this.height = Number(packageInfo.height ?? data.height ?? 0);
    this.description = packageInfo.description || data.description || "";
    this.category = packageInfo.category || data.category || "";

    this.from = shipping.from || data.origin_country || "Хятад агуулах";
    this.to = shipping.to || data.destination_country || "Улаанбаатар";
    this.method = shipping.method || data.method || "Стандарт";

    this.price = isNewOrder ? 0 : Number(payment.price ?? data.shipping_price ?? data.price ?? 0);
    this.paid = Boolean(payment.paid ?? data.payment_status === "Төлөгдсөн");
    this.paymentMethod = payment.paymentMethod || data.payment_method || "";
    this.paidDate = payment.paidDate || data.paid_date || "";

    this.createdAt = timestamps.createdAt || data.createdAt || "";
    this.updatedAt = timestamps.updatedAt || data.updatedAt || "";

    this.items = this.normalizeItems(data.items, packageInfo);
  }

  // Shipment доторх items array-г нэг ижил format болгож хувиргана.
  normalizeItems(items, packageInfo) {
    if (Array.isArray(items) && items.length) {
      return items.map((item) => ({
        name: item.item_name || item.name || item.description || "Бараа",
        quantity: Number(item.quantity || item.qty || 1),
        description: item.description || "",
      }));
    }

    if (packageInfo.description || packageInfo.category) {
      return [
        {
          name: packageInfo.description || "Бараа",
          quantity: 1,
          description: packageInfo.category || "",
        },
      ];
    }

    return [];
  }

  // Одоогийн status timeline-ийн хэд дэх алхам вэ гэдгийг олно.
  get statusIndex() {
    const index = STATUS_ORDER.indexOf(this.status);
    return index >= 0 ? index : 0;
  }

  // Status-ийн icon болон өнгийг буцаана.
  get meta() {
    return STATUS[this.status] ?? { icon: "help", color: "var(--color-brown)" };
  }

  get formattedPrice() {
    return money(this.price);
  }

  // Admin жин оруулаагүй үед жин/үнэ user талд харагдахгүй.
  get hasWeight() {
    return Number(this.weight) > 0;
  }

  get hasPrice() {
    return Number(this.price) > 0;
  }

  // Тухайн status хэдэнд шинэчлэгдсэнийг олно.
  // Жишээ нь: "Хятадын агуулахад" гэдэг status-ийн огноог history дотроос хайна.
  getStatusDate(statusName) {
    const history = Array.isArray(this.statusHistory) ? this.statusHistory : [];

    // Array ашиглаж history дотроос status-ийн хамгийн сүүлийн огноог олно.
    const found = [...history].reverse().find((item) => item.status === statusName);

    if (found?.updatedAt || found?.date) {
      return formatDate(found.updatedAt || found.date);
    }

    // Эхний төлөв бол захиалга үүссэн огноог fallback болгож харуулна.
    if (statusName === "Захиалга үүсгэсэн") {
      return formatDate(this.createdAt);
    }

    // Одоогийн төлөв history-д байхгүй бол updatedAt-г fallback болгоно.
    if (statusName === this.status) {
      return formatDate(this.updatedAt || this.createdAt);
    }

    return "";
  }

  // Одоогийн төлөв хамгийн сүүлд хэзээ шинэчлэгдсэнийг олно.
  get statusUpdatedText() {
    return this.getStatusDate(this.status);
  }

  get dimensionText() {
    if (!this.length || !this.width || !this.height) return "-";
    return `${this.length} × ${this.width} × ${this.height} см`;
  }

  get paymentText() {
    if (this.paid) {
      return this.paymentMethod
        ? `Төлөгдсөн · ${this.paymentMethod}`
        : "Төлөгдсөн";
    }

    return "Төлөгдөөгүй";
  }

  get isDelivered() {
    return this.status === "Олгогдсон";
  }

  get isCanceled() {
    return this.status === "Цуцлагдсан";
  }

  // Цуцлах боломжтой эсэхийг шалгана.
  get canCancel() {
    return this.id && CANCEL_ALLOWED_STATUSES.includes(this.status);
  }
}

// ===============================================
// CARGO TRACKER CLASS
// Backend API дуудаж shipment хайдаг logic энд байна.
// ===============================================
class CargoTracker {
  // Track code-оор хайх.
  async findByCode(code) {
    const data = await shipmentAPI.trackByCode(code);
    return normalizeList(data).map((item) => new Shipment(item));
  }

  // Утасны дугаараар хайх.
  async findByPhone(phone) {
    const data = await shipmentAPI.trackByPhone(phone);
    return normalizeList(data).map((item) => new Shipment(item));
  }

  // Login хийсэн user-ийн өөрийн захиалгуудыг авах.
  async findMyShipments() {
    const data = await shipmentAPI.myShipments();
    return normalizeList(data).map((item) => new Shipment(item));
  }

  summarise(list) {
    return list.reduce(
      (acc, shipment) => ({
        totalWeight: acc.totalWeight + shipment.weight,
        totalPrice: acc.totalPrice + shipment.price,
        count: acc.count + 1,
      }),
      { totalWeight: 0, totalPrice: 0, count: 0 }
    );
  }

  pendingOnly(list) {
    return list.filter((shipment) => !shipment.isDelivered && !shipment.isCanceled);
  }
}

// ===============================================
// TRACK UI CLASS
// DOM буюу дэлгэц дээр харагдах хэсгийг удирдана.
// ===============================================
export class TrackUI {
  constructor() {
    this.tracker = new CargoTracker();
  }

  // Track page ачаалагдахад хамгийн түрүүнд ажиллана.
  async init() {
    this.resultsEl = document.getElementById("track-results");
    this.searchForm = document.querySelector(".form");
    this.searchBtn = document.querySelector(".form button");
    this.codeInput = document.getElementById("track-code-input");
    this.session = getSession();

    if (!this.resultsEl) {
      console.error("TrackUI: #track-results missing");
      return;
    }

    this.bindCancelEvent();

    // Нэвтэрсэн хэрэглэгч захиалга хянах дээр form бөглөхгүй.
    // Утасны дугаараар нь бүх захиалга шууд гарна.
    if (this.session?.user?.phone) {
      this.prepareLoggedInView();
      await this.loadMyShipments();
      return;
    }

    if (!this.searchBtn || !this.codeInput) {
      console.error("TrackUI: search DOM elements missing");
      return;
    }

    this.bindEvents();
    this.applyHash();
  }

  // Login хийсэн user үед search form-ийг нууж, шууд захиалгыг харуулна.
  prepareLoggedInView() {
    if (this.searchForm) this.searchForm.style.display = "none";

    const title = document.querySelector("main > h1");
    const desc = document.querySelector("main > p");

    if (title) title.textContent = "Миний захиалгууд";
    if (desc) desc.textContent = "Таны дугаараар бүртгэгдсэн бүх захиалга автоматаар харагдаж байна.";
  }

  // Guest user-ийн search товч болон Enter key-г холбож өгнө.
  bindEvents() {
    this.searchBtn.addEventListener("click", () => this.onSearch());

    this.codeInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        this.onSearch();
      }
    });
  }

  // Захиалга цуцлах button дээр дарахад ажиллах event.
  bindCancelEvent() {
    this.resultsEl.addEventListener("click", async (event) => {
      const cancelBtn = event.target.closest("[data-cancel-shipment]");
      if (!cancelBtn) return;

      const id = cancelBtn.dataset.cancelShipment;
      const code = cancelBtn.dataset.code || "";

      // Цуцлах үйлдэл хийхийн тулд хэрэглэгч нэвтэрсэн байх хэрэгтэй.
      // Guest user-д button харагдаж болно, гэхдээ backend рүү явуулахгүй.
      if (!this.session?.user?.phone) {
        alert("Захиалга цуцлахын тулд эхлээд нэвтэрнэ үү.");
        return;
      }

      if (!confirm(`${code} захиалгыг цуцлах уу?`)) return;

      try {
        cancelBtn.disabled = true;
        cancelBtn.textContent = "Цуцалж байна...";
        await shipmentAPI.cancel(id);
        await this.loadMyShipments();
      } catch (err) {
        alert(err.message || "Захиалга цуцлахад алдаа гарлаа");
        cancelBtn.disabled = false;
        cancelBtn.textContent = "Захиалга цуцлах";
      }
    });
  }

  // Home page-ээс #/track?query=... гэж ирвэл автоматаар хайна.
  applyHash() {
    const hash = window.location.hash;
    const queryString = hash.includes("?") ? hash.split("?")[1] : "";
    const params = new URLSearchParams(queryString);
    const query = params.get("query");

    if (!query) return;

    this.codeInput.value = query;
    this.onSearch();
  }

  // Login хийсэн user-ийн захиалгыг backend-ээс татаж харуулна.
  async loadMyShipments() {
    try {
      this.showLoading("Таны захиалгуудыг ачааллаж байна...");
      const results = await this.tracker.findMyShipments();

      if (!results.length) {
        this.showEmpty("Миний захиалга");
        return;
      }

      this.renderResults(results, true);
    } catch (err) {
      this.showError(err.message || "Миний захиалгуудыг ачаалахад алдаа гарлаа.");
    }
  }

  // Guest user track code эсвэл phone оруулаад хайхад ажиллана.
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

      let results = [];

      if (/^MN-\d{5}$/.test(value)) {
        results = await this.tracker.findByCode(value);
      } else if (/^[6-9]\d{7}$/.test(value)) {
        results = await this.tracker.findByPhone(value);
      } else {
        this.showError("Утасны дугаар эсвэл хяналтын код буруу байна.");
        return;
      }

      if (!results.length) {
        this.showEmpty(value);
        return;
      }

      this.renderResults(results, false);
    } catch (err) {
      this.showError(err.message || "Ачаа хайхад алдаа гарлаа.");
    }
  }

  // Олдсон shipment-үүдийг card хэлбэрээр дэлгэц дээр зурна.
  renderResults(list, showCancelButtons = false) {
    const summary = this.tracker.summarise(list);
    const pending = this.tracker.pendingOnly(list);

    const summaryHTML = `
      <div class="track-summary">
        <span>Нийт: <strong>${summary.count}</strong> ачаа</span>
        <span>Нийт жин: <strong>${summary.totalWeight.toFixed(1)} кг</strong></span>
        <span>Нийт үнэ: <strong>${money(summary.totalPrice)}</strong></span>
        ${
          pending.length > 0
            ? `<span class="pending-badge">${pending.length} хүлээгдэж буй ачаа</span>`
            : `<span class="delivered-badge">Идэвхтэй хүлээлтгүй</span>`
        }
      </div>
    `;

    const cards = list.map((shipment) => this.buildCard(shipment, showCancelButtons)).join("");
    this.resultsEl.innerHTML = summaryHTML + cards;
  }

  // Нэг shipment-ийн card HTML үүсгэнэ.
  // Одоо card-ийг <order-card> web component зурна.
  buildCard(shipment, showCancelButton = false) {
    // reduce ашиглаж status бүрийн огноог object болгож бэлдэнэ.
    const statusDates = STATUS_ORDER.reduce((dates, statusName) => {
      dates[statusName] = shipment.getStatusDate(statusName);
      return dates;
    }, {});

    // Component-д attribute байдлаар өгөгдлөө дамжуулна.
    return `
      <order-card
        order-id="${escapeAttr(shipment.id)}"
        track-code="${escapeAttr(shipment.trackCode)}"
        status="${escapeAttr(shipment.status)}"
        status-date="${escapeAttr(shipment.statusUpdatedText)}"
        phone="${escapeAttr(shipment.phone || "-")}"
        weight="${shipment.weight}"
        price="${shipment.price}"
        can-cancel="${shipment.canCancel ? "true" : "false"}"
        items="${encodeData(shipment.items)}"
        status-dates="${encodeData(statusDates)}"
      ></order-card>
    `;
  }

  // Timeline алхмуудыг үүсгэнэ.
  // Status бүрийн доор тухайн төлөв шинэчлэгдсэн огноог харуулна.
  buildSteps(shipment) {
    return STATUS_ORDER.map((label, index) => {
      const done = !shipment.isCanceled && index <= shipment.statusIndex;
      const current = !shipment.isCanceled && index === shipment.statusIndex;
      const meta = STATUS[label] ?? { icon: "help", color: "var(--color-brown)" };
      const dateText = shipment.getStatusDate(label);

      return `
        <li class="step ${done ? "done" : ""} ${current ? "current" : ""}">
          <span class="step-icon material-symbols-outlined">${meta.icon}</span>
          <span>
            <span class="step-label">${label}</span>
            <small class="step-date">${dateText}</small>
          </span>
        </li>
      `;
    }).join("");
  }

  // Shipment дотор байгаа бараануудыг жагсаалтаар харуулна.
  buildItems(shipment) {
    if (!shipment.items.length) return "";

    return `
      <div class="track-card__items">
        <strong>Бараанууд</strong>
        <ul>
          ${shipment.items.map((item) => `
            <li>
              <span>${item.name}</span>
              <small>${item.quantity} ш${item.description ? ` · ${item.description}` : ""}</small>
            </li>
          `).join("")}
        </ul>
      </div>
    `;
  }

  // Status history хэсгийг үүсгэнэ.
  buildHistory(shipment) {
    if (!shipment.statusHistory.length) return "";

    return `
      <div class="track-history">
        <strong>Төлөвийн түүх</strong>
        ${shipment.statusHistory.map((item) => `
          <p>
            <span>${item.status}</span>
            <small>${formatDate(item.date || item.updatedAt)}</small>
          </p>
        `).join("")}
      </div>
    `;
  }

  // Цуцлах боломжтой төлөв дээр button харуулна.
  // Backend цуцлахдаа user нэвтэрсэн эсэхийг бас шалгана.
  buildCancelButton(shipment) {
    if (!shipment.canCancel) return "";

    return `
      <button class="cancel-order-btn" type="button" data-cancel-shipment="${shipment.id}" data-code="${shipment.trackCode}">
        Захиалга цуцлах
      </button>
    `;
  }

  // Loading message харуулна.
  showLoading(text = "Хайж байна...") {
    this.resultsEl.innerHTML = `
      <div class="track-empty">
        <span class="material-symbols-outlined">hourglass_empty</span>
        <p>${text}</p>
      </div>
    `;
  }

  // Илгээмж олдоогүй үед харуулах message.
  showEmpty(query) {
    this.resultsEl.innerHTML = `
      <div class="track-empty">
        <span class="material-symbols-outlined">search_off</span>
        <p><strong>"${query}"</strong> захиалга олдсонгүй.</p>
        <p class="track-empty__hint">Tracking код эсвэл утасны дугаараа шалгана уу.</p>
      </div>
    `;
  }

  // Алдаа гарсан үед харуулах message.
  showError(message) {
    this.resultsEl.innerHTML = `
      <div class="track-empty track-empty--error">
        <span class="material-symbols-outlined">error</span>
        <p>${message}</p>
      </div>
    `;
  }
}
