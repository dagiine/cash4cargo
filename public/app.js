// renderHeader → header HTML үүсгэнэ.
// renderSignin → signin хэсгийг буцаана. Одоогоор хоосон string буцаадаг.
// initSignin   → login/register form-ийн event listener-үүдийг ажиллуулна.
import { renderHeader, renderSignin, initSignin } from "./components/header.js";

import { renderFooter } from "./components/footer.js";

// Web component-уудыг import хийж байна.
// Эдгээрийг import хийснээр browser дээр custom element-үүд бүртгэгдэнэ.
import "./components/status-badge.js";
import "./components/faq-item.js";
import "./components/order-card.js";

// api.js файлаас login хийсэн эсэхийг шалгах function import хийж байна.
import { isLoggedIn } from "./js/api.js";

// Сайтын route буюу page-үүдийн тохиргоо.
// item       → navigation дээр харагдах нэр
// lnk        → hash link
// component  → pages folder доторх JS file-ийн нэр
// mainClass  → тухайн page-ийн <main> дээр нэмэгдэх class
// private    → login шаардлагатай page эсэх
// hideFromNav → navigation дээр харуулахгүй байх эсэх
const routes = [
  {
    item: "Нүүр",
    lnk: "#/",
    component: "home",
    mainClass: "home-main home",
  },

  {
    item: "Захиалга хянах",
    lnk: "#/track",
    component: "track",
    mainClass: "track-main",
  },

  {
    item: "Захиалга үүсгэх",
    lnk: "#/create-order",
    component: "create-order",
    mainClass: "",
  },

  {
    item: "Профайл",
    lnk: "#/profile",
    component: "profile",
    mainClass: "profile-main",

    // private true тул зөвхөн login хийсэн хэрэглэгч орж болно.
    private: true,

    // Profile page navigation menu дээр шууд харагдахгүй.
    // Харин login хийсэн үед header дээр user/profile shortcut-аар орно.
    hideFromNav: true,
  },

  {
    item: "Тусламж",
    lnk: "#/support",
    component: "support",
    mainClass: "support-main",
  },

  {
    item: "Бидний тухай",
    lnk: "#/about-us",
    component: "about-us",
    mainClass: "",
  },
];

// Тухайн page-д хэрэгтэй CSS file-ийг ачаалах function.
// Жишээ: page = "home" бол ./css/home.css ачаална.
function loadCSS(page) {
  // Өмнө нь ачаалсан page-specific CSS байвал устгана.
  // Ингэхгүй бол өөр page-ийн CSS давхар нөлөөлж магадгүй.
  document.querySelector("#page-css")?.remove();

  // Шинэ <link> tag үүсгэнэ.
  const link = document.createElement("link");

  // Энэ нь stylesheet гэдгийг заана.
  link.rel = "stylesheet";

  // CSS file-ийн замыг тохируулна.
  link.href = `./css/${page}.css`;

  // Дараа нь устгахын тулд id өгч байна.
  link.id = "page-css";

  // <head> дотор CSS link-ийг нэмнэ.
  document.head.appendChild(link);
}

// Зарим page-д нэмэлт CSS хэрэгтэй үед ашиглах function.
// Одоогоор зөвхөн track page дээр track-results.css нэмэлтээр ачаалж байна.
function loadExtraCSS(page) {
  // Өмнө нь ачаалсан extra CSS байвал устгана.
  document.querySelector("#page-extra-css")?.remove();

  // Track page дээр tracking result card/timeline-ийн CSS нэмэлтээр хэрэгтэй.
  if (page === "track") {
    const link = document.createElement("link");

    link.rel = "stylesheet";
    link.href = "./css/track-results.css";
    link.id = "page-extra-css";

    document.head.appendChild(link);
  }
}

// Тухайн page-д хэрэгтэй нэмэлт JS logic-ийг ачаалах function.
// Dynamic import ашиглаж байгаа тул зөвхөн тухайн page орсон үед JS нь ачаална.
async function loadPageJS(page) {
  try {
    // Support page дээр FAQ/search logic ажиллуулна.
    if (page === "support") {
      const module = await import("./js/initSupportSearch.js");
      module.initSupportSearch?.();
    }

    // Track page дээр tracking form/result logic ажиллуулна.
    if (page === "track") {
      const module = await import("./js/trackUI.js");

      // TrackUI class-аас object үүсгээд init function-г ажиллуулна.
      await new module.TrackUI().init();
    }

    // Home page дээр home tracking input болон address copy logic ажиллуулна.
    if (page === "home") {
      const module = await import("./js/initHomePage.js");

      // Home дээрээс tracking code/phone хайх logic.
      module.initHomeTracking?.();

      // Хаяг copy хийх logic.
      module.initAddressCopy?.();
    }

    // Create order page дээр захиалга үүсгэх form logic ажиллуулна.
    if (page === "create-order") {
      const module = await import("./js/initCreateOrder.js");
      module.initCreateOrder?.();
    }

    // Profile page дээр хэрэглэгчийн мэдээлэл/захиалгын logic ажиллуулна.
    if (page === "profile") {
      const module = await import("./js/initProfile.js");
      module.initProfile?.();
    }
  } catch (err) {
    // Page-ийн JS ачаалах үед алдаа гарвал console дээр харуулна.
    console.error(`${page} JS load error:`, err);
  }
}

// Browser-ийн hash-аас тохирох route-ийг олно.
// Жишээ: "#/track?code=MN-12345" байсан ч зөвхөн "#/track" хэсгийг ашиглана.
function getRouteFromHash(hash) {
  // Query хэсгийг салгаж авна.
  const cleanHash = hash.split("?")[0];

  // routes array дотроос cleanHash-тэй таарах route хайна.
  // Олдохгүй бол default-аар routes[0] буюу home page-ийг буцаана.
  return routes.find((r) => r.lnk === cleanHash) || routes[0];
}

// Бүх page-ийг render хийх гол function.
// Hash өөрчлөгдөх бүрт энэ function дахин ажиллана.
async function render() {
  // Одоогийн browser hash-ийг авна.
  // Хэрэв hash байхгүй бол default-аар "#/" буюу home page.
  const hash = document.location.hash || "#/";

  // Query хэсгийг салгаж цэвэр hash авна.
  const cleanHash = hash.split("?")[0];

  // Хэрэв хэрэглэгч login хийсэн байхад Нүүр page руу орвол
  // шууд Захиалга хянах page руу шилжүүлнэ.
  if (cleanHash === "#/" && isLoggedIn()) {
    window.location.hash = "#/track";
    return;
  }

  // Одоогийн hash-д тохирох route-ийг авна.
  const route = getRouteFromHash(hash);

  // Хэрэв private page руу login хийгээгүй хэрэглэгч орох гэж байвал
  // home page руу буцаана.
  if (route.private && !isLoggedIn()) {
    window.location.hash = "#/";
    return;
  }

  // Header дээр харагдах route-уудыг шүүнэ.
  const headerRoutes = routes.filter((route) => {
    // hideFromNav true бол menu дээр харуулахгүй.
    if (route.hideFromNav) return false;

    // Login хийсэн үед Нүүр link-ийг menu дээрээс нууж байна.
    if (isLoggedIn() && route.item === "Нүүр") return false;

    // Бусад route-уудыг харуулна.
    return true;
  });

  // #app дотор header, main, footer-ийг зурна.
  document.querySelector("#app").innerHTML = `
    <!-- Login panel нээх/хаах checkbox -->
    <input type="checkbox" id="signin-toggle" hidden/>

    <!-- Header component -->
    ${renderHeader(headerRoutes, cleanHash)}

    <!-- Одоогоор хоосон signin render -->
    ${renderSignin()}

    <!-- Login panel-ийн backdrop -->
    <label for="signin-toggle" class="signin-backdrop"></label>

    <!-- Page content энд орно -->
    <main class="${route.mainClass || ""}"></main>

    <!-- Footer component -->
    ${renderFooter()}
  `;

  // Header доторх login/register form-ийн event-үүдийг ажиллуулна.
  // Энэ нь renderHeader хийсний дараа дуудагдах ёстой.
  initSignin();

  try {
    // Эхлээд тухайн page-ийн CSS-ийг ачаална.
    loadCSS(route.component);

    // Хэрэв тухайн page-д нэмэлт CSS хэрэгтэй бол ачаална.
    loadExtraCSS(route.component);

    // Дараа нь тухайн page-ийн JS module-ийг dynamic import хийж ачаална.
    // Жишээ: route.component = "home" бол ./pages/home.js ачаална.
    const pageModule = await import(`./pages/${route.component}.js`);

    // Page module-ийн default export function-г ажиллуулж HTML авна.
    // Тэр HTML-ээ <main> дотор оруулна.
    document.querySelector("main").innerHTML = pageModule.default();

    // Page-specific JS logic-ийг ажиллуулна.
    await loadPageJS(route.component);
  } catch (err) {
    // Page ачаалах үед алдаа гарвал console дээр харуулна.
    console.error("Page load error:", err);

    // Хэрэглэгчид харагдах энгийн error message.
    document.querySelector("main").innerHTML =
      "<p>Хуудас ачаалахад алдаа гарлаа.</p>";
  }
}

// DOMContentLoaded → HTML бүрэн ачаалсны дараа render ажиллуулна.
window.addEventListener("DOMContentLoaded", render);

// hashchange → URL hash өөрчлөгдөх үед шинэ page render хийнэ.
// Жишээ: #/track → #/support
window.addEventListener("hashchange", render);