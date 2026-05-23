// ===============================================
// ТУСЛАМЖ / FAQ PAGE JS
// Энэ файл support page дээр ажиллана.
// Үүрэг:
// 1. Default асуултуудыг харуулах
// 2. Admin нэмсэн FAQ-г backend-ээс авч нэмэх
// 3. Category button болон search ажиллуулах
// ===============================================

import { faqAPI } from "./api.js";

// Үндсэн category-ууд. Dropdown байхгүй, зөвхөн button байна.
const DEFAULT_CATEGORIES = [
  { name: "Захиалга", icon: "shopping_cart" },
  { name: "Тээвэрлэлт", icon: "local_shipping" },
  { name: "Төлбөр", icon: "payments" },
];

// Тусламж дээр анх харагдах асуултууд.
// Эдгээрийг хэрэглэгчийн өгсөн FAQ текстээс нэгтгэсэн.
const DEFAULT_FAQS = [
  {
    category: "Захиалга",
    question: "Яаж захиалга өгөх вэ?",
    answer: "Захиалга үүсгэх хуудсанд утасны дугаар болон барааны мэдээллээ бөглөж илгээмжээ бүртгүүлнэ. Захиалга үүссэний дараа tracking code гарна.",
  },
  {
    category: "Захиалга",
    question: "Ямар ч Хятадын сайтаас захиалж болох уу?",
    answer: "Тийм. Taobao, 1688, JD.com, Pinduoduo зэрэг ихэнх Хятадын худалдааны сайтаас захиалах боломжтой. Захиалсан барааны мэдээллээ зөв оруулахад хангалттай.",
  },
  {
    category: "Захиалга",
    question: "Ямар барааг хориглодог вэ?",
    answer: "Шатамхай бүтээгдэхүүн, том хүчин чадалтай литийн зай, хуурамч бүтээгдэхүүн, мансууруулах бодис, амьд амьтан зэрэг бараа хориглогдоно. Эргэлзээтэй бараа байвал холбогдож лавлана уу.",
  },
  {
    category: "Захиалга",
    question: "Захиалгаа өөрчлөх эсвэл цуцлах боломжтой юу?",
    answer: "Захиалга үүсгэсэн болон Хятадын агуулахад байгаа үед цуцлах боломжтой. Тээвэрлэлт эхэлсний дараа цуцлах боломжгүй.",
  },
  {
    category: "Захиалга",
    question: "Хагарч гэмтэх барааг хэрхэн захиалах вэ?",
    answer: "Шил, толь, зурагт зэрэг хагарч гэмтэх барааг захиалахдаа худалдагчаас гадуур нь модон хайрцаг эсвэл хамгаалалттай савлагаатай явуулахыг хүсвэл аюулгүй ирэх магадлал өндөр.",
  },
  {
    category: "Тээвэрлэлт",
    question: "Захиалсан бараа хэд хоногт Улаанбаатарт ирэх вэ?",
    answer: "Эрээнд хүргэгдсэн бараа ихэвчлэн 3-5 хоногт Улаанбаатарт ирдэг. Хил, гааль, цаг агаар, замын нөхцөлөөс хамаарч хугацаа өөрчлөгдөж болно.",
  },
  {
    category: "Тээвэрлэлт",
    question: "Ачаагаа хэрхэн хянах вэ?",
    answer: "Захиалга хянах хуудсанд tracking code эсвэл утасны дугаараа оруулж хайна. Нэвтэрсэн хэрэглэгчийн захиалгууд автоматаар харагдана.",
  },
  {
    category: "Тээвэрлэлт",
    question: "Ачаагаа Улаанбаатарт ирэхээр нь хаанаас авах вэ?",
    answer: "Улаанбаатар дахь салбар дээрээс авах боломжтой. Ачаа ирсэн үед төлөв шинэчлэгдэж, авах мэдээлэл харагдана.",
  },
  {
    category: "Тээвэрлэлт",
    question: "Миний бараа тээвэрлэлт төлөвтэй болохгүй байна. Шалгаад өгөөч?",
    answer: "Зарим том овортой бараа шууд Улаанбаатарт ирсэн төлөвт шилжих боломжтой. Учир нь ийм барааг машин дээр жин, овор хэмжээгээр нь шалгаж бүртгэдэг.",
  },
  {
    category: "Төлбөр",
    question: "Барааны үнэ хэрхэн бодогдох вэ?",
    answer: "Тээврийн үнэ барааны нийт жингээр бодогдоно. Admin жин оруулсны дараа үнэ автоматаар гарна.",
  },
  {
    category: "Төлбөр",
    question: "Ямар төлбөрийн хэрэгслүүдийг хүлээн авдаг вэ?",
    answer: "QPay, банкны шилжүүлэг болон боломжит төлбөрийн хэрэгслүүдээр төлбөр хийх боломжтой.",
  },
  {
    category: "Төлбөр",
    question: "Төлбөрөө хэзээ хийдэг вэ?",
    answer: "Бараа Хятад дахь агуулахад ирж жин баталгаажсаны дараа төлбөрийн мэдээлэл гарна.",
  },
  {
    category: "Төлбөр",
    question: "Өндөр үнэ бүхий ачааг даатгуулах боломжтой юу?",
    answer: "Өндөр үнэ бүхий барааны талаар урьдчилан мэдэгдэж, нэмэлт хамгаалалт эсвэл даатгалын боломжийг лавлаж болно.",
  },
  {
    category: "Төлбөр",
    question: "Гаалийн татвар ногдох уу?",
    answer: "Монгол Улсын гаалийн журамд заасан хэмжээнээс давсан бараанд татвар ногдох боломжтой. Ийм тохиолдолд нэмэлт мэдээлэл шаардлагатай байж болно.",
  },
];

let allCategories = [...DEFAULT_CATEGORIES];
let allFaqs = [...DEFAULT_FAQS];
let activeCategory = "all";
let searchText = "";

// Backend-ээс ирсэн category-г нэг ижил format болгоно.
function normalizeCategory(item) {
  if (typeof item === "string") {
    return { name: item, icon: "help" };
  }

  return {
    name: item.name || item.category || "Ерөнхий",
    icon: item.icon || "help",
  };
}

// Backend-ээс ирсэн FAQ-г нэг ижил format болгоно.
function normalizeFaq(item) {
  return {
    question: item.question || item.title || "Асуулт",
    answer: item.answer || item.description || "",
    category: item.category || "Захиалга",
  };
}

// HTML attribute дотор аюулгүй бичих жижиг helper.
function escapeAttr(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

// Давхардсан category-г Map ашиглаж нэгтгэнэ.
function mergeCategories(categories, faqs) {
  const categoryMap = new Map();

  [...DEFAULT_CATEGORIES, ...categories].forEach((item) => {
    const category = normalizeCategory(item);
    categoryMap.set(category.name, category);
  });

  faqs.forEach((faq) => {
    if (!categoryMap.has(faq.category)) {
      categoryMap.set(faq.category, { name: faq.category, icon: "help" });
    }
  });

  return Array.from(categoryMap.values());
}

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
    <faq-item
      category="${escapeAttr(faq.category)}"
      question="${escapeAttr(faq.question)}"
      answer="${escapeAttr(faq.answer)}"
    ></faq-item>
  `;
}

// Category button-уудыг зурна.
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

// Search болон category filter хийсний дараах FAQ list.
function getVisibleFaqs() {
  const cleanSearch = searchText.toLowerCase().trim();

  return allFaqs.filter((faq) => {
    const sameCategory = activeCategory === "all" || faq.category === activeCategory;
    const faqText = `${faq.question} ${faq.answer} ${faq.category}`.toLowerCase();
    const foundBySearch = !cleanSearch || faqText.includes(cleanSearch);

    return sameCategory && foundBySearch;
  });
}

// FAQ жагсаалтыг зурна.
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
