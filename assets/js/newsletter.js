/* ==================================================
   BIANCHETI ENGENHARIA
   Newsletter Controller

   01. Configuration
   02. State
   03. Utilities
   04. DOM References
   05. Data Loading
   06. Rendering
   07. Filtering
   08. Events
   09. Initialization
================================================== */

(() => {
  "use strict";

  /* ==================================================
     01. CONFIGURATION
  ================================================== */

  const CONFIG = {
    postsPath: "content/posts.json",
    initialVisiblePosts: 6
  };

  /* ==================================================
     02. STATE
  ================================================== */

  const state = {
    allPosts: [],
    filteredPosts: [],
    activeCategory: "todos",
    searchTerm: "",
    visiblePosts: CONFIG.initialVisiblePosts
  };

  /* ==================================================
     03. UTILITIES
  ================================================== */

  function formatDate(dateString) {
    const date = new Date(`${dateString}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
      return dateString;
    }

    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    }).format(date);
  }

  function sortPostsByDate(posts) {
    return [...posts].sort((a, b) => {
      const dateA = new Date(`${a.date}T00:00:00`);
      const dateB = new Date(`${b.date}T00:00:00`);
      return dateB - dateA;
    });
  }

  function normalizeText(text) {
    return String(text || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }

  function escapeHTML(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function getPostUrl(postId) {
    return `artigos/${encodeURIComponent(postId)}.html`;
  }

  function getFeaturedPost(posts) {
    const featuredPosts = posts.filter(post => post.featured);
    if (featuredPosts.length > 0) {
      return sortPostsByDate(featuredPosts)[0];
    }
    return posts[0] || null;
  }

  function getSearchableContent(post) {
    return normalizeText([
      post.title,
      post.excerpt,
      post.category,
      post.categoryLabel,
      post.author
    ].join(" "));
  }

  /* ==================================================
     04. DOM REFERENCES
  ================================================== */

  const dom = {
    filtersContainer: document.getElementById("newsletter-filters"),
    filters: Array.from(document.querySelectorAll(".newsletter-filter")),
    searchInput: document.getElementById("newsletter-search-input"),
    featuredPost: document.getElementById("featured-post"),
    postsGrid: document.getElementById("newsletter-posts"),
    emptyState: document.getElementById("newsletter-empty"),
    clearFiltersButton: document.getElementById("clear-newsletter-filters"),
    loadMoreButton: document.getElementById("load-more-posts"),
    resultsText: document.getElementById("newsletter-results")
  };

  /* ==================================================
     05. DATA LOADING
  ================================================== */

  async function loadPosts() {
    const response = await fetch(CONFIG.postsPath, {
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error("Não foi possível carregar as publicações.");
    }

    const data = await response.json();

    if (!data || !Array.isArray(data.posts)) {
      throw new Error("Formato inválido em posts.json.");
    }

    return sortPostsByDate(data.posts);
  }

  /* ==================================================
     06. RENDERING
  ================================================== */

  function createFeaturedPostMarkup(post) {
    if (!post) {
      return `
        <div class="newsletter-status">
          Nenhuma publicação em destaque disponível no momento.
        </div>
      `;
    }

    return `
      <article class="featured-article">
        <a
          class="featured-article__image"
          href="${escapeHTML(getPostUrl(post.id))}"
          aria-label="Ler artigo: ${escapeHTML(post.title)}"
        >
          <img
            src="${escapeHTML(post.image)}"
            alt="${escapeHTML(post.imageAlt || post.title)}"
            loading="lazy"
            onerror="this.style.display='none'; this.parentElement.style.background='#e8e8e8';"
          >
        </a>

        <div class="featured-article__content">
          <span class="featured-article__eyebrow">
            ${escapeHTML(post.categoryLabel)} • Artigo em destaque
          </span>

          <h3 class="featured-article__title">
            <a href="${escapeHTML(getPostUrl(post.id))}">
              ${escapeHTML(post.title)}
            </a>
          </h3>

          <p class="featured-article__excerpt">
            ${escapeHTML(post.excerpt)}
          </p>

          <p class="newsletter-card__meta">
            <span>${escapeHTML(formatDate(post.date))}</span>
            <span>${escapeHTML(post.author)}</span>
            <span>${escapeHTML(post.readingTime)} min de leitura</span>
          </p>

          <a
            class="button button--outline"
            href="${escapeHTML(getPostUrl(post.id))}"
          >
            Ler artigo
            <span aria-hidden="true">↗</span>
          </a>
        </div>
      </article>
    `;
  }

  function createPostCardMarkup(post) {
    return `
      <article class="newsletter-card">
        <a
          class="newsletter-card__image"
          href="${escapeHTML(getPostUrl(post.id))}"
          aria-label="Ler artigo: ${escapeHTML(post.title)}"
        >
          <img
            src="${escapeHTML(post.image)}"
            alt="${escapeHTML(post.imageAlt || post.title)}"
            loading="lazy"
            onerror="this.style.display='none'; this.parentElement.style.background='#e8e8e8';"
          >
        </a>

        <div class="newsletter-card__meta">
          <span>${escapeHTML(post.categoryLabel)}</span>
          <span>${escapeHTML(formatDate(post.date))}</span>
        </div>

        <h3 class="newsletter-card__title">
          <a href="${escapeHTML(getPostUrl(post.id))}">
            ${escapeHTML(post.title)}
          </a>
        </h3>

        <p class="newsletter-card__excerpt">
          ${escapeHTML(post.excerpt)}
        </p>

        <a
          class="newsletter-card__link"
          href="${escapeHTML(getPostUrl(post.id))}"
        >
          Ler artigo
          <span aria-hidden="true">↗</span>
        </a>
      </article>
    `;
  }

  function renderFeaturedPost(posts) {
    if (!dom.featuredPost) return;

    const featured = getFeaturedPost(posts);
    dom.featuredPost.innerHTML = createFeaturedPostMarkup(featured);
  }

  function renderPostsGrid(posts) {
    if (!dom.postsGrid) return;

    if (!posts.length) {
      dom.postsGrid.innerHTML = "";
      dom.postsGrid.setAttribute("aria-busy", "false");
      return;
    }

    const postsToShow = posts.slice(0, state.visiblePosts);

    dom.postsGrid.innerHTML = postsToShow
      .map(createPostCardMarkup)
      .join("");

    dom.postsGrid.setAttribute("aria-busy", "false");
  }

  function renderResults(posts) {
    if (!dom.resultsText) return;

    const total = posts.length;
    const visible = Math.min(total, state.visiblePosts);

    if (total === 0) {
      dom.resultsText.textContent = "Nenhuma publicação encontrada.";
      return;
    }

    dom.resultsText.textContent =
      `Exibindo ${visible} de ${total} publicação${total > 1 ? "ões" : ""}.`;
  }

  function renderLoadMoreButton(posts) {
    if (!dom.loadMoreButton) return;

    const hasMorePosts = state.visiblePosts < posts.length;
    dom.loadMoreButton.hidden = !hasMorePosts;
  }

  function renderEmptyState(posts) {
    if (!dom.emptyState) return;

    dom.emptyState.hidden = posts.length > 0;
  }

  function renderAll() {
    const filteredPosts = state.filteredPosts;

    renderFeaturedPost(filteredPosts);
    renderPostsGrid(filteredPosts);
    renderResults(filteredPosts);
    renderLoadMoreButton(filteredPosts);
    renderEmptyState(filteredPosts);
  }

  /* ==================================================
     07. FILTERING
  ================================================== */

  function applyFilters() {
    const category = state.activeCategory;
    const searchTerm = normalizeText(state.searchTerm);

    const filtered = state.allPosts.filter(post => {
      const matchesCategory =
        category === "todos" || post.category === category;

      const matchesSearch =
        !searchTerm ||
        getSearchableContent(post).includes(searchTerm);

      return matchesCategory && matchesSearch;
    });

    state.filteredPosts = filtered;
    renderAll();
  }

  function updateFilterButtons() {
    dom.filters.forEach(button => {
      const isActive = button.dataset.category === state.activeCategory;

      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
  }

  function resetFilters() {
    state.activeCategory = "todos";
    state.searchTerm = "";
    state.visiblePosts = CONFIG.initialVisiblePosts;

    if (dom.searchInput) {
      dom.searchInput.value = "";
    }

    updateFilterButtons();
    applyFilters();
  }

  /* ==================================================
     08. EVENTS
  ================================================== */

  function setupEvents() {
    if (dom.filtersContainer) {
      dom.filtersContainer.addEventListener("click", event => {
        const button = event.target.closest(".newsletter-filter");
        if (!button) return;

        state.activeCategory = button.dataset.category || "todos";
        state.visiblePosts = CONFIG.initialVisiblePosts;

        updateFilterButtons();
        applyFilters();
      });
    }

    if (dom.searchInput) {
      dom.searchInput.addEventListener("input", event => {
        state.searchTerm = event.target.value;
        state.visiblePosts = CONFIG.initialVisiblePosts;
        applyFilters();
      });
    }

    if (dom.clearFiltersButton) {
      dom.clearFiltersButton.addEventListener("click", () => {
        resetFilters();
      });
    }

    if (dom.loadMoreButton) {
      dom.loadMoreButton.addEventListener("click", () => {
        state.visiblePosts += CONFIG.initialVisiblePosts;
        renderAll();
      });
    }
  }

  /* ==================================================
     09. INITIALIZATION
  ================================================== */

  async function initNewsletter() {
    const hasNewsletterPage =
      dom.postsGrid ||
      dom.featuredPost ||
      dom.filtersContainer;

    if (!hasNewsletterPage) {
      return;
    }

    try {
      state.allPosts = await loadPosts();
      state.filteredPosts = [...state.allPosts];

      updateFilterButtons();
      setupEvents();
      renderAll();

    } catch (error) {
      if (dom.featuredPost) {
        dom.featuredPost.innerHTML = `
          <div class="newsletter-status">
            Não foi possível carregar o artigo em destaque.
          </div>
        `;
      }

      if (dom.postsGrid) {
        dom.postsGrid.innerHTML = `
          <p class="newsletter-status">
            Não foi possível carregar as publicações no momento.
          </p>
        `;
        dom.postsGrid.setAttribute("aria-busy", "false");
      }

      if (dom.resultsText) {
        dom.resultsText.textContent = "Erro ao carregar publicações.";
      }

      console.error(error);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initNewsletter, {
      once: true
    });
  } else {
    initNewsletter();
  }

})();