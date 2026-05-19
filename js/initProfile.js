// js/initProfile.js
// Профайл хуудасны логик — мэдээлэл харуулах, засах, захиалгын түүх

import { getSession, updateUser, clearSession, getUserOrders } from "./auth.js";

export function initProfile() {
  const session = getSession();

  // Нэвтрээгүй бол нүүр хуудас руу шилжүүлнэ
  if (!session) {
    window.location.hash = "#/";
    return;
  }

  // ── Мэдээлэл харуулах ──
  fillDisplay(session);
  fillForm(session);
  loadOrders(session);

  // ── Хадгалах товч ──
  const saveBtn = document.getElementById("pf-save");
  if (saveBtn) {
    saveBtn.addEventListener("click", function() {
      handleSave(session);
    });
  }

  // ── Гарах товч ──
  const logoutBtn = document.getElementById("pf-logout");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function() {
      clearSession();
      // Header-г шинэчлэхийн тулд хуудас дахин ачаална
      window.location.hash = "#/";
      window.dispatchEvent(new Event("hashchange"));
    });
  }
}

// ── Толгой хэсэгт нэр, холбоо барих харуулах ──
function fillDisplay(user) {
  const nameEl    = document.getElementById("profile-display-name");
  const contactEl = document.getElementById("profile-display-contact");

  if (nameEl)    nameEl.textContent    = user.name || "Нэргүй";
  if (contactEl) contactEl.textContent = user.phone || user.email || "";
}

// ── Формд утга дүүргэх ──
function fillForm(user) {
  const setVal = function(id, val) {
    const el = document.getElementById(id);
    if (el) el.value = val || "";
  };

  setVal("pf-name",    user.name);
  setVal("pf-phone",   user.phone);
  setVal("pf-email",   user.email);
  setVal("pf-address", user.address);
}

// ── Хадгалах ──
function handleSave(session) {
  const getVal = function(id) {
    return (document.getElementById(id)?.value || "").trim();
  };

  const name     = getVal("pf-name");
  const phone    = getVal("pf-phone");
  const email    = getVal("pf-email");
  const address  = getVal("pf-address");
  const pw       = getVal("pf-password");
  const pw2      = getVal("pf-password2");
  const msgEl    = document.getElementById("profile-message");

  // ── Нэр заавал ──
  if (!name) {
    showMsg("Нэрийг оруулна уу", "error", msgEl);
    return;
  }

  // ── Нууц үг солих гэж байгаа бол шалгана ──
  if (pw || pw2) {
    if (pw.length < 6) {
      showMsg("Нууц үг дор хаяж 6 тэмдэгт байх ёстой", "error", msgEl);
      return;
    }
    if (pw !== pw2) {
      showMsg("Нууц үг таарахгүй байна", "error", msgEl);
      return;
    }
  }

  // ── Шинэчилсэн хэрэглэгч ──
  const updated = {
    ...session,
    name:     name,
    phone:    phone,
    email:    email,
    address:  address,
    password: pw ? pw : session.password,
  };

  updateUser(updated);
  fillDisplay(updated);

  // Нууц үг талбаруудыг цэвэрлэнэ
  document.getElementById("pf-password").value  = "";
  document.getElementById("pf-password2").value = "";

  showMsg("Амжилттай хадгаллаа ✓", "success", msgEl);

  // Header-г шинэчлэхийн тулд event явуулна
  window.dispatchEvent(new CustomEvent("c4c:sessionUpdated", { detail: updated }));
}

// ── Захиалгын түүх ──
function loadOrders(user) {
  const listEl = document.getElementById("profile-orders-list");
  if (!listEl) return;

  // localStorage-аас хэрэглэгчийн захиалгууд
  const orders = getUserOrders(user.id);

  // data.json-оос энэ хэрэглэгчийн track record-ууд
  const phone = user.phone;

  if (phone) {
    // Track data-г fetch хийж харуулна
    fetch("./data/data.json")
      .then(function(r) { return r.json(); })
      .then(function(data) {
        // Энэ хэрэглэгчийн утасны дугаараар шүүнэ
        const myShipments = data.filter(function(item) {
          return (item.customer?.phone || "").replace(/\D/g, "") === phone.replace(/\D/g, "");
        });

        renderOrders(listEl, myShipments, orders);
      })
      .catch(function() {
        renderOrders(listEl, [], orders);
      });
  } else {
    renderOrders(listEl, [], orders);
  }
}

// ── Захиалгуудыг HTML болгох ──
function renderOrders(el, shipments, formOrders) {
  // Статусийн өнгө
  const statusColor = {
    "Захиалга үүсгэсэн": "#94a3b8",
    "Хятадын агуулахад": "#f59e0b",
    "Замын Үүд дээр":    "#3b82f6",
    "Улаанбаатарт ирсэн":"#8b5cf6",
    "Олгогдсон":          "#22c55e",
  };

  let html = "";

  // ── Ачааны мэдээлэл (track) ──
  if (shipments.length > 0) {
    html += `<h4 class="profile-orders-subtitle">Ачааны мэдээлэл</h4>`;
    html += shipments.map(function(s) {
      const status = s.shipping?.status || "Тодорхойгүй";
      const color  = statusColor[status] || "#94a3b8";
      const history = (s.shipping?.statusHistory || []);

      const historyHTML = history.map(function(h) {
        return `
          <li class="order-history-item">
            <span class="order-history-dot" style="background:${statusColor[h.status] || '#94a3b8'}"></span>
            <span>${h.status}</span>
            <span class="order-history-date">${h.date}</span>
          </li>
        `;
      }).join("");

      return `
        <article class="profile-order-card">
          <div class="profile-order-header">
            <strong class="profile-order-code">${s.trackCode}</strong>
            <span class="profile-order-status" style="color:${color}">${status}</span>
          </div>
          <div class="profile-order-meta">
            <span>${s.package?.description || ""}</span>
            <span>${s.package?.weight || 0} кг</span>
            <span>${(s.payment?.price || 0).toLocaleString("mn-MN")} ₮</span>
          </div>
          ${history.length > 0 ? `
            <details class="profile-order-history">
              <summary>Статусын түүх</summary>
              <ul class="order-history-list">${historyHTML}</ul>
            </details>
          ` : ""}
        </article>
      `;
    }).join("");
  }

  // ── Форм захиалгууд (create-order-оор үүсгэсэн) ──
  if (formOrders.length > 0) {
    html += `<h4 class="profile-orders-subtitle">Миний захиалгууд</h4>`;
    html += formOrders.map(function(o) {
      return `
        <article class="profile-order-card">
          <div class="profile-order-header">
            <strong class="profile-order-code">#${o.id}</strong>
            <span class="profile-order-date">${o.createdAt}</span>
          </div>
          <div class="profile-order-meta">
            <span>${(o.items || []).length} бараа</span>
          </div>
        </article>
      `;
    }).join("");
  }

  if (!html) {
    html = `<p class="profile-muted">Захиалгын түүх олдсонгүй.</p>`;
  }

  el.innerHTML = html;
}

// ── Мессеж харуулах ──
function showMsg(text, type, el) {
  if (!el) return;
  el.textContent = text;
  el.className   = "profile-message profile-message--" + type;

  // 3 секундийн дараа арилна
  setTimeout(function() {
    el.textContent = "";
    el.className   = "profile-message";
  }, 3000);
}