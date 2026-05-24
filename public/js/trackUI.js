// ===============================================
// TRACK PAGE JS
// Энэ файл track page-ийн гол урсгалыг удирдана.
// Том HTML render болон cancel logic-ийг тусдаа файлд салгасан.
// ===============================================

import { getSession } from "./api.js";
import "../components/order-card.js";
import { CargoTracker } from "./track/CargoTracker.js";
import { bindCancelOrderEvent } from "./track/trackCancel.js";
import { cleanTrackInput, getSearchType } from "./track/trackHelpers.js";
import {createSummaryElement, renderShipmentCards, showEmpty, showError, showLoading } from "./track/trackRender.js";

export class TrackUI {
  constructor() {
    this.tracker = new CargoTracker();
    this.session = null;
  }

  // Track page нээгдэхэд хамгийн түрүүнд ажиллана.
  async init() {
    this.getElements();
    this.session = getSession();

    if (!this.resultsEl) return;

    bindCancelOrderEvent(
      this.resultsEl,
      () => this.session,
      () => this.loadMyShipments()
    );

    if (this.session?.user?.phone) {
      this.prepareLoggedInView();
      await this.loadMyShipments();
      return;
    }

    this.bindSearchEvent();
    this.applyHashQuery();
  }

  // HTML element-үүдийг нэг дор авч хадгална.
  getElements() {
    this.resultsEl = document.getElementById("track-results");
    this.searchForm = document.querySelector(".form");
    this.searchBtn = document.querySelector(".form button");
    this.codeInput = document.getElementById("track-code-input");
  }

  // Login хийсэн user үед хайх form хэрэггүй тул нууна.
  prepareLoggedInView() {
    if (this.searchForm) this.searchForm.style.display = "none";

    const title = document.querySelector("main > h1");
    const desc = document.querySelector("main > p");

    if (title) title.textContent = "Миний захиалгууд";
    if (desc) desc.textContent = "Таны дугаараар бүртгэгдсэн бүх захиалга автоматаар харагдаж байна.";
  }

  // Guest user-ийн хайх товч болон Enter key-г ажиллуулна.
  bindSearchEvent() {
    if (!this.searchBtn || !this.codeInput) return;

    this.searchBtn.addEventListener("click", () => this.searchGuestOrder());

    this.codeInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        this.searchGuestOrder();
      }
    });
  }

  // Home page-ээс #/track?query=... ирсэн бол автоматаар хайна.
  applyHashQuery() {
    const queryString = window.location.hash.includes("?")
      ? window.location.hash.split("?")[1]
      : "";

    const query = new URLSearchParams(queryString).get("query");
    if (!query || !this.codeInput) return;

    this.codeInput.value = query;
    this.searchGuestOrder();
  }

  // Login хийсэн user-ийн захиалгуудыг backend-ээс татна.
  async loadMyShipments() {
    try {
      showLoading(this.resultsEl, "Таны захиалгуудыг ачааллаж байна...");

      const shipments = await this.tracker.findMyShipments();
      if (!shipments.length) {
        showEmpty(this.resultsEl, "Миний захиалга");
        return;
      }

      this.renderResults(shipments);
    } catch (err) {
      showError(this.resultsEl, err.message || "Миний захиалгуудыг ачаалахад алдаа гарлаа.");
    }
  }

  // Guest user tracking code эсвэл утсаар хайна.
  async searchGuestOrder() {
    const value = cleanTrackInput(this.codeInput?.value);
    const searchType = getSearchType(value);

    if (!value) {
      showError(this.resultsEl, "Хайх утга оруулна уу.");
      return;
    }

    if (searchType === "invalid") {
      showError(this.resultsEl, "Утасны дугаар эсвэл хяналтын код буруу байна.");
      return;
    }

    try {
      showLoading(this.resultsEl);

      const shipments = searchType === "code"
        ? await this.tracker.findByCode(value)
        : await this.tracker.findByPhone(value);

      if (!shipments.length) {
        showEmpty(this.resultsEl, value);
        return;
      }

      this.renderResults(shipments);
    } catch (err) {
      showError(this.resultsEl, err.message || "Ачаа хайхад алдаа гарлаа.");
    }
  }

  // Summary + order card-уудыг зурна.
  renderResults(shipments) {
    this.resultsEl.innerHTML = "";
    this.resultsEl.appendChild(createSummaryElement(this.tracker, shipments));
    renderShipmentCards(this.resultsEl, shipments);
  }
}
