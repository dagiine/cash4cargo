// ===============================================
// ORDER CARD WEB COMPONENT
// Нэг захиалгыг <order-card> гэж тусдаа component болгож харуулна.
//
// Энэ файлыг хэт олон жижиг файлд салгахгүйгээр нэг дор байлгав.
// Ингэснээр эхлэн суралцагч уншихад амар байна.
// CSS нь тусдаа public/components/order-card.css файлд байна.
// ===============================================

import { STATUS_MAP, STATUS_ORDER } from "../js/track/trackConstants.js";

// Status бүрийн нэр + icon-ийг нэг array болгож бэлдэнэ.
// map ашиглаж байгаа нь STATUS_ORDER array-г HTML зурахад тохиромжтой object болгож хувиргаж байна.
const ORDER_STEPS = STATUS_ORDER.map((statusName) => {
  const meta = STATUS_MAP.get(statusName) || { icon: "radio_button_unchecked" };

  return {
    label: statusName,
    icon: meta.icon,
  };
});

class OrderCard extends HTMLElement {
  constructor() {
    super();
    this.shipment = null;
  }

  // Track page-ээс shipment object ирэхэд card дахин зурагдана.
  set data(value) {
    this.shipment = value;
    this.render();
  }

  connectedCallback() {
    this.render();
  }

  render() {
    if (!this.shipment) return;

    this.innerHTML = this.buildCardHTML();
    this.addEvents();
  }

  // Бүтэн card-ийн HTML.
  buildCardHTML() {
    const deliveredClass = this.shipment.isDelivered ? "track-card--delivered" : "";
    const canceledClass = this.shipment.isCanceled ? "track-card--canceled" : "";

    return `
      <article class="track-card ${deliveredClass} ${canceledClass}">
        <div class="track-card__header">
          ${this.buildHeaderHTML()}
          ${this.buildCancelButtonHTML()}
        </div>

        ${this.buildItemsHTML()}
        ${this.shipment.isCanceled ? this.buildCanceledHTML() : this.buildStepsHTML()}
      </article>
    `;
  }

  // Tracking code, төлөв, шинэчлэгдсэн огноо, утас/жин/үнэ хэсэг.
  buildHeaderHTML() {
    const icon = this.getHeaderIcon(this.shipment.status);

    return `
      <div class="track-card__main">
        <span class="track-card__icon">
          <span class="material-symbols-outlined">${icon}</span>
        </span>

        <div class="track-card__content">
          <h3 class="track-card__code">${this.shipment.trackCode}</h3>
          <p class="track-card__status">${this.shipment.status}</p>
          <p class="track-card__date">Шинэчлэгдсэн: ${this.shipment.statusUpdatedText}</p>
          ${this.buildMiniDetailsHTML()}
        </div>
      </div>
    `;
  }

  // Status нэрээр icon авах жижиг helper.
  getHeaderIcon(statusName) {
    const meta = STATUS_MAP.get(statusName) || { icon: "inventory_2" };
    return meta.icon;
  }

  // Утас, жин, үнэний жижиг мэдээлэл.
  // Жин/үнэ 0 байвал харуулахгүй.
  buildMiniDetailsHTML() {
    const details = [
      this.buildPhoneHTML(),
      this.shipment.hasWeight ? this.buildWeightHTML() : "",
      this.shipment.hasPrice ? this.buildPriceHTML() : "",
    ];

    // filter(Boolean) хоосон string-үүдийг хасна.
    // reduce нь үлдсэн HTML-үүдийг нэг string болгож нийлүүлнэ.
    const html = details
      .filter(Boolean)
      .reduce((result, item) => result + item, "");

    return `<div class="track-card__mini-details">${html}</div>`;
  }

  buildPhoneHTML() {
    return `
      <span class="detail-pill">
        <span class="material-symbols-outlined">phone_iphone</span>
        <span>Утас:</span>
        <strong>${this.shipment.phone || "-"}</strong>
      </span>
    `;
  }

  buildWeightHTML() {
    return `
      <span class="detail-pill">
        <span class="material-symbols-outlined">scale</span>
        <span>Жин:</span>
        <strong>${this.shipment.weight.toFixed(1)} кг</strong>
      </span>
    `;
  }

  buildPriceHTML() {
    return `
      <span class="detail-pill detail-pill--price">
        <span class="material-symbols-outlined">payments</span>
        <span>Үнэ:</span>
        <strong>${this.shipment.formattedPrice}</strong>
      </span>
    `;
  }

  // Бараануудыг жагсаалтаар харуулна.
  buildItemsHTML() {
    if (!this.shipment.items.length) return "";

    const itemList = this.shipment.items.map((item) => `
      <li>
        <span>${item.name}</span>
        <small>${item.quantity} ш${item.description ? ` · ${item.description}` : ""}</small>
      </li>
    `).join("");

    return `
      <div class="track-card__items">
        <strong>Бараанууд</strong>
        <ul>${itemList}</ul>
      </div>
    `;
  }

  // Status timeline.
  // Step бүр icon + status нэр + огноотой байна.
  buildStepsHTML() {
    const stepsHTML = ORDER_STEPS.map((step, index) => {
      const done = !this.shipment.isCanceled && index <= this.shipment.statusIndex;
      const current = !this.shipment.isCanceled && index === this.shipment.statusIndex;

      return `
        <li class="step ${done ? "done" : ""} ${current ? "current" : ""}">
          <span class="step-dot">
            <span class="material-symbols-outlined">${step.icon}</span>
          </span>

          <span class="step-text">
            <span class="step-label">${step.label}</span>
            <small class="step-date">${this.shipment.getStatusDate(step.label)}</small>
          </span>
        </li>
      `;
    }).join("");

    return `<ul class="track-steps">${stepsHTML}</ul>`;
  }

  buildCancelButtonHTML() {
    if (!this.shipment.canCancel) return "";

    return `
      <button class="cancel-order-btn" type="button">
        Захиалга цуцлах
      </button>
    `;
  }

  buildCanceledHTML() {
    return `
      <div class="track-canceled-note">
        <span class="material-symbols-outlined">cancel</span>
        Захиалга цуцлагдсан.
      </div>
    `;
  }

  // Цуцлах товч дарагдахад track page рүү custom event явуулна.
  // Ингэснээр component өөрөө backend request хийхгүй, зөвхөн event дамжуулна.
  addEvents() {
    const cancelButton = this.querySelector(".cancel-order-btn");
    if (!cancelButton) return;

    cancelButton.addEventListener("click", () => {
      this.dispatchEvent(new CustomEvent("cancel-order", {
        bubbles: true,
        detail: {
          id: this.shipment.id,
          code: this.shipment.trackCode,
          button: cancelButton,
        },
      }));
    });
  }
}

// Component-ийг нэг л удаа register хийнэ.
if (!customElements.get("order-card")) {
  customElements.define("order-card", OrderCard);
}