import { getFaqCategoriesWithMissing, handleFaqAdminClick, handleFaqAdminSubmit, renderFaqAdmin } from "./js/faqAdmin.js";

const API_BASE = `${window.location.origin}/api`;
const TOKEN_KEY = "cash4cargo_admin_token";
const SHIPPING_RATE_PER_KG = 3500;

const statusClass = {
  "Олгогдсон": "success",
  "Улаанбаатарт ирсэн": "warning",
  "Замын Үүд дээр": "pending",
  "Хятадын агуулахад": "info",
  "Захиалга үүсгэсэн": "neutral",
  "Цуцлагдсан": "danger"
};

const statusOptions = Object.keys(statusClass);
let shipments = [];
let users = [];
let faqs = [];
let faqCategories = [];
let currentUser = null;
let dateSort = "newest";
let activeFilter = "Бүгд";

const appContent = document.querySelector("#appContent");
const searchInput = document.querySelector("#searchInput");
const sidebar = document.querySelector("#sidebar");
const overlay = document.querySelector("#overlay");
const modal = document.querySelector("#shipmentModal");
const editModal = document.querySelector("#editShipmentModal");
const shipmentForm = document.querySelector("#shipmentForm");
const editShipmentForm = document.querySelector("#editShipmentForm");
const adminName = document.querySelector("#adminName");
const adminRole = document.querySelector("#adminRole");
const adminAvatar = document.querySelector("#adminAvatar");
const loginScreen = document.querySelector("#loginScreen");
const loginForm = document.querySelector("#loginForm");
const loginMessage = document.querySelector("#loginMessage");
const logoutBtn = document.querySelector("#logoutBtn");
const statusModal = document.querySelector("#statusModal");
const quickStatusForm = document.querySelector("#quickStatusForm");
const quickStatusShipment = document.querySelector("#quickStatusShipment");
const quickStatusValue = document.querySelector("#quickStatusValue");

function getToken() { return localStorage.getItem(TOKEN_KEY) || localStorage.getItem("c4c_token"); }
function saveToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem("c4c_token", token);
}
function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem("c4c_token");
  localStorage.removeItem("c4c_user");
}

async function apiFetch(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) throw new Error(data?.message || "Сервертэй холбогдоход алдаа гарлаа");
  return data;
}

function formatMoney(value) { return `${Number(value || 0).toLocaleString("en-US")} ₮`; }
function formatWeight(value) { return `${Number(value || 0).toLocaleString("en-US")} кг`; }
function formatDate(value) { return value ? new Date(value).toLocaleDateString("mn-MN") : "-"; }
function initials(name = "?") {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "?";
}
function calculatePrice(weight) { return Math.round(Number(weight || 0) * SHIPPING_RATE_PER_KG); }

function mapShipment(item) {
  const firstItem = item.items?.[0];
  const product = item.items?.length > 1
    ? `${firstItem?.item_name || "Бараа"} +${item.items.length - 1}`
    : firstItem?.item_name || "Бараа";

  return {
    id: item._id,
    code: item.tracking_code,
    customer: item.receiver_name || item.sender_name || "Захиалагч",
    phone: item.receiver_phone || item.user_phone || "",
    product,
    items: item.items || [],
    weight: formatWeight(item.total_weight),
    price: formatMoney(item.shipping_price),
    rawWeight: Number(item.total_weight || 0),
    rawPrice: Number(item.shipping_price || 0),
    status: item.status,
    paymentStatus: item.payment_status,
    date: formatDate(item.createdAt),
    createdAt: item.createdAt,
    statusHistory: item.status_history || [],
    estimatedDelivery: item.estimated_delivery,
    avatar: initials(item.receiver_name || item.sender_name)
  };
}

function showLogin(message = "") {
  loginScreen.classList.add("show");
  if (message) showLoginMessage(message, "error");
}
function hideLogin() {
  loginScreen.classList.remove("show");
  loginMessage.textContent = "";
  loginMessage.classList.remove("show");
}
function showLoginMessage(text, type = "error") {
  loginMessage.textContent = text;
  loginMessage.classList.add("show");
  loginMessage.style.color = type === "error" ? "#ef4444" : "#22c55e";
}
function renderStatus(status, itemId = "") {
  return `<button class="status status-click ${statusClass[status] || "neutral"}" type="button" data-status-edit="${itemId}" title="Төлөв солих"><span>•</span>${status || "-"}</button>`;
}

function getVisibleShipments() {
  let data = [...shipments];
  if (activeFilter !== "Бүгд") data = data.filter((item) => item.status === activeFilter);
  data.sort((a, b) => dateSort === "oldest"
    ? new Date(a.createdAt) - new Date(b.createdAt)
    : new Date(b.createdAt) - new Date(a.createdAt)
  );
  return data;
}

function renderShipmentRows(data = shipments.slice(0, 5)) {
  if (!data.length) return `<tr><td colspan="8" class="empty-row">Илгээмж олдсонгүй.</td></tr>`;

  return data.map((item) => `
    <tr data-code="${item.code}">
      <td><button class="code link-button" data-detail="${item.code}">${item.code}</button></td>
      <td><div class="customer"><span class="avatar">${item.avatar}</span><span><strong>${item.customer}</strong><small>+976 ${item.phone}</small></span></div></td>
      <td>${item.product}</td>
      <td>${item.weight}</td>
      <td><strong>${item.price}</strong></td>
      <td>${renderStatus(item.status, item.id)}</td>
      <td>${item.date}</td>
      <td><button class="table-action-btn" data-edit="${item.code}">Засах</button></td>
    </tr>
  `).join("");
}

function renderTable(data = shipments.slice(0, 5), smallTitle = false) {
  return `
    <section class="table-card">
      <div class="table-title">
        <div><h2>${smallTitle ? "Сүүлийн илгээмжүүд" : "Илгээмжүүд"}</h2><p>${data.length} илгээмж харуулж байна</p></div>
        ${smallTitle ? `<a href="#shipments" class="code">Бүгдийг үзэх →</a>` : ""}
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Tracking code</th><th>Захиалагч</th><th>Бараанууд</th><th>Жин</th><th>Үнэ</th><th>Төлөв</th><th>Огноо</th><th>Үйлдэл</th></tr></thead>
          <tbody>${renderShipmentRows(data)}</tbody>
        </table>
      </div>
    </section>`;
}

function countStatus(status) { return shipments.filter((item) => item.status === status).length; }

function renderDashboard() {
  const totalPrice = shipments.reduce((sum, item) => sum + item.rawPrice, 0);
  const stats = [
    ["inventory_2", "Нийт ачаа", shipments.length, "API"],
    ["schedule", "Хүлээгдэж буй", countStatus("Захиалга үүсгэсэн"), "API"],
    ["warehouse", "Эрээн агуулах", countStatus("Хятадын агуулахад"), "API"],
    ["location_on", "УБ ирсэн", countStatus("Улаанбаатарт ирсэн"), "API"],
    ["task_alt", "Хүргэгдсэн", countStatus("Олгогдсон"), "API"],
    ["payments", "Нийт төлбөр", formatMoney(totalPrice), "API"]
  ];

  appContent.innerHTML = `
    <section class="card-grid">
      ${stats.map(([icon, label, value, trend]) => `<article class="stat-card"><div class="stat-top"><span class="icon material-symbols-outlined">${icon}</span><span class="trend">${trend}</span></div><div><p>${label}</p><strong>${value}</strong></div></article>`).join("")}
    </section>
    <section class="dashboard-layout">
      <article class="panel">
        <div class="panel-header"><div><h2>Төлөвийн статистик</h2><p>MongoDB backend-ээс уншсан бодит өгөгдөл</p></div></div>
        <div class="chart">
          ${statusOptions.map((status, index) => {
            const count = countStatus(status);
            const percent = shipments.length ? Math.round((count / shipments.length) * 100) : 0;
            const height = shipments.length ? Math.max(18, percent) : 18;
            return `<div class="bar-wrap"><span class="bar-count">${count}</span><div class="bar ${index % 2 === 0 ? "active" : ""}" style="height:${height}%"></div><small>${percent}%</small><strong>${status}</strong></div>`;
          }).join("")}
        </div>
      </article>
      <aside>
        <h2>Шуурхай үйлдэл</h2>
        <div class="quick-list">
          <article class="quick-card" id="quickCreate"><span class="material-symbols-outlined">add</span><h3>Ачаа бүртгэх</h3><p>Олон бараатай илгээмж backend рүү хадгална</p></article>
          <article class="quick-card accent" id="quickStatus"><span class="material-symbols-outlined">published_with_changes</span><h3>Төлөв шинэчлэх</h3><p>Илгээмжийн явцыг шууд өөрчилнө</p></article>
          <article class="quick-card light" id="quickRefresh"><span class="material-symbols-outlined">sync</span><h3>Дахин ачаалах</h3><p>MongoDB-с хамгийн шинэ мэдээлэл авна</p></article>
        </div>
      </aside>
    </section>
    ${renderTable(getVisibleShipments().slice(0, 5), true)}
  `;

  document.querySelector("#quickCreate")?.addEventListener("click", openModal);
  document.querySelector("#quickStatus")?.addEventListener("click", openStatusModal);
  document.querySelector("#quickRefresh")?.addEventListener("click", loadDataAndRender);
}

function renderShipments() {
  const data = getVisibleShipments();
  appContent.innerHTML = `
    <section class="page-title">
      <div><h1>Илгээмжүүд</h1><p>Backend API-аас ${shipments.length} илгээмж уншлаа.</p></div>
      <div class="actions">
        <select class="sort-select" id="dateSortSelect">
          <option value="newest" ${dateSort === "newest" ? "selected" : ""}>Шинэ → Хуучин</option>
          <option value="oldest" ${dateSort === "oldest" ? "selected" : ""}>Хуучин → Шинэ</option>
        </select>
        <button class="secondary-btn" id="refreshBtn"><span class="material-symbols-outlined">sync</span>Шинэчлэх</button>
        <button class="secondary-btn" id="openCreateBtn"><span class="material-symbols-outlined">add</span>Ачаа нэмэх</button>
      </div>
    </section>
    <section class="filter-row"><div class="filters">${["Бүгд", ...statusOptions].map((x) => `<button class="filter-btn ${x === activeFilter ? "active" : ""}" data-filter="${x}">${x}</button>`).join("")}</div></section>
    ${renderTable(data)}
  `;

  document.querySelector("#refreshBtn")?.addEventListener("click", loadDataAndRender);
  document.querySelector("#openCreateBtn")?.addEventListener("click", openModal);
  document.querySelector("#dateSortSelect")?.addEventListener("change", (event) => { dateSort = event.target.value; renderShipments(); });
  document.querySelectorAll(".filter-btn").forEach((btn) => btn.addEventListener("click", () => { activeFilter = btn.dataset.filter; renderShipments(); }));
}

function getUserOrders(phone) {
  return shipments.filter((item) => item.phone === phone);
}

function renderUserOrderHistory(user) {
  const orders = getUserOrders(user.phone);

  if (!orders.length) {
    return `<p class="user-order-empty">Энэ хэрэглэгчийн захиалга одоогоор байхгүй.</p>`;
  }

  return `
    <div class="user-order-history">
      <strong>Захиалгын түүх</strong>
      ${orders.map((order) => `
        <button class="user-order-row" type="button" data-detail="${order.code}">
          <span>${order.code}</span>
          <small>${order.status}</small>
          <b>${order.price}</b>
        </button>
      `).join("")}
    </div>
  `;
}

function renderUsers() {
  appContent.innerHTML = `
    <section class="page-title">
      <div><h1>Хэрэглэгчид</h1><p>Хэрэглэгч дээр дарахад захиалгын түүх нь харагдана.</p></div>
      <button class="secondary-btn" id="refreshUsersBtn"><span class="material-symbols-outlined">sync</span>Шинэчлэх</button>
    </section>
    <section class="users-grid">
      ${users.map((user) => `
        <article class="user-card" data-user-card="${user.phone}">
          <button class="user-card-top user-card-click" type="button" data-user-orders="${user.phone}">
            <span class="avatar">${initials(user.name)}</span>
            <div><h3>${user.name}</h3><p>+976 ${user.phone}</p></div>
          </button>
          <div class="user-meta"><span>Role: <strong>${user.role}</strong></span><span>Бүртгэсэн: <strong>${formatDate(user.createdAt)}</strong></span></div>
          <div class="user-actions">
            <button class="secondary-btn compact" data-role-id="${user._id || user.id}" data-role="${user.role === "admin" ? "user" : "admin"}">${user.role === "admin" ? "User болгох" : "Admin болгох"}</button>
            <button class="danger-btn compact" data-delete-user="${user._id || user.id}">Устгах</button>
          </div>
          <div class="user-orders" hidden>
            ${renderUserOrderHistory(user)}
          </div>
        </article>`).join("") || `<p class="empty-text">Хэрэглэгч олдсонгүй.</p>`}
    </section>`;

  document.querySelector("#refreshUsersBtn")?.addEventListener("click", loadDataAndRender);
}

function renderFaq() {
  // FAQ-ийн HTML болон category logic admin/js/faqAdmin.js дотор байгаа.
  appContent.innerHTML = renderFaqAdmin(faqs, faqCategories);
}

function renderShipmentDetail(code) {
  const item = shipments.find((shipment) => shipment.code === code);
  if (!item) { renderEmpty("Илгээмж олдсонгүй", "search_off"); return; }

  appContent.innerHTML = `
    <section class="page-title">
      <div><h1>${item.code}</h1><p>${item.customer} хэрэглэгчийн илгээмжийн дэлгэрэнгүй.</p></div>
      <div class="actions"><button class="secondary-btn" data-edit="${item.code}">Засах</button><button class="secondary-btn" onclick="location.hash='#shipments'">← Буцах</button></div>
    </section>
    <section class="detail-grid">
      <article class="panel"><div class="panel-header"><div><h2>Илгээмжийн явц</h2><p>Сүүлийн шинэчлэл: ${item.date}</p></div>${renderStatus(item.status, item.id)}</div><div class="timeline">${statusOptions.map((step) => `<div class="timeline-item"><span class="timeline-dot material-symbols-outlined">${step === item.status ? "radio_button_checked" : "check"}</span><div><strong>${step}</strong><span>${step === item.status ? "Одоогийн төлөв" : "Бүртгэгдсэн төлөв"}</span></div></div>`).join("")}</div></article>
      <article class="panel"><h2>Үндсэн мэдээлэл</h2><div class="details-list"><div><span>Захиалагч</span><strong>${item.customer}</strong></div><div><span>Утас</span><strong>+976 ${item.phone}</strong></div><div><span>Нийт жин</span><strong>${item.weight}</strong></div><div><span>Үнэ</span><strong>${item.price}</strong></div><div><span>Төлбөр</span><strong>${item.paymentStatus}</strong></div><div><span>Огноо</span><strong>${item.date}</strong></div></div></article>
      <article class="panel full-panel"><h2>Бараанууд</h2><div class="items-detail-list">${item.items.map((it) => `<div><strong>${it.item_name}</strong><span>${it.quantity || 1}ш</span><small>${it.description || ""}</small></div>`).join("")}</div></article>
    </section>`;
}

function renderEmpty(title, icon) {
  appContent.innerHTML = `<section class="empty-page"><div><span class="material-symbols-outlined">${icon}</span><h1>${title}</h1><p>Энэ хэсгийн UI-г дараагийн алхамд нэмээд өргөжүүлж болно.</p></div></section>`;
}

function setActive(page) {
  document.querySelectorAll(".nav-link").forEach((link) => link.classList.toggle("active", link.dataset.page === page));
}
function route() {
  const hash = location.hash.replace("#", "") || "dashboard";
  const [page, code] = hash.split("/");
  setActive(page);
  closeSidebar();
  if (page === "dashboard") renderDashboard();
  else if (page === "shipments") renderShipments();
  else if (page === "users") renderUsers();
  else if (page === "shipment") renderShipmentDetail(code);
  else if (page === "faq") renderFaq();
  else renderDashboard();
}

function openModal() {
  modal.classList.add("show");
  overlay.classList.add("show");
  modal.setAttribute("aria-hidden", "false");
  if (!document.querySelector("#createItemsBox .item-row")) addItemRow("createItemsBox");
  updatePricePreview("create");
}
function closeModal() {
  modal.classList.remove("show");
  if (!statusModal.classList.contains("show") && !editModal.classList.contains("show")) overlay.classList.remove("show");
  modal.setAttribute("aria-hidden", "true");
}
function openEditModal(code) {
  const item = shipments.find((shipment) => shipment.code === code);
  if (!item) return;
  editShipmentForm.elements.id.value = item.id;
  editShipmentForm.elements.code.value = item.code;
  editShipmentForm.elements.customer.value = item.customer;
  editShipmentForm.elements.phone.value = item.phone;
  editShipmentForm.elements.current_price.value = item.price;
  editShipmentForm.elements.total_weight.value = item.rawWeight || "";
  editShipmentForm.elements.new_price.value = formatMoney(calculatePrice(item.rawWeight));
  editShipmentForm.elements.description.value = "";
  const box = document.querySelector("#editItemsBox");
  box.innerHTML = item.items.length
    ? item.items.map((it) => `<div class="item-row readonly-item-row"><input value="${it.item_name || "Бараа"}" disabled /><input value="${it.quantity || 1}ш" disabled /><input value="${it.description || ""}" disabled /></div>`).join("")
    : `<div class="item-row readonly-item-row"><input value="Бараа бүртгэгдээгүй" disabled /></div>`;
  updatePricePreview("edit");
  editModal.classList.add("show");
  overlay.classList.add("show");
  editModal.setAttribute("aria-hidden", "false");
}
function closeEditModal() {
  editModal.classList.remove("show");
  if (!modal.classList.contains("show") && !statusModal.classList.contains("show")) overlay.classList.remove("show");
  editModal.setAttribute("aria-hidden", "true");
}

function addItemRow(boxId, item = {}) {
  const box = document.querySelector(`#${boxId}`);
  const row = document.createElement("div");
  row.className = "item-row";
  row.innerHTML = `
    <input name="item_name" placeholder="Барааны нэр" value="${item.item_name || ""}" required />
    <input name="quantity" type="number" min="1" value="${item.quantity || 1}" required />
    <input name="description" placeholder="Тайлбар / трак код" value="${item.description || ""}" />
    <button type="button" class="icon-btn remove-item"><span class="material-symbols-outlined">delete</span></button>`;
  box.appendChild(row);
  const prefix = boxId.startsWith("create") ? "create" : "edit";
  row.addEventListener("input", () => updatePricePreview(prefix));
  row.querySelector(".remove-item").addEventListener("click", () => {
    if (box.querySelectorAll(".item-row").length > 1) row.remove();
    updatePricePreview(prefix);
  });
}
function collectItems(boxId) {
  return [...document.querySelectorAll(`#${boxId} .item-row`)].map((row) => ({
    item_name: row.querySelector('[name="item_name"]')?.value.trim() || "",
    quantity: Number(row.querySelector('[name="quantity"]')?.value || 1),
    description: row.querySelector('[name="description"]')?.value.trim() || ""
  })).filter((it) => it.item_name);
}
function getPackageWeightFromForm(prefix) {
  const form = prefix === "create" ? shipmentForm : editShipmentForm;
  return Number(form?.elements.total_weight?.value || 0);
}
function updatePricePreview(prefix) {
  const totalWeight = getPackageWeightFromForm(prefix);
  const totalPrice = calculatePrice(totalWeight);
  const weightEl = document.querySelector(`#${prefix}TotalWeight`);
  const priceEl = document.querySelector(`#${prefix}TotalPrice`);
  if (weightEl) weightEl.textContent = formatWeight(totalWeight);
  if (priceEl) priceEl.textContent = formatMoney(totalPrice);
  if (prefix === "edit" && editShipmentForm?.elements.new_price) {
    editShipmentForm.elements.new_price.value = formatMoney(totalPrice);
  }
}

function fillStatusShipmentSelect(selectedId = "") {
  if (!quickStatusShipment) return;
  if (!shipments.length) { quickStatusShipment.innerHTML = `<option value="">Илгээмж олдсонгүй</option>`; return; }
  quickStatusShipment.innerHTML = shipments.map((item) => `<option value="${item.id}" data-status="${item.status}" ${item.id === selectedId ? "selected" : ""}>${item.code} — ${item.customer} — ${item.status}</option>`).join("");
  const selected = quickStatusShipment.selectedOptions[0];
  if (selected && quickStatusValue) quickStatusValue.value = selected.dataset.status;
}
function openStatusModal(selectedId = "") {
  fillStatusShipmentSelect(selectedId);
  statusModal.classList.add("show");
  overlay.classList.add("show");
  statusModal.setAttribute("aria-hidden", "false");
}
function closeStatusModal() {
  statusModal.classList.remove("show");
  if (!modal.classList.contains("show") && !editModal.classList.contains("show")) overlay.classList.remove("show");
  statusModal.setAttribute("aria-hidden", "true");
}
function openSidebar() { sidebar.classList.add("show"); overlay.classList.add("show"); }
function closeSidebar() { sidebar.classList.remove("show"); if (!modal.classList.contains("show") && !statusModal.classList.contains("show") && !editModal.classList.contains("show")) overlay.classList.remove("show"); }

async function loadData() {
  const [shipmentsResponse, usersResponse, faqsResponse, categoriesResponse] = await Promise.all([
    apiFetch(`/shipments?limit=100&sort=${dateSort}`),
    apiFetch("/auth/users"),
    apiFetch("/faqs"),
    apiFetch("/faqs/categories")
  ]);
  shipments = (shipmentsResponse.shipments || []).map(mapShipment);
  users = usersResponse.users || [];
  faqs = faqsResponse.faqs || [];
  faqCategories = getFaqCategoriesWithMissing(faqs, categoriesResponse.categories || []);
}
async function loadDataAndRender() {
  try {
    appContent.innerHTML = `<section class="empty-page"><div><span class="material-symbols-outlined">sync</span><h1>Ачааллаж байна...</h1></div></section>`;
    await loadData();
    route();
  } catch (err) {
    if (err.message.includes("Token") || err.message.includes("Нэвтрэлт") || err.message.includes("admin")) { clearToken(); showLogin(err.message); }
    else appContent.innerHTML = `<section class="empty-page"><div><span class="material-symbols-outlined">error</span><h1>Алдаа</h1><p>${err.message}</p></div></section>`;
  }
}
async function checkSession() {
  const token = getToken();
  if (!token) { showLogin(); return; }
  try {
    const data = await apiFetch("/auth/me");
    if (data.user.role !== "admin") { clearToken(); showLogin("Admin самбарт зөвхөн admin эрхтэй хэрэглэгч нэвтэрнэ. User эрхтэй бол /user хаягаар орно."); return; }
    currentUser = data.user;
    adminName.textContent = currentUser.name;
    adminRole.textContent = currentUser.role.toUpperCase();
    adminAvatar.textContent = initials(currentUser.name).slice(0, 1);
    hideLogin();
    await loadDataAndRender();
  } catch (err) { clearToken(); showLogin(err.message); }
}

// Events
document.querySelector("#menuBtn").addEventListener("click", openSidebar);
document.querySelector("#newShipmentBtn").addEventListener("click", openModal);
document.querySelector("#closeModalBtn").addEventListener("click", closeModal);
document.querySelector("#closeEditModalBtn").addEventListener("click", closeEditModal);
document.querySelector("#closeStatusModalBtn").addEventListener("click", closeStatusModal);
document.querySelector("#addCreateItemBtn")?.addEventListener("click", () => addItemRow("createItemsBox"));
document.querySelector("#addEditItemBtn")?.addEventListener("click", () => addItemRow("editItemsBox"));
shipmentForm?.elements.total_weight?.addEventListener("input", () => updatePricePreview("create"));
editShipmentForm?.elements.total_weight?.addEventListener("input", () => updatePricePreview("edit"));

overlay.addEventListener("click", () => { closeModal(); closeEditModal(); closeStatusModal(); closeSidebar(); });

appContent.addEventListener("click", async (event) => {
  const detailBtn = event.target.closest("[data-detail]");
  const editBtn = event.target.closest("[data-edit]");
  const roleBtn = event.target.closest("[data-role-id]");
  const deleteUserBtn = event.target.closest("[data-delete-user]");
  const deleteFaqBtn = event.target.closest("[data-delete-faq]");
  const statusBtn = event.target.closest("[data-status-edit]");
  const userOrdersBtn = event.target.closest("[data-user-orders]");

  if (userOrdersBtn) {
    const card = userOrdersBtn.closest(".user-card");
    const orders = card?.querySelector(".user-orders");
    if (orders) orders.hidden = !orders.hidden;
  }

  if (detailBtn) location.hash = `#shipment/${detailBtn.dataset.detail}`;
  if (editBtn) openEditModal(editBtn.dataset.edit);
  if (statusBtn) openStatusModal(statusBtn.dataset.statusEdit);

  if (roleBtn) {
    if (!confirm(`Энэ хэрэглэгчийг ${roleBtn.dataset.role} болгох уу?`)) return;
    await apiFetch(`/auth/users/${roleBtn.dataset.roleId}/role`, { method: "PUT", body: JSON.stringify({ role: roleBtn.dataset.role }) });
    await loadDataAndRender();
  }

  if (deleteUserBtn) {
    if (!confirm("Энэ хэрэглэгчийн хаягийг устгах уу?")) return;
    await apiFetch(`/auth/users/${deleteUserBtn.dataset.deleteUser}`, { method: "DELETE" });
    await loadDataAndRender();
  }

  if (deleteFaqBtn) {
    await handleFaqAdminClick(event, apiFetch, loadDataAndRender);
    return;
  }
});

appContent.addEventListener("submit", async (event) => {
  // FAQ/category form-уудын logic admin/js/faqAdmin.js дотор салсан.
  const faqHandled = await handleFaqAdminSubmit(event, apiFetch, loadDataAndRender);
  if (faqHandled) return;
});

searchInput.addEventListener("input", () => {
  const query = searchInput.value.trim().toLowerCase();
  if (!location.hash.includes("shipments")) location.hash = "#shipments";
  const filtered = getVisibleShipments().filter((item) => item.code.toLowerCase().includes(query) || item.customer.toLowerCase().includes(query) || item.phone.includes(query));
  setTimeout(() => { const card = document.querySelector(".table-card"); if (card) card.outerHTML = renderTable(filtered); }, 0);
});

quickStatusShipment?.addEventListener("change", () => {
  const selected = quickStatusShipment.selectedOptions[0];
  if (selected && quickStatusValue) quickStatusValue.value = selected.dataset.status;
});
quickStatusForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = new FormData(quickStatusForm);
  const shipmentId = form.get("shipment_id");
  if (!shipmentId) { alert("Эхлээд илгээмж сонгоно уу"); return; }
  try {
    await apiFetch(`/shipments/${shipmentId}/status`, { method: "PUT", body: JSON.stringify({ status: form.get("status"), description: form.get("description") }) });
    quickStatusForm.reset(); closeStatusModal(); await loadDataAndRender();
  } catch (err) { alert(err.message); }
});

shipmentForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = new FormData(shipmentForm);
  const phone = String(form.get("phone") || "").replace(/\D/g, "");
  const items = collectItems("createItemsBox");
  const code = String(form.get("code") || "").trim().toUpperCase();
  const payload = { user_phone: phone, receiver_phone: phone, sender_name: form.get("customer"), receiver_name: form.get("customer"), status: form.get("status"), payment_status: form.get("payment_status"), total_weight: Number(form.get("total_weight") || 0), description: form.get("description") || "", items };
  if (code) payload.tracking_code = code;
  try {
    await apiFetch("/shipments", { method: "POST", body: JSON.stringify(payload) });
    shipmentForm.reset(); document.querySelector("#createItemsBox").innerHTML = ""; closeModal(); location.hash = "#shipments"; await loadDataAndRender();
  } catch (err) { alert(err.message); }
});

editShipmentForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = new FormData(editShipmentForm);
  const id = form.get("id");
  const payload = { total_weight: Number(form.get("total_weight") || 0), description: form.get("description") || "" };
  try {
    await apiFetch(`/shipments/${id}`, { method: "PUT", body: JSON.stringify(payload) });
    closeEditModal(); await loadDataAndRender();
  } catch (err) { alert(err.message); }
});

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = new FormData(loginForm);
  try {
    const data = await apiFetch("/auth/login", { method: "POST", body: JSON.stringify({ phone: String(form.get("phone") || "").replace(/\D/g, ""), password: form.get("password") }) });
    if (data.user.role !== "admin") { showLoginMessage("User эрхтэй байна. User тал руу /user хаягаар нэвтэрнэ үү."); return; }
    saveToken(data.token); showLoginMessage("Амжилттай нэвтэрлээ", "success"); await checkSession();
  } catch (err) { showLoginMessage(err.message); }
});
logoutBtn.addEventListener("click", () => { clearToken(); currentUser = null; showLogin(); });
window.addEventListener("hashchange", route);
checkSession();
