// app.js — Үндсэн router

import { renderHeader, renderSignin, initSignin } from "./components/header.js";
import { renderFooter } from "./components/footer.js";

// ── Nav-д харагдах routes (профайл энд байхгүй) ──
const routes = [
  { item: "Нүүр",            lnk: "#/",            component: "home",         mainClass: "" },
  { item: "Захиалга хянах",  lnk: "#/track",       component: "track",        mainClass: "track-main" },
  { item: "Захиалга үүсгэх", lnk: "#/create-order", component: "create-order", mainClass: "" },
  { item: "Тусламж",         lnk: "#/support",     component: "support",      mainClass: "support-main" },
  { item: "Бидний тухай",    lnk: "#/about-us",    component: "about-us",     mainClass: "" },
];

// ── Профайл route (nav-д харагдахгүй, зөвхөн header товчоор нэвтэрнэ) ──
const profileRoute = { lnk: "#/profile", component: "profile", mainClass: "" };

function loadCSS(page) {
  document.querySelector("#page-css")?.remove();
  var link = document.createElement("link");
  link.rel  = "stylesheet";
  link.href = "./css/" + page + ".css";
  link.id   = "page-css";
  document.head.appendChild(link);
}

function loadExtraCSS(page) {
  document.querySelector("#page-extra-css")?.remove();
  if (page === "track") {
    var link = document.createElement("link");
    link.rel  = "stylesheet";
    link.href = "./css/track-results.css";
    link.id   = "page-extra-css";
    document.head.appendChild(link);
  }
}

async function loadPageJS(page) {
  try {
    if (page === "support") {
      var m = await import("./js/initSupportSearch.js");
      m.initSupportSearch?.();
    }
    if (page === "pricing") {
      var m = await import("./js/pricingUI.js");
      new m.PricingUI().init();
    }
    if (page === "track") {
      var m = await import("./js/trackUI.js");
      await new m.TrackUI().init();
    }
    if (page === "home") {
      var m = await import("./js/initHomePage.js");
      m.initHomeTracking?.();
      m.initAddressCopy?.();
      m.initHomeSession?.();   // нэвтэрсэн мэдэгдэл
    }
    if (page === "create-order") {
      var m = await import("./js/initCreateOrder.js");
      m.initCreateOrder?.();
    }
    if (page === "profile") {
      var m = await import("./js/initProfile.js");
      m.initProfile?.();
    }
  } catch (err) {
    console.error(page + " JS load error:", err);
  }
}

function getRouteFromHash(hash) {
  var clean = hash.split("?")[0];
  if (clean === "#/profile") return profileRoute;
  return routes.find(function(r) { return r.lnk === clean; }) || routes[0];
}

async function render() {
  var hash      = document.location.hash || "#/";
  var cleanHash = hash.split("?")[0];
  var route     = getRouteFromHash(hash);

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
    loadCSS(route.component);
    loadExtraCSS(route.component);
    var pageModule = await import("./pages/" + route.component + ".js");
    document.querySelector("main").innerHTML = pageModule.default();
    await loadPageJS(route.component);
  } catch (err) {
    console.error("Page load error:", err);
    document.querySelector("main").innerHTML = "<p>Хуудас ачаалахад алдаа гарлаа.</p>";
  }
}

window.addEventListener("DOMContentLoaded", render);
window.addEventListener("hashchange", render);