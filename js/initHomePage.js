export function initHomeTracking() {
    const input = document.getElementById("home-track-input");
    const button = document.getElementById("home-track-btn");
    const message = document.getElementById("track-message");

    if (!input || !button) 
        return;

    function goToTrack() {
        let value = input.value.trim().toUpperCase();

        if (!value) {
            message.textContent = "Хайх утга оруулна уу.";
            message.style.color = "var(--color--error)";
            return;
        }

        let type = "";

        // MN12345 -> MN-12345 болгоно
        if (/^MN\d{5}$/.test(value)) {
            value = value.replace(/^MN/, "MN-");
        }

        if (/^MN-\d{5}$/.test(value)) {
            type = "code";
        }
        else if (/^[6-9]\d{7}$/.test(value)) {
            type = "phone";
        }
        else {
            message.textContent = "Утасны дугаар эсвэл хяналтын код буруу байна.";
            message.style.color = "var(--color--error)";
            return;
        }

        // Track хуудас руу шилжих
        window.location.hash = `#/track?type=${type}&query=${encodeURIComponent(value)}`;
    }

    button.addEventListener("click", goToTrack);

    input.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
            e.preventDefault();
            goToTrack();
        }
    });
}

export function initAddressCopy() {
  const buttons = document.querySelectorAll(".warehouse-copy-btn");

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {

      // Товчны байгаа мөрийг олно
      const row = btn.closest(".warehouse-copy-row");

      // Текстийг олно
      const textElement = row.querySelector(".warehouse-value");
      const text = textElement.textContent;

      // Clipboard руу хуулна
      navigator.clipboard.writeText(text);

      const icon = btn.querySelector(".material-symbols-outlined");
      icon.textContent = "check";
      btn.classList.add("copied");

      setTimeout(() => {
        icon.textContent = "content_copy";
        btn.classList.remove("copied");
      }, 1000);
    });
  });
}