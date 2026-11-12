
"""
BIANCHETI ENGENHARIA
Static Article Generator

Lê content/posts.json e gera páginas
HTML individuais a partir dos Markdown.

Executar na raiz do projeto:
    python scripts/build_articles.py
"""

import json
import re
from datetime import date
from html import escape
from pathlib import Path

import markdown


# ==========================================
# 01. CONFIGURAÇÕES
# ==========================================

ROOT = Path(__file__).resolve().parent.parent

POSTS_FILE = ROOT / "content" / "posts.json"
OUTPUT_DIR = ROOT / "artigos"

SITE_URL = "https://biancheti.com.br"


# ==========================================
# 02. UTILITÁRIOS
# ==========================================

def clean(value):
    """Escapa texto para uso seguro no HTML."""
    return escape(str(value or ""), quote=True)


def format_date(iso_date):
    """Formata a data para o padrão brasileiro."""
    parsed = date.fromisoformat(iso_date)
    return parsed.strftime("%d/%m/%Y")


def get_content_path(relative_path):
    """Garante que o Markdown esteja dentro de content/posts."""
    allowed_dir = (ROOT / "content" / "posts").resolve()
    path = (ROOT / relative_path).resolve()

    if not path.is_relative_to(allowed_dir):
        raise ValueError("Caminho de conteúdo inválido.")

    if path.suffix.lower() != ".md":
        raise ValueError("O conteúdo deve ser Markdown.")

    return path


def json_for_html(data):
    """Prepara JSON-LD sem encerrar a tag script."""
    return (
        json.dumps(data, ensure_ascii=False)
        .replace("<", "\\u003c")
        .replace(">", "\\u003e")
        .replace("&", "\\u0026")
    )


# ==========================================
# 03. CONSTRUÇÃO DA PÁGINA
# ==========================================

def build_article(post):

    slug = post["id"]

    if not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", slug):
        raise ValueError(f"ID inválido: {slug}")

    title = post["title"]
    description = post.get("excerpt", "")
    category = post.get("categoryLabel", "Artigo")
    author = post.get("author", "Biancheti Engenharia")
    published = post["date"]
    reading_time = post.get("readingTime")

    # Lê e converte o conteúdo Markdown.

    markdown_path = get_content_path(post["content"])

    content_md = markdown_path.read_text(encoding="utf-8")

    content_html = markdown.markdown(
        content_md,
        extensions=["extra", "sane_lists"]
    )

    # Define a URL definitiva.

    article_url = f"{SITE_URL}/artigos/{slug}.html"

    # Adiciona imagem apenas se existir.

    image_html = ""
    image_url = None

    image_path = post.get("image")

    if image_path:

        local_image = (ROOT / image_path).resolve()

        if (
            local_image.is_relative_to(ROOT)
            and local_image.is_file()
        ):

            image_url = f"{SITE_URL}/{image_path}"

            image_html = f"""
            <figure class="article-cover">
              <img
                src="{clean(image_path)}"
                alt="{clean(post.get('imageAlt', title))}"
                decoding="async"
              >
            </figure>
            """

    # Dados estruturados para os buscadores.

    structured_data = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": title,
        "description": description,
        "datePublished": published,
        "author": {
            "@type": "Organization",
            "name": author
        },
        "publisher": {
            "@type": "Organization",
            "name": "Biancheti Engenharia"
        },
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": article_url
        }
    }

    if image_url:
        structured_data["image"] = image_url

    # Metadados opcionais da imagem.

    og_image = ""

    if image_url:
        og_image = (
            f'<meta property="og:image" '
            f'content="{clean(image_url)}">'
        )

    reading_label = ""

    if reading_time:
        reading_label = (
            f'<span>{clean(reading_time)} min de leitura</span>'
        )

    # Documento HTML completo.

    html = f"""<!DOCTYPE html>
<html lang="pt-BR">

<head>

  <meta charset="UTF-8">

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  >

  <!-- Permite usar caminhos relativos à raiz -->
  <base href="../">

  <!-- SEO -->

  <title>{clean(title)} | Biancheti Engenharia</title>

  <meta
    name="description"
    content="{clean(description)}"
  >

  <link
    rel="canonical"
    href="{clean(article_url)}"
  >

  <meta property="og:type" content="article">
  <meta property="og:locale" content="pt_BR">
  <meta
    property="og:site_name"
    content="Biancheti Engenharia"
  >
  <meta
    property="og:title"
    content="{clean(title)}"
  >
  <meta
    property="og:description"
    content="{clean(description)}"
  >
  <meta
    property="og:url"
    content="{clean(article_url)}"
  >
  {og_image}

  <meta name="twitter:card" content="summary">

  <!-- Dados estruturados -->

  <script type="application/ld+json">
{json_for_html(structured_data)}
  </script>

  <!-- Bootstrap -->

  <link
    href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css"
    rel="stylesheet"
  >

  <!-- CSS do projeto -->

  <link rel="stylesheet" href="assets/css/base.css">
  <link rel="stylesheet" href="assets/css/components.css">
  <link rel="stylesheet" href="assets/css/article.css">

  <!-- Estilos complementares do artigo -->

  <style>

    .static-article {{
      padding: 5rem 0 7rem;
    }}

    .static-article__container {{
      max-width: 800px;
      margin-inline: auto;
    }}

    .static-article__category {{
      display: block;
      margin-bottom: 1.5rem;
      font-size: 0.8rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }}

    .static-article__title {{
      margin-bottom: 1.5rem;
      font-size: clamp(2rem, 5vw, 3.75rem);
      line-height: 1.15;
    }}

    .static-article__meta {{
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      margin-bottom: 3rem;
      color: #666;
      font-size: 0.875rem;
    }}

    .article-cover {{
      margin: 0 0 3rem;
    }}

    .article-cover img {{
      display: block;
      width: 100%;
      height: auto;
      aspect-ratio: 16 / 9;
      object-fit: cover;
    }}

    .article-body {{
      font-size: 1.05rem;
      line-height: 1.9;
      overflow-wrap: anywhere;
    }}

    .article-body h2 {{
      margin: 3rem 0 1.25rem;
      font-size: 1.7rem;
    }}

    .article-body h3 {{
      margin: 2rem 0 1rem;
      font-size: 1.3rem;
    }}

    .article-body p,
    .article-body ul,
    .article-body ol {{
      margin-bottom: 1.5rem;
    }}

    .article-body blockquote {{
      margin: 2rem 0;
      padding: 1rem 1.5rem;
      border-left: 3px solid #222;
      background: #f5f5f5;
    }}

    .article-body img {{
      max-width: 100%;
      height: auto;
    }}

    .static-article__back {{
      display: inline-block;
      margin-top: 4rem;
      color: inherit;
      text-decoration: underline;
      text-underline-offset: 5px;
    }}

    @media (max-width: 767.98px) {{
      .static-article {{
        padding: 3rem 0 5rem;
      }}
    }}

  </style>

  <!-- Componentes compartilhados -->

  <script src="assets/js/main.js" defer></script>
  <script src="assets/js/components.js" defer></script>

</head>

<body>

  <!-- Header -->

  <div id="site-header-container"></div>

  <!-- Artigo -->

  <main id="conteudo" class="static-article">

    <div class="container">

      <article class="static-article__container">

        <header>

          <span class="static-article__category">
            {clean(category)}
          </span>

          <h1 class="static-article__title">
            {clean(title)}
          </h1>

          <div class="static-article__meta">

            <span>{clean(author)}</span>

            <time datetime="{clean(published)}">
              {clean(format_date(published))}
            </time>

            {reading_label}

          </div>

        </header>

        {image_html}

        <div class="article-body">
          {content_html}
        </div>

        <a
          href="newsletter.html"
          class="static-article__back"
        >
          ← Voltar para a Newsletter
        </a>

      </article>

    </div>

  </main>

  <!-- Footer -->

  <div id="site-footer-container"></div>

  <script
    src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js"
    defer
  ></script>

</body>
</html>
"""

    output_path = OUTPUT_DIR / f"{slug}.html"

    output_path.write_text(html, encoding="utf-8")

    print(f"[OK] {output_path.relative_to(ROOT)}")


# ==========================================
# 04. EXECUÇÃO
# ==========================================

def main():

    data = json.loads(
        POSTS_FILE.read_text(encoding="utf-8")
    )

    posts = data.get("posts", [])

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    print("Gerando artigos da Biancheti...")

    for post in posts:
        build_article(post)

    print(f"\nConcluído: {len(posts)} artigo(s).")


if __name__ == "__main__":
    main()
