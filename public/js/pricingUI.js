import { METHODS, PROHIBITED, VOLUMETRIC_DIVISOR, DEFAULT_RATE_PER_KG } from "../data/shippingData.js";

class ShippingMethod {
  constructor({ name, time, price }) {
    this.name = name;
    this.time = time;
    this.price = price;
  }

  get formattedPrice() {
    return `$${this.price.toFixed(2)}`;
  }
}

class PricingCalculator {
  constructor(ratePerKg = DEFAULT_RATE_PER_KG) {
    this.ratePerKg = ratePerKg;
  }

  volumetricWeight(length, width, height) {
    return (length * width * height) / VOLUMETRIC_DIVISOR;
  }

  chargeableWeight(actualKg, length, width, height) {
    const volumetric = this.volumetricWeight(length, width, height);
    return Math.max(actualKg, volumetric);
  }

  totalCost(chargeableWeight) {
    return chargeableWeight * this.ratePerKg;
  }
}

export class PricingUI {
  constructor() {
    this.calculator = new PricingCalculator();
    this.methods = METHODS.map((method) => new ShippingMethod(method));
  }

  init() {
    this.methodsBodyEl = document.getElementById("methods-body");
    this.methodsSummaryEl = document.getElementById("methods-summary");
    this.prohibitedGridEl = document.getElementById("prohibited-grid");
    this.calcFormEl = document.getElementById("calc-form");
    this.calcResultEl = document.getElementById("calc-result");

    if (!this.methodsBodyEl || !this.prohibitedGridEl || !this.calcFormEl || !this.calcResultEl) {
      console.error("PricingUI: required DOM elements not found");
      return;
    }

    this.renderMethods();
    this.renderProhibited();
    this.bindForm();
  }

  renderMethods() {
    this.methodsBodyEl.innerHTML = this.methods
      .map((method) => {
        return `
          <div class="sh-row" role="row">
            <span class="sh-row__name">${method.name}</span>
            <span class="sh-row__time">${method.time}</span>
            <span class="sh-row__price">${method.formattedPrice}</span>
            <span class="sh-row__action">
              <button class="btn" type="button">Select</button>
            </span>
          </div>
        `;
      })
      .join("");

    if (this.methodsSummaryEl) {
      const cheapest = this.methods.reduce((min, method) =>
        method.price < min.price ? method : min
      , this.methods[0]);

      const names = this.methods.map((method) => method.name).join(" · ");

      this.methodsSummaryEl.textContent =
        `${names} — хамгийн хямд: ${cheapest.name} (${cheapest.formattedPrice}/кг)`;
    }
  }

  renderProhibited() {
    this.prohibitedGridEl.innerHTML = PROHIBITED
      .map((item) => {
        return `
          <div class="prohibited-card">
            <div class="prohibited-card__header">
              <span class="prohibited-label">${item.label}</span>
            </div>
            <p class="prohibited-sub">${item.sub}</p>
          </div>
        `;
      })
      .join("");
  }

  bindForm() {
    this.calcFormEl.addEventListener("submit", (event) => {
      event.preventDefault();
      this.calculate();
    });
  }

  calculate() {
    const weight = parseFloat(document.getElementById("sh-weight")?.value) || 0;
    const length = parseFloat(document.getElementById("sh-length")?.value) || 0;
    const width = parseFloat(document.getElementById("sh-width")?.value) || 0;
    const height = parseFloat(document.getElementById("sh-height")?.value) || 0;

    const volumetric = this.calculator.volumetricWeight(length, width, height);
    const chargeable = this.calculator.chargeableWeight(weight, length, width, height);
    const total = this.calculator.totalCost(chargeable);

    if (chargeable === 0) {
      this.calcResultEl.innerHTML = "";
      return;
    }

    const availableMethods = this.methods
      .map((method) => {
        const methodTotal = chargeable * method.price;
        return `
          <div class="calc-row">
            <span>${method.name}</span>
            <span>$${methodTotal.toFixed(2)}</span>
          </div>
        `;
      })
      .join("");

    this.calcResultEl.innerHTML = `
      <div class="calc-result-inner">
        <h3>Тооцоолсон үнэ</h3>

        <div class="calc-rows">
          <div class="calc-row">
            <span>Бодит жин</span>
            <span>${weight.toFixed(1)} кг</span>
          </div>

          <div class="calc-row">
            <span>Эзэлхүүнээс тооцоолсон жин</span>
            <span>${volumetric.toFixed(2)} кг</span>
          </div>

          <div class="calc-row">
            <span>Төлбөр тооцох жин</span>
            <span>${chargeable.toFixed(2)} кг</span>
          </div>

          <div class="calc-row">
            <span>Суурь үнэ</span>
            <span>$${this.calculator.ratePerKg.toFixed(2)} / кг</span>
          </div>

          <div class="calc-row total">
            <span>Тооцоолсон үнэ</span>
            <span>$${total.toFixed(2)}</span>
          </div>
        </div>

        <div class="calc-methods-list" style="margin-top:16px;">
          <h4 style="margin-bottom:10px;">Тээвэрлэлтийн төрөл</h4>
          <div class="calc-rows">
            ${availableMethods}
          </div>
        </div>
      </div>
    `;
  }
}