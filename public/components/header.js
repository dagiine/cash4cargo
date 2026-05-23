import { getSession, saveSession, authAPI } from "../js/api.js";

const NAV_ICONS = {
  "#/"              : "home",
  "#/track"         : "search",
  "#/create-order" : "add",
  "#/support"      : "help",
  "#/about-us"     : "groups",
  "#/profile"      : "account_circle"
};

/* =========================================
   Navigation menu үүсгэх
========================================= */
function buildNav(routes, currentHash) {
  let html = "";

  routes.forEach(function(route) {
    const isActive = route.lnk === currentHash;
    const icon = NAV_ICONS[route.lnk] || "circle";
    const isCreate = route.lnk === "#/create-order";

    html += `
      <li class="${isCreate ? "nav-create" : ""}">
        <a href="${route.lnk}" class="${isActive ? "active" : ""}">
          <span class="nav-icon material-symbols-outlined">${icon}</span>
          <span class="nav-label">${route.item}</span>
        </a>
      </li>
    `;
  });

  return html;
}

/* =========================================
   Header render хийх
========================================= */
export function renderHeader(routes, currentHash) {
  const session = getSession();
  const loggedIn = !!session;
  const logoLink = loggedIn ? "#/track" : "#/";

  const authButton = loggedIn
    ? `
      <a href="#/profile" class="user-info profile-shortcut ${currentHash === "#/profile" ? "active" : ""}" aria-label="Профайл руу очих">
        <span class="material-symbols-outlined signin-icon">account_circle</span>
        <span class="user-name">${session.user?.name || "Хэрэглэгч"}</span>
      </a>
    `
    : `
      <label for="signin-toggle" class="signin-open-btn">
        <span class="material-symbols-outlined signin-icon">person</span>
        <span class="signin-text">Нэвтрэх</span>
      </label>
    `;

  return `
    <input type="checkbox" id="call-toggle" hidden />
    <input type="checkbox" id="signin-toggle" hidden />

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
        <label for="call-toggle" class="header-call-btn">
          <span class="material-symbols-outlined">call</span>
          <span class="call-btn-text">Холбоо барих</span>
        </label>

        ${authButton}
      </section>
    </header>

    <label for="call-toggle" class="call-backdrop"></label>

    <aside class="call-panel">
      <label for="call-toggle" class="call-close">
        <span class="material-symbols-outlined">close</span>
      </label>

      <h2>Холбоо барих</h2>

      <article class="call-card">
        <div class="call-info">
          <strong>УБ салбар</strong>
          <span>+976 9944 7176</span>
        </div>
        <a href="tel:+97699447176" class="call-link">
          <span class="material-symbols-outlined">call</span>
        </a>
      </article>

      <article class="call-card">
        <div class="call-info">
          <strong>Эрээн агуулах</strong>
          <span>+86 175 4755 8506</span>
        </div>
        <a href="weixin://dl/chat" class="call-link">
          <span class="material-symbols-outlined">sms</span>
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

    ${loggedIn ? "" : `
    <div class="signin-panel">
      <label for="signin-toggle" class="signin-close">
        <span class="material-symbols-outlined">close</span>
      </label>

      <form id="signin-form">
        <h2>Нэвтрэх</h2>
        <p id="signin-message" class="signin-message"></p>

        <input id="signin-value" type="text" placeholder="Имэйл эсвэл утасны дугаар" />
        <input id="signin-password" type="password" placeholder="Нууц үг" />

        <button type="submit" class="signin-btn">Нэвтрэх</button>
        <a href="#" class="signin-forgot">Нууц үгээ мартсан?</a>

        <hr />

        <button type="button" class="signin-create" id="show-register-btn">
          Шинэ хаяг үүсгэх
        </button>
      </form>

      <form id="register-form" style="display: none;">
        <h2>Шинэ хаяг үүсгэх</h2>
        <p id="register-message" class="signin-message"></p>

        <input id="register-name" type="text" placeholder="Нэр" />
        <input id="register-phone" type="text" placeholder="Утасны дугаар" />
        <input id="register-password" type="password" placeholder="Нууц үг" />

        <button type="submit" class="signin-btn">Бүртгүүлэх</button>
        <button type="button" class="signin-create" id="show-login-btn">
          Нэвтрэх рүү буцах
        </button>
      </form>
    </div>`}
  `;
}

export function renderSignin() {
  return "";
}

/* =========================================
   Sign in logic
========================================= */
export function initSignin() {
  const signinForm = document.querySelector("#signin-form");
  const registerForm = document.querySelector("#register-form");
  const panel = document.querySelector(".signin-panel");
  const signinMessage = document.querySelector("#signin-message");
  const registerMessage = document.querySelector("#register-message");
  const signinToggle = document.querySelector("#signin-toggle");
  const callToggle = document.querySelector("#call-toggle");
  const showRegisterBtn = document.querySelector("#show-register-btn");
  const showLoginBtn = document.querySelector("#show-login-btn");

  if (signinToggle) {
    signinToggle.addEventListener("change", function() {
      if (signinToggle.checked && callToggle) callToggle.checked = false;
    });
  }

  if (callToggle) {
    callToggle.addEventListener("change", function() {
      if (callToggle.checked && signinToggle) signinToggle.checked = false;
    });
  }

  if (showRegisterBtn) {
    showRegisterBtn.addEventListener("click", function() {
      signinForm.style.display = "none";
      registerForm.style.display = "block";
      clearMessage(signinMessage);
      clearMessage(registerMessage);
    });
  }

  if (showLoginBtn) {
    showLoginBtn.addEventListener("click", function() {
      registerForm.style.display = "none";
      signinForm.style.display = "block";
      clearMessage(signinMessage);
      clearMessage(registerMessage);
    });
  }

  if (signinForm) {
    signinForm.addEventListener("submit", async function(e) {
      e.preventDefault();

      const value = document.querySelector("#signin-value").value.trim();
      const password = document.querySelector("#signin-password").value.trim();
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      const isPhone = /^[6-9]\d{7}$/.test(value);

      if (!value || !password) return showMessage(signinMessage, panel, "Бүх талбарыг бөглөнө үү", "error");
      if (!isEmail && !isPhone) return showMessage(signinMessage, panel, "Имэйл эсвэл утасны дугаар буруу байна", "error");
      if (password.length < 6) return showMessage(signinMessage, panel, "Нууц үг дор хаяж 6 тэмдэгт байна", "error");

      try {
        const data = await authAPI.login(value.replace(/\D/g, ""), password);
        saveSession(data.token, data.user);

        if (data.user && data.user.role === "admin") {
          localStorage.setItem("cash4cargo_admin_token", data.token);
          showMessage(signinMessage, panel, "Admin эрхээр нэвтэрлээ", "success");
          setTimeout(function() { window.location.href = "/admin"; }, 500);
          return;
        }

        showMessage(signinMessage, panel, "Амжилттай нэвтэрлээ", "success");
        setTimeout(function() {
          signinToggle.checked = false;
          signinForm.reset();
          clearMessage(signinMessage);
          window.location.hash = "#/track";
          window.location.reload();
        }, 700);
      } catch (err) {
        showMessage(signinMessage, panel, err.message, "error");
      }
    });
  }

  if (registerForm) {
    registerForm.addEventListener("submit", async function(e) {
      e.preventDefault();

      const name = document.querySelector("#register-name").value.trim();
      const phone = document.querySelector("#register-phone").value.trim();
      const password = document.querySelector("#register-password").value.trim();

      if (!name || !phone || !password) return showMessage(registerMessage, panel, "Бүх талбарыг бөглөнө үү", "error");
      if (!/^[6-9]\d{7}$/.test(phone)) return showMessage(registerMessage, panel, "Утасны дугаар буруу байна", "error");
      if (password.length < 6) return showMessage(registerMessage, panel, "Нууц үг дор хаяж 6 тэмдэгт байна", "error");

      try {
        const data = await authAPI.register(name, phone, password);
        saveSession(data.token, data.user);
        showMessage(registerMessage, panel, "Бүртгэл амжилттай үүслээ", "success");
        setTimeout(function() {
          registerForm.reset();
          clearMessage(registerMessage);
          signinToggle.checked = false;
          window.location.hash = "#/track";
          window.location.reload();
        }, 700);
      } catch (err) {
        showMessage(registerMessage, panel, err.message, "error");
      }
    });
  }
}

function showMessage(message, panel, text, type) {
  if (!message) return;
  message.textContent = text;
  message.classList.add("show");

  if (type === "error") {
    message.style.color = "var(--color--error, #ef4444)";
    panel?.classList.remove("signin-shake");
    if (panel) void panel.offsetWidth;
    panel?.classList.add("signin-shake");
  }

  if (type === "success") {
    message.style.color = "var(--color--success, #22c55e)";
  }
}

function clearMessage(message) {
  if (!message) return;
  message.textContent = "";
  message.classList.remove("show");
}
