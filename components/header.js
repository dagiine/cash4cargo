const NAV_ICONS = {
  "#/"            : "home",
  "#/track"       : "search",
  "#/create-order": "edit_square",
  "#/support"     : "help",
  "#/about-us"    : "info"
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

        <label for="signin-toggle" class="btn signin-open-btn">Нэвтрэх</label>
      </section>
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

  const callToggle = document.querySelector("#call-toggle");

  if (toggle) {
    toggle.addEventListener("change", function () {
      if (toggle.checked && callToggle) {
        callToggle.checked = false;
      }
    });
  }

  if (callToggle) {
    callToggle.addEventListener("change", function () {
      if (callToggle.checked && toggle) {
        toggle.checked = false;
      }
    });
  }

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