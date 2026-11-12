
/* ==================================================
   BIANCHETI ENGENHARIA
   Article Controller

   01. Configuration
   02. DOM References
   03. Utilities
   04. Data Loading
   05. Cover Image
   06. Article Rendering
   07. Error Handling
   08. Initialization
================================================== */

(() => {
  "use strict";

  /* ==================================================
     01. CONFIGURATION
  ================================================== */

  const CONFIG = {
    postsPath: "content/posts.json",
    siteName: "Biancheti Engenharia"
  };


  /* ==================================================
     02. DOM REFERENCES
  ================================================== */

  const dom = {
    title: document.getElementById("article-title"),
    category: document.getElementById("article-category"),
    breadcrumb: document.getElementById(
      "article-category-breadcrumb"
    ),
    date: document.getElementById("article-date"),
    author: document.getElementById("article-author"),
    readingTime: document.getElementById(
      "article-reading-time"
    ),
    cover: document.getElementById("article-cover"),
    coverImage: document.getElementById(
      "article-cover-image"
    ),
    content: document.getElementById("article-content"),
    loading: document.getElementById("article-loading"),
    error: document.getElementById("article-error")
  };


  /* ==================================================
     03. UTILITIES
  ================================================== */

  // Obtém o identificador informado na URL.

  function getArticleId() {
    const params = new URLSearchParams(
      window.location.search
    );

    return params.get("id")?.trim() || null;
  }


  // Converte datas para o formato brasileiro.

  function formatDate(dateString) {

    if (
      typeof dateString !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(dateString)
    ) {
      return "Data não informada";
    }

    const date = new Date(
      `${dateString}T12:00:00`
    );

    if (Number.isNaN(date.getTime())) {
      return "Data não informada";
    }

    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    }).format(date);
  }


  // Exibe ou oculta o carregamento.

  function setLoading(isLoading) {

    if (dom.loading) {
      dom.loading.hidden = !isLoading;
    }

    if (dom.content) {
      dom.content.setAttribute(
        "aria-busy",
        String(isLoading)
      );
    }

  }


  // Verifica se o caminho do Markdown
  // pertence à pasta de publicações.

  function getValidContentPath(path) {

    if (
      typeof path !== "string" ||
      !/^content\/posts\/[a-z0-9-]+\.md$/.test(path)
    ) {
      throw new Error(
        "Caminho do artigo inválido."
      );
    }

    return path;
  }


  // Permite somente imagens locais
  // da pasta de imagens do projeto.

  function getValidImagePath(path) {

    if (
      typeof path !== "string" ||
      !/^assets\/images\/[a-zA-Z0-9/_-]+\.(jpg|jpeg|png|webp|avif)$/i.test(path)
    ) {
      return null;
    }

    return path;
  }


  /* ==================================================
     04. DATA LOADING
  ================================================== */

  // Busca o catálogo de publicações.

  async function fetchPosts() {

    const response = await fetch(
      CONFIG.postsPath
    );

    if (!response.ok) {
      throw new Error(
        "Não foi possível carregar o catálogo."
      );
    }

    const data = await response.json();

    if (!data || !Array.isArray(data.posts)) {
      throw new Error(
        "O catálogo de artigos é inválido."
      );
    }

    return data.posts;
  }


  // Localiza a publicação pelo identificador.

  function findArticle(posts, articleId) {

    return posts.find(
      post => post.id === articleId
    ) || null;

  }


  // Busca o conteúdo Markdown.

  async function fetchMarkdown(path) {

    const validPath = getValidContentPath(path);

    const response = await fetch(validPath);

    if (!response.ok) {
      throw new Error(
        "Não foi possível carregar o Markdown."
      );
    }

    return response.text();
  }


  /* ==================================================
     05. COVER IMAGE
  ================================================== */

  function showCoverPlaceholder() {

    if (!dom.cover || !dom.coverImage) {
      return;
    }

    dom.cover.classList.add("is-placeholder");

    dom.coverImage.hidden = true;
    dom.coverImage.removeAttribute("src");
    dom.coverImage.removeAttribute("alt");

  }


  function renderCover(post) {

    if (!dom.cover || !dom.coverImage) {
      return;
    }

    const imagePath = getValidImagePath(
      post.image
    );

    if (!imagePath) {
      showCoverPlaceholder();
      return;
    }

    dom.cover.classList.remove(
      "is-placeholder"
    );

    dom.coverImage.onload = () => {

      dom.cover.classList.remove(
        "is-placeholder"
      );

      dom.coverImage.hidden = false;

    };

    dom.coverImage.onerror = () => {
      showCoverPlaceholder();
    };

    dom.coverImage.alt =
      post.imageAlt || post.title || "";

    dom.coverImage.src = imagePath;

  }


  /* ==================================================
     06. ARTICLE RENDERING
  ================================================== */

  // Preenche o cabeçalho do artigo.

  function renderArticleHeader(post) {

    const category =
      post.categoryLabel || "Artigo";

    if (dom.title) {
      dom.title.textContent = post.title;
    }

    if (dom.category) {
      dom.category.textContent = category;
    }

    if (dom.breadcrumb) {
      dom.breadcrumb.textContent = category;
    }

    if (dom.date) {
      dom.date.textContent = formatDate(
        post.date
      );
    }

    if (dom.author) {
      dom.author.textContent =
        post.author || CONFIG.siteName;
    }

    if (dom.readingTime) {

      const minutes = Number(
        post.readingTime
      );

      dom.readingTime.textContent =
        Number.isFinite(minutes) && minutes > 0
          ? `${minutes} min de leitura`
          : "Tempo não informado";

    }

    // Atualiza o título da aba.

    document.title =
      `${post.title} | ${CONFIG.siteName}`;

    // Atualiza a descrição da página.

    const description = document.querySelector(
      'meta[name="description"]'
    );

    if (description && post.excerpt) {
      description.setAttribute(
        "content",
        post.excerpt
      );
    }

  }


  // Converte Markdown em HTML seguro.

  function renderMarkdown(markdown) {

    if (
      !window.marked ||
      !window.DOMPurify
    ) {
      throw new Error(
        "As bibliotecas de Markdown não carregaram."
      );
    }

    // Converte a sintaxe Markdown.

    const html = window.marked.parse(markdown, {
      gfm: true,
      breaks: false
    });

    // Remove elementos e atributos perigosos.

    const cleanHTML = window.DOMPurify.sanitize(
      html,
      {
        USE_PROFILES: {
          html: true
        },
        FORBID_TAGS: [
          "script",
          "iframe",
          "object",
          "embed",
          "form"
        ]
      }
    );

    if (!dom.content) {
      return;
    }

    // Mantém o título acessível
    // da seção de conteúdo.

    dom.content.innerHTML = `
      <h2
        id="article-content-title"
        class="visually-hidden"
      >
        Conteúdo do artigo
      </h2>
    ` + cleanHTML;

    // Configura links externos.

    dom.content.querySelectorAll(
      "a[href]"
    ).forEach(link => {

      let url;

      try {
        url = new URL(
          link.getAttribute("href"),
          window.location.href
        );
      } catch {
        link.removeAttribute("href");
        return;
      }

      if (
        !["http:", "https:"].includes(
          url.protocol
        )
      ) {
        link.removeAttribute("href");
        return;
      }

      if (url.origin !== window.location.origin) {

        link.target = "_blank";
        link.rel = "noopener noreferrer";

      }

    });

    // Melhora o carregamento das imagens.

    dom.content.querySelectorAll(
      "img"
    ).forEach(image => {

      image.loading = "lazy";
      image.decoding = "async";

    });

    dom.content.hidden = false;

  }


  /* ==================================================
     07. ERROR HANDLING
  ================================================== */

  function showError(message) {

    setLoading(false);

    if (dom.content) {
      dom.content.hidden = true;
    }

    if (dom.error) {
      dom.error.hidden = false;
    }

    if (dom.title) {
      dom.title.textContent =
        "Artigo indisponível.";
    }

    if (dom.category) {
      dom.category.textContent =
        "Newsletter";
    }

    if (dom.breadcrumb) {
      dom.breadcrumb.textContent =
        "Artigo indisponível";
    }

    showCoverPlaceholder();

    document.title =
      `Artigo indisponível | ${CONFIG.siteName}`;

    console.error(
      "Biancheti Newsletter:",
      message
    );

  }


  /* ==================================================
     08. INITIALIZATION
  ================================================== */

  async function initArticle() {

    if (!dom.content || !dom.title) {
      return;
    }

    const articleId = getArticleId();

    if (!articleId) {

      showError(
        "Nenhum identificador foi informado."
      );

      return;
    }

    setLoading(true);

    try {

      // Busca todas as publicações.

      const posts = await fetchPosts();

      // Localiza o artigo solicitado.

      const post = findArticle(
        posts,
        articleId
      );

      if (!post) {
        throw new Error(
          "Artigo não encontrado."
        );
      }

      // Busca o arquivo Markdown.

      const markdown = await fetchMarkdown(
        post.content
      );

      // Renderiza o conteúdo primeiro,
      // para evitar um cabeçalho preenchido
      // com corpo de artigo indisponível.

      renderMarkdown(markdown);

      // Preenche os demais elementos.

      renderArticleHeader(post);
      renderCover(post);

      // Finaliza o carregamento.

      setLoading(false);

    } catch (error) {

      showError(error.message);

    }

  }


  if (document.readyState === "loading") {

    document.addEventListener(
      "DOMContentLoaded",
      initArticle,
      { once: true }
    );

  } else {

    initArticle();

  }

})();
