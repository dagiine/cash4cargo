export default function createOrder() {
  return `
  <section class="form-wrapper">
    <h1>Захиалга үүсгэх</h1>
    <p>Хятад Улсаас Монгол Улс руу захиалсан илгээмжийн мэдээллийг оруулна уу.</p>

    <form id="order-form">
      <label>
        Утасны дугаар
        <span class="material-symbols-outlined">phone</span>
        <input id="phone" type="tel" placeholder="99112233"
        />
      </label>
      <p id="phone-error" class="field-error"></p>

      <label>
        Хяналтын код
        <span class="material-symbols-outlined">tag</span>
        <input id="track-code" type="text" placeholder="Хятад бараа захиалгын хяналтын код"
        />
      </label>
      <p id="track-code-error" class="field-error"></p>

      <label>
        Барааны тайлбар
        <span class="material-symbols-outlined">inventory_2</span>
        <textarea
          id="desc"
          placeholder="Барааны талаар тайлбар оруулна уу..."
        ></textarea>
      </label>
      <p id="desc-error" class="field-error"></p>

      <button type="submit">
        <span class="material-symbols-outlined">add_shopping_cart</span>
        Захиалга үүсгэх
      </button>
      <p id="form-message" class="form-message"></p>

      <small>
        Захиалга үүсгэсний дараа таны мэдээллийг шалгаж баталгаажуулна.
        Та SMS-ээр хяналтын код хүлээн авах болно.
      </small>
    </form>
  </section>
  `;
}