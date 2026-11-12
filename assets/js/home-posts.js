
/* ==================================================
   BIANCHETI ENGENHARIA
   Home Posts Controller

   01. Configuration
   02. Utilities
   03. Data Loading
   04. Card Creation
   05. Rendering
   06. Initialization
================================================== */

(() => {
  "use strict";

  /* ==================================================
     01. CONFIGURATION
  ================================================== */

  const CONFIG = {
    postsPath: "content/posts.json",
    maxPosts: 3,
    containerId: "latest-posts"
  };


  /* ==================================================
     02. UTILITIES
  ================================================== */

  function formatDate(dateString) {

    const date = new Date(
      `${dateString}T12:00:00`
    );

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }).format(date);

  }


  function sortPostsByDate(posts) {

    return [...posts].sort((a, b) => {
      return b.date.localeCompare(a.date);
    });

  }


  function getPostUrl(post) {
    return `artigos/${encodeURIComponent(post.id)}.html`;

  }


  /* ==================================================
     03. DATA LOADING
  ================================================== */

  async function loadPosts() {

    const response = await fetch(
      CONFIG.postsPath
    );

    if (!response.ok) {
      throw new Error(
        "Não foi possível carregar as publicações."
      );
    }

    const data = await response.json();

    if (!data || !Array.isArray(data.posts)) {
      throw new Error(
        "Formato inválido do catálogo."
      );
    }

    return sortPostsByDate(data.posts).slice(
      0,
      CONFIG.maxPosts
    );

  }


  /* ==================================================
     04. CARD CREATION
  ================================================== */

  function createPostCard(post) {

    const article = document.createElement(
      "article"
    );

    article.className = "journal-card";

    // Imagem

    const imageLink = document.createElement(
      "a"
    );

    imageLink.className = "journal-card__image";
    imageLink.href = getPostUrl(post);

    const image = document.createElement("img");

    image.src = post.image || "";
    image.alt = post.imageAlt || post.title;
    image.loading = "lazy";
    image.decoding = "async";

    // Fallback para imagens ausentes.

    image.addEventListener("error", () => {
      image.remove();
      imageLink.classList.add("is-placeholder");
    });

    imageLink.appendChild(image);

    // Metadados

    const meta = document.createElement("div");

    meta.className = "journal-card__meta";

    const category = document.createElement(
      "span"
    );

    category.textContent =
      post.categoryLabel || "Artigo";

    const date = document.createElement("span");

    date.textContent = formatDate(post.date);

    meta.append(category, date);

    // Título

    const title = document.createElement("h3");

    title.className = "journal-card__title";

    const titleLink = document.createElement(
      "a"
    );

    titleLink.href = getPostUrl(post);
    titleLink.textContent = post.title;

    title.appendChild(titleLink);

    // Descrição

    const description = document.createElement(
      "p"
    );

    description.className =
      "journal-card__description";

    description.textContent =
      post.excerpt || "";

    // Link para leitura

    const readMore = document.createElement("a");

    readMore.className = "journal-card__link";
    readMore.href = getPostUrl(post);

    readMore.textContent = "Ler artigo ↗";

    // Montagem

    article.append(
      imageLink,
      meta,
      title,
      description,
      readMore
    );

    return article;

  }


  /* ==================================================
     05. RENDERING
  ================================================== */

  function renderPosts(container, posts) {

    // Remove a mensagem de carregamento.

    container.replaceChildren();

    if (!posts.length) {

      const empty = document.createElement("p");

      empty.className = "journal-grid__status";

      empty.textContent =
        "Nenhuma publicação disponível no momento.";

      container.appendChild(empty);

      container.setAttribute(
        "aria-busy",
        "false"
      );

      return;

    }

    const fragment = document.createDocumentFragment();

    posts.forEach(post => {
      fragment.appendChild(
        createPostCard(post)
      );
    });

    container.appendChild(fragment);

    container.setAttribute(
      "aria-busy",
      "false"
    );

  }


  function renderError(container) {

    const message = document.createElement("p");

    message.className = "journal-grid__status";

    message.textContent =
      "Não foi possível carregar as publicações.";

    container.replaceChildren(message);

    container.setAttribute(
      "aria-busy",
      "false"
    );

  }


  /* ==================================================
     06. INITIALIZATION
  ================================================== */

  async function initHomePosts() {

    const container = document.getElementById(
      CONFIG.containerId
    );

    if (!container) return;

    try {

      const posts = await loadPosts();

      renderPosts(container, posts);

    } catch (error) {

      console.error(
        "Biancheti Home:",
        error
      );

      renderError(container);

    }

  }


  if (document.readyState === "loading") {

    document.addEventListener(
      "DOMContentLoaded",
      initHomePosts,
      { once: true }
    );

  } else {

    initHomePosts();

  }

})();
