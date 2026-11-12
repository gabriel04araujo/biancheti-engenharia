
/* ==================================================
   BIANCHETI ENGENHARIA
   Animation Controller

   01. Configuration
   02. Scroll reveal
   03. Initialization
================================================== */

(() => {
  "use strict";

  /* ================================================
     01. CONFIGURATION
  ================================================ */

  const CONFIG = {
    selector: "[data-reveal]",
    visibleClass: "is-visible",
    rootMargin: "0px 0px -40px 0px",
    threshold: 0.1
  };


  /* ================================================
     02. SCROLL REVEAL
  ================================================ */

  function initScrollReveal() {

    const elements = document.querySelectorAll(
      CONFIG.selector
    );

    if (!elements.length) {
      return;
    }

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // Sem animações quando o usuário
    // prefere movimento reduzido.

    if (reducedMotion) {
      elements.forEach(element => {
        element.classList.add(CONFIG.visibleClass);
      });

      return;
    }

    // Fallback para navegadores sem suporte.

    if (!("IntersectionObserver" in window)) {
      elements.forEach(element => {
        element.classList.add(CONFIG.visibleClass);
      });

      return;
    }

    // O observer detecta quando um elemento
    // entra na área visível da página.

    const observer = new IntersectionObserver(
      (entries, currentObserver) => {

        entries.forEach(entry => {

          if (!entry.isIntersecting) {
            return;
          }

          const element = entry.target;

          element.classList.add(
            CONFIG.visibleClass
          );

          // Observamos apenas até a
          // primeira aparição do elemento.

          currentObserver.unobserve(element);

        });

      },
      {
        root: null,
        rootMargin: CONFIG.rootMargin,
        threshold: CONFIG.threshold
      }
    );

    elements.forEach(element => {
      observer.observe(element);
    });
  }


  /* ================================================
     03. INITIALIZATION
  ================================================ */

/* ==================================================
   ANIMATED COUNTERS
================================================== */

  function initCounters() {

    const counters = document.querySelectorAll(
      "[data-counter]"
    );

    if (!counters.length) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (
      reducedMotion ||
      !("IntersectionObserver" in window)
    ) {
      return;
    }

    function animateCounter(element) {

      const target = Number(
        element.dataset.counter
      );

      if (!Number.isFinite(target) || target < 0) {
        return;
      }

      const duration = 1800;
      let startTime = null;

      function update(timestamp) {

        if (startTime === null) {
          startTime = timestamp;
        }

        const elapsed = timestamp - startTime;

        const progress = Math.min(
          elapsed / duration,
          1
        );

        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);

        const current = Math.round(
          target * eased
        );

        element.textContent = `+${current}`;

        if (progress < 1) {
          requestAnimationFrame(update);
        } else {
          element.textContent = `+${target}`;
        }

      }

      requestAnimationFrame(update);

    }

    const observer = new IntersectionObserver(
      (entries, currentObserver) => {

        entries.forEach(entry => {

          if (!entry.isIntersecting) return;

          animateCounter(entry.target);

          currentObserver.unobserve(
            entry.target
          );

        });

      },
      {
        threshold: 0.5
      }
    );

    counters.forEach(counter => {
      observer.observe(counter);
    });

  }

  function initAnimations() {

    // Ativa os estilos de animação.
    document.documentElement.classList.add(
      "js-animations"
    );

    // Inicia as animações de rolagem.
    initScrollReveal(); 
    initCounters();

  }

  // O script está carregado com defer,
  // mas mantemos a inicialização segura.

  if (document.readyState === "loading") {

    document.addEventListener(
      "DOMContentLoaded",
      initAnimations,
      { once: true }
    );

  } else {

    initAnimations();

  }

})();
