
/* ==================================================
   BIANCHETI ENGENHARIA
   Contact Form Controller

   01. Configuration
   02. Message Builder
   03. Form Handler
   04. Initialization
================================================== */

(() => {
  "use strict";

  /* ==================================================
     01. CONFIGURATION
  ================================================== */

  const CONFIG = {

    // Substitua pelo WhatsApp oficial da empresa.
    // Formato: código do país + DDD + número.
    // Exemplo de formato: 5531999999999
    // Não utilize espaços, parênteses ou hífens.

    whatsappNumber: "553198376994",

    formSelector: "#contact-form",
    feedbackSelector: "#contact-feedback"

  };


  /* ==================================================
     02. MESSAGE BUILDER
  ================================================== */

  function buildWhatsAppMessage(data) {

    const message = [
      "Olá, equipe Biancheti!",
      "",
      `Meu nome é ${data.name}.`,
      "",
      `Assunto: ${data.subject}`,
      "",
      data.message,
      "",
      "Aguardo o contato de vocês!"
    ];

    return message.join("\n");

  }


  /* ==================================================
     03. FORM HANDLER
  ================================================== */

  function initContactForm() {

    const form = document.querySelector(
      CONFIG.formSelector
    );

    const feedback = document.querySelector(
      CONFIG.feedbackSelector
    );

    if (!form) return;

    function showFeedback(message) {

      if (feedback) {
        feedback.textContent = message;
      }

    }

    form.addEventListener("submit", event => {

      event.preventDefault();

      showFeedback("");

      // Validação nativa do formulário.

      if (!form.reportValidity()) {
        return;
      }

      // Coleta dos valores.

      const name = form.elements["name"]
        .value.trim();

      const subject = form.elements["subject"]
        .value.trim();

      const message = form.elements["message"]
        .value.trim();

      // Evita mensagens vazias ou apenas espaços.

      if (!name || !subject || !message) {

        showFeedback(
          "Preencha todos os campos antes de continuar."
        );

        return;
      }

      // Verifica se o WhatsApp foi configurado.

      const number = CONFIG.whatsappNumber;

      if (!/^\d{12,13}$/.test(number)) {

        showFeedback(
          "O atendimento pelo WhatsApp ainda não está configurado."
        );

        return;
      }

      // Monta a mensagem.

      const text = buildWhatsAppMessage({
        name,
        subject,
        message
      });

      // Codifica a mensagem para utilização na URL.

      const encodedMessage = encodeURIComponent(text);

      const whatsappURL =
        `https://wa.me/${number}?text=${encodedMessage}`;

      // Abre o WhatsApp.
      // O usuário confirma o envio no aplicativo.

      const newWindow = window.open(
        whatsappURL,
        "_blank",
        "noopener,noreferrer"
      );

      // Fallback caso o navegador bloqueie
      // a abertura de uma nova aba.

      if (!newWindow) {

        showFeedback(
          "Se o WhatsApp não abriu, permita pop-ups " +
          "ou tente novamente."
        );

      } else {

        showFeedback(
          "Mensagem preparada! Confirme o envio no WhatsApp."
        );

      }

    });

  }


  /* ==================================================
     04. INITIALIZATION
  ================================================== */

  function init() {
    initContactForm();
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
