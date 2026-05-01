export default function createOrder() {
  return `
    <h1>Захиалга үүсгэх</h1>
    <p>Хятад Улсаас Монгол Улс руу захиалсан илгээмжийн мэдээллийг оруулна уу.</p>

    <form id="order-form" class="form">
      <label>
        Утасны дугаар
        <input id="phone" type="tel" placeholder="99112233">
        <span class="material-symbols-outlined">phone</span>
      </label>
      <p id="phone-error"></p>

      <label>
        Хяналтын код
        <input id="track-code" type="text" placeholder="Хяналтын код">
        <span class="material-symbols-outlined">tag</span>
      </label>
      <p id="track-code-error"></p>

      <label>
        Барааны тайлбар
        <textarea id="desc" placeholder="Тайлбар..."></textarea>
        <span class="material-symbols-outlined">inventory_2</span>
      </label>
      <p id="desc-error"></p>

      <button type="submit">
        <span class="material-symbols-outlined">add_shopping_cart</span>
        Захиалга үүсгэх
      </button>

      <p id="form-message"></p>

      <small>
        Захиалга үүсгэсний дараа таны мэдээллийг шалгаж баталгаажуулна. Та SMS-ээр хяналтын код хүлээн авах болно.
      </small>

    </form>
  `;
}