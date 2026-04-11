export function initCreateOrder() {
  const form = document.getElementById("order-form");
  const phoneInput = document.getElementById("phone");
  const trackInput = document.getElementById("track-code");
  const descInput = document.getElementById("desc");

  const phoneError = document.getElementById("phone-error");
  const trackError = document.getElementById("track-code-error");
  const descError = document.getElementById("desc-error");
  const formMessage = document.getElementById("form-message");

  if (!form || !phoneInput || !trackInput || !descInput || !phoneError || !trackError || !descError || !formMessage) {
    return;
  }

  function showError(elError, elInput, message) {
    elError.textContent = message;
    elError.style.display = "block";
    elInput.classList.add("input-error");
  }

  function hideError(elError, elInput) {
    elError.textContent = "";
    elError.style.display = "none";
    elInput.classList.remove("input-error");
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    hideError(phoneError, phoneInput);
    hideError(trackError, trackInput);
    hideError(descError, descInput);

    // Form-ийн доорх message-ийг цэвэрлэнэ
    formMessage.textContent = "";

    let isValid = true;

    const phone = phoneInput.value.trim();
    const trackCode = trackInput.value.trim().toUpperCase();
    const description = descInput.value.trim();

    if (phone === "") {
      showError(phoneError, phoneInput, "Утасны дугаар оруулна уу.");
      isValid = false;
    } else if (!/^[6-9]\d{7}$/.test(phone)) {
      showError(phoneError, phoneInput, "Утасны дугаар 8 оронтой байна.");
      isValid = false;
    }

    if (trackCode === "") {
      showError(trackError, trackInput, "Хяналтын код оруулна уу.");
      isValid = false;
    }

    if (description === "") {
      showError(descError, descInput, "Барааны тайлбар оруулна уу.");
      isValid = false;
    }

    if (!isValid) {
      return;
    }

    alert("Захиалга амжилттай үүслээ!");
    formMessage.textContent = "Захиалга амжилттай үүслээ.";
    formMessage.style.color = "var(--color--success)";
    formMessage.style.display = "block";
  formMessage.style.textAlign = "center";

    form.reset();
  });
}