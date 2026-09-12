"""Read-only public SEO crawl. No credentials, database writes or packages required."""
import concurrent.futures
import html.parser
import json
from pathlib import Path
import time
import urllib.error
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from collections import Counter
from datetime import datetime, timezone

BASE = "https://www.smartechvacuum.com"
OUT = Path(__file__).resolve().parents[1] / "docs/audits/2026-09-09-public-crawl.json"


class Page(html.parser.HTMLParser):
    def __init__(self):
        super().__init__()
        self.title = ""
        self.h1 = []
        self.h2 = []
        self.meta = {}
        self.canonical = []
        self.images = []
        self.links = []
        self.article_links = []
        self.schemas = []
        self.schema_errors = 0
        self.in_article = False
        self.capture = None
        self.buffer = ""

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == "article":
            self.in_article = True
        if tag in ("title", "h1", "h2") or (tag == "script" and a.get("type") == "application/ld+json"):
            self.capture, self.buffer = tag, ""
        if tag == "meta":
            key = a.get("name", a.get("property"))
            if key:
                self.meta[key] = a.get("content", "")
        if tag == "link" and a.get("rel") == "canonical":
            self.canonical.append(a.get("href", ""))
        if tag == "img":
            self.images.append({k: a.get(k) for k in ("src", "alt", "width", "height", "loading")})
        if tag == "a" and "href" in a:
            self.links.append(a["href"])
            if self.in_article:
                self.article_links.append(a["href"])

    def handle_data(self, data):
        if self.capture:
            self.buffer += data

    def handle_endtag(self, tag):
        if tag == "article":
            self.in_article = False
        if self.capture != tag:
            return
        if tag == "title":
            self.title = self.buffer
        elif tag in ("h1", "h2"):
            getattr(self, tag).append(self.buffer)
        elif tag == "script":
            try:
                self.schemas.append(json.loads(self.buffer))
            except ValueError:
                self.schema_errors += 1
        self.capture = None


def fetch(url):
    start = time.monotonic()
    request = urllib.request.Request(url, headers={"User-Agent": "SmartechSEOAudit/1.0 (site owner public read-only audit)"})
    try:
        with urllib.request.urlopen(request, timeout=35) as response:
            data = response.read()
            return {"url": url, "final_url": response.url, "status": response.status,
                    "seconds": round(time.monotonic() - start, 3), "bytes": len(data),
                    "x_robots_tag": response.headers.get("X-Robots-Tag"),
                    "content_type": response.headers.get("Content-Type"),
                    "cache": response.headers.get("x-vercel-cache")}, data.decode("utf-8", errors="replace")
    except urllib.error.HTTPError as error:
        return {"url": url, "status": error.code, "error": str(error)}, ""
    except Exception as error:
        return {"url": url, "status": None, "error": str(error)}, ""


def audit(url):
    result, body = fetch(url)
    if result.get("status") == 200 and "text/html" in (result.get("content_type") or ""):
        page = Page()
        page.feed(body)
        result.update(vars(page))
        for key in ("rawdata", "lasttag", "interesting", "cdata_elem", "convert_charrefs", "lineno", "offset", "in_article", "capture", "buffer"):
            result.pop(key, None)
        result["literal_markdown_links"] = body.count("](")
    return result


def main():
    sitemap_response, sitemap = fetch(BASE + "/sitemap.xml")
    if sitemap_response.get("status") != 200:
        raise SystemExit(json.dumps(sitemap_response))
    root = ET.fromstring(sitemap)
    urls = [element.text for element in root.findall(".//{*}loc")]
    # All blogs and industries; fixed pages; spread sample across product listing.
    blogs = [u for u in urls if "/blog/" in u]
    products = [u for u in urls if "/products/" in u]
    others = [u for u in urls if u not in blogs and u not in products]
    sample = list(dict.fromkeys(products[::max(1, len(products)//16)][:16] + products[:3]))
    selected = list(dict.fromkeys(others + blogs + sample + [BASE + "/privacy", BASE + "/terms", BASE + "/cookies"]))
    robots_response, robots = fetch(BASE + "/robots.txt")
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        pages = list(pool.map(audit, selected))
    redirects = [audit(u) for u in ("http://smartechvacuum.com", "https://smartechvacuum.com", BASE + "/blog/22", BASE + "/seo-audit-missing-page-20260909")]
    report = {"checked_at_utc": datetime.now(timezone.utc).isoformat(), "method": "public HTTP HTML, no browser or search index access; four workers",
              "sitemap_response": sitemap_response, "sitemap_urls": urls,
              "counts": {"sitemap": len(urls), "unique": len(set(urls)), "blogs": len(blogs), "products": len(products), "other": len(others), "sampled_pages": len(pages)},
              "robots_response": robots_response, "robots": robots, "pages": pages, "redirect_and_404_probes": redirects}
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps({"counts": report["counts"], "status_counts": dict(Counter(str(p.get("status")) for p in pages)), "output": str(OUT)}, ensure_ascii=False))


if __name__ == "__main__":
    main()
