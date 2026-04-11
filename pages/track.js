export default function track() {
  return `
    <h1>Захиалга хянах</h1>
    <p>Хяналтын код эсвэл утасны дугаараар захиалга хайх боломжтой.</p>

    <div class="form-wrapper">
      <input type="radio" name="track" id="tab-code" checked />
      <input type="radio" name="track" id="tab-phone" />

      <div class="tab-strip">
        <label for="tab-code">
          <span class="material-symbols-outlined">qr_code_scanner</span>
          Хяналтын код
        </label>
        <label for="tab-phone">
          <span class="material-symbols-outlined">phone_iphone</span>
          Утасны дугаар
        </label>
      </div>

      <div class="form-box">
        <div class="tab-panel tab-panel--code">
          <label>
            Хяналтын код (жишээ: MN-12345)
            <span class="material-symbols-outlined">qr_code_scanner</span>
            <input id="track-code-input" type="text" placeholder="Жишээ: MN-12345"/>
          </label>
        </div>

        <div class="tab-panel tab-panel--phone">
          <label>
            Утасны дугаар
            <span class="material-symbols-outlined">phone_iphone</span>
            <input id="track-phone-input" type="tel" placeholder="99112233"/>
          </label>
        </div>

        <button type="submit">
          <span class="material-symbols-outlined">search</span>
          Хайх
        </button>
      </div>
    </div>

    <div id="track-results"></div>

    <div class="info-strip">
      <article>
        <span class="material-symbols-outlined">support_agent</span>
        <div class="text">
          <h3>24/7 туслах</h3>
          <p>+976 7000 0000</p>
        </div>
      </article>

      <article>
        <span class="material-symbols-outlined">verified_user</span>
        <div class="text">
          <h3>Найдвартай</h3>
          <p>Баталгаат тээвэр</p>
        </div>
      </article>
      
      <article>
        <span class="material-symbols-outlined">schedule</span>
        <div class="text">
          <h3>Хурдан</h3>
          <p>3–7 ажлын өдөр</p>
        </div>
      </article>
    </div>
  `;
}