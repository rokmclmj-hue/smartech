# -*- coding: utf-8 -*-
"""스마텍 홈페이지 매주 기계 점검 (docs/audits/site-review-playbook.md 4장).

정답이 정해진 항목만 라이브 사이트(비회원)로 확인하고, 결과를 바탕화면 `스마텍_주간점검` 폴더에 남긴다.
파일 이름: YYYY-MM-DD_이상없음.md / YYYY-MM-DD_확인필요N건.md
코드·DB는 고치지 않는다. Windows 예약 작업 SmartechWeeklySiteCheck(월 10:00, 창 없음)이 실행한다.

수동 실행: python scripts/weekly_site_check.py
"""
import html
import json
import os
import random
import re
import subprocess
import sys
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BASE = "https://www.smartechvacuum.com"
OUT_DIR = Path.home() / "Desktop" / "스마텍_주간점검"
STATE_FILE = OUT_DIR / "state.json"
KNOWN_FILE = ROOT / "scripts" / "weekly-check-known.json"
NODE = r"C:\Program Files\nodejs\node.exe"
UA = {"User-Agent": "SmartechWeeklyCheck/1.0"}

# 사양표 행 이름 → 카탈로그 행 이름(정규식). 값이 그냥 숫자인 행만 대조한다(과학 표기 도달압력 등은 월간 점검에서 사람이 본다)
SPEC_LABELS = [
    ("배기속도 (Peak)", r"Peak\s+pumping\s+speed"),
    ("최대 배기속도", r"Peak\s+(?:pumping\s+)?speed|Maximum\s+pumping\s+speed"),
    ("작동 온도", r"Operating\s+temperature|Ambient\s+(?:operating\s+)?temperature|temperature\s+range"),
    ("무게", r"\bWeight\b|\bMass\b"),
]


def fetch(path, timeout=60):
    url = path if path.startswith("http") else BASE + path
    req = urllib.request.Request(url, headers=UA)
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return r.status, r.read().decode("utf-8", "replace")
    except urllib.error.HTTPError as e:
        return e.code, ""
    except Exception as e:  # 네트워크 오류는 결과에 그대로 적는다
        return 0, str(e)


def visible_text(s):
    s = re.sub(r"<script.*?</script>", " ", s, flags=re.S)
    return html.unescape(re.sub(r"<[^>]+>", " ", s))


def ld_json(s):
    out = []
    for b in re.findall(r'<script type="application/ld\+json"[^>]*>(.*?)</script>', s, re.S):
        try:
            out.append(json.loads(b))
        except Exception:
            out.append({"_parse_error": True})
    return out


# ── 1. 사양표 ↔ 카탈로그 ──────────────────────────────────────────
def parse_spec_data():
    src = (ROOT / "lib" / "product-specs.ts").read_text(encoding="utf-8")
    data = {}
    for m in re.finditer(r'^  "([^"]+)": \{\s*\n\s*models: \[([^\]]*)\],\s*\n\s*rows: \[(.*?)\n    \],', src, re.S | re.M):
        cat = m.group(1)
        models = re.findall(r'"([^"]+)"', m.group(2))
        rows = []
        for r in re.finditer(r'\{ label: "([^"]+)", unit: "([^"]*)", values: \[([^\]]*)\] \}', m.group(3)):
            rows.append((r.group(1), r.group(2), re.findall(r'"([^"]*)"', r.group(3))))
        data[cat] = (models, rows)
    return data


def parse_catalog_map():
    src = (ROOT / "lib" / "catalogs.ts").read_text(encoding="utf-8")
    return {k: v for k, v in re.findall(r'"([^"]+)":\s*"/api/catalog\?file=([^"]+)"', src)}


def nums(text):
    return [float(x.replace(",", "")) for x in re.findall(r"\d[\d,]*\.?\d*", text)]


def value_found(value, pool):
    """사이트 값의 숫자들이 카탈로그 숫자 묶음에 모두 있는지(±1.5%, cfm→m³/h 환산도 허용)."""
    wanted = nums(value)
    if not wanted:
        return True
    for w in wanted:
        ok = False
        for c in pool:
            for cand in (c, c * 1.699):  # cfm → m³/h
                if cand and abs(cand - w) <= max(0.015 * w, 0.051):
                    ok = True
                    break
            if ok:
                break
        if not ok:
            return False
    return True


def check_specs(known):
    import fitz  # PyMuPDF
    issues, checked, skipped = [], 0, 0
    spec = parse_spec_data()
    catmap = parse_catalog_map()
    for cat, (models, rows) in spec.items():
        pdf = catmap.get(cat)
        if not pdf or not (ROOT / "public" / "catalogs" / pdf).exists():
            skipped += 1
            continue
        doc = fitz.open(ROOT / "public" / "catalogs" / pdf)
        text = "\n".join(p.get_text() for p in doc)
        for label, unit, values in rows:
            pat = next((p for l, p in SPEC_LABELS if label.startswith(l)), None)
            if not pat:
                continue
            hits = [m.end() for m in re.finditer(pat, text, re.I)]
            if not hits:
                skipped += 1
                continue
            pool = []
            for h in hits:
                pool += nums(text[h:h + 500])
            for model, v in zip(models, values):
                if v in ("-", "—", ""):
                    continue
                checked += 1
                key = f"{cat}|{label}|{model}|{v}"
                if key in known.get("spec_ok", []):
                    continue
                if not value_found(v, pool):
                    issues.append(f"사양 불일치 의심: {cat} · {model} · {label} = {v} {unit} (카탈로그 {pdf}에서 같은 행 값 못 찾음)")
    return issues, f"사양 값 {checked}개 대조, 대조 불가 {skipped}건(카탈로그 없음·행 이름 못 찾음)"


# ── 2. 사이트맵·블로그 ────────────────────────────────────────────
def sitemap():
    st, s = fetch("/sitemap.xml")
    locs = re.findall(r"<loc>([^<]+)</loc>", s)
    paths = [l.replace(BASE, "") or "/" for l in locs]
    return st, paths


def check_blog(paths):
    issues = []
    posts = [p for p in paths if re.match(r"^/blog/[^/?]+$", p)]

    def one(p):
        st, s = fetch(p)
        if st != 200:
            return [f"블로그 {p} 응답 {st}"]
        out = []
        body = visible_text(s)
        for j in ld_json(s):
            if isinstance(j, list) or j.get("_parse_error"):
                out.append(f"블로그 {p} 검색엔진용 데이터 형식 오류(배열/파싱 실패)")
                continue
            if j.get("@type") == "FAQPage":
                qs = [q.get("name", "") for q in j.get("mainEntity", [])]
                miss = [q for q in qs if html.unescape(q)[:20] not in body]
                if miss:
                    out.append(f"블로그 {p} FAQ {len(miss)}/{len(qs)}개가 화면에 안 보임")
            if j.get("@type") == "Article" and "http" in j.get("articleBody", ""):
                out.append(f"블로그 {p} articleBody에 주소(http) 섞임")
        return out

    with ThreadPoolExecutor(6) as ex:
        for r in ex.map(one, posts):
            issues += r
    return issues, f"블로그 {len(posts)}편"


# ── 3. 파트번호 화면 ─────────────────────────────────────────────
def check_sku(paths):
    issues = []
    skus = [p for p in paths if re.match(r"^/products/[A-Z0-9][^/]*$", p)]
    random.seed(datetime.now().strftime("%Y%W"))
    sample = ["/products/A65501903", "/products/A73701983"] + random.sample(skus, min(8, len(skus)))
    for p in sample:
        st, s = fetch(p)
        if st != 200:
            issues.append(f"파트번호 {p} 응답 {st}")
            continue
        prod = next((j for j in ld_json(s) if isinstance(j, dict) and j.get("@type") == "Product"), None)
        if not prod:
            issues.append(f"파트번호 {p} 구조화 데이터(Product) 없음")
            continue
        avail = prod.get("offers", {}).get("availability", "")
        price = prod.get("offers", {}).get("price", 0) or 0
        body = visible_text(s)
        if avail.endswith("InStock") and "바로 출고 가능" not in body:
            issues.append(f"파트번호 {p} 재고 있음(InStock)인데 화면에 '바로 출고 가능' 없음")
        if avail.endswith("OutOfStock") and "(재고 없음)" not in body:
            issues.append(f"파트번호 {p} 재고 없음(OutOfStock)인데 화면 문구 다름")
        if avail.endswith("Discontinued") and "단종" not in body:
            issues.append(f"파트번호 {p} 단종인데 화면에 단종 표시 없음")
        if not avail.endswith("Discontinued") and price > 0 and "견적 카트에 추가" not in body:
            issues.append(f"파트번호 {p} 비회원 '견적 카트에 추가' 버튼 없음")
    return issues, f"파트번호 {len(sample)}개(고정 2 + 이번 주 무작위 {len(sample) - 2})"


# ── 4. 산업 페이지 → 모델 링크 ───────────────────────────────────
def check_industries(paths):
    issues, links, total = [], set(), 0
    for p in [p for p in paths if p.startswith("/industries/")]:
        st, s = fetch(p)
        found = set(re.findall(r'href="(/products/edwards-[^"]+)"', s))
        if st != 200 or not found:
            issues.append(f"산업 {p} 응답 {st}, 모델 링크 {len(found)}개")
        links |= found
        total += len(re.findall(r'href="/products/edwards-[^"]+"', s))
    with ThreadPoolExecutor(6) as ex:
        for l, (st, _) in zip(sorted(links), ex.map(fetch, sorted(links))):
            if st != 200:
                issues.append(f"모델 링크 {l} 응답 {st}")
    return issues, total, f"산업 페이지 모델 링크 {total}개(고유 {len(links)}곳)"


# ── 5. 원가 노출 검사 ────────────────────────────────────────────
def check_leaks():
    try:
        r = subprocess.run([NODE, "scripts/check-public-leaks.mjs"], cwd=ROOT, capture_output=True,
                           text=True, encoding="utf-8", errors="replace", timeout=600,
                           creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0))
        if r.returncode != 0:
            tail = "\n".join((r.stdout + r.stderr).strip().splitlines()[-8:])
            return [f"원가·개인정보 노출 검사 실패(종료 코드 {r.returncode}):\n```\n{tail}\n```"], "노출 검사 실패"
        return [], "노출 검사 통과"
    except Exception as e:
        return [f"노출 검사 실행 못 함: {e}"], "노출 검사 실행 못 함"


# ── 6. robots·사이트맵 개수 변화 ─────────────────────────────────
def check_counts(paths, model_links, state):
    issues = []
    counts = {
        "전체": len(paths),
        "모델": sum(1 for p in paths if p.startswith("/products/edwards-")),
        "파트번호": sum(1 for p in paths if re.match(r"^/products/[A-Z0-9]", p)),
        "블로그": sum(1 for p in paths if re.match(r"^/blog/[^/?]+$", p)),
        "산업": sum(1 for p in paths if p.startswith("/industries/")),
        "산업→모델 링크": model_links,
    }
    prev = state.get("counts", {})
    for k, v in counts.items():
        if prev.get(k) and v < prev[k] * 0.95:
            issues.append(f"{k} 수가 지난번 {prev[k]} → 이번 {v}로 5% 넘게 줄어듦")
    st, robots = fetch("/robots.txt")
    if st != 200 or re.search(r"^Disallow:\s*/\s*$", robots, re.M):
        issues.append(f"robots.txt 이상(응답 {st}, 또는 사이트 전체 차단 줄 있음)")
    return issues, counts


def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    state = json.loads(STATE_FILE.read_text(encoding="utf-8")) if STATE_FILE.exists() else {}
    known = json.loads(KNOWN_FILE.read_text(encoding="utf-8")) if KNOWN_FILE.exists() else {}
    started = datetime.now()

    sections, issues = [], []
    st, paths = sitemap()
    if st != 200 or not paths:
        issues.append(f"사이트맵을 읽지 못함(응답 {st}) — 다른 점검도 불완전")

    for name, fn in [("1. 사양표 ↔ 카탈로그", lambda: check_specs(known)),
                     ("2. 블로그 FAQ·요약문", lambda: check_blog(paths)),
                     ("3. 파트번호 화면", lambda: check_sku(paths))]:
        try:
            iss, summary = fn()
        except Exception as e:
            iss, summary = [f"{name} 점검 중 오류: {e}"], "오류"
        issues += iss
        sections.append((name, summary, iss))

    try:
        iss, model_links, summary = check_industries(paths)
    except Exception as e:
        iss, model_links, summary = [f"산업 페이지 점검 중 오류: {e}"], 0, "오류"
    issues += iss
    sections.append(("4. 산업 페이지 → 모델", summary, iss))

    iss, summary = check_leaks()
    issues += iss
    sections.append(("5. 원가·개인정보 노출", summary, iss))

    iss, counts = check_counts(paths, model_links, state)
    issues += iss
    sections.append(("6. 사이트맵·robots", ", ".join(f"{k} {v}" for k, v in counts.items()), iss))

    day = started.strftime("%Y-%m-%d")
    name = f"{day}_이상없음.md" if not issues else f"{day}_확인필요{len(issues)}건.md"
    lines = [f"# 스마텍 홈페이지 주간 기계 점검 — {day}", "",
             f"- 실행: {started:%H:%M} ~ {datetime.now():%H:%M}, 비회원 상태 라이브 사이트",
             f"- 결과: {'이상 없음' if not issues else f'확인 필요 {len(issues)}건'}",
             "- 이 점검은 정답이 정해진 항목만 본다. 글 내용·고객 흐름·방향성은 매달 지시서(docs/audits/site-review-playbook.md)로.",
             "- 문제가 있으면 클로드에게 \"주간 점검 확인필요 봐줘\"라고 이 파일을 알려 주세요. 코드는 아무것도 바뀌지 않았습니다.", ""]
    for title, summary, iss in sections:
        lines.append(f"## {title} — {'✅' if not iss else '⚠️'} {summary}")
        lines += [f"- {i}" for i in iss] or ["- 이상 없음"]
        lines.append("")
    (OUT_DIR / name).write_text("\n".join(lines), encoding="utf-8-sig")
    state.update({"last_run": started.isoformat(timespec="seconds"), "counts": counts, "last_report": name})
    STATE_FILE.write_text(json.dumps(state, ensure_ascii=False, indent=1), encoding="utf-8")
    print(OUT_DIR / name)
    return 0


if __name__ == "__main__":
    sys.exit(main())
