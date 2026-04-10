import { METHODS, PROHIBITED, VOLUMETRIC_DIVISOR, DEFAULT_RATE_PER_KG } from "./data.js";

// ──────────────────────────────────────────────
//  ShippingMethod – нэг тээврийн аргын загвар
// ──────────────────────────────────────────────
export class ShippingMethod {
  constructor({ name, time, price }) {
    this.name  = name;
    this.time  = time;
    this.price = price;   // $/кг
  }

  get formattedPrice() {
    return `$${this.price.toFixed(2)}`;
  }
}

// ──────────────────────────────────────────────
//  PricingCalculator – үнэ тооцоох логик
// ──────────────────────────────────────────────
export class PricingCalculator {
  constructor(ratePerKg = DEFAULT_RATE_PER_KG) {
    this.ratePerKg = ratePerKg;
  }

  // Эзэлхүүний жин
  volumetricWeight(l, w, h) {
    return (l * w * h) / VOLUMETRIC_DIVISOR;
  }

  // Тооцох жин (бодит ба эзэлхүүний их нь)
  chargeableWeight(actualKg, l, w, h) {
    const vol = this.volumetricWeight(l, w, h);
    return Math.max(actualKg, vol);
  }

  // Нийт үнэ
  totalCost(chargeable) {
    return chargeable * this.ratePerKg;
  }
}

// ──────────────────────────────────────────────
//  PricingUI – DOM-тай ажиллах класс
// ──────────────────────────────────────────────
export class PricingUI {
  #calculator;
  #methods;

  constructor() {
    this.#calculator = new PricingCalculator();
    // map → raw объект бүрийг ShippingMethod instance болгох
    this.#methods = METHODS.map((m) => new ShippingMethod(m));

    this.methodsBodyEl  = document.getElementById("methods-body");
    this.methodsSummary = document.getElementById("methods-summary");
    this.prohibitedGrid = document.getElementById("prohibited-grid");
    this.calcForm       = document.getElementById("calc-form");
    this.calcResultEl   = document.getElementById("calc-result");
  }

  init() {
    this.#renderMethods();
    this.#renderProhibited();
    this.#bindCalcForm();
  }

  // ── Тээврийн аргуудыг DOM-д гаргах ──────────
  #renderMethods() {
    // map → мөр бүрийн HTML
    const rows = this.#methods
      .map((m) => this.#buildMethodRow(m))
      .join("");

    this.methodsBodyEl.innerHTML = rows;

    // reduce → хамгийн хямд үнийг олох
    const cheapest = this.#methods.reduce(
      (min, m) => (m.price < min.price ? m : min),
      this.#methods[0]
    );

    // join → аргуудын нэрсийг нэгтгэх
    const names = this.#methods.map((m) => m.name).join(" · ");
    this.methodsSummary.textContent =
      `${names} — хамгийн хямд: ${cheapest.name} (${cheapest.formattedPrice}/кг)`;
  }

  #buildMethodRow(method) {
    return `
      <div class="sh-row" role="row">
        <span class="sh-row__name">${method.name}</span>
        <span class="sh-row__time">${method.time}</span>
        <span class="sh-row__price">${method.formattedPrice}</span>
        <span class="sh-row__action">
          <button class="btn" type="button"
                  onclick="this.textContent = this.textContent === 'Selected ✓' ? 'Select' : 'Selected ✓'">
            Select
          </button>
        </span>
      </div>`;
  }

  // ── Хориотой бараануудыг DOM-д гаргах ───────
  #renderProhibited() {
    this.prohibitedGrid.innerHTML = PROHIBITED
      .map((p) => `
        <div class="prohibited-card">
          <div class="prohibited-card__header">
            <span class="prohibited-label">${p.label}</span>
          </div>
          <p class="prohibited-sub">${p.sub}</p>
        </div>`)
      .join("");
  }

  // ── Тооцоолуурын form handler ─────────────
  #bindCalcForm() {
    this.calcForm.addEventListener("submit", (e) => {
      e.preventDefault();
      this.#onCalculate();
    });
  }

  #onCalculate() {
    const w  = parseFloat(document.getElementById("sh-weight").value) || 0;
    const l  = parseFloat(document.getElementById("sh-length").value) || 0;
    const wd = parseFloat(document.getElementById("sh-width").value)  || 0;
    const h  = parseFloat(document.getElementById("sh-height").value) || 0;

    const vol        = this.#calculator.volumetricWeight(l, wd, h);
    const chargeable = this.#calculator.chargeableWeight(w, l, wd, h);
    const total      = this.#calculator.totalCost(chargeable);

    if (chargeable === 0) {
      this.calcResultEl.innerHTML = "";
      return;
    }

    // filter → тооцоолсон жингийн харьцуулалт
    const chosen = this.#methods.filter((m) => m.price <= total / chargeable + 1);

    this.calcResultEl.innerHTML = `
      <div class="calc-result-inner">
        <h3>Estimated Cost</h3>
        <div class="calc-rows">
          <div class="calc-row">
            <span>Actual weight</span>
            <span>${w.toFixed(1)} kg</span>
          </div>
          <div class="calc-row">
            <span>Volumetric weight</span>
            <span>${vol.toFixed(2)} kg</span>
          </div>
          <div class="calc-row">
            <span>Chargeable weight</span>
            <span>${chargeable.toFixed(2)} kg</span>
          </div>
          <div class="calc-row">
            <span>Rate (Standard)</span>
            <span>$${this.#calculator.ratePerKg.toFixed(2)} / kg</span>
          </div>
          <div class="calc-row total">
            <span>Total estimate</span>
            <span>$${total.toFixed(2)}</span>
          </div>
          ${chosen.length > 0 ? `
          <div class="calc-row" style="margin-top:8px;font-size:12px;color:#94a3b8;">
            Тохиромжтой арга: ${chosen.map((m) => m.name).join(", ")}
          </div>` : ""}
        </div>
      </div>`;
  }
}
