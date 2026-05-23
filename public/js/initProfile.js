// ===============================================
// PROFILE PAGE JS
// Login хийсэн user-ийн profile page-г ажиллуулна.
// Үүрэг: user info харуулах, password солих, logout хийх.
// ===============================================

import { authAPI, clearSession, isLoggedIn, getSession } from "./api.js";

// Profile page дээр message харуулах helper.
function showProfileMessage(message, type = "error") {
  const messageElement = document.querySelector("#profile-message");
  if (!messageElement) return;

  messageElement.textContent = message;
  messageElement.className = `profile-message ${type}`;
}

export function initProfile() {
  // Login хийгээгүй бол profile үзүүлэхгүй, home руу буцаана.
  if (!isLoggedIn()) {
    window.location.hash = "#/";
    return;
  }

  const session = getSession();
  const passwordForm = document.querySelector("#profile-password-form");
  const logoutButton = document.querySelector("#profile-logout-btn");

  // HTML дээр user-ийн мэдээлэл харуулах element байвал бөглөнө.
  const nameElement = document.querySelector("#profile-name");
  const phoneElement = document.querySelector("#profile-phone");

  if (nameElement) nameElement.textContent = session?.user?.name || "Хэрэглэгч";
  if (phoneElement) phoneElement.textContent = session?.user?.phone || "-";

  // Logout товч.
  logoutButton?.addEventListener("click", function() {
    clearSession();
    window.location.hash = "#/";
    window.location.reload();
  });

  // Password update form.
  passwordForm?.addEventListener("submit", async function(event) {
    event.preventDefault();

    const currentPassword = document.querySelector("#current-password")?.value.trim();
    const newPassword = document.querySelector("#new-password")?.value.trim();
    const confirmPassword = document.querySelector("#confirm-password")?.value.trim();

    if (!currentPassword || !newPassword || !confirmPassword) {
      showProfileMessage("Бүх талбарыг бөглөнө үү.");
      return;
    }

    if (newPassword.length < 6) {
      showProfileMessage("Шинэ нууц үг дор хаяж 6 тэмдэгт байх ёстой.");
      return;
    }

    if (newPassword !== confirmPassword) {
      showProfileMessage("Шинэ нууц үг давхцахгүй байна.");
      return;
    }

    try {
      await authAPI.updatePassword(currentPassword, newPassword);
      passwordForm.reset();
      showProfileMessage("Нууц үг амжилттай шинэчлэгдлээ.", "success");
    } catch (error) {
      showProfileMessage(error.message || "Нууц үг шинэчлэхэд алдаа гарлаа.");
    }
  });
}
