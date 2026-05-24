// ===============================================
// ADMIN FAQ LOGIC
// FAQ болон FAQ category-тэй холбоотой HTML + event logic.
// Admin-тэй холбоотой code-ийг admin folder дотор байлгахын тулд салгав.
// ===============================================

// FAQ category байхгүй үед FAQ-ийн category нэрээр нь автоматаар нэмнэ.
export function getFaqCategoriesWithMissing(faqs = [], categories = []) {
  const categoryMap = new Map();

  categories.forEach((category) => {
    if (!category?.name) return;
    categoryMap.set(category.name, {
      name: category.name,
      icon: category.icon || "help",
    });
  });

  faqs.forEach((faq) => {
    if (!faq?.category) return;

    if (!categoryMap.has(faq.category)) {
      categoryMap.set(faq.category, {
        name: faq.category,
        icon: "help",
      });
    }
  });

  return Array.from(categoryMap.values());
}

// Select дотор харагдах category option-уудыг үүсгэнэ.
function getCategoryOptions(categories = []) {
  return categories.map((category) => `
    <option value="${category.name}">${category.name}</option>
  `).join("");
}

// Нэг FAQ card-ийн HTML.
function getFaqCard(faq) {
  return `
    <div class="faq-card inner-faq-card">
      <small>${faq.category || "Ерөнхий"}</small>
      <h3>${faq.question}</h3>
      <p>${faq.answer}</p>
      <button class="danger-btn compact" data-delete-faq="${faq._id}">
        Устгах
      </button>
    </div>
  `;
}

// Нэг category доторх FAQ жагсаалтыг үүсгэнэ.
function getCategoryCard(category, faqs = []) {
  const list = faqs.filter((faq) => faq.category === category.name);
  const faqCards = list.map(getFaqCard).join("");

  return `
    <article class="faq-category-card">
      <h2>${category.name}</h2>
      ${faqCards || `<p class="empty-text">Энэ ангилалд асуулт нэмэгдээгүй байна.</p>`}
    </article>
  `;
}

// FAQ page-ийн бүтэн HTML.
export function renderFaqAdmin(faqs = [], categories = []) {
  const options = getCategoryOptions(categories);
  const categoryCards = categories.map((category) => getCategoryCard(category, faqs)).join("");

  return `
    <section class="page-title">
      <div>
        <h1>FAQ</h1>
        <p>Эхлээд ангилал сонгоод, тухайн ангилал дотор асуулт нэмнэ.</p>
      </div>
    </section>

    <section class="panel faq-admin-layout">
      <form id="categoryForm" class="form-grid category-form">
        <label>
          Шинэ ангиллын нэр
          <input name="name" placeholder="Жишээ: Даатгал" required />
        </label>

        <label>
          Icon нэр <small>/заавал биш/</small>
          <input name="icon" placeholder="Жишээ: verified_user" />
        </label>

        <button class="secondary-btn" type="submit">Ангилал нэмэх</button>
      </form>

      <form id="faqForm" class="form-grid">
        <label>
          Ангилал
          <select name="category" required>
            ${options || `<option value="Захиалга">Захиалга</option>`}
          </select>
        </label>

        <label>
          Асуулт
          <input name="question" placeholder="Жишээ: Ачаа хэд хоногт ирэх вэ?" required />
        </label>

        <label class="full-field">
          Хариулт
          <textarea name="answer" placeholder="Хариултаа бичнэ үү" required></textarea>
        </label>

        <button class="primary-btn" type="submit">Асуулт нэмэх</button>
      </form>
    </section>

    <section class="faq-list">
      ${categoryCards || `<p class="empty-text">FAQ ангилал нэмэгдээгүй байна.</p>`}
    </section>
  `;
}

// FAQ устгах товч дарагдсан эсэхийг шалгаад устгана.
export async function handleFaqAdminClick(event, apiFetch, refreshPage) {
  const deleteButton = event.target.closest("[data-delete-faq]");
  if (!deleteButton) return false;

  if (!confirm("Энэ FAQ-г устгах уу?")) return true;

  await apiFetch(`/faqs/${deleteButton.dataset.deleteFaq}`, {
    method: "DELETE",
  });

  await refreshPage();
  return true;
}

// Category нэмэх болон FAQ нэмэх form-уудыг ажиллуулна.
export async function handleFaqAdminSubmit(event, apiFetch, refreshPage) {
  const formElement = event.target;

  if (formElement.id === "categoryForm") {
    event.preventDefault();

    const form = new FormData(formElement);

    await apiFetch("/faqs/categories", {
      method: "POST",
      body: JSON.stringify({
        name: form.get("name"),
        icon: form.get("icon") || "help",
      }),
    });

    formElement.reset();
    await refreshPage();
    return true;
  }

  if (formElement.id === "faqForm") {
    event.preventDefault();

    const form = new FormData(formElement);

    await apiFetch("/faqs", {
      method: "POST",
      body: JSON.stringify({
        question: form.get("question"),
        answer: form.get("answer"),
        category: form.get("category") || "Захиалга",
      }),
    });

    formElement.reset();
    await refreshPage();
    return true;
  }

  return false;
}
