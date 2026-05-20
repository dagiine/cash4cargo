  import { renderHeader, renderSignin, initSignin } from "./components/header.js";
  import { renderFooter } from "./components/footer.js";
  import { isLoggedIn } from "./js/api.js";

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
      item: "Профайл",
      lnk: "#/profile",
      component: "profile",
      mainClass: "profile-main",
      private: true,
      hideFromNav: true
    },

    {
      item: "Тусламж",
      lnk: "#/support",
      component: "support",
      mainClass: "support-main"
    },

    {
      item: "Бидний тухай",
      lnk: "#/about-us",
      component: "about-us",
      mainClass: ""
    },
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

      if (page === "profile") {
        const module = await import("./js/initProfile.js");
        module.initProfile?.();
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
    let hash = document.location.hash || "#/";
    const cleanHash = hash.split("?")[0];

    // ── Нэвтэрсэн хэрэглэгч "/" руу орвол шууд /track руу дамжуулна ──
    if (cleanHash === "#/" && isLoggedIn()) {
      window.location.hash = "#/track";
      return; // hashchange event render()-г дахин дуудна
    }

    const route = getRouteFromHash(hash);

    // ── Нэвтрээгүй хэрэглэгч profile page руу орохгүй ──
    if (route.private && !isLoggedIn()) {
      window.location.hash = "#/";
      return;
    }

    // ── Нэвтэрсэн үед "Нүүр" болон profile route-г menu дээрээс нуух ──
    const headerRoutes = routes.filter((route) => {
      if (route.hideFromNav) return false;
      if (isLoggedIn() && route.item === "Нүүр") return false;
      return true;
    });

    document.querySelector("#app").innerHTML = `
      <input type="checkbox" id="signin-toggle" hidden/>

      ${renderHeader(headerRoutes, cleanHash)}
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