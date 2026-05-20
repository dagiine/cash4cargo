import { getSession } from "../js/api.js";

function formatPhone(phone = "") {
  const digits = String(phone).replace(/\D/g, "");
  if (digits.length === 8) {
    return `+976 ${digits.slice(0, 4)}-${digits.slice(4)}`;
  }
  return phone || "-";
}

export default function profilePage() {
  const session = getSession();
  const user = session?.user || {};
  const name = user.name || "Хэрэглэгч";
  const phone = formatPhone(user.phone);

  return `
    <section class="profile-page">
      <div class="profile-card">
        <div class="profile-top">
          <div class="profile-avatar-wrap">
            <div class="profile-avatar">
              <span class="material-symbols-outlined">account_box</span>
            </div>
            <button class="profile-edit-avatar" type="button" title="Зураг солих">
              <span class="material-symbols-outlined">edit</span>
            </button>
          </div>

          <h1>${name}</h1>
          <p class="profile-phone">
            <span class="material-symbols-outlined">call</span>
            <span>${phone}</span>
          </p>
        </div>

        <form id="profile-password-form" class="profile-form">
          <p id="profile-message" class="profile-message"></p>

          <label class="profile-field">
            <span>Одоогийн нууц үг</span>
            <input id="current-password" type="password" placeholder="••••••••" autocomplete="current-password" />
          </label>

          <label class="profile-field">
            <span>Шинэ нууц үг</span>
            <input id="new-password" type="password" placeholder="••••••••" autocomplete="new-password" />
          </label>

          <label class="profile-field">
            <span>Шинэ нууц үг давтах</span>
            <input id="confirm-password" type="password" placeholder="••••••••" autocomplete="new-password" />
          </label>

          <button class="profile-update-btn" type="submit">Нууц үг шинэчлэх</button>
        </form>

        <div class="profile-divider"></div>

        <button id="profile-logout-btn" class="profile-logout-btn" type="button">
          <span class="material-symbols-outlined">logout</span>
          <span>Гарах</span>
        </button>
      </div>
    </section>
  `;
}
