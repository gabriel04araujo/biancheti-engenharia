
/* ==================================================
   BIANCHETI ENGENHARIA
   Shared Components Controller

   01. Configuration
   02. Component Loading
   03. Active Navigation
   04. Mobile Navigation
   05. Footer Year
   06. Initialization
================================================== */

(() => {
  "use strict";

  /* ==================================================
     01. CONFIGURATION
  ================================================== */

  const CONFIG = {
    headerPath: "components/header.html",
    footerPath: "components/footer.html"
  };


  /* ==================================================
     02. COMPONENT LOADING
  ================================================== */

  async function loadComponent(path, targetId) {

    const target = document.getElementById(
      targetId
    );

    if (!target) {
      return false;
    }

    try {

      const response = await fetch(path);

      if (!response.ok) {
        throw new Error(
          `Erro HTTP ${response.status}`
        );
      }

      const html = await response.text();

      target.innerHTML = html;

      return true;

    } catch (error) {

      console.error(
        `Erro ao carregar ${path}:`,
        error
      );

      return false;

    }

  }


  /* ==================================================
     03. ACTIVE NAVIGATION
  ================================================== */

  function updateActiveNavigation() {

    const currentPage = window.location.pathname
      .split("/")
      .pop() || "index.html";

    const pageMap = {
      "index.html": "index",
      "sobre.html": "sobre",
      "servicos.html": "servicos",
      "newsletter.html": "newsletter",
      "artigo.html": "newsletter",
      "contato.html": "contato"
    };

    const activePage = pageMap[currentPage];

    document.querySelectorAll(
      ".site-nav__links a[data-nav]"
    ).forEach(link => {

      const isActive =
        link.dataset.nav === activePage;

      if (isActive) {
        link.setAttribute(
          "aria-current",
          "page"
        );
      } else {
        link.removeAttribute(
          "aria-current"
        );
      }

    });

  }


  /* ==================================================
     04. MOBILE NAVIGATION
  ================================================== */

  function initMobileNavigation() {

    const toggle = document.querySelector(
      ".site-nav__toggle"
    );

    const menu = document.querySelector(
      ".site-nav__links"
    );

    const navigation = document.querySelector(
      ".site-nav"
    );

    if (!toggle || !menu || !navigation) {
      return;
    }

    const breakpoint = window.matchMedia(
      "(max-width: 1199.98px)"
    );

    function setMenuState(isOpen) {

      menu.classList.toggle(
        "is-open",
        isOpen
      );

      toggle.setAttribute(
        "aria-expanded",
        String(isOpen)
      );

      toggle.setAttribute(
        "aria-label",
        isOpen ? "Fechar menu" : "Abrir menu"
      );

    }

    function closeMenu() {
      setMenuState(false);
    }

    toggle.addEventListener("click", () => {

      const isOpen =
        toggle.getAttribute(
          "aria-expanded"
        ) === "true";

      setMenuState(!isOpen);

    });

    menu.querySelectorAll("a").forEach(link => {

      link.addEventListener(
        "click",
        closeMenu
      );

    });

    document.addEventListener(
      "keydown",
      event => {

        if (event.key === "Escape") {
          closeMenu();

          if (breakpoint.matches) {
            toggle.focus();
          }
        }

      }
    );

    document.addEventListener(
      "click",
      event => {

        if (!navigation.contains(event.target)) {
          closeMenu();
        }

      }
    );

    breakpoint.addEventListener(
      "change",
      event => {

        if (!event.matches) {
          closeMenu();
        }

      }
    );

  }

/* ==================================================
   FOOTER UTILITIES
================================================== */

  function updateFooterYear() {

    // Atualiza o ano automaticamente.

    const year = document.getElementById(
      "current-year"
    );

    if (year) {
      year.textContent = new Date().getFullYear();
    }

    // Corrige o link "Voltar ao início".
    // Funciona também nas páginas de artigos,
    // que utilizam <base href="../">.

    const backToTop = document.querySelector(
      '.site-footer__bottom a[href="#inicio"]'
    );

    if (backToTop) {

      backToTop.href =
        window.location.pathname +
        window.location.search +
        "#inicio";

    }

  }

  /* ==================================================
     06. INITIALIZATION
  ================================================== */

  async function initComponents() {

    // Carrega os componentes em paralelo.

    const [headerLoaded, footerLoaded] =
      await Promise.all([

        loadComponent(
          CONFIG.headerPath,
          "site-header-container"
        ),

        loadComponent(
          CONFIG.footerPath,
          "site-footer-container"
        )

      ]);

    // Inicializa a navegação somente depois
    // que o cabeçalho estiver disponível.

    if (headerLoaded) {
      updateActiveNavigation();
      initMobileNavigation();
    }

    if (footerLoaded) {
      updateFooterYear();
    }

  }


  if (document.readyState === "loading") {

    document.addEventListener(
      "DOMContentLoaded",
      initComponents,
      { once: true }
    );

  } else {

    initComponents();

  }

})();
