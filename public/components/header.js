// api.js файлаас хэрэгтэй function-уудыг import хийж байна.
// getSession  → localStorage/session-оос login хийсэн хэрэглэгчийн мэдээлэл авах
// saveSession → login/register амжилттай бол token болон user мэдээлэл хадгалах
// authAPI     → backend рүү login/register request явуулах object
import { getSession, saveSession, authAPI } from "../js/api.js";

// Navigation menu дээр харагдах link бүрт тохирох icon-уудыг хадгалж байна.
// key нь route буюу hash link.
// value нь Material Symbols icon-ийн нэр.
const NAV_ICONS = {
  "#/": "home",
  "#/track": "search",
  "#/create-order": "add",
  "#/support": "help",
  "#/about-us": "groups",
  "#/profile": "account_circle",
};

/* =========================================
   Navigation menu үүсгэх
========================================= */

// routes array ашиглаж navigation menu-ийн <li> item-уудыг үүсгэнэ.
// routes      → app.js эсвэл өөр файлаас ирсэн navigation route-ууд
// currentHash → одоо идэвхтэй байгаа page-ийн hash
function buildNav(routes, currentHash) {
  // Эцэст нь буцаах HTML string.
  let html = "";

  // routes array доторх route бүрээр давтана.
  routes.forEach(function (route) {
    // Одоогийн route идэвхтэй байгаа эсэхийг шалгана.
    // Хэрэв route.lnk нь currentHash-тэй тэнцүү бол active class авна.
    const isActive = route.lnk === currentHash;

    // Тухайн route-д тохирох icon авна.
    // NAV_ICONS дээр байхгүй бол default-аар circle icon авна.
    const icon = NAV_ICONS[route.lnk] || "circle";

    // Захиалга үүсгэх link мөн эсэхийг шалгана.
    // Ингэснээр create-order item дээр тусгай class өгч болно.
    const isCreate = route.lnk === "#/create-order";

    // Нэг navigation item-ийн HTML-ийг үүсгээд html дээр нэмнэ.
    html += `
      <li class="${isCreate ? "nav-create" : ""}">
        <a href="${route.lnk}" class="${isActive ? "active" : ""}">
          <span class="nav-icon material-symbols-outlined">${icon}</span>
          <span class="nav-label">${route.item}</span>
        </a>
      </li>
    `;
  });

  // Бүх navigation item-уудын HTML-ийг буцаана.
  return html;
}

/* =========================================
   Header render хийх
========================================= */

// Header HTML үүсгэнэ.
// Энд logo, navigation, холбоо барих popup, login/register popup байна.
// routes      → navigation menu-ийн жагсаалт
// currentHash → одоогийн page-ийн hash
export function renderHeader(routes, currentHash) {
  // Хэрэглэгч login хийсэн эсэхийг session-оос шалгана.
  const session = getSession();

  // session байвал loggedIn true болно.
  const loggedIn = !!session;

  // Login хийсэн хэрэглэгч logo дээр дарахад track page руу очно.
  // Login хийгээгүй хэрэглэгч logo дээр дарахад home page руу очно.
  const logoLink = loggedIn ? "#/track" : "#/";

  // Header-ийн баруун талд харагдах auth хэсгийг бэлдэнэ.
  // Login хийсэн бол profile shortcut харуулна.
  // Login хийгээгүй бол "Нэвтрэх" button харуулна.
  const authButton = loggedIn
    ? `
      <a
        href="#/profile"
        class="user-info profile-shortcut ${currentHash === "#/profile" ? "active" : ""}"
        aria-label="Профайл руу очих"
      >
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

  // Header-ийн бүтэн HTML-ийг буцаана.
  return `
    <!-- Checkbox ашиглаж popup/panel нээж хааж байна -->
    <!-- call-toggle checked бол холбоо барих panel нээгдэнэ -->
    <input type="checkbox" id="call-toggle" hidden />

    <!-- signin-toggle checked бол нэвтрэх panel нээгдэнэ -->
    <input type="checkbox" id="signin-toggle" hidden />

    <header>
      <!-- Logo хэсэг -->
      <a href="${logoLink}" class="logo">
        <span class="logo-icon">
          <img src="./pics/logo.png" alt="Cash 4 Cargo Logo" />
        </span>
        Cash 4 Cargo
      </a>

      <!-- Navigation menu -->
      <nav>
        <ul>${buildNav(routes, currentHash)}</ul>
      </nav>

      <!-- Header-ийн баруун талын action button-ууд -->
      <section class="header-actions">
        <!-- Холбоо барих panel нээх button -->
        <label for="call-toggle" class="header-call-btn">
          <span class="material-symbols-outlined">call</span>
          <span class="call-btn-text">Холбоо барих</span>
        </label>

        <!-- Login эсвэл profile button -->
        ${authButton}
      </section>
    </header>

    <!-- Холбоо барих panel-ийн backdrop -->
    <!-- Үүн дээр дарахад checkbox uncheck болж panel хаагдана -->
    <label for="call-toggle" class="call-backdrop"></label>

    <!-- Холбоо барих panel -->
    <aside class="call-panel">
      <!-- Panel хаах button -->
      <label for="call-toggle" class="call-close">
        <span class="material-symbols-outlined">close</span>
      </label>

      <h2>Холбоо барих</h2>

      <!-- УБ салбарын холбоо барих card -->
      <article class="call-card">
        <div class="call-info">
          <strong>УБ салбар</strong>
          <span>+976 9944 7176</span>
        </div>

        <a href="tel:+97699447176" class="call-link">
          <span class="material-symbols-outlined">call</span>
        </a>
      </article>

      <!-- Эрээн агуулахын холбоо барих card -->
      <article class="call-card">
        <div class="call-info">
          <strong>Эрээн агуулах</strong>
          <span>WeChat: +86 175 4755 8506</span>
        </div>

        <a
          href="weixin://dl/chat"
          class="call-link"
          title="WeChat-аар холбогдох"
          aria-label="Эрээн агуулахтай WeChat-аар холбогдох"
        >
          <span class="material-symbols-outlined">sms</span>
        </a>
      </article>

      <!-- Жолоочийн холбоо барих card -->
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

    <!-- Хэрэглэгч login хийгээгүй үед л signin/register panel харуулна -->
    ${
      loggedIn
        ? ""
        : `
    <div class="signin-panel">
      <!-- Login/Register panel хаах button -->
      <label for="signin-toggle" class="signin-close">
        <span class="material-symbols-outlined">close</span>
      </label>

      <!-- Login form -->
      <form id="signin-form">
        <h2>Нэвтрэх</h2>

        <!-- Login үед алдаа эсвэл амжилтын message энд гарна -->
        <p id="signin-message" class="signin-message"></p>

        <input id="signin-value" type="text" placeholder="Имэйл эсвэл утасны дугаар" />
        <input id="signin-password" type="password" placeholder="Нууц үг" />

        <button type="submit" class="signin-btn">Нэвтрэх</button>
        <a href="#" class="signin-forgot">Нууц үгээ мартсан?</a>

        <hr />

        <!-- Register form руу шилжих button -->
        <button type="button" class="signin-create" id="show-register-btn">
          Шинэ хаяг үүсгэх
        </button>
      </form>

      <!-- Register form -->
      <!-- Эхэндээ display: none; байгаа тул харагдахгүй -->
      <form id="register-form" style="display: none;">
        <h2>Шинэ хаяг үүсгэх</h2>

        <!-- Register үед алдаа эсвэл амжилтын message энд гарна -->
        <p id="register-message" class="signin-message"></p>

        <input id="register-name" type="text" placeholder="Нэр" />
        <input id="register-phone" type="text" placeholder="Утасны дугаар" />
        <input id="register-password" type="password" placeholder="Нууц үг" />

        <button type="submit" class="signin-btn">Бүртгүүлэх</button>

        <!-- Login form руу буцах button -->
        <button type="button" class="signin-create" id="show-login-btn">
          Нэвтрэх рүү буцах
        </button>
      </form>
    </div>`
    }
  `;
}

// Одоогоор тусдаа signin render ашиглахгүй байгаа тул хоосон string буцааж байна.
// Хэрэв дараа нь signin panel-ийг тусдаа component болговол энд HTML бичиж болно.
export function renderSignin() {
  return "";
}

/* =========================================
   Sign in logic
========================================= */

// Login/register panel-ийн event listener-үүдийг ажиллуулах function.
// renderHeader() ажилласны дараа энэ function-г дуудах хэрэгтэй.
export function initSignin() {
  // Login form-ийг DOM-оос олж авна.
  const signinForm = document.querySelector("#signin-form");

  // Register form-ийг DOM-оос олж авна.
  const registerForm = document.querySelector("#register-form");

  // Panel-ийг DOM-оос олж авна.
  const panel = document.querySelector(".signin-panel");

  // Login message гаргах element.
  const signinMessage = document.querySelector("#signin-message");

  // Register message гаргах element.
  const registerMessage = document.querySelector("#register-message");

  // Login panel нээж/хаах checkbox.
  const signinToggle = document.querySelector("#signin-toggle");

  // Холбоо барих panel нээж/хаах checkbox.
  const callToggle = document.querySelector("#call-toggle");

  // Register form руу шилжих button.
  const showRegisterBtn = document.querySelector("#show-register-btn");

  // Login form руу буцах button.
  const showLoginBtn = document.querySelector("#show-login-btn");

  // Хэрэв signin panel нээгдсэн бол call panel-ийг хаана.
  // Ингэснээр хоёр panel зэрэг нээгдэхгүй.
  if (signinToggle) {
    signinToggle.addEventListener("change", function () {
      if (signinToggle.checked && callToggle) callToggle.checked = false;
    });
  }

  // Хэрэв call panel нээгдсэн бол signin panel-ийг хаана.
  if (callToggle) {
    callToggle.addEventListener("change", function () {
      if (callToggle.checked && signinToggle) signinToggle.checked = false;
    });
  }

  // "Шинэ хаяг үүсгэх" button дарахад register form харуулна.
  if (showRegisterBtn) {
    showRegisterBtn.addEventListener("click", function () {
      signinForm.style.display = "none";
      registerForm.style.display = "block";

      // Хуучин message-үүдийг цэвэрлэнэ.
      clearMessage(signinMessage);
      clearMessage(registerMessage);
    });
  }

  // "Нэвтрэх рүү буцах" button дарахад login form харуулна.
  if (showLoginBtn) {
    showLoginBtn.addEventListener("click", function () {
      registerForm.style.display = "none";
      signinForm.style.display = "block";

      // Хуучин message-үүдийг цэвэрлэнэ.
      clearMessage(signinMessage);
      clearMessage(registerMessage);
    });
  }

  // Login form байвал submit event listener нэмнэ.
  if (signinForm) {
    signinForm.addEventListener("submit", async function (e) {
      // Form submit хийх үед page refresh болохоос сэргийлнэ.
      e.preventDefault();

      // Login input-уудаас value авна.
      const value = document.querySelector("#signin-value").value.trim();
      const password = document.querySelector("#signin-password").value.trim();

      // Email format зөв эсэхийг шалгана.
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

      // Монгол утасны дугаар зөв эсэхийг шалгана.
      const isPhone = /^[6-9]\d{7}$/.test(value);

      // Хоосон талбар байвал error message харуулна.
      if (!value || !password) {
        return showMessage(signinMessage, panel, "Бүх талбарыг бөглөнө үү", "error");
      }

      // Email эсвэл phone аль нэг нь зөв format-тай байх ёстой.
      if (!isEmail && !isPhone) {
        return showMessage(signinMessage, panel, "Имэйл эсвэл утасны дугаар буруу байна", "error");
      }

      // Нууц үг дор хаяж 6 тэмдэгттэй байх ёстой.
      if (password.length < 6) {
        return showMessage(signinMessage, panel, "Нууц үг дор хаяж 6 тэмдэгт байна", "error");
      }

      try {
        // Backend рүү login request явуулна.
        // value.replace(/\D/g, "") нь утасны дугаараас тэмдэгтүүдийг цэвэрлэнэ.
        const data = await authAPI.login(value.replace(/\D/g, ""), password);

        // Login амжилттай бол token болон user мэдээллийг хадгална.
        saveSession(data.token, data.user);

        // Хэрэв admin хэрэглэгч бол admin token хадгалаад /admin page руу явуулна.
        if (data.user && data.user.role === "admin") {
          localStorage.setItem("cash4cargo_admin_token", data.token);
          showMessage(signinMessage, panel, "Admin эрхээр нэвтэрлээ", "success");

          setTimeout(function () {
            window.location.href = "/admin";
          }, 500);

          return;
        }

        // Энгийн хэрэглэгч амжилттай нэвтэрсэн message.
        showMessage(signinMessage, panel, "Амжилттай нэвтэрлээ", "success");

        // Бага зэрэг хүлээгээд panel хааж, track page руу шилжинэ.
        setTimeout(function () {
          signinToggle.checked = false;
          signinForm.reset();
          clearMessage(signinMessage);
          window.location.hash = "#/track";
          window.location.reload();
        }, 700);
      } catch (err) {
        // Backend-ээс ирсэн error message-г харуулна.
        showMessage(signinMessage, panel, err.message, "error");
      }
    });
  }

  // Register form байвал submit event listener нэмнэ.
  if (registerForm) {
    registerForm.addEventListener("submit", async function (e) {
      // Form submit хийх үед page refresh болохоос сэргийлнэ.
      e.preventDefault();

      // Register input-уудаас value авна.
      const name = document.querySelector("#register-name").value.trim();
      const phone = document.querySelector("#register-phone").value.trim();
      const password = document.querySelector("#register-password").value.trim();

      // Хоосон талбар байвал error message харуулна.
      if (!name || !phone || !password) {
        return showMessage(registerMessage, panel, "Бүх талбарыг бөглөнө үү", "error");
      }

      // Утасны дугаар зөв format-тай эсэхийг шалгана.
      if (!/^[6-9]\d{7}$/.test(phone)) {
        return showMessage(registerMessage, panel, "Утасны дугаар буруу байна", "error");
      }

      // Нууц үг дор хаяж 6 тэмдэгттэй байх ёстой.
      if (password.length < 6) {
        return showMessage(registerMessage, panel, "Нууц үг дор хаяж 6 тэмдэгт байна", "error");
      }

      try {
        // Backend рүү register request явуулна.
        const data = await authAPI.register(name, phone, password);

        // Register амжилттай бол token болон user мэдээллийг хадгална.
        saveSession(data.token, data.user);

        // Амжилтын message харуулна.
        showMessage(registerMessage, panel, "Бүртгэл амжилттай үүслээ", "success");

        // Бага зэрэг хүлээгээд panel хааж, track page руу шилжинэ.
        setTimeout(function () {
          registerForm.reset();
          clearMessage(registerMessage);
          signinToggle.checked = false;
          window.location.hash = "#/track";
          window.location.reload();
        }, 700);
      } catch (err) {
        // Backend-ээс ирсэн error message-г харуулна.
        showMessage(registerMessage, panel, err.message, "error");
      }
    });
  }
}

// Login/register panel дээр message харуулах helper function.
// message → message бичих <p>
// panel   → signin panel, error үед shake animation хийхэд ашиглана
// text    → харуулах message
// type    → "error" эсвэл "success"
function showMessage(message, panel, text, type) {
  // message element байхгүй бол function зогсоно.
  if (!message) return;

  // Message text-ийг оруулна.
  message.textContent = text;

  // show class нэмснээр CSS дээр харагддаг болно.
  message.classList.add("show");

  // Error message бол улаан өнгө өгч panel shake animation ажиллуулна.
  if (type === "error") {
    message.style.color = "var(--color--error, #ef4444)";

    // Хуучин shake class-ийг авна.
    panel?.classList.remove("signin-shake");

    // Animation дахин ажиллуулахын тулд browser repaint force хийж байна.
    if (panel) void panel.offsetWidth;

    // Shake animation class нэмнэ.
    panel?.classList.add("signin-shake");
  }

  // Success message бол ногоон өнгө өгнө.
  if (type === "success") {
    message.style.color = "var(--color--success, #22c55e)";
  }
}

// Message-г цэвэрлэх helper function.
function clearMessage(message) {
  // message element байхгүй бол function зогсоно.
  if (!message) return;

  // Text-ийг хоосолно.
  message.textContent = "";

  // show class-ийг авснаар CSS дээр нууж болно.
  message.classList.remove("show");
}