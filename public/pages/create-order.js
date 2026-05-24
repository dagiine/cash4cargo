// pages/create-order.js

function renderCreateOrderPage() {
  return `
    <div class="co-page">

      <!-- ══ ЗҮҮН: Захиалгын форм (2/3) ══ -->
      <div class="co-main">

        <div class="co-page-header">
          <div>
            <h2 class="co-heading">Захиалга</h2>
            
            <p class="co-subheading" id="co-sub">Утасны дугаар оруулна уу</p>
          </div>
          <div class="co-header-actions">
            <button class="co-btn-icon" onclick="coClearAll()" title="Цэвэрлэх">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg>
            </button>
          </div>
        </div>

        <div class="co-section-label" id="co-phone-label">УТАСНЫ ДУГААР</div>
        <div class="co-phone-wrap" id="co-phone-wrap">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><circle cx="12" cy="17" r="1"/></svg>
          <input
            class="co-phone-input"
            id="co-phone"
            type="tel"
            placeholder="99112233"
            maxlength="8"
            oninput="coUpdateSub()"
          />
        </div>

        <div class="co-items-header">
          <div class="co-section-label" style="margin:0">ЗАХИАЛСАН БАРААНУУД</div>
          <button class="co-btn-additem" onclick="coAddItem()">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
            Нэмэх
          </button>
        </div>

        <div class="co-table-head">
          <span class="co-th" style="width:150px">Трак код</span>
          <span class="co-th" style="flex:1">Нэр</span>
          <span class="co-th" style="width:64px;text-align:center">Тоо</span>
          <span style="width:32px"></span>
        </div>

        <div id="co-items-list" class="co-items-list"></div>

        <div class="co-items-summary" id="co-summary" style="display:none">
          <span id="co-item-count">0 бараа</span>
          <span id="co-qty-sum">Нийт 0 ш</span>
        </div>

        <button class="co-submit-btn" id="co-submit-btn" onclick="coSubmit()">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><path d="M3 6h18M16 10a4 4 0 01-8 0"/></svg>
          Захиалга үүсгэх
        </button>

        <p class="co-terms">
          Захиалга илгээснээр та манай
          <a href="#" class="co-link">үйлчилгээний нөхцөл</a>-тэй зөвшөөрч байна.
        </p>
      </div>

      <!-- ══ БАРУУН: Үнэ тооцоолуур (1/3) ══ -->
      <div class="co-sidebar">
        <div class="co-sidebar-card">
          <div class="co-sidebar-title">ҮНЭ ТООЦООЛУУР</div>

          <div class="co-calc-group">
            <div class="co-calc-label">ЖИН (КГ)</div>
            <div class="co-calc-input-wrap">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6 2h12a1 1 0 011 1v2H5V3a1 1 0 011-1z"/><path d="M5 5l1.5 14h11L19 5"/></svg>
              <input class="co-calc-input" id="calc-weight" type="number" placeholder="5.0" step="0.1" min="0" />
            </div>
          </div>

          <div class="co-calc-group">
            <div class="co-calc-label">ХЭМЖЭЭ (СМ) — ЭЗЛЭХҮҮН ЖИНГИЙН ТООЦОО</div>
            <div class="co-calc-dims">
              <div class="co-dim">
                <div class="co-dim-label">УРТ</div>
                <input class="co-calc-dim-input" id="calc-l" type="number" placeholder="0" min="0" />
              </div>
              <div class="co-dim">
                <div class="co-dim-label">ӨРГӨН</div>
                <input class="co-calc-dim-input" id="calc-w" type="number" placeholder="0" min="0" />
              </div>
              <div class="co-dim">
                <div class="co-dim-label">ӨНДӨР</div>
                <input class="co-calc-dim-input" id="calc-h" type="number" placeholder="0" min="0" />
              </div>
            </div>
          </div>

          <div class="co-calc-result" id="calc-result" style="display:none">
            <div class="co-calc-divider"></div>
            <div class="co-calc-breakdown" id="calc-breakdown"></div>
            <div class="co-calc-total">
              <span>Нийт дүн</span>
              <span class="co-calc-total-val" id="calc-total-val"></span>
            </div>
          </div>
        </div>
      </div>

    </div>
  `;
}
export default renderCreateOrderPage;
export { renderCreateOrderPage };