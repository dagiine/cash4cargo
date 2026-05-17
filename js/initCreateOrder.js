// pages/create-order.js

export function renderCreateOrderPage() {
  return `
    <section class="form-wrapper">
      <h1>Захиалга үүсгэх</h1>
      <p>Олон бараатай захиалга үүсгэх боломжтой.</p>

      <form id="orderForm" class="order-form">
        <div class="field">
          <label>Утасны дугаар</label>
          <input id="phone" class="inp" placeholder="99112233" inputmode="tel">
          <small class="err-txt" id="phoneError"></small>
        </div>

        <div class="field">
          <div class="row-between">
            <label>Захиалсан бараанууд</label>
            <button type="button" id="addItemBtn" class="btn btn-outline btn-sm">
              + Нэмэх
            </button>
          </div>

          <small class="err-txt" id="itemsError"></small>

          <div class="order-items-wrapper">
            <div class="order-items-header">
              <span>Трак код</span>
              <span>Нэр</span>
              <span>Тоо</span>
              <span></span>
            </div>

            <div id="itemsList"></div>
          </div>
        </div>

        <div id="successMsg" class="msg success" style="display:none;"></div>

        <button type="submit" class="btn btn-primary btn-big">
          Захиалга үүсгэх
        </button>
      </form>
    </section>
  `;
}

export function initCreateOrderPage() {
  const form = document.getElementById("orderForm");
  const phoneInput = document.getElementById("phone");
  const addItemBtn = document.getElementById("addItemBtn");
  const itemsList = document.getElementById("itemsList");

  const phoneError = document.getElementById("phoneError");
  const itemsError = document.getElementById("itemsError");
  const successMsg = document.getElementById("successMsg");

  let items = [
    { trackCode: "", name: "", qty: 1 }
  ];

  function renderItems() {
    itemsList.innerHTML = items.map((item, index) => `
      <div class="order-item-row">
        <input 
          class="inp order-item-input"
          placeholder="Трак код"
          value="${item.trackCode}"
          data-index="${index}"
          data-field="trackCode"
        >

        <input 
          class="inp order-item-input"
          placeholder="Барааны нэр"
          value="${item.name}"
          data-index="${index}"
          data-field="name"
        >

        <input 
          class="inp order-item-input order-item-input--qty"
          type="number"
          min="1"
          value="${item.qty}"
          data-index="${index}"
          data-field="qty"
        >

        ${
          items.length > 1
            ? `<button type="button" class="order-remove-item-btn" data-remove="${index}">×</button>`
            : `<span></span>`
        }
      </div>
    `).join("");
  }

  function validate() {
    let isValid = true;

    phoneError.textContent = "";
    itemsError.textContent = "";

    if (!/^[6-9]\d{7}$/.test(phoneInput.value.trim())) {
      phoneError.textContent = "Утасны дугаар 8 оронтой байна, 6-9-өөр эхэлнэ.";
      isValid = false;
    }

    const hasEmptyName = items.some(item => item.name.trim() === "");
    const hasEmptyTrackCode = items.some(item => item.trackCode.trim() === "");

    if (hasEmptyTrackCode) {
      itemsError.textContent = "Бараа бүрийн трак кодыг бөглөнө үү.";
      isValid = false;
    } else if (hasEmptyName) {
      itemsError.textContent = "Бараа бүрийн нэрийг бөглөнө үү.";
      isValid = false;
    }

    return isValid;
  }

  addItemBtn.addEventListener("click", () => {
    items.push({ trackCode: "", name: "", qty: 1 });
    renderItems();
  });

  itemsList.addEventListener("input", (event) => {
    const index = event.target.dataset.index;
    const field = event.target.dataset.field;

    if (index !== undefined && field) {
      items[index][field] = event.target.value;
    }
  });

  itemsList.addEventListener("click", (event) => {
    const removeIndex = event.target.dataset.remove;

    if (removeIndex !== undefined) {
      items.splice(removeIndex, 1);
      renderItems();
    }
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!validate()) return;

    const newOrder = {
      id: Date.now(),
      phone: phoneInput.value.trim(),
      status: "Захиалга үүсгэсэн",
      createdAt: new Date().toISOString(),
      items: items.map(item => ({
        trackCode: item.trackCode.trim(),
        name: item.name.trim(),
        qty: Number(item.qty)
      }))
    };

    console.log("Шинэ захиалга:", newOrder);

    successMsg.style.display = "block";
    successMsg.textContent = "Захиалга амжилттай үүслээ!";

    phoneInput.value = "";
    items = [{ trackCode: "", name: "", qty: 1 }];
    renderItems();
  });

  renderItems();
}