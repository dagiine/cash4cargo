  import { renderHeader, renderSignin, initSignin } from "./components/header.js";
  import { renderFooter } from "./components/footer.js";
  import { isLoggedIn } from "./js/api.js";

  const routes = [
    { 
      item: "Нүүр", 
      lnk: "#/", 
      component: "home", 
      mainClass: "home-main home" 
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
    document.querySelector("#component-extra-css")?.remove();

    if (page === "track") {
      const resultCSS = document.createElement("link");
      resultCSS.rel = "stylesheet";
      resultCSS.href = "./css/track-results.css";
      resultCSS.id = "page-extra-css";
      document.head.appendChild(resultCSS);

      // Order card нь web component тул CSS-ийг тусдаа файлд салгасан.
      const orderCardCSS = document.createElement("link");
      orderCardCSS.rel = "stylesheet";
      orderCardCSS.href = "./components/order-card.css";
      orderCardCSS.id = "component-extra-css";
      document.head.appendChild(orderCardCSS);
    }
  }

  async function loadPageJS(page) {
    try {
      if (page === "support") {
        const module = await import("./js/initSupportSearch.js");
        module.initSupportSearch?.();
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
    const hash = document.location.hash || "#/";
    const cleanHash = hash.split("?")[0];

    // Нэвтэрсэн хэрэглэгч Нүүр рүү орвол шууд хянах хуудас руу шилжинэ
    if (cleanHash === "#/" && isLoggedIn()) {
      window.location.hash = "#/track";
      return;
    }

    const route = getRouteFromHash(hash);

    // Нэвтрээгүй хэрэглэгч profile page руу орохгүй
    if (route.private && !isLoggedIn()) {
      window.location.hash = "#/";
      return;
    }

    // Нэвтэрсэн үед Нүүр болон hidden route-г menu дээрээс нуух
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