// pages/profile.js
// Профайл хуудас — нэвтэрсэн хэрэглэгчийн мэдээлэл засах

export default function profile() {
  return `
    <div class="profile-page">

      <!-- ── Хэрэглэгчийн мэдээлэл ── -->
      <section class="profile-card">
        <div class="profile-avatar">
          <span class="material-symbols-outlined">account_circle</span>
        </div>
        <div class="profile-info">
          <h2 id="profile-display-name">...</h2>
          <p id="profile-display-contact" class="profile-muted">...</p>
        </div>
      </section>

      <!-- ── Мэдээлэл засах форм ── -->
      <section class="profile-form-section">
        <h3>Мэдээлэл засах</h3>

        <p id="profile-message" class="profile-message"></p>

        <div class="profile-form">
          <label>
            Нэр
            <input type="text" id="pf-name" placeholder="Таны нэр">
          </label>

          <label>
            Утасны дугаар
            <input type="text" id="pf-phone" placeholder="99XXXXXX">
          </label>

          <label>
            И-мэйл
            <input type="email" id="pf-email" placeholder="example@gmail.com">
          </label>

          <label>
            Хаяг
            <input type="text" id="pf-address" placeholder="Дүүрэг, хороо, байр...">
          </label>

          <hr class="profile-divider">

          <h4>Нууц үг солих (заавал биш)</h4>

          <label>
            Шинэ нууц үг
            <input type="password" id="pf-password" placeholder="Шинэ нууц үг">
          </label>

          <label>
            Нууц үг давтах
            <input type="password" id="pf-password2" placeholder="Давтах">
          </label>

          <button class="btn profile-save-btn" id="pf-save">
            <span class="material-symbols-outlined">save</span>
            Хадгалах
          </button>
        </div>
      </section>

      <!-- ── Захиалгын түүх ── -->
      <section class="profile-orders-section">
        <h3>Захиалгын түүх</h3>
        <div id="profile-orders-list">
          <p class="profile-muted">Ачааллаж байна...</p>
        </div>
      </section>

      <!-- ── Гарах ── -->
      <section class="profile-logout-section">
        <button class="btn profile-logout-btn" id="pf-logout">
          <span class="material-symbols-outlined">logout</span>
          Гарах
        </button>
      </section>

    </div>
  `;
}