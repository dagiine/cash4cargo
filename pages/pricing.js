export default function renderPricing() {
  return `
    <main class="sh-main">

      <div class="sh-hero">
        <h1>Тээврийн үнэ ба тооцоолуур</h1>
        <p>Хятад Улсаас Монгол Улс руу ил тод, өрсөлдөхүйц үнэ.</p>
      </div>

      <div class="sh-layout">

        <!-- LEFT -->
        <section class="sh-calc">
          <h2>Үнэ тооцоолуур</h2>

          <form id="calc-form" class="sh-calc__form">
            <div class="field">
              <label>Жин (кг)</label>
              <input id="sh-weight" type="number" min="0" step="0.1" />
            </div>

            <div class="sh-dims">
              <div class="field">
                <label>Урт (см)</label>
                <input id="sh-length" type="number" min="0" />
              </div>

              <div class="field">
                <label>Өргөн (см)</label>
                <input id="sh-width" type="number" min="0" />
              </div>

              <div class="field">
                <label>Өндөр (см)</label>
                <input id="sh-height" type="number" min="0" />
              </div>
            </div>

            <button type="submit" class="btn big">
              Тооцоолох →
            </button>
          </form>
          <div id="calc-result" class="calc-result"></div>

        </section>

        <!-- RIGHT -->
        <div class="sh-right">

          <!-- METHODS -->
          <section class="sh-methods">

            <h2>Боломжтой тээврийн төрлүүд</h2>

            <div class="sh-table">
              <div class="sh-table__head">
                <span>Төрөл</span>
                <span>Хугацаа</span>
                <span>Үнэ</span>
                <span>Үйлдэл</span>
              </div>

              <div id="methods-body"></div>
            </div>

          </section>

          <!-- PROHIBITED -->
          <section class="sh-prohibited">

            <h2 class="sh-section-title">
              ⚠ Хориотой бараа
            </h2>
            <div id="prohibited-grid" class="sh-prohibited__grid"></div>
          </section>
        </div>
      </div>
    </main>
  `;
}