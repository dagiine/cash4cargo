export default function createOrderPage() {
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