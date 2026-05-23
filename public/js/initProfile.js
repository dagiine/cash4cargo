import { authAPI, clearSession, isLoggedIn } from "./api.js";

function showProfileMessage(message, type = "error") {
  const el = document.querySelector("#profile-message");
  if (!el) return;

  el.textContent = message;
  el.className = `profile-message ${type}`;
}

export function initProfile() {
  if (!isLoggedIn()) {
    window.location.hash = "#/";
    return;
  }

  const form = document.querySelector("#profile-password-form");
  const logoutBtn = document.querySelector("#profile-logout-btn");
  const editAvatarBtn = document.querySelector(".profile-edit-avatar");

  editAvatarBtn?.addEventListener("click", () => {
    showProfileMessage("Зураг солих хэсгийг дараагийн хувилбарт холбож болно.", "info");
  });

  logoutBtn?.addEventListener("click", () => {
    clearSession();
    window.location.hash = "#/";
    window.location.reload();
  });

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const currentPassword = document.querySelector("#current-password")?.value.trim();
    const newPassword = document.querySelector("#new-password")?.value.trim();
    const confirmPassword = document.querySelector("#confirm-password")?.value.trim();

    if (!currentPassword || !newPassword || !confirmPassword) {
      return showProfileMessage("Бүх талбарыг бөглөнө үү", "error");
    }

    if (newPassword.length < 6) {
      return showProfileMessage("Шинэ нууц үг дор хаяж 6 тэмдэгт байна", "error");
    }

    if (newPassword !== confirmPassword) {
      return showProfileMessage("Шинэ нууц үг давталттайгаа таарахгүй байна", "error");
    }

    if (currentPassword === newPassword) {
      return showProfileMessage("Шинэ нууц үг одоогийн нууц үгээс өөр байх ёстой", "error");
    }

    try {
      await authAPI.updatePassword(currentPassword, newPassword);
      form.reset();
      showProfileMessage("Нууц үг амжилттай шинэчлэгдлээ ✓", "success");
    } catch (err) {
      showProfileMessage(err.message || "Нууц үг шинэчлэхэд алдаа гарлаа", "error");
    }
  });
}
