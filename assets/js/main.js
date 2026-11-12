
/* ==================================================
   BIANCHETI ENGENHARIA
   Main JavaScript

   Funcionalidades globais do site.
   Navegação e rodapé são controlados
   pelo components.js.
================================================== */

(() => {
  "use strict";

  function init() {

    // Reservado para funcionalidades
    // globais futuras do site.

  }

  if (document.readyState === "loading") {

    document.addEventListener(
      "DOMContentLoaded",
      init,
      { once: true }
    );

  } else {

    init();

  }

})();
