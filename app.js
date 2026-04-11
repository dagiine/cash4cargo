import { renderHeader, renderSignin, initSignin } from "./components/header.js";
import { renderFooter } from "./components/footer.js";

const routes = [
  { 
    item: "Нүүр", 
    lnk: "#/", 
    component: "home", 
    mainClass: "" 
  },

  {
    item: "Захиалга хянах",
    lnk: "#/track",
    component: "track",
    mainClass: "track-main"
  },

  {
    item: "Захиалга үүсгэх",
    lnk: "#/create-order",
    component: "create-order",
    mainClass: ""
  },

  {
    item: "Үнэ",
    lnk: "#/pricing",
    component: "pricing",
    mainClass: ""
  },

  {
    item: "Тусламж",
    lnk: "#/support",
    component: "support",
    mainClass: "support-main"
  }
];

function loadCSS(page) {
  document.querySelector("#page-css")?.remove();

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = `./css/${page}.css`;
  link.id = "page-css";

  document.head.appendChild(link);
}

function loadExtraCSS(page) {
  document.querySelector("#page-extra-css")?.remove();

  if (page === "track") {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "./css/track-results.css";
    link.id = "page-extra-css";

    document.head.appendChild(link);
  }
}

async function loadPageJS(page) {
  try {
    if (page === "support") {
      const module = await import("./js/initSupportSearch.js");
      module.initSupportSearch?.();
    }

    if (page === "pricing") {
      const module = await import("./js/pricingUI.js");
      new module.PricingUI().init();
    }

    if (page === "track") {
      const module = await import("./js/trackUI.js");
      await new module.TrackUI().init();
    }

    if (page === "home") {
      const module = await import("./js/initHomePage.js");
      module.initHomeTracking?.();
      module.initAddressCopy?.();
    }

    if (page === "create-order") {
      const module = await import("./js/initCreateOrder.js");
      module.initCreateOrder?.();
    }

  } catch (err) {
    console.error(`${page} JS load error:`, err);
  }
}

function getRouteFromHash(hash) {
  const cleanHash = hash.split("?")[0];
  return routes.find((r) => r.lnk === cleanHash) || routes[0];
}

async function render() {
  const hash = document.location.hash || "#/";
  const cleanHash = hash.split("?")[0];
  const route = getRouteFromHash(hash);

  document.querySelector("#app").innerHTML = `
    <input type="checkbox" id="signin-toggle" hidden/>

    ${renderHeader(routes, cleanHash)}
    ${renderSignin()}

    <label for="signin-toggle" class="signin-backdrop"></label>
    <main class="${route.mainClass || ""}"></main>

    ${renderFooter()}
  `;

  initSignin();

  try {
    /* Эхлээд CSS */
    loadCSS(route.component);
    loadExtraCSS(route.component);

    /* Дараа нь хуудсууд */
    const pageModule =
      await import(
        `./pages/${route.component}.js`
      );

    document.querySelector("main").innerHTML = pageModule.default();
    await loadPageJS(route.component);
  }
  catch (err) {
    console.error("Page load error:", err);

    document.querySelector("main").innerHTML = 
      "<p>Хуудас ачаалахад алдаа гарлаа.</p>";
  }
}

window.addEventListener("DOMContentLoaded", render);
window.addEventListener("hashchange", render);