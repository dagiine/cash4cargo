// components/header.js
// Navigation header, холбоо барих panel, нэвтрэх / профайл

import { getSession, clearSession, login, register } from "../js/auth.js";

const NAV_ICONS = {
  "#/"            : "home",
  "#/track"       : "search",
  "#/create-order": "edit_square",
  "#/support"     : "help",
  "#/about-us"    : "info",
  "#/profile"     : "account_circle",
};

function buildNav(routes, currentHash) {
  let html = "";

  routes.forEach(function(route) {
    const isActive    = route.lnk === currentHash;
    const activeClass = isActive ? ' class="active"' : "";
    const icon        = NAV_ICONS[route.lnk] || "circle";

    html += `
      <li>
        <a href="${route.lnk}"${activeClass}>
          <span class="nav-icon material-symbols-outlined">${icon}</span>
          <span class="nav-label">${route.item}</span>
        </a>
      </li>
    `;
  });

  return html;
}

export function renderHeader(routes, currentHash) {
  return `
    <header>
      <a href="#/" class="logo">
        <span class="logo-icon">
          <img src="./pics/logo.png" alt="Cash 4 Cargo Logo" />
        </span>
        Cash 4 Cargo
      </a>

      <nav>
        <ul>
          ${buildNav(routes, currentHash)}
        </ul>
      </nav>

      <section class="header-actions">
        <input type="checkbox" id="call-toggle" hidden />

        <label for="call-toggle" class="header-call-btn">
          <span class="material-symbols-outlined">call</span>
          <span>Холбоо барих</span>
        </label>

        <aside class="call-panel">
          <h2>Холбоо барих</h2>

          <article class="call-card">
            <div class="call-info">
              <strong>УБ салбар</strong>
              <span>+976 9944 7176</span>
            </div>
            <a href="tel:+97699447176" class="call-link" aria-label="УБ салбар руу залгах">
              <span class="material-symbols-outlined">call</span>
            </a>
          </article>

          <article class="call-card">
            <div class="call-info">
              <strong>Эрээн агуулах</strong>
              <span>+86 175 4755 8506</span>
            </div>
            <a href="tel:+8617547558506" class="call-link" aria-label="Эрээн агуулах руу залгах">
              <span class="material-symbols-outlined">call</span>
            </a>
          </article>

          <article class="call-card">
            <div class="call-info">
              <strong>Жолооч</strong>
              <span>+976 9911 2233</span>
            </div>
            <a href="tel:+97699112233" class="call-link" aria-label="Жолооч руу залгах">
              <span class="material-symbols-outlined">call</span>
            </a>
          </article>
        </aside>

        <!-- Нэвтэрсэн бол профайл товч, үгүй бол нэвтрэх товч -->
        <div id="header-auth-btn">
          ${renderAuthBtn()}
        </div>
      </section>
    </header>
  `;
}

// ── Нэвтэрсэн эсэхийг шалгаж товч render хийх ──
function renderAuthBtn() {
  const session = getSession();

  if (session) {
    // Нэвтэрсэн → Профайл товч
    return `
      <a href="#/profile" class="btn signin-open-btn profile-header-btn">
        <span class="material-symbols-outlined">account_circle</span>
        <span>${session.name || "Профайл"}</span>
      </a>
    `;
  }

  // Нэвтрээгүй → Нэвтрэх товч
  return `<label for="signin-toggle" class="btn signin-open-btn">Нэвтрэх</label>`;
}

// ── Нэвтрэх panel (signin) ──
export function renderSignin() {
  const session = getSession();

  // Нэвтэрсэн бол panel харуулахгүй
  if (session) return "";

  return `
    <div class="signin-panel">
      <label for="signin-toggle" class="signin-close">
        <span class="material-symbols-outlined">close</span>
      </label>

      <!-- Нэвтрэх / Бүртгүүлэх tab -->
      <div class="signin-tabs">
        <button class="signin-tab active" data-tab="login">Нэвтрэх</button>
        <button class="signin-tab" data-tab="register">Бүртгүүлэх</button>
      </div>

      <!-- Нэвтрэх форм -->
      <form id="signin-login-form" class="signin-form">
        <p id="signin-message" class="signin-message"></p>

        <input type="text" id="signin-identifier" placeholder="Утасны дугаар эсвэл и-мэйл"/>
        <input type="password" id="signin-password" placeholder="Нууц үг"/>

        <button type="submit" class="signin-btn">Нэвтрэх</button>
        <a href="#" class="signin-forgot">Нууц үгээ мартсан?</a>
      </form>

      <!-- Бүртгүүлэх форм -->
      <form id="signin-register-form" class="signin-form" style="display:none">
        <p id="signin-reg-message" class="signin-message"></p>

        <input type="text" id="reg-name" placeholder="Таны нэр"/>
        <input type="text" id="reg-identifier" placeholder="Утасны дугаар эсвэл и-мэйл"/>
        <input type="password" id="reg-password" placeholder="Нууц үг (дор хаяж 6 тэмдэгт)"/>

        <button type="submit" class="signin-btn">Бүртгүүлэх</button>
      </form>
    </div>
  `;
}

// ── Нэвтрэх логикийг идэвхжүүлэх ──
export function initSignin() {
  const toggle     = document.querySelector("#signin-toggle");
  const callToggle = document.querySelector("#call-toggle");

  // call panel ба signin panel зэрэг нээгдэхгүй байх
  if (toggle && callToggle) {
    toggle.addEventListener("change", function() {
      if (toggle.checked) callToggle.checked = false;
    });
    callToggle.addEventListener("change", function() {
      if (callToggle.checked) toggle.checked = false;
    });
  }

  // ── Tab солих ──
  const tabs = document.querySelectorAll(".signin-tab");
  const loginForm    = document.getElementById("signin-login-form");
  const registerForm = document.getElementById("signin-register-form");

  tabs.forEach(function(tab) {
    tab.addEventListener("click", function() {
      tabs.forEach(function(t) { t.classList.remove("active"); });
      tab.classList.add("active");

      if (tab.dataset.tab === "login") {
        loginForm.style.display    = "";
        registerForm.style.display = "none";
      } else {
        loginForm.style.display    = "none";
        registerForm.style.display = "";
      }
    });
  });

  // ── Нэвтрэх submit ──
  if (loginForm) {
    loginForm.addEventListener("submit", function(e) {
      e.preventDefault();
      const identifier = document.getElementById("signin-identifier")?.value.trim();
      const password   = document.getElementById("signin-password")?.value.trim();
      const msgEl      = document.getElementById("signin-message");
      const panel      = document.querySelector(".signin-panel");

      if (!identifier || !password) {
        showSigninError("Бүх талбарыг бөглөнө үү", msgEl, panel);
        return;
      }

      const result = login(identifier, password);

      if (result.ok) {
        msgEl.textContent = "Амжилттай нэвтэрлээ ✓";
        msgEl.style.color = "var(--color--success)";

        setTimeout(function() {
          if (toggle) toggle.checked = false;
          loginForm.reset();
          msgEl.textContent = "";
          // Профайл товч шинэчлэх
          refreshAuthBtn();
        }, 800);
      } else {
        showSigninError(result.error, msgEl, panel);
      }
    });
  }

  // ── Бүртгүүлэх submit ──
  if (registerForm) {
    registerForm.addEventListener("submit", function(e) {
      e.preventDefault();
      const name       = document.getElementById("reg-name")?.value.trim();
      const identifier = document.getElementById("reg-identifier")?.value.trim();
      const password   = document.getElementById("reg-password")?.value.trim();
      const msgEl      = document.getElementById("signin-reg-message");
      const panel      = document.querySelector(".signin-panel");

      if (!name || !identifier || !password) {
        showSigninError("Бүх талбарыг бөглөнө үү", msgEl, panel);
        return;
      }
      if (password.length < 6) {
        showSigninError("Нууц үг дор хаяж 6 тэмдэгт байна", msgEl, panel);
        return;
      }

      const result = register(name, identifier, password);

      if (result.ok) {
        msgEl.textContent = "Бүртгэл амжилттай ✓";
        msgEl.style.color = "var(--color--success)";

        setTimeout(function() {
          if (toggle) toggle.checked = false;
          registerForm.reset();
          msgEl.textContent = "";
          refreshAuthBtn();
        }, 800);
      } else {
        showSigninError(result.error, msgEl, panel);
      }
    });
  }

  // ── Профайл session update event ──
  window.addEventListener("c4c:sessionUpdated", function(e) {
    refreshAuthBtn();
  });
}

// ── Auth товч шинэчлэх (нэвтрэлтийн дараа) ──
function refreshAuthBtn() {
  const el = document.getElementById("header-auth-btn");
  if (el) el.innerHTML = renderAuthBtn();
}

// ── Error харуулах ──
function showSigninError(text, msgEl, panel) {
  if (msgEl) {
    msgEl.textContent = text;
    msgEl.style.color = "var(--color--error)";
  }
  if (panel) {
    panel.classList.remove("signin-shake");
    void panel.offsetWidth;
    panel.classList.add("signin-shake");
  }
}