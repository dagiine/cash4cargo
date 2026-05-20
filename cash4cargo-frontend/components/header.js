import { getSession, clearSession, saveSession, authAPI } from "../js/api.js";

const NAV_ICONS = {
  "#/"            : "home",
  "#/track"       : "search",
  "#/create-order": "edit_square",
  "#/support"     : "help",
  "#/about-us"    : "info",
  "#/profile"     : "account_circle",
};

function buildNav(routes, currentHash) {
  return routes.map((route) => {
    const isActive    = route.lnk === currentHash;
    const activeClass = isActive ? ' class="active"' : "";
    const icon        = NAV_ICONS[route.lnk] || "circle";
    return `
      <li>
        <a href="${route.lnk}"${activeClass}>
          <span class="nav-icon material-symbols-outlined">${icon}</span>
          <span class="nav-label">${route.item}</span>
        </a>
      </li>`;
  }).join("");
}

export function renderHeader(routes, currentHash) {
  const session = getSession();
  const loggedIn = !!session;

  const authSection = loggedIn
    ? `<a href="#/profile" class="user-info profile-shortcut" aria-label="Профайл руу очих">
         <span class="material-symbols-outlined">account_circle</span>
         <span class="user-name">${session.user.name}</span>
       </a>`
    : `<label for="signin-toggle" class="btn signin-open-btn">Нэвтрэх</label>`;

  const logoLink = loggedIn ? "#/track" : "#/";

  return `
    <header>
      <a href="${logoLink}" class="logo">
        <span class="logo-icon">
          <img src="./pics/logo.png" alt="Cash 4 Cargo Logo" />
        </span>
        Cash 4 Cargo
      </a>

      <nav>
        <ul>${buildNav(routes, currentHash)}</ul>
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
            <a href="tel:+8617547558506" class="call-link">
              <span class="material-symbols-outlined">call</span>
            </a>
          </article>
          <article class="call-card">
            <div class="call-info">
              <strong>Жолооч</strong>
              <span>+976 9911 2233</span>
            </div>
            <a href="tel:+97699112233" class="call-link">
              <span class="material-symbols-outlined">call</span>
            </a>
          </article>
        </aside>

        ${authSection}
      </section>
    </header>`;
}

export function renderSignin() {
  return `
    <div class="signin-panel">
      <label for="signin-toggle" class="signin-close">
        <span class="material-symbols-outlined">close</span>
      </label>

      <h2>Нэвтрэх</h2>

      <form id="signin-form">
        <p id="signin-message" class="signin-message"></p>

        <input id="signin-phone" type="text" placeholder="Утасны дугаар (99112233)"/>
        <input id="signin-password" type="password" placeholder="Нууц үг"/>

        <button type="submit" class="signin-btn">Нэвтрэх</button>
        <a href="#" class="signin-forgot">Нууц үгээ мартсан?</a>

        <hr/>

        <button type="button" class="signin-create" id="show-register-btn">
          Шинэ хаяг үүсгэх
        </button>
      </form>

      <!-- Бүртгэлийн форм (нуусан) -->
      <form id="register-form" style="display:none">
        <p id="register-message" class="signin-message"></p>

        <input id="reg-name"     type="text"     placeholder="Нэр"/>
        <input id="reg-phone"    type="text"     placeholder="Утасны дугаар (99112233)"/>
        <input id="reg-password" type="password" placeholder="Нууц үг (6+ тэмдэгт)"/>

        <button type="submit" class="signin-btn">Бүртгүүлэх</button>
        <button type="button" class="signin-create" id="show-login-btn">
          Нэвтрэх хуудас руу буцах
        </button>
      </form>
    </div>`;
}

export function initSignin() {
  const toggle      = document.querySelector("#signin-toggle");
  const callToggle  = document.querySelector("#call-toggle");
  const panel       = document.querySelector(".signin-panel");
  const signinForm  = document.querySelector("#signin-form");
  const registerForm= document.querySelector("#register-form");
  const signinMsg   = document.querySelector("#signin-message");
  const registerMsg = document.querySelector("#register-message");

  // Нэг нь нээлттэй бол нөгөөг хаана
  if (toggle && callToggle) {
    toggle.addEventListener("change", () => { if (toggle.checked) callToggle.checked = false; });
    callToggle.addEventListener("change", () => { if (callToggle.checked) toggle.checked = false; });
  }

  // Login ↔ Register солих
  document.querySelector("#show-register-btn")?.addEventListener("click", () => {
    signinForm.style.display   = "none";
    registerForm.style.display = "";
  });
  document.querySelector("#show-login-btn")?.addEventListener("click", () => {
    registerForm.style.display = "none";
    signinForm.style.display   = "";
  });

  // Logout товч
  document.querySelector("#logout-btn")?.addEventListener("click", () => {
    clearSession();
    window.location.hash = "#/";
    window.location.reload();
  });

  // ── Нэвтрэх ─────────────────────────────────────────────────
  signinForm?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const phone    = document.querySelector("#signin-phone")?.value.trim();
    const password = document.querySelector("#signin-password")?.value.trim();

    if (!phone || !password) {
      return showMsg(signinMsg, panel, "Бүх талбарыг бөглөнө үү", "error");
    }
    if (!/^[6-9]\d{7}$/.test(phone)) {
      return showMsg(signinMsg, panel, "Утасны дугаар буруу байна", "error");
    }
    if (password.length < 6) {
      return showMsg(signinMsg, panel, "Нууц үг дор хаяж 6 тэмдэгт байна", "error");
    }

    try {
      const data = await authAPI.login(phone, password);
      saveSession(data.token, data.user);
      showMsg(signinMsg, panel, "Амжилттай нэвтэрлээ ✓", "success");

      setTimeout(() => {
        if (toggle) toggle.checked = false;
        signinForm.reset();
        signinMsg.textContent = "";
        // Нэвтэрсний дараа track хуудас руу шилжинэ
        window.location.hash = "#/track";
        window.location.reload();
      }, 800);
    } catch (err) {
      showMsg(signinMsg, panel, err.message, "error");
    }
  });

  // ── Бүртгүүлэх ───────────────────────────────────────────────
  registerForm?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name     = document.querySelector("#reg-name")?.value.trim();
    const phone    = document.querySelector("#reg-phone")?.value.trim();
    const password = document.querySelector("#reg-password")?.value.trim();

    if (!name || !phone || !password) {
      return showMsg(registerMsg, panel, "Бүх талбарыг бөглөнө үү", "error");
    }
    if (!/^[6-9]\d{7}$/.test(phone)) {
      return showMsg(registerMsg, panel, "Утасны дугаар буруу байна", "error");
    }
    if (password.length < 6) {
      return showMsg(registerMsg, panel, "Нууц үг дор хаяж 6 тэмдэгт байна", "error");
    }

    try {
      const data = await authAPI.register(name, phone, password);
      saveSession(data.token, data.user);
      showMsg(registerMsg, panel, "Бүртгэл амжилттай ✓", "success");

      setTimeout(() => {
        if (toggle) toggle.checked = false;
        registerForm.reset();
        registerMsg.textContent = "";
        window.location.hash = "#/track";
        window.location.reload();
      }, 800);
    } catch (err) {
      showMsg(registerMsg, panel, err.message, "error");
    }
  });
}

function showMsg(el, panel, text, type) {
  if (!el) return;
  el.textContent = text;
  el.style.color = type === "error"
    ? "var(--color--error, #ef4444)"
    : "var(--color--success, #22c55e)";

  if (type === "error" && panel) {
    panel.classList.remove("signin-shake");
    void panel.offsetWidth;
    panel.classList.add("signin-shake");
  }
}
