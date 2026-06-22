#!/usr/bin/env python3
"""Import the owner's promoted Luogu solutions into Hexo posts."""

from __future__ import annotations

import json
import re
import subprocess
import sys
import time
from datetime import datetime
from html import unescape
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
POSTS_DIR = ROOT / "source" / "_posts"
REPORT_PATH = ROOT / "tmp" / "luogu-import-report.json"
AUTHOR_UID = 226760

# Read from the logged-in "全站推荐" list on 2026-06-22. Non-solution
# categories (two travel notes and one algorithm article) are intentionally
# omitted.
ARTICLE_IDS = [
    "imhpnubt", "qu7zpgzi", "0hmo0mdd", "oraifzp9", "tt60cfml",
    "vqnuf0az", "e7qlxddg", "uncnaxx6", "higstxh6", "xap3la6s",
    "s2n9ggfs", "ilbvs1nv", "94rrt68s", "y9x1dscm", "0ua1720q",
    "giv2oyny", "ufxzgqmz", "2mq3l9jp", "uskev68d", "uan9rkvo",
    "92h7feca", "z7qabciy", "sbtaedbl", "8yjuq5j1", "2etsnoml",
    "4opn09he", "4hlqbebw", "ic9fkggx", "rlyn7fgm", "58dxopwh",
    "kofqj4gf", "carqxqk0", "0u2pue2e", "otm5w87m", "q5l41fpw",
    "83gnu31o", "5t331m2d", "ikr9a8ul", "3pn95rno", "bplxu9nf",
    "0ssvuc65", "qldraca0", "4g4e1rjk", "67e36x2k", "pehaxfzi",
    "0p7umtp1", "391fczq0", "vflrpd4s", "nrxrtm7u", "va2v9dsy",
    "4rhoep79", "ow5o19vi",
]


def fetch_article(article_id: str) -> dict:
    url = f"https://www.luogu.com.cn/article/{article_id}"
    command = (
        "$ProgressPreference='SilentlyContinue';"
        f"(Invoke-WebRequest -UseBasicParsing -Uri '{url}' "
        "-Headers @{'User-Agent'='Mozilla/5.0'}).Content"
    )
    result = subprocess.run(
        ["powershell.exe", "-NoProfile", "-Command", command],
        capture_output=True,
        text=True,
        encoding="utf-8",
        timeout=30,
        check=False,
    )
    if result.returncode != 0:
        raise RuntimeError(result.stderr.strip() or f"PowerShell exited {result.returncode}")
    html = result.stdout
    match = re.search(
        r'<script\s+id="lentille-context"\s+type="application/json">(.*?)</script>',
        html,
        re.S,
    )
    if not match:
        return legacy_article(article_id)
    payload = json.loads(unescape(match.group(1)))
    article = payload["data"]["article"]
    article["url"] = url
    return article


def strip_front_matter(text: str) -> str:
    match = re.match(r"^---\s*\n.*?\n---\s*\n", text, re.S)
    return text[match.end():].strip() if match else text.strip()


def legacy_article(article_id: str) -> dict:
    """Recover two older articles that show a browser-only access page to scripts."""
    common = {
        "lid": article_id,
        "category": 2,
        "author": {"uid": AUTHOR_UID},
        "url": f"https://www.luogu.com.cn/article/{article_id}",
    }
    if article_id == "4rhoep79":
        return {
            **common,
            "title": "题解 P5634 【数码排序【加强版】】",
            "time": 1573348465,
            "solutionFor": {"pid": "P5634", "name": "数码排序【加强版】"},
            "content": (
                "高精度对于 Python 来说不是个事。\n\n"
                "思路与原版相同。\n\n"
                "```python\n"
                "import math\n"
                "n = int(input())\n"
                "l = int(math.log(n - 1, 2)) + 1\n"
                "res = n * l\n"
                "res = res - 2 ** l\n"
                "res = res + 1\n"
                "t = n * (n - 1) // 2\n"
                "print(min(res, t) % 100000007)\n"
                "```"
            ),
        }
    if article_id == "ow5o19vi":
        legacy_path = POSTS_DIR / "CF1545D AquaMoon and Wrong Coordinate 题解 - 副本.md"
        if not legacy_path.exists():
            raise RuntimeError(f"{article_id}: legacy source file is missing")
        return {
            **common,
            "title": "CF1545D AquaMoon and Wrong Coordinate 题解",
            "time": 1626062514,
            "solutionFor": {
                "pid": "CF1545D",
                "name": "AquaMoon and Wrong Coordinate",
            },
            "content": strip_front_matter(legacy_path.read_text(encoding="utf-8")),
        }
    raise RuntimeError(f"{article_id}: missing lentille-context")


def yaml_quote(value: str) -> str:
    return json.dumps(value, ensure_ascii=False)


def safe_filename(value: str) -> str:
    value = re.sub(r'[<>:"/\\|?*\x00-\x1f]', " ", value)
    value = re.sub(r"\s+", " ", value).strip().rstrip(".")
    return value[:180]


def normalized_title(article: dict) -> tuple[str, str | None]:
    solution = article.get("solutionFor")
    if solution:
        pid = solution["pid"].strip()
        name = solution["name"].strip()
        return f"{pid} {name} 题解", pid

    # Very old articles may no longer expose solutionFor. Normalize the
    # visible title while preserving all useful problem information.
    title = article["title"].strip()
    title = re.sub(r"^\s*题解\s*[：:]?\s*", "", title)
    title = re.sub(r"\s*题解\s*$", "", title)
    title = title.replace("【", "").replace("】", "")
    match = re.search(r"\b((?:CF|P|UVA)\s*\d+[A-Z0-9-]*)\b", title, re.I)
    pid = re.sub(r"\s+", "", match.group(1)).upper() if match else None
    return f"{title.strip()} 题解", pid


def build_post(article: dict, title: str) -> str:
    published = datetime.fromtimestamp(article["time"]).astimezone()
    date = published.strftime("%Y-%m-%d %H:%M:%S")
    content = article["content"].strip()
    source = article["url"]
    return (
        "---\n"
        f"title: {yaml_quote(title)}\n"
        f"date: {date}\n"
        "categories:\n"
        "  - 题解\n"
        "tags:\n"
        "  - 题解\n"
        "  - 洛谷\n"
        f"luogu_article: {yaml_quote(article['lid'])}\n"
        f"source: {yaml_quote(source)}\n"
        "---\n\n"
        f"> 本文迁移自[洛谷原文]({source})。\n\n"
        f"{content}\n"
    )


def existing_problem_id(path: Path) -> str | None:
    text = path.read_text(encoding="utf-8", errors="replace")[:3000]
    match = re.search(r"\b((?:CF|P|UVA)\s*\d+[A-Z0-9-]*)\b", text, re.I)
    return re.sub(r"\s+", "", match.group(1)).upper() if match else None


def main() -> int:
    POSTS_DIR.mkdir(parents=True, exist_ok=True)
    REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)

    articles: list[dict] = []
    errors: list[dict] = []
    for index, article_id in enumerate(ARTICLE_IDS, 1):
        try:
            article = fetch_article(article_id)
            if article["author"]["uid"] != AUTHOR_UID:
                raise RuntimeError(f"unexpected author uid {article['author']['uid']}")
            if article["category"] != 2:
                raise RuntimeError(f"unexpected category {article['category']}")
            articles.append(article)
            print(f"[{index:02d}/{len(ARTICLE_IDS)}] {article_id}: {article['title']}")
        except Exception as exc:  # noqa: BLE001 - collect a complete report
            errors.append({"id": article_id, "error": str(exc)})
            print(f"[{index:02d}/{len(ARTICLE_IDS)}] {article_id}: ERROR {exc}", file=sys.stderr)
        time.sleep(0.08)

    existing_by_pid: dict[str, list[Path]] = {}
    for path in POSTS_DIR.glob("*.md"):
        pid = existing_problem_id(path)
        if pid:
            existing_by_pid.setdefault(pid, []).append(path)

    written: list[str] = []
    removed_duplicates: list[str] = []
    imported_pids: set[str] = set()
    for article in articles:
        title, pid = normalized_title(article)
        filename = safe_filename(title) + ".md"
        target = POSTS_DIR / filename
        target.write_text(build_post(article, title), encoding="utf-8", newline="\n")
        written.append(target.name)

        if pid:
            imported_pids.add(pid)
            for old_path in existing_by_pid.get(pid, []):
                if old_path.resolve() != target.resolve() and old_path.exists():
                    old_path.unlink()
                    removed_duplicates.append(old_path.name)

    report = {
        "requested": len(ARTICLE_IDS),
        "fetched": len(articles),
        "errors": errors,
        "written": written,
        "removed_duplicates": sorted(set(removed_duplicates)),
        "imported_problem_ids": sorted(imported_pids),
    }
    REPORT_PATH.write_text(
        json.dumps(report, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 1 if errors else 0


if __name__ == "__main__":
    raise SystemExit(main())
