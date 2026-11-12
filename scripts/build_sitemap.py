
"""
BIANCHETI ENGENHARIA
Gerador automático de sitemap.xml

Execute na raiz do projeto:
    py scripts/build_sitemap.py
"""

import json
import re
import xml.etree.ElementTree as ET
from datetime import date
from pathlib import Path
from urllib.parse import urljoin


# ==========================================
# CONFIGURAÇÕES
# ==========================================

ROOT = Path(__file__).resolve().parent.parent

SITE_URL = "https://biancheti.com.br/"

POSTS_FILE = ROOT / "content" / "posts.json"
OUTPUT_FILE = ROOT / "sitemap.xml"

STATIC_PAGES = [
    "",
    "sobre.html",
    "servicos.html",
    "contato.html",
    "newsletter.html",
]

NAMESPACE = "http://www.sitemaps.org/schemas/sitemap/0.9"

ET.register_namespace("", NAMESPACE)


# ==========================================
# FUNÇÕES
# ==========================================

def add_url(urlset, path, lastmod=None):
    """Adiciona uma URL ao sitemap."""

    item = ET.SubElement(
        urlset,
        f"{{{NAMESPACE}}}url"
    )

    ET.SubElement(
        item,
        f"{{{NAMESPACE}}}loc"
    ).text = urljoin(SITE_URL, path)

    if lastmod:
        ET.SubElement(
            item,
            f"{{{NAMESPACE}}}lastmod"
        ).text = lastmod


def valid_date(value):
    """Valida uma data ISO 8601."""

    if not value:
        return None

    date.fromisoformat(value)
    return value


def build_sitemap():

    data = json.loads(
        POSTS_FILE.read_text(encoding="utf-8")
    )

    posts = data.get("posts", [])

    if not isinstance(posts, list):
        raise ValueError("posts deve ser uma lista.")

    urlset = ET.Element(
        f"{{{NAMESPACE}}}urlset"
    )

    total = 0

    # Páginas institucionais

    for page in STATIC_PAGES:

        file_path = ROOT / (page or "index.html")

        if not file_path.is_file():
            print(f"[AVISO] Página não encontrada: {file_path.name}")
            continue

        add_url(urlset, page)
        total += 1

    # Artigos gerados

    for post in posts:

        slug = post.get("id", "")

        if not re.fullmatch(
            r"[a-z0-9]+(?:-[a-z0-9]+)*",
            slug
        ):
            print(f"[AVISO] ID inválido: {slug}")
            continue

        article_path = f"artigos/{slug}.html"

        # Não anuncia uma página que ainda não existe.
        if not (ROOT / article_path).is_file():
            print(f"[AVISO] Artigo não gerado: {slug}")
            continue

        # Use updated quando houver uma revisão real.
        # Caso contrário, use a data de publicação.
        modified = valid_date(
            post.get("updated") or post.get("date")
        )

        add_url(
            urlset,
            article_path,
            modified
        )

        total += 1

    tree = ET.ElementTree(urlset)

    ET.indent(tree, space="  ")

    tree.write(
        OUTPUT_FILE,
        encoding="utf-8",
        xml_declaration=True
    )

    print(f"\n[OK] sitemap.xml gerado com {total} URLs")


if __name__ == "__main__":
    build_sitemap()
