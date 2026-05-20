export function initSupportSearch() {
  const searchInput = document.getElementById("faq-search");
  const categoryTabs = document.getElementById("faq-categories");
  const sectionTitle = document.getElementById("faq-section-title");
  const noResultsMessage = document.getElementById("faq-no-results");
  const faqCards = document.querySelectorAll(".faq-group > article");

  // Input талбарын утга өөрчлөгдөх бүрт ажиллана
  searchInput.addEventListener("input", function () {
    const query = searchInput.value.trim().toLowerCase();

    if (query === "") {
      // Анхны хэлбэрт буцаана
      categoryTabs.style.display = "";
      sectionTitle.textContent = "Түгээмэл асуултууд";
      noResultsMessage.style.display = "none";

      faqCards.forEach(function (card) {
        card.style.display = "";

        const details = card.querySelector("details");
        details.removeAttribute("open");
      });

      return;
    }

    // Хайлт хийх үед
    categoryTabs.style.display = "none";
    sectionTitle.textContent = "Хайлтын үр дүн";

    let found = false;

    faqCards.forEach(function (card) {
      const question = card.querySelector("summary").textContent.toLowerCase();
      const answer = card.querySelector("p").textContent.toLowerCase();

      // Хайлтын утга асуулт эсвэл хариултад байгаа эсэхийг шалгах
      const match = question.includes(query) || answer.includes(query);

      if (match) {
        // Таарсан бол card-ийг харуулна
        card.style.display = "";

        // details-ийг автоматаар нээнэ
        card.querySelector("details").setAttribute("open", "");

        found = true;

      } else {
        // Таарахгүй бол card-ийг нууна
        card.style.display = "none";

        // details-ийг хаана
        card.querySelector("details").removeAttribute("open");
      }
    });

    if (found) {
      noResultsMessage.style.display = "none";
    } else {
      noResultsMessage.style.display = "block";
    }
  });
}