export default function track() {
  return `
    <h1>Захиалга хянах</h1>
    <p>Хяналтын код эсвэл утасны дугаараар захиалга хайх боломжтой.</p>

    <input type="radio" name="track" id="tab-code" checked>
    <input type="radio" name="track" id="tab-phone">

    <div class="tabs">
      <label for="tab-code">
        <span class="material-symbols-outlined">qr_code_scanner</span>
        Хяналтын код
      </label>

      <label for="tab-phone">
        <span class="material-symbols-outlined">phone_iphone</span>
        Утасны дугаар
      </label>
    </div>

    <div class="form">
      <label data-tab="code">
        Хяналтын код (жишээ: MN-12345)
        <span class="material-symbols-outlined">qr_code_scanner</span>
        <input id="track-code-input" type="text" placeholder="Жишээ: MN-12345">
      </label>

      <label data-tab="phone">
        Утасны дугаар
        <span class="material-symbols-outlined">phone_iphone</span>
        <input id="track-phone-input" type="tel" placeholder="Жишээ: 99112233">
      </label>

      <button type="submit">
        <span class="material-symbols-outlined">search</span>
        Хайх
      </button>
    </div>

    <div id="track-results"></div>

    <div class="info">
      <article>
        <span class="material-symbols-outlined">support_agent</span>
        <div>
          <h3>24/7 туслах</h3>
          <p>+976 7000 0000</p>
        </div>
      </article>

      <article>
        <span class="material-symbols-outlined">verified_user</span>
        <div>
          <h3>Найдвартай</h3>
          <p>Баталгаат тээвэр</p>
        </div>
      </article>

      <article>
        <span class="material-symbols-outlined">schedule</span>
        <div>
          <h3>Хурдан</h3>
          <p>3–7 ажлын өдөр</p>
        </div>
      </article>
    </div>
  `;
} 