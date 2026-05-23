export default function track() {
  return `
    <h1>Захиалга хянах</h1>
    <p>Хяналтын код эсвэл утасны дугаараар захиалга хайх боломжтой.</p>

    <div class="form">

      <label>
        Хяналтын код эсвэл утасны дугаар
        <span class="material-symbols-outlined">search</span>
        <input
          id="track-code-input"
          type="text"
          placeholder="Жишээ: MN-12345 эсвэл 99112233"
        />
      </label>

      <button type="button">
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