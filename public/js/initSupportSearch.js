import { faqAPI } from "./api.js";

function normalizeFaq(item) {
  return {
    question: item.question || item.title || "Асуулт",
    answer: item.answer || item.description || "",
    category: String(item.category || "general").toLowerCase(),
  };
}

function buildFaqArticle(faq) {
  return `
    <article data-api-faq="true">
      <details>
        <summary>${faq.question}</summary>
        <p>${faq.answer}</p>
      </details>
    </article>
  `;
}

function getFaqGroup(id) {
  return document.querySelector(`div.faq-group#${id}`);
}

function pickTargetGroup(category) {
  const ordering = getFaqGroup("faq-ordering");
  const shipping = getFaqGroup("faq-shipping");
  const payments = getFaqGroup("faq-payments");

  if (category.includes("shipping") || category.includes("хүргэл") || category.includes("тээв")) {
    return shipping || ordering;
  }

  if (category.includes("payment") || category.includes("төлб") || category.includes("үнэ")) {
    return payments || ordering;
  }

  return ordering;
}

async function loadBackendFaqs() {
  const ordering = getFaqGroup("faq-ordering");
  if (!ordering) return;

  try {
    const data = await faqAPI.list();
    const rawFaqs = Array.isArray(data) ? data : data?.faqs || [];
    const faqs = rawFaqs.map(normalizeFaq);

    if (!faqs.length) return;

    document.querySelectorAll("[data-api-faq='true']").forEach((item) => item.remove());

    faqs.forEach((faq) => {
      const target = pickTargetGroup(faq.category);
      target?.insertAdjacentHTML("beforeend", buildFaqArticle(faq));
    });
  } catch (err) {
    console.warn("FAQ API ашиглах боломжгүй байна. Static FAQ-г харуулж байна.", err);
  }
}

function bindSearch() {
  const searchInput = document.getElementById("faq-search");
  const categoryTabs = document.querySelector(".categories");
  const sectionTitle = document.querySelector("article section h2");
  const noResultsMessage = document.getElementById("faq-no-results");

  if (!searchInput || !categoryTabs || !sectionTitle || !noResultsMessage) return;

  searchInput.addEventListener("input", function () {
    const query = searchInput.value.trim().toLowerCase();
    const faqCards = document.querySelectorAll(".faq-group > article");

    if (query === "") {
      categoryTabs.style.display = "";
      sectionTitle.textContent = "Түгээмэл асуултууд";
      noResultsMessage.style.display = "none";

      faqCards.forEach(function (card) {
        card.style.display = "";
        card.querySelector("details")?.removeAttribute("open");
      });

      return;
    }

    categoryTabs.style.display = "none";
    sectionTitle.textContent = "Хайлтын үр дүн";

    let found = false;

    faqCards.forEach(function (card) {
      const question = card.querySelector("summary")?.textContent.toLowerCase() || "";
      const answer = card.querySelector("p")?.textContent.toLowerCase() || "";
      const match = question.includes(query) || answer.includes(query);

      if (match) {
        card.style.display = "";
        card.querySelector("details")?.setAttribute("open", "");
        found = true;
      } else {
        card.style.display = "none";
        card.querySelector("details")?.removeAttribute("open");
      }
    });

    noResultsMessage.style.display = found ? "none" : "block";
  });
}

export async function initSupportSearch() {
  await loadBackendFaqs();
  bindSearch();
}
