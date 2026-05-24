// ===============================================
// ТУСЛАМЖ / FAQ PAGE JS
// Энэ файл search, category button, FAQ render logic-ийг ажиллуулна.
// Data болон normalize helper-үүдийг support/faqData.js файл руу салгасан.
// ===============================================

import { faqAPI } from "./api.js";
import { DEFAULT_CATEGORIES, DEFAULT_FAQS, mergeCategories, normalizeCategory, normalizeFaq } from "./support/faqData.js";

let allCategories = [...DEFAULT_CATEGORIES];
let allFaqs = [...DEFAULT_FAQS];
let activeCategory = "all";
let searchText = "";

// Нэг category button-ийн HTML үүсгэнэ.
function buildCategoryButton(category) {
  const activeClass = activeCategory === category.name ? "active" : "";

  return `
    <button class="faq-category-btn ${activeClass}" type="button" data-category="${category.name}">
      <span class="material-symbols-outlined">${category.icon}</span>
      ${category.name}
    </button>
  `;
}

// Нэг FAQ item-ийн HTML үүсгэнэ.
function buildFaqArticle(faq) {
  return `
    <article data-category="${faq.category}">
      <details>
        <summary>${faq.question}</summary>
        <p>${faq.answer}</p>
      </details>
    </article>
  `;
}

// Category button-уудыг page дээр зурна.
function renderCategories() {
  const categoryBox = document.querySelector("#faq-categories");
  if (!categoryBox) return;

  const allButtonClass = activeCategory === "all" ? "active" : "";

  categoryBox.innerHTML = `
    <button class="faq-category-btn ${allButtonClass}" type="button" data-category="all">
      <span class="material-symbols-outlined">view_list</span>
      Бүгд
    </button>
    ${allCategories.map(buildCategoryButton).join("")}
  `;
}

// Search text болон category сонголтоор FAQ-г шүүнэ.
function getVisibleFaqs() {
  const cleanSearch = searchText.toLowerCase().trim();

  return allFaqs.filter((faq) => {
    const sameCategory = activeCategory === "all" || faq.category === activeCategory;
    const faqText = `${faq.question} ${faq.answer} ${faq.category}`.toLowerCase();
    const foundBySearch = !cleanSearch || faqText.includes(cleanSearch);

    return sameCategory && foundBySearch;
  });
}

// FAQ жагсаалтыг page дээр зурна.
function renderFaqs() {
  const faqList = document.querySelector("#faq-list");
  const noResults = document.querySelector("#faq-no-results");
  if (!faqList) return;

  const visibleFaqs = getVisibleFaqs();
  faqList.innerHTML = visibleFaqs.map(buildFaqArticle).join("");

  if (noResults) {
    noResults.style.display = visibleFaqs.length ? "none" : "block";
  }
}

function renderAll() {
  renderCategories();
  renderFaqs();
}

// Backend-ээс admin нэмсэн FAQ болон category-г авна.
async function loadFaqFromBackend() {
  try {
    // Public FAQ тул token хэрэггүй.
    const [faqResponse, categoryResponse] = await Promise.all([
      faqAPI.list(),
      faqAPI.categories(),
    ]);

    const backendFaqs = Array.isArray(faqResponse) ? faqResponse : faqResponse.faqs || [];
    const backendCategories = categoryResponse.categories || [];

    allFaqs = [...DEFAULT_FAQS, ...backendFaqs.map(normalizeFaq)];
    allCategories = mergeCategories(backendCategories.map(normalizeCategory), allFaqs);

    renderAll();
  } catch (error) {
    console.error("FAQ ачаалахад алдаа гарлаа:", error);
  }
}

export async function initSupportSearch() {
  const searchInput = document.querySelector("#faq-search");
  const categoryBox = document.querySelector("#faq-categories");

  // Хайлт бичих бүрд FAQ list дахин шүүгдэнэ.
  searchInput?.addEventListener("input", (event) => {
    searchText = event.target.value;
    renderFaqs();
  });

  // Category button дээр дарахад тухайн ангиллын асуултууд гарна.
  categoryBox?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-category]");
    if (!button) return;

    activeCategory = button.dataset.category;
    renderAll();
  });

  renderAll();
  await loadFaqFromBackend();
}
