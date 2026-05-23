// ===============================================
// Захиалга хянах page дээр нэг илгээмжийн card зурна.
// ===============================================

// Захиалгын status-уудыг хадгалж байна.
const STATUS_ORDER = [
  "Захиалга үүсгэсэн",
  "Хятадын агуулахад",
  "Замын Үүд дээр",
  "Улаанбаатарт ирсэн",
  "Олгогдсон",
];

// Map ашиглаж status бүрт тохирох icon-г хадгалж байна.
const STATUS_ICON_MAP = new Map([
  ["Захиалга үүсгэсэн", "send"],
  ["Хятадын агуулахад", "inventory_2"],
  ["Замын Үүд дээр", "local_shipping"],
  ["Улаанбаатарт ирсэн", "warehouse"],
  ["Олгогдсон", "check_circle"],
  ["Цуцлагдсан", "cancel"],
]);

// Attribute дотор хадгалсан JSON data-г буцааж object/array болгох helper function.
// Учир нь HTML attribute дотор array/object шууд хадгалах боломжгүй,
// тиймээс encodeURIComponent + JSON.stringify ашиглаад явуулсан data-г энд уншина.
function decodeData(value, fallback = []) {
  // Хэрэв value байхгүй бол default fallback буцаана.
  if (!value) return fallback;

  try {
    // decodeURIComponent → encode хийсэн text-ийг буцааж хэвийн text болгоно.
    // JSON.parse → string болсон JSON-ийг object/array болгоно.
    return JSON.parse(decodeURIComponent(value));
  } catch (error) {
    // Data унших үед алдаа гарвал console дээр харуулна.
    console.error("OrderCard data уншихад алдаа гарлаа:", error);

    // Алдаа гарсан үед fallback утгаа буцаана.
    return fallback;
  }
}

// Мөнгөн дүнг Монгол форматтай болгох helper function.
// Жишээ: 12000 → 12,000 ₮
function formatMoney(amount) {
  return Number(amount || 0).toLocaleString("mn-MN") + " ₮";
}

// HTMLElement-ээс удамшуулж өөрийн custom element үүсгэж байна.
// Энэ class нь <order-card></order-card> гэсэн component болно.
class OrderCard extends HTMLElement {
  // connectedCallback нь component HTML дээр гарч ирэх үед автоматаар ажиллана.
  connectedCallback() {
    // Attribute-уудаас захиалгын бүх мэдээллийг уншиж order object болгоно.
    const order = this.getOrderData();

    // Card дээр тавих class-уудыг array байдлаар бэлдэж байна.
    const cardClass = [
      "track-card",

      // Хэрэв захиалга олгогдсон бол delivered class нэмнэ.
      order.isDelivered ? "track-card--delivered" : "",

      // Хэрэв захиалга цуцлагдсан бол canceled class нэмнэ.
      order.isCanceled ? "track-card--canceled" : "",
    ]
      // Хоосон string-үүдийг устгана.
      .filter(Boolean)

      // Class-уудыг нэг string болгон нийлүүлнэ.
      .join(" ");

    // Component-ийн дотор харагдах HTML-ийг үүсгэж байна.
    this.innerHTML = `
      <article class="${cardClass}">
        <div class="track-card__header">
          <div class="track-card__main">

            <!-- Захиалгын одоогийн status icon -->
            <span class="track-card__icon">
              <span class="material-symbols-outlined">${order.icon}</span>
            </span>

            <div class="track-card__content">

              <!-- Tracking code -->
              <h3 class="track-card__code">${order.trackCode}</h3>

              <!-- Status badge component -->
              <!-- Энэ нь status-badge гэсэн өөр web component ашиглаж байна -->
              <status-badge
                variant="header"
                icon="${order.icon}"
                status="${order.status}"
                date="${order.statusDate}"
              ></status-badge>

              <!-- Утас, жин, үнэ гэсэн жижиг мэдээллүүд -->
              <div class="track-card__mini-details">
                ${this.buildPhone(order.phone)}
                ${this.buildWeight(order.weight)}
                ${this.buildPrice(order.price)}
              </div>
            </div>
          </div>

          <!-- Цуцлах боломжтой бол cancel button гарна -->
          ${this.buildCancelButton(order)}
        </div>

        <!-- Захиалгын бараанууд -->
        ${this.buildItems(order.items)}

        <!-- Хэрэв цуцлагдсан бол цуцлагдсан note харуулна -->
        <!-- Цуцлагдаагүй бол status timeline харуулна -->
        ${order.isCanceled ? this.buildCanceledNote() : this.buildSteps(order)}
      </article>
    `;
  }

  // Component дээр ирсэн attribute-уудаас order object үүсгэнэ.
  getOrderData() {
    // status attribute байхгүй бол default status өгнө.
    const status = this.getAttribute("status") || "Захиалга үүсгэсэн";

    // weight attribute-ийг number болгож авна.
    const weight = Number(this.getAttribute("weight") || 0);

    // price attribute-ийг number болгож авна.
    const price = Number(this.getAttribute("price") || 0);

    return {
      // Захиалгын database id.
      id: this.getAttribute("order-id") || "",

      // Tracking code.
      trackCode: this.getAttribute("track-code") || "-",

      // Одоогийн status.
      status,

      // Status шинэчлэгдсэн огноо.
      statusDate: this.getAttribute("status-date") || "-",

      // Хэрэглэгчийн утас.
      phone: this.getAttribute("phone") || "-",

      // Нийт жин.
      weight,

      // Тээврийн үнэ.
      price,

      // Одоогийн status-д тохирох icon.
      // Хэрэв Map дээр байхгүй status ирвэл help icon харуулна.
      icon: STATUS_ICON_MAP.get(status) || "help",

      // can-cancel attribute "true" байвал цуцлах button гарна.
      canCancel: this.getAttribute("can-cancel") === "true",

      // Захиалга олгогдсон эсэх.
      isDelivered: status === "Олгогдсон",

      // Захиалга цуцлагдсан эсэх.
      isCanceled: status === "Цуцлагдсан",

      // items attribute-аас барааны жагсаалтыг уншина.
      items: decodeData(this.getAttribute("items"), []),

      // status-dates attribute-аас status бүрийн огноог уншина.
      statusDates: decodeData(this.getAttribute("status-dates"), {}),
    };
  }

  // Утасны мэдээлэл харуулах жижиг pill үүсгэнэ.
  buildPhone(phone) {
    return `
      <span class="detail-pill">
        <span class="material-symbols-outlined">phone_iphone</span>
        <span>Утас:</span>
        <strong>${phone || "-"}</strong>
      </span>
    `;
  }

  // Жингийн мэдээлэл харуулах жижиг pill үүсгэнэ.
  buildWeight(weight) {
    const value = Number(weight || 0);

    return `
      <span class="detail-pill">
        <span class="material-symbols-outlined">scale</span>
        <span>Жин:</span>
        <strong>${value.toFixed(1)} кг</strong>
      </span>
    `;
  }

  // Үнийн мэдээлэл харуулах жижиг pill үүсгэнэ.
  buildPrice(price) {
    const value = Number(price || 0);

    return `
      <span class="detail-pill detail-pill--price">
        <span class="material-symbols-outlined">payments</span>
        <span>Үнэ:</span>
        <strong>${formatMoney(value)}</strong>
      </span>
    `;
  }

  // Захиалга цуцлах button үүсгэнэ.
  buildCancelButton(order) {
    // Хэрэв canCancel false бол button харуулахгүй.
    if (!order.canCancel) return "";

    return `
      <button
        class="cancel-order-btn"
        type="button"
        data-cancel-shipment="${order.id}"
        data-code="${order.trackCode}"
      >
        Захиалга цуцлах
      </button>
    `;
  }

  // Захиалгад байгаа бараануудын жагсаалтыг үүсгэнэ.
  buildItems(items) {
    // items array биш эсвэл хоосон бол юу ч харуулахгүй.
    if (!Array.isArray(items) || !items.length) return "";

    // map ашиглаж бараа бүрийн <li> мөрийг үүсгэнэ.
    const itemRows = items
      .map(
        (item) => `
          <li>
            <span>${item.name}</span>
            <small>
              ${item.quantity} ш${item.description ? ` · ${item.description}` : ""}
            </small>
          </li>
        `
      )
      .join("");

    return `
      <div class="track-card__items">
        <strong>Бараанууд</strong>
        <ul>${itemRows}</ul>
      </div>
    `;
  }

  // Status timeline буюу захиалгын явцын алхмуудыг үүсгэнэ.
  buildSteps(order) {
    // Одоогийн status STATUS_ORDER array дотор хэд дэх index дээр байгааг олно.
    const currentIndex = STATUS_ORDER.indexOf(order.status);

    // Хэрэв status array дотор байхгүй бол 0 index буюу эхний status гэж үзнэ.
    const safeIndex = currentIndex >= 0 ? currentIndex : 0;

    // STATUS_ORDER array дээр map хийж status бүрийн badge үүсгэнэ.
    const steps = STATUS_ORDER
      .map((label, index) => {
        // Одоогийн status хүртэлх бүх алхам done болно.
        const done = index <= safeIndex;

        // Яг одоогийн status current болно.
        const current = index === safeIndex;

        // Тухайн status-д тохирох icon авна.
        const icon = STATUS_ICON_MAP.get(label) || "help";

        // Тухайн status-ийн огноо байвал харуулна.
        // Байхгүй бол status-badge component өөрөө "..." гэж харуулна.
        const dateText = order.statusDates[label] || "";

        // done/current class-уудыг бэлдэнэ.
        const state = [done ? "done" : "", current ? "current" : ""]
          .filter(Boolean)
          .join(" ");

        // Status бүрийг status-badge component-оор харуулна.
        return `
          <status-badge
            variant="timeline"
            icon="${icon}"
            status="${label}"
            date="${dateText}"
            state="${state}"
          ></status-badge>
        `;
      })
      .join("");

    // Бүх status badge-ийг ul дотор хийж буцаана.
    return `<ul class="track-steps">${steps}</ul>`;
  }

  // Захиалга цуцлагдсан үед харуулах note үүсгэнэ.
  buildCanceledNote() {
    return `
      <div class="track-canceled-note">
        <span class="material-symbols-outlined">cancel</span>
        Энэ захиалга цуцлагдсан.
      </div>
    `;
  }
}

// "order-card" custom element өмнө нь бүртгэгдсэн эсэхийг шалгана.
// Ингэснээр нэг component-г дахин define хийх үед гарах browser error-оос сэргийлнэ.
if (!customElements.get("order-card")) {
  // <order-card></order-card> гэсэн custom HTML tag-г browser-д бүртгэнэ.
  customElements.define("order-card", OrderCard);
}