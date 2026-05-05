// Icon map — route.lnk-тэй тохирч байна
const NAV_ICONS = {
  "#/"            : "home",
  "#/track"       : "search",
  "#/create-order": "edit_square",
  "#/pricing"     : "sell",
  "#/support"     : "help"
};

function buildNav(routes, currentHash) {
  let html = "";

  routes.forEach(function(route) {
    const isActive   = route.lnk === currentHash;
    const activeClass = isActive ? ' class="active"' : "";
    const icon       = NAV_ICONS[route.lnk] || "circle";

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

      <label for="signin-toggle" class="btn">Нэвтрэх</label>
    </header>
  `;
}

export function renderSignin() {
  return `
    <div class="signin-panel">
      <label for="signin-toggle" class="signin-close">
        <span class="material-symbols-outlined">close</span>
      </label>

      <h2>Нэвтрэх</h2>

      <form>
        <p id="signin-message" class="signin-message"></p>

        <input type="text" placeholder="Имэйл эсвэл утасны дугаар"/>
        <input type="password" placeholder="Нууц үг"/>
        
        <button type="submit" class="signin-btn">Нэвтрэх</button>
        <a href="#" class="signin-forgot">Нууц үгээ мартсан?</a>
        
        <hr/>
        
        <button type="button" class="signin-create">Шинэ хаяг үүсгэх</button>
      </form>
    </div>
  `;
}

export function initSignin() {
  const form = document.querySelector(".signin-panel form");
  const panel = document.querySelector(".signin-panel");
  const message = document.querySelector("#signin-message");
  const toggle = document.querySelector("#signin-toggle");

  if (!form) 
    return;

  form.addEventListener("submit", function (e) {
    // Form submit хийх үед хуудас refresh хийхгүй
    e.preventDefault();

    const value = form.querySelector("input[type='text']").value.trim();
    const password = form.querySelector("input[type='password']").value.trim();

    // ^[^\s@]+      → @-с өмнөх хэсэг (хэрэглэгчийн нэр)
    // @              → заавал @ тэмдэг
    // [^\s@]+       → домэйн нэр (gmail гэх мэт)
    // \.            → цэг
    // [^\s@]+$      → өргөтгөл (com, mn гэх мэт)
    let isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

    // 6,7,8,9-ээр эхэлсэн, 8 оронтой
    let isPhone = /^[6-9]\d{7}$/.test(value);
    let validPassword = password.length >= 6;

    if (!value || !password) {
      showError("Бүх талбарыг бөглөнө үү");
      return;
    }

    if (!isEmail && !isPhone) {
      showError("Имэйл эсвэл утасны дугаар буруу байна");
      return;
    }

    if (!validPassword) {
      showError("Нууц үг дор хаяж 6 тэмдэгт байна");
      return;
    }

    message.textContent = "Амжилттай нэвтэрлээ";
    message.style.color = "var(--color--success)";

    setTimeout(() => {
      toggle.checked = false;
      form.reset();
      message.textContent = "";
    }, 1000);

    function showError(text) {
      message.textContent = text;
      message.style.color = "var(--color--error)";

      panel.classList.remove("signin-shake");
      void panel.offsetWidth;
      panel.classList.add("signin-shake");
    }
  });
}