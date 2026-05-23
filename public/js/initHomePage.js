// ===============================================
// HOME PAGE TRACKING INPUT
// Нүүр хуудсан дээрх tracking input-ийг ажиллуулна.
// User код эсвэл утас бичээд хайхад track page рүү шилжүүлнэ.
// ===============================================

export function initHomeTracking() {
  const input = document.getElementById("home-track-input");
  const button = document.getElementById("home-track-btn");
  const message = document.getElementById("track-message");

  // Хэрвээ home page дээр эдгээр element байхгүй бол function зогсоно.
  if (!input || !button) return;

  // Хайх товч дарахад ажиллах function.
  function goToTrack() {
    let value = input.value.trim().toUpperCase();

    if (!value) {
      if (message) {
        message.textContent = "Хайх утга оруулна уу.";
        message.style.color = "var(--color--error)";
      }
      return;
    }

    // MN12345 гэж бичсэн бол MN-12345 болгож засна.
    if (/^MN\d{5}$/.test(value)) {
      value = value.replace(/^MN/, "MN-");
    }

    // Track page рүү query дамжуулна.
    window.location.hash = `#/track?query=${encodeURIComponent(value)}`;
  }

  // Button click.
  button.addEventListener("click", goToTrack);

  // Enter дарахад бас хайна.
  input.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
      event.preventDefault();
      goToTrack();
    }
  });
}
