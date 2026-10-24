"""Local agent dashboard.

Reads the four radio files on origin/main and writes
C:\\Users\\MichaelThomson\\Desktop\\agents.html.
With --serve, http://127.0.0.1:5510/ rebuilds the page on each load.
"""
from __future__ import annotations

import hashlib
import html
import json
import re
import subprocess
import threading
import time
import urllib.error
import urllib.request
from datetime import datetime, timedelta, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

SITE = Path(r"C:\Users\MichaelThomson\source\hackathon-site")
API = Path(r"C:\Users\MichaelThomson\source\hackathon-api")
OUT = Path(r"C:\Users\MichaelThomson\Desktop\agents.html")
PORT = 5510
FETCH_GAP_S = 15
WINDOW_S = 3 * 60 * 60
BUCKET_S = 10 * 60

AGENTS = (
    {
        "key": "integrator",
        "name": "Integrator",
        "seat": "Dobby",
        "colour": "#f59e0b",
        "radio": "docs/radio/integrator.md",
        "checkout": SITE,
        "role": "Leads, names the next slice, and deploys the box.",
    },
    {
        "key": "po",
        "name": "Product owner",
        "seat": "PO",
        "colour": "#c4b5fd",
        "radio": "docs/radio/po.md",
        "checkout": Path(r"C:\Users\MichaelThomson\source\lanes\po\hackathon-site"),
        "role": "Feeds both queues and keeps improving this dashboard. No other product code.",
    },
    {
        "key": "dev1",
        "name": "grok-dev-1",
        "seat": "API",
        "colour": "#38bdf8",
        "radio": "docs/radio/grok-dev-1.md",
        "checkout": Path(r"C:\Users\MichaelThomson\source\lanes\grok-dev-1\hackathon-api"),
        "role": "Not specialised. Builds the queue in po.md. The API checkout is beside this seat.",
    },
    {
        "key": "dev2",
        "name": "grok-dev-2",
        "seat": "Map",
        "colour": "#4ade80",
        "radio": "docs/radio/grok-dev-2.md",
        "checkout": Path(r"C:\Users\MichaelThomson\source\lanes\grok-dev-2\hackathon-site"),
        "role": "Not specialised. Builds the queue in po.md. The ops map is not the taxi game.",
    },
)

_lock = threading.Lock()
_last_fetch = 0.0
_page = "<!DOCTYPE html><title>Agents</title><p>Building the dashboard.</p>"


def git(args: list[str], cwd: Path, timeout: int = 30) -> str:
    try:
        done = subprocess.run(
            ["git", *args],
            cwd=cwd,
            capture_output=True,
            text=True,
            timeout=timeout,
            encoding="utf-8",
            errors="replace",
        )
    except (OSError, subprocess.TimeoutExpired) as exc:
        return f"(git failed: {exc})"
    if done.returncode != 0:
        err = (done.stderr or done.stdout or "git failed").strip()
        return f"({err.splitlines()[0] if err else 'git failed'})"
    return (done.stdout or "").strip()


def refresh_origin() -> None:
    global _last_fetch
    now = time.time()
    if now - _last_fetch < FETCH_GAP_S:
        return
    git(["fetch", "origin", "main"], SITE, timeout=45)
    if API.is_dir():
        git(["fetch", "origin", "main"], API, timeout=45)
    _last_fetch = time.time()


def parse_when(raw: str) -> datetime | None:
    text = (raw or "").strip()
    if not text or text.startswith("("):
        return None
    try:
        return datetime.fromisoformat(text.replace("Z", "+00:00"))
    except ValueError:
        return None


def fmt_when(when: datetime | None) -> tuple[str, str, str]:
    if when is None:
        return "No report yet", "—", "quiet"
    local = when.astimezone()
    clock = local.strftime("%H:%M:%S")
    day = local.strftime("%d %b %Y")
    age_s = (datetime.now(timezone.utc) - when.astimezone(timezone.utc)).total_seconds()
    if age_s < 0:
        age_s = 0
    if age_s < 90:
        ago = "just now"
    elif age_s < 3600:
        ago = f"{int(age_s // 60)} min ago"
    elif age_s < 86400:
        ago = f"{int(age_s // 3600)} h ago"
    else:
        ago = f"{int(age_s // 86400)} d ago"
    state = "active" if age_s < 20 * 60 else "quiet"
    return f"{day} · {clock}", ago, state


def radio_turn(times: list[int], now: int, gap_s: int = 20 * 60, aim_s: int = 20 * 60) -> dict:
    """Judge the newest run of one lane's radio commits.

    A gap of more than 20 minutes starts another turn. One or two radios in
    the newest turn is short. More than two, or a run of 20 minutes, is about
    30 minutes.
    """
    ordered = sorted({int(ts) for ts in times if int(ts) > 0})
    if not ordered:
        return {"verdict": "short", "count": 0, "span_min": 0}
    run = [ordered[-1]]
    for ts in reversed(ordered[:-1]):
        if run[-1] - ts > gap_s:
            break
        run.append(ts)
    run.sort()
    span_s = run[-1] - run[0]
    count = len(run)
    if count > 2 or span_s >= aim_s:
        verdict = "about 30 minutes"
    else:
        verdict = "short"
    return {"verdict": verdict, "count": count, "span_min": span_s // 60}


def turn_sentence(times: list[int], now: int) -> str:
    """One line: last-turn length, how many radios, and how many minutes."""
    turn = radio_turn(times, now)
    noun = "radio" if turn["count"] == 1 else "radios"
    return f"Turn {turn['verdict']} · {turn['count']} {noun} over {turn['span_min']} min"


def radio_commit_times(path: str, limit: int = 120) -> list[int]:
    """Unix times of that radio file on origin/main, newest first."""
    raw = git(["log", f"-{limit}", "--format=%ct", "origin/main", "--", path], SITE)
    times = []
    for line in raw.splitlines():
        line = line.strip()
        if line.isdigit():
            times.append(int(line))
    return times


def now_section(text: str) -> str:
    start = text.find("## Now")
    if start < 0:
        return text[:2500]
    rest = text[start:]
    nxt = rest.find("\n## ", 4)
    body = rest if nxt < 0 else rest[:nxt]
    return body.strip()


def order_for(now_text: str, key: str) -> str:
    labels = {
        "integrator": "integrator",
        "po": "product owner",
        "dev1": "grok-dev-1",
        "dev2": "grok-dev-2",
    }
    want = labels[key]
    for line in now_text.splitlines():
        if not line.startswith("|"):
            continue
        cells = [cell.strip() for cell in line.strip("|").split("|")]
        if len(cells) < 3:
            continue
        if cells[0].lower() == want:
            return cells[2]
    return "No order row in the Now table."


def headline(text: str) -> str:
    lines = []
    for line in text.splitlines():
        stripped = line.strip()
        if not stripped or stripped.startswith("#"):
            continue
        lines.append(stripped)
        if len(lines) == 2:
            break
    return " ".join(lines)[:420]


def own_next(text: str) -> str:
    match = re.search(r"Next:\s*(.+)", text)
    if not match:
        return ""
    return match.group(1).strip()


def section_between(text: str, start: str, end: str) -> str:
    """Slice from a heading at the start of a line to the next heading."""
    match = re.search(rf"^{re.escape(start)}\s*$", text, re.M)
    if not match:
        return ""
    begin = match.start()
    finish = re.search(rf"^{re.escape(end)}\s*$", text[begin + len(start):], re.M)
    if not finish:
        return text[begin:].strip()
    return text[begin: begin + len(start) + finish.start()].strip()


def paused_issue_numbers(text: str) -> set[int]:
    """Issue numbers the integrator has told the lanes not to build."""
    found: set[int] = set()
    for line in text.splitlines():
        low = line.lower()
        if not any(word in low for word in ("paus", "do not build", "do not start", "wrong work")):
            continue
        for start, finish in re.findall(r"#(\d+)\s+through\s+#(\d+)", line):
            lo, hi = int(start), int(finish)
            if 0 < hi - lo < 200:
                found.update(range(lo, hi + 1))
        found.update(int(number) for number in re.findall(r"#(\d+)", line))
    return found


def parse_po_plan(text: str) -> tuple[str, list[dict], list[dict]]:
    """Preamble, issue rows, and every heading in po.md, including an empty queue."""
    items: list[dict] = []
    sections: list[dict] = []
    preamble = ""
    for chunk in re.split(r"(?=^#{2,3} )", text, flags=re.M):
        lines = chunk.splitlines()
        if not lines or not lines[0].startswith("#"):
            continue
        heading = lines[0].lstrip("#").strip()
        body = "\n".join(lines[1:]).strip()
        if heading.lower() == "product owner":
            preamble = body
            continue
        files = ""
        for line in lines[1:]:
            if line.lower().startswith("files"):
                files = line.strip()
                break
        nxt = ""
        nxt_match = re.search(r"^Next:\s*(.+)$", body, re.M)
        if nxt_match:
            nxt = nxt_match.group(1).strip()
        low_heading = heading.lower()
        if low_heading.startswith("reservoir"):
            kind = "reservoir"
        elif low_heading.startswith("next for me"):
            kind = "self"
        else:
            kind = "queue"
        jobs = []
        for line in lines[1:]:
            stripped = line.strip()
            if not stripped.startswith("- "):
                continue
            if stripped.lower() in {"- none yet", "- none"}:
                continue
            if re.match(r"- #\d+\b", stripped):
                continue
            jobs.append(stripped[2:].strip())
        before = len(items)
        for match in re.finditer(r"^- #(\d+)\s+(.+)$", body, re.M):
            rest = match.group(2).strip()
            labels = ""
            title = rest
            if ". Label " in rest:
                title, labels = rest.split(". Label ", 1)
                labels = labels.strip().rstrip(".")
            title = title.strip().rstrip(".")
            number = int(match.group(1))
            items.append(
                {
                    "number": number,
                    "title": title,
                    "labels": labels,
                    "files": files,
                    "next": nxt,
                    "is_next": bool(title) and (
                        nxt.lower().startswith(title.lower()) or f"#{number}" in nxt
                    ),
                    "section": kind,
                    "lane": heading,
                }
            )
        sections.append(
            {
                "lane": heading,
                "files": files,
                "next": nxt,
                "section": kind,
                "jobs": jobs,
                "count": len(items) - before,
                "skipped": skip_issue_numbers(body),
            }
        )
    return preamble, items, sections


def markdown_table(text: str) -> list[list[str]]:
    rows = []
    for line in text.splitlines():
        if not line.startswith("|"):
            continue
        cells = [cell.strip() for cell in line.strip().strip("|").split("|")]
        if len(cells) < 2:
            continue
        if all(set(cell) <= set("-: ") and cell for cell in cells):
            continue
        if cells[0].lower() == "lane":
            continue
        rows.append(cells)
    return rows


def empire_car_count() -> int | None:
    if not API.is_dir():
        return None
    source = git(["show", "origin/main:app/empire.py"], API)
    if not source or source.startswith("("):
        return None
    signs = re.findall(r'\("T\d+"', source)
    if signs:
        return len(set(signs))
    block = re.search(r"CARS\s*=\s*tuple\((.*?)\)\s*\n", source, re.S)
    if block:
        colours = re.findall(r'"#[0-9A-Fa-f]{3,8}"', block.group(1))
        if colours:
            return len(colours)
    if re.search(r"T1 through T10", source):
        return 10
    return None


def path_on_main(repo: Path, path: str) -> bool:
    """True when git cat-file finds the path. Success prints nothing."""
    return git(["cat-file", "-e", f"origin/main:{path}"], repo) == ""


def checkout_line(path: Path) -> str:
    if not path.is_dir():
        return "Checkout folder is not on this PC."
    branch = git(["status", "-sb"], path)
    first = branch.splitlines()[0] if branch else "(no status)"
    stamp = git(["log", "-1", "--format=%cI"], path)
    subject = git(["log", "-1", "--format=%h %s"], path)
    when, ago, _state = fmt_when(parse_when(stamp.splitlines()[0] if stamp else ""))
    return f"{first}. Last local commit {when} ({ago}). {subject}"


def po_titles(text: str) -> list[tuple[int, str]]:
    start = text.find("### Product owner titles")
    if start < 0:
        return []
    end = text.find("\n### ", start + 10)
    block = text[start:] if end < 0 else text[start:end]
    found = re.findall(r"^(\d+)\. `([^`]+)`", block, re.M)
    return [(int(number), title) for number, title in found]


def slice_marks(text: str) -> dict[tuple[str, int], str]:
    """Slices the integrator has marked as already on main. Value is the SHA."""
    done: dict[tuple[str, int], str] = {}
    pattern = re.compile(
        r"^(?P<kind>[AU])(?P<num>\d+) is on `main`(?: at `([0-9a-f]+)`)?",
        re.M,
    )
    for match in pattern.finditer(text):
        done[(match.group("kind"), int(match.group("num")))] = match.group(3) or ""
    return done


def slice_blurbs(text: str) -> dict[tuple[str, int], str]:
    blurbs: dict[tuple[str, int], str] = {}
    for match in re.finditer(r"^([AU])(\d+)\. (.+)$", text, re.M):
        blurbs[(match.group(1), int(match.group(2)))] = match.group(3).strip()
    for match in re.finditer(
        r"^([AU])(\d+) is on `main`[^\n]*?Skip it\.\s*(.+)$",
        text,
        re.M,
    ):
        blurbs[(match.group(1), int(match.group(2)))] = match.group(3).strip()
    return blurbs


def radio_frontier(text: str, kind: str) -> int:
    """Highest slice number implied done by a lane radio that says Next: U7."""
    highest = 0
    for match in re.finditer(rf"Next:\s*{kind}(\d+)", text):
        highest = max(highest, int(match.group(1)) - 1)
    return highest


def series_numbers(blurbs: dict[tuple[str, int], str], kind: str) -> list[int]:
    nums = [num for (k, num) in blurbs if k == kind]
    if not nums:
        return list(range(1, 33))
    return list(range(1, max(nums) + 1))


def lane_of(files: list[str]) -> str:
    blob = "\n".join(files)
    product = any(
        path.startswith("app/") or path.startswith("scripts/") or path.endswith(".html")
        for path in files
        if not path.startswith("docs/radio/")
    )
    if "app/map.js" in blob or "app/map.css" in blob or "app/index.html" in blob:
        return "dev2"
    if "office" in blob or "taxi_fare" in blob:
        return "dev1"
    if product and "docs/radio/grok-dev-2.md" in blob:
        return "dev2"
    if product and "docs/radio/grok-dev-1.md" in blob:
        return "dev1"
    if files == ["docs/radio/po.md"] or blob.strip() == "docs/radio/po.md":
        return "po"
    if "docs/radio/po.md" in blob and not product:
        return "po"
    if "docs/radio/grok-dev-1.md" in blob and not product:
        return "dev1"
    if "docs/radio/grok-dev-2.md" in blob and not product:
        return "dev2"
    if "docs/radio/integrator.md" in blob or "scripts/agents_dashboard.py" in blob:
        return "integrator"
    if product:
        return "integrator"
    return "other"


def site_commits() -> list[dict]:
    raw = git(
        [
            "log",
            "--since=3 hours ago",
            "--format=%x1e%ct%x09%h%x09%s",
            "--name-only",
            "origin/main",
        ],
        SITE,
        timeout=45,
    )
    commits = []
    for block in raw.split("\x1e"):
        block = block.strip()
        if not block:
            continue
        lines = block.splitlines()
        parts = lines[0].split("\t", 2)
        if len(parts) != 3:
            continue
        files = [line.strip() for line in lines[1:] if line.strip()]
        commits.append(
            {
                "ts": int(parts[0]),
                "sha": parts[1],
                "subject": parts[2],
                "files": files,
                "lane": lane_of(files),
                "repo": "site",
            }
        )
    return commits


def api_commits() -> list[dict]:
    if not API.is_dir():
        return []
    raw = git(
        ["log", "--since=3 hours ago", "--format=%ct%x09%h%x09%s", "origin/main"],
        API,
        timeout=45,
    )
    if raw.startswith("("):
        return []
    rows = []
    for line in raw.splitlines():
        parts = line.split("\t", 2)
        if len(parts) != 3:
            continue
        rows.append(
            {
                "ts": int(parts[0]),
                "sha": parts[1],
                "subject": parts[2],
                "files": [],
                "lane": "dev1",
                "repo": "api",
            }
        )
    return rows


def api_facts() -> tuple[str, bool, bool]:
    if not API.is_dir():
        return "unknown", False, False
    config = git(["show", "origin/main:app/config.py"], API)
    version = "unknown"
    match = re.search(r'^VERSION\s*=\s*"([^"]+)"', config, re.M)
    if match:
        version = match.group(1)
    probe = git(["cat-file", "-e", "origin/main:app/empire.py"], API)
    has_empire = not probe.startswith("(")
    auth = git(["show", "origin/main:app/routers/auth.py"], API)
    registers_fleet = "ensure_game" in auth
    return version, has_empire, registers_fleet


def furthest_po(titles: list[tuple[int, str]], current_index: int) -> int:
    raw = git(
        ["log", "-60", "-p", "--format=%x1e", "origin/main", "--", "docs/radio/po.md"],
        SITE,
        timeout=45,
    )
    known = {title.lower(): number for number, title in titles}
    best = current_index
    for match in re.finditer(r"^\+Title:\s*(.+)$", raw, re.M):
        label = match.group(1).split(". Label")[0].strip().lower()
        if label in known:
            best = max(best, known[label])
    return best


def box_sha(text: str) -> str:
    match = re.search(r"last checked was `([0-9a-f]+)`", text)
    return match.group(1) if match else "unknown"


def bar(done: int, total: int) -> str:
    total = max(total, 1)
    done = max(0, min(done, total))
    pct = round(100 * done / total)
    return (
        f'<div class="bar" role="img" aria-label="{done} of {total}">'
        f'<span style="width:{pct}%"></span></div>'
        f'<p class="bar-label"><strong>{done}</strong> / {total} · {pct}%</p>'
    )


def chips(
    kind: str,
    numbers: list[int],
    done: set[int],
    nxt: int | None,
    blurbs: dict[tuple[str, int], str],
) -> str:
    cells = []
    for num in numbers:
        if num in done:
            state = "done"
        elif nxt == num:
            state = "next"
        else:
            state = "wait"
        title = html.escape(blurbs.get((kind, num), ""), quote=True)
        cells.append(
            f'<button type="button" class="chip {state}" data-slice="{kind}{num}" '
            f'title="{title}">{num}</button>'
        )
    return "".join(cells)


def claimed_span(text: str, kind: str) -> set[int]:
    """A radio that says A3 to A32 are on main has finished that range."""
    found: set[int] = set()
    pattern = re.compile(rf"{kind}(\d+)\s+to\s+{kind}(\d+)\s+(?:are|is) on", re.I)
    for match in pattern.finditer(text or ""):
        start, end = int(match.group(1)), int(match.group(2))
        if end >= start:
            found.update(range(start, end + 1))
    return found


def slice_shas(text: str) -> dict[str, str]:
    found: dict[str, str] = {}
    for match in re.finditer(r"\b([AU])(\d+) is `([0-9a-f]{7,})`", text or ""):
        found[f"{match.group(1)}{int(match.group(2))}"] = match.group(3)
    for match in re.finditer(
        r"([AU])(\d+)\s+to\s+([AU])(\d+)[^\n]{0,120}?`([0-9a-f]{7,})`",
        text or "",
    ):
        if match.group(1) != match.group(3):
            continue
        sha = match.group(5)
        for num in range(int(match.group(2)), int(match.group(4)) + 1):
            found.setdefault(f"{match.group(1)}{num}", sha)
    return found


_issues_at = 0.0
_issues: list[dict] = []


def issue_index(needed: set[int] | None = None) -> list[dict]:
    """Site issues, cached so a refresh does not call GitHub every time."""
    global _issues_at, _issues
    have = {int(issue.get("number") or 0) for issue in _issues}
    if _issues and time.time() - _issues_at < 90 and (not needed or needed <= have):
        return _issues
    try:
        done = subprocess.run(
            [
                "gh",
                "issue",
                "list",
                "--repo",
                "Tyneside-Software/hackathon-site",
                "--state",
                "all",
                "--limit",
                "1000",
                "--json",
                "number,title,url,state,body,labels",
            ],
            capture_output=True,
            text=True,
            timeout=60,
            encoding="utf-8",
            errors="replace",
        )
    except (OSError, subprocess.TimeoutExpired):
        _issues_at = time.time()
        return _issues
    if done.returncode != 0 or not done.stdout.strip():
        _issues_at = time.time()
        return _issues
    try:
        parsed = json.loads(done.stdout)
    except json.JSONDecodeError:
        _issues_at = time.time()
        return _issues
    if isinstance(parsed, list):
        _issues = parsed
    have = {int(issue.get("number") or 0) for issue in _issues}
    for number in sorted((needed or set()) - have)[:40]:
        try:
            one = subprocess.run(
                [
                    "gh", "issue", "view", str(number),
                    "--repo", "Tyneside-Software/hackathon-site",
                    "--json", "number,title,url,state,body,labels",
                ],
                capture_output=True,
                text=True,
                timeout=20,
                encoding="utf-8",
                errors="replace",
            )
        except (OSError, subprocess.TimeoutExpired):
            continue
        if one.returncode != 0 or not one.stdout.strip():
            continue
        try:
            row = json.loads(one.stdout)
        except json.JSONDecodeError:
            continue
        if isinstance(row, dict):
            _issues.append(row)
    _issues_at = time.time()
    return _issues


def label_names(issue: dict) -> list[str]:
    names = []
    for label in issue.get("labels") or []:
        if isinstance(label, dict):
            name = str(label.get("name") or "")
        else:
            name = str(label)
        if name:
            names.append(name)
    return names


def match_issue(title: str, issues: list[dict]) -> dict | None:
    want = title.lower().strip()
    hits = [issue for issue in issues if str(issue.get("title") or "").lower().strip() == want]
    if not hits:
        return None
    hits.sort(key=lambda issue: int(issue.get("number") or 0), reverse=True)
    return hits[0]


def radio_chatter(limit: int = 30) -> list[dict]:
    raw = git(
        [
            "log",
            f"-{limit}",
            "-p",
            "--format=%x1e%ct%x09%h%x09%s",
            "origin/main",
            "--",
            "docs/radio/po.md",
            "docs/radio/grok-dev-1.md",
            "docs/radio/grok-dev-2.md",
            "docs/radio/integrator.md",
        ],
        SITE,
        timeout=60,
    )
    if not raw or raw.startswith("("):
        return []
    lane_file = {
        "docs/radio/po.md": "po",
        "docs/radio/grok-dev-1.md": "dev1",
        "docs/radio/grok-dev-2.md": "dev2",
        "docs/radio/integrator.md": "integrator",
    }
    items = []
    for block in raw.split("\x1e"):
        block = block.strip("\n")
        if not block:
            continue
        head, _, patch = block.partition("\n")
        parts = head.split("\t", 2)
        if len(parts) != 3:
            continue
        ts, sha, subject = int(parts[0]), parts[1], parts[2]
        files = re.findall(r"^diff --git a/(\S+)", patch, re.M)
        lane = "integrator"
        for path, name in lane_file.items():
            if path in files:
                lane = name
                break
        added = []
        for line in patch.splitlines():
            if (
                line.startswith("+++")
                or line.startswith("---")
                or line.startswith("diff ")
                or line.startswith("index ")
                or line.startswith("@@")
                or line.startswith("\\")
            ):
                continue
            if line.startswith("+"):
                added.append(line[1:])
        body = "\n".join(added).strip()
        if lane == "integrator" and len(body) > 2200:
            start = body.find("## Now")
            if start >= 0:
                end = body.find("\n## ", start + 5)
                body = body[start: end if end > 0 else start + 1600]
            else:
                body = body[:1600]
            body = body.rstrip() + "\n\nThe rest of that order is in the Radios tab."
        if not body:
            body = subject
        when, ago, _state = fmt_when(datetime.fromtimestamp(ts, timezone.utc))
        items.append(
            {
                "id": sha,
                "when": when,
                "ago": ago,
                "lane": lane,
                "subject": subject,
                "body": body,
                "sha": sha,
                "href": f"https://github.com/Tyneside-Software/hackathon-site/commit/{sha}",
            }
        )
    return items


def activity_chart(commits: list[dict], now_ts: int) -> str:
    buckets = WINDOW_S // BUCKET_S
    start = now_ts - WINDOW_S
    counts = [{key: 0 for key in ("integrator", "po", "dev1", "dev2")} for _ in range(buckets)]
    for commit in commits:
        if commit["ts"] < start or commit["lane"] not in counts[0]:
            continue
        index = min(buckets - 1, max(0, (commit["ts"] - start) // BUCKET_S))
        counts[index][commit["lane"]] += 1
    peak = max((sum(bucket.values()) for bucket in counts), default=1) or 1
    width = 720
    height = 148
    pad = 18
    gap = 6
    inner = width - pad * 2
    slot = inner / buckets
    colours = {
        "integrator": "#f59e0b",
        "po": "#c4b5fd",
        "dev1": "#38bdf8",
        "dev2": "#4ade80",
    }
    shapes = []
    labels = []
    for index, bucket in enumerate(counts):
        x = pad + index * slot + gap / 2
        w = max(4, slot - gap)
        y = height - 22
        total = sum(bucket.values())
        if total:
            for key in ("dev2", "dev1", "po", "integrator"):
                part = bucket[key]
                if not part:
                    continue
                h = (part / peak) * (height - 40)
                y -= h
                shapes.append(
                    f'<rect x="{x:.1f}" y="{y:.1f}" width="{w:.1f}" height="{h:.1f}" '
                    f'fill="{colours[key]}" rx="2"><title>{key} {part}</title></rect>'
                )
        else:
            shapes.append(
                f'<rect x="{x:.1f}" y="{height - 24}" width="{w:.1f}" height="2" fill="#2a3544"/>'
            )
        moment = datetime.fromtimestamp(start + index * BUCKET_S).astimezone()
        if index % 3 == 0:
            labels.append(
                f'<text x="{x:.1f}" y="{height - 4}" fill="#94a3b8" font-size="10">'
                f'{moment.strftime("%H:%M")}</text>'
            )
    return (
        f'<svg viewBox="0 0 {width} {height}" class="chart" role="img" '
        f'aria-label="Commits in the last three hours">{"".join(shapes)}{"".join(labels)}</svg>'
    )


def named_issue(text: str) -> int | None:
    """The issue a dev radio names as next, such as 'Next: 798' or 'Next: #828'."""
    match = re.search(r"Next:\s*#?(\d+)", text or "")
    if not match:
        return None
    return int(match.group(1))


def queue_state(item: dict, next_by_lane: dict[str, int | None], paused: set[int], stale: bool) -> str:
    if stale or item["number"] in paused or item["section"] == "reservoir":
        return "paused"
    nxt = next_by_lane.get(item["lane"].lower())
    if nxt is not None:
        if item["number"] < nxt:
            return "done"
        if item["number"] == nxt:
            return "next"
        return "queued"
    if item["is_next"]:
        return "next"
    return "queued"


def skip_issue_numbers(body: str) -> list[int]:
    """Issue numbers named on the line that says they are already on main."""
    match = re.search(r"(?im)^.*already on main:\s*(.+)$", body or "")
    if not match:
        return []
    return [int(number) for number in re.findall(r"#(\d+)", match.group(1))]


def plan_bucket(section: str, state: str) -> str:
    """Which list draws this row.

    A done queue row is already on main. Next and queued stay unfinished.
    A reservoir row stays in the waiting list.
    """
    if section != "queue":
        return "held"
    if state == "done":
        return "done"
    if state in {"next", "queued"}:
        return "open"
    return "paused"


def plan_button(sid: str, state: str, number: int, title: str) -> str:
    """One clickable plan row."""
    return (
        f'<button type="button" class="plan-row {state}" data-slice="{sid}">'
        f'<span class="num">#{number}</span>'
        f'<span class="title">{html.escape(title)}</span>'
        f'<span class="badge">{html.escape(state)}</span>'
        "</button>"
    )


def queue_lists(unfinished: list[str], done: list[str]) -> str:
    """Unfinished slices in one list, lines already on main in another."""
    def block(heading: str, rows: list[str], empty: str) -> str:
        body = (
            f'<div class="plan-list">{"".join(rows)}</div>'
            if rows
            else f'<p class="fine">{html.escape(empty)}</p>'
        )
        return f"<h4>{html.escape(heading)}</h4>{body}"

    return (
        block(
            f"Unfinished · {len(unfinished)}",
            unfinished,
            "No unfinished slices in this list.",
        )
        + block(
            f"Already on main · {len(done)}",
            done,
            "No lines in this list are already on main.",
        )
    )


_progress_cache: dict[str, dict] = {}
CODE_SUFFIXES = (".py", ".js", ".mjs", ".css", ".html", ".kt")


def _apply_numstat(raw: str, total: int, points: list[tuple[int, int]], window_start: int) -> tuple[int, int]:
    """Walk a git numstat log. Returns the new total and lines added inside the window."""
    added_window = 0
    ts = 0
    for line in raw.splitlines():
        # A plain timestamp marker. Record-separator bytes are line breaks in
        # Python, so they never stay at the start of a split line.
        if line.startswith("COMMIT "):
            if ts:
                points.append((ts, total))
            try:
                ts = int(line.split()[1])
            except (IndexError, ValueError):
                ts = 0
            continue
        parts = line.split("\t")
        if len(parts) < 3 or not parts[2].endswith(CODE_SUFFIXES):
            continue
        try:
            added = int(parts[0])
            removed = int(parts[1])
        except ValueError:
            continue
        total += added - removed
        if ts >= window_start:
            added_window += added
    if ts:
        points.append((ts, total))
    return total, added_window


def _sample_points(points: list[tuple[int, int]], count: int = 48) -> list[tuple[int, int]]:
    if len(points) <= count:
        return points
    last = len(points) - 1
    chosen = []
    for index in range(count):
        chosen.append(points[round(index * last / (count - 1))])
    return chosen


def recent_line(points: list[tuple[int, int]], window_s: int = WINDOW_S) -> list[tuple[int, int]]:
    """Running total across the last three hours, including a point at each end."""
    if not points:
        return []
    now = int(time.time())
    start = now - window_s
    before: int | None = None
    inside: list[tuple[int, int]] = []
    for ts, total in points:
        if ts < start:
            before = total
        else:
            inside.append((ts, total))
    chosen: list[tuple[int, int]] = []
    if before is not None:
        chosen.append((start, before))
    chosen.extend(inside)
    if not chosen:
        return []
    if chosen[-1][0] < now:
        chosen.append((now, chosen[-1][1]))
    return _sample_points(chosen)


def code_progress(repo: Path) -> dict:
    """Cumulative code lines on origin/main. Cached, then extended when main moves."""
    empty = {"tip": "", "total": 0, "points": [], "added_3h": 0}
    if not repo.is_dir():
        return empty
    tip = git(["rev-parse", "origin/main"], repo)
    if not tip or tip.startswith("("):
        return empty
    cached = _progress_cache.get(str(repo))
    if cached and cached.get("tip") == tip:
        return cached
    window_start = int(time.time()) - WINDOW_S
    if cached and cached.get("tip"):
        raw = git(
            [
                "log",
                "--reverse",
                "--pretty=format:COMMIT %ct",
                "--numstat",
                f"{cached['tip']}..{tip}",
            ],
            repo,
            timeout=60,
        )
        if raw.startswith("("):
            return cached
        points = list(cached.get("points_full") or [])
        total, _added = _apply_numstat(raw, int(cached.get("total") or 0), points, window_start)
    else:
        raw = git(
            ["log", "--reverse", "--pretty=format:COMMIT %ct", "--numstat", "origin/main"],
            repo,
            timeout=120,
        )
        if not raw or raw.startswith("("):
            return empty
        points = []
        total, _added = _apply_numstat(raw, 0, points, window_start)
    recent = git(
        ["log", "--since=3 hours ago", "--pretty=format:COMMIT %ct", "--numstat", "origin/main"],
        repo,
        timeout=40,
    )
    added_3h = 0
    if recent and not recent.startswith("("):
        _ignored, added_3h = _apply_numstat(recent, 0, [], window_start)
    result = {
        "tip": tip,
        "total": total,
        "points_full": points,
        "points": _sample_points(points),
        "added_3h": added_3h,
    }
    _progress_cache[str(repo)] = result
    return result


def line_chart(series: list[tuple[str, str, list[tuple[int, int]]]]) -> str:
    width, height = 720, 188
    pad_l, pad_r, pad_t, pad_b = 52, 12, 14, 26
    all_points = [point for _name, _colour, points in series for point in points]
    if len(all_points) < 2:
        return '<p class="fine">Not enough code history for a graph yet.</p>'
    t0 = min(point[0] for point in all_points)
    t1 = max(point[0] for point in all_points)
    y_min = min(point[1] for point in all_points)
    y_max = max(point[1] for point in all_points)
    span = max(y_max - y_min, 1)
    label = series[0][0] if len(series) == 1 else "Code"

    def x_of(ts: int) -> float:
        if t1 == t0:
            return float(pad_l)
        return pad_l + (ts - t0) / (t1 - t0) * (width - pad_l - pad_r)

    def y_of(val: int) -> float:
        return pad_t + (1 - (val - y_min) / span) * (height - pad_t - pad_b)

    parts = [
        f'<svg viewBox="0 0 {width} {height}" class="chart" role="img" '
        f'aria-label="{html.escape(label)} code lines on main over the last 3 hours">'
    ]
    for frac in (0, 0.5, 1):
        val = int(round(y_min + span * frac))
        yy = y_of(val)
        parts.append(
            f'<line x1="{pad_l}" y1="{yy:.1f}" x2="{width - pad_r}" y2="{yy:.1f}" stroke="#2a3544"/>'
        )
        parts.append(
            f'<text x="4" y="{yy + 4:.1f}" fill="#94a3b8" font-size="10">{val}</text>'
        )
    for name, colour, points in series:
        if len(points) < 2:
            continue
        drawn = " ".join(f"{x_of(ts):.1f},{y_of(val):.1f}" for ts, val in points)
        parts.append(
            f'<polyline fill="none" stroke="{colour}" stroke-width="2.4" points="{drawn}">'
            f"<title>{html.escape(name)}</title></polyline>"
        )
    for frac, anchor in ((0, "start"), (0.5, "middle"), (1, "end")):
        ts = int(t0 + (t1 - t0) * frac)
        moment = datetime.fromtimestamp(ts, timezone.utc).astimezone()
        parts.append(
            f'<text x="{x_of(ts):.1f}" y="{height - 6}" fill="#94a3b8" font-size="10" '
            f'text-anchor="{anchor}">{moment.strftime("%d %b %H:%M")}</text>'
        )
    parts.append("</svg>")
    return "".join(parts)


_play_at = 0.0
_play_ok = False


def box_has_play() -> bool:
    """True when the box is serving the taxi game page, not an nginx 404."""
    global _play_at, _play_ok
    if time.time() - _play_at < 20:
        return _play_ok
    ok = False
    try:
        req = urllib.request.Request(
            "http://100.65.94.5/play.html",
            headers={"Cache-Control": "no-cache"},
        )
        with urllib.request.urlopen(req, timeout=4) as res:
            chunk = res.read(8000).decode("utf-8", "replace")
            ok = res.status == 200 and "play-map" in chunk
    except (OSError, urllib.error.URLError, TimeoutError, ValueError):
        ok = False
    _play_at = time.time()
    _play_ok = ok
    return ok


BOX_SITE = "http://100.65.94.5"
BOX_API = "http://100.65.94.5:8080"
_box_at = 0.0
_box_rows: list[dict] = []


def _http_text(url: str, limit: int = 200_000) -> str | None:
    try:
        req = urllib.request.Request(url, headers={"Cache-Control": "no-cache"})
        with urllib.request.urlopen(req, timeout=4) as res:
            if getattr(res, "status", 200) != 200:
                return None
            return res.read(limit).decode("utf-8", "replace")
    except (OSError, urllib.error.URLError, TimeoutError, ValueError):
        return None


def _same_text(left: str, right: str) -> bool:
    def norm(text: str) -> str:
        return text.replace("\r\n", "\n").replace("\r", "\n").strip()

    return norm(left) == norm(right)


def github_vs_box(version: str) -> list[dict]:
    """Live read of the three product pages and the API health, against origin/main.

    No password. A miss here is not a deploy.
    """
    global _box_at, _box_rows
    if _box_rows and time.time() - _box_at < 20:
        return _box_rows
    rows = [
        {
            "name": "Tracker",
            "state": "Issues 22 and 29 stay blocked. There is no box page for this product.",
            "url": "",
        }
    ]
    pages = (
        ("Booking office", "office.html", f"{BOX_SITE}/office.html", "Real data"),
        ("Empire desk", "game.html", f"{BOX_SITE}/game.html", "Simulated data"),
        ("Taxi game", "play.html", f"{BOX_SITE}/play.html", "play-map"),
    )
    for name, path, url, marker in pages:
        gh = git(["show", f"origin/main:{path}"], SITE, timeout=20)
        live = _http_text(url)
        if not gh or gh.startswith("("):
            state = "not on GitHub main"
        elif live is None:
            state = "the box did not answer"
        elif marker not in live:
            state = "the box answered without the page marker"
        elif _same_text(live, gh):
            state = "box matches GitHub"
        else:
            state = "box is behind GitHub"
        rows.append({"name": name, "state": state, "url": url})
    health = _http_text(f"{BOX_API}/health", limit=4000)
    live_ver = ""
    if health:
        found = re.search(r'"version"\s*:\s*"([^"]+)"', health)
        if found:
            live_ver = found.group(1)
    if not live_ver:
        state = "box health did not answer"
    elif live_ver == version:
        state = f"health {live_ver} matches GitHub"
    else:
        state = f"box health is {live_ver} and GitHub is {version}"
    rows.append({"name": "API", "state": state, "url": f"{BOX_API}/health"})
    _box_rows = rows
    _box_at = time.time()
    return rows


def compare_table(rows: list[dict]) -> str:
    body = []
    for row in rows:
        state = row["state"]
        if "matches GitHub" in state:
            tone = "match"
        elif state.startswith("Issues 22"):
            tone = "quiet"
        else:
            tone = "behind"
        url = row.get("url") or ""
        link = f'<a href="{html.escape(url)}">{html.escape(url)}</a>' if url else "—"
        body.append(
            "<tr>"
            f"<th>{html.escape(row['name'])}</th>"
            f'<td class="{tone}">{html.escape(state)}</td>'
            f"<td>{link}</td>"
            "</tr>"
        )
    return (
        '<table class="now"><thead><tr><th>Surface</th><th>GitHub against the box</th><th>Live</th></tr></thead>'
        "<tbody>"
        + "".join(body)
        + "</tbody></table>"
    )


def empire_has_money() -> bool:
    if not API.is_dir():
        return False
    source = git(["show", "origin/main:app/empire.py"], API)
    return "fare_in" in source and "driver_share" in source


def _page_keeps_out(page: str, marker: str, denial: str) -> bool:
    """True when the page does not carry that control.

    A sentence such as 'no bus toggle' counts as the control staying off.
    """
    low = (page or "").lower()
    if denial in low:
        return True
    return marker not in low


def play_shape(page: str, script: str) -> list[tuple[bool, str]]:
    """Whether the taxi page on main matches the game someone can play.

    The text is the GitHub file. This does not read the box.
    """
    both = f"{page or ''}\n{script or ''}"
    script_low = (script or "").lower()
    return [
        ("54.9783" in both and "-1.6178" in both, "The circle stays on Grey's Monument."),
        ("55.0367" in both and "-1.5075" in both, "The Shiremoor depot stays."),
        ("fare_in" in both and "pence" in script_low, "The in-game money is on the page, in pence."),
        (_page_keeps_out(page, "phone", "no phone"), "There is no phone list."),
        (_page_keeps_out(page, "place stops", "no place stops"), "There is no Place stops control."),
        (_page_keeps_out(page, "bus toggle", "no bus toggle"), "There is no bus toggle."),
    ]


# The ten colours on the feed, T1 amber first and T10 yellow last.
FEED_COLOURS = (
    "#f5b942",
    "#38bdf8",
    "#4ade80",
    "#c084fc",
    "#fb7185",
    "#f97316",
    "#a3e635",
    "#22d3ee",
    "#e879f9",
    "#facc15",
)


def feed_shape(source: str) -> list[tuple[bool, str]]:
    """Whether the ten-car feed on API main still matches the game.

    The text is app/empire.py on GitHub. This does not read the box.
    """
    text = source or ""
    colours_ok = all(colour in text for colour in FEED_COLOURS) and "T1" in text
    totals_ok = all(number not in text for number in ("2860", "1130", "1240"))
    return [
        (colours_ok, "The feed has the ten colours, and T1 stays amber."),
        ("55.0367" in text and "-1.5075" in text, "The feed depot is Shiremoor."),
        ("CHECK_S = 10" in text and "TRAIL_S = 600" in text, "check_s is 10 and trail_s is 600."),
        ("fare_in" in text and totals_ok, "The feed money is fare_in, and the company totals stay off it."),
        ("FUEL_PENCE_PER_MILE = 20" in text, "Fuel on the feed is 20 pence a mile."),
    ]


PAGE_SCRIPT = r"""
(function () {
  var catalogEl = document.getElementById("catalog");
  if (!catalogEl) return;
  var catalog = JSON.parse(catalogEl.textContent);
  var slices = {};
  catalog.slices.forEach(function (item) { slices[item.id] = item; });
  var detail = document.getElementById("detail");
  var find = document.getElementById("find");

  function esc(text) {
    return String(text == null ? "" : text).replace(/[&<>]/g, function (ch) {
      return {"&": "&amp;", "<": "&lt;", ">": "&gt;"}[ch];
    });
  }

  function showSlice(id) {
    var item = slices[id];
    if (!item || !detail) return;
    sessionStorage.setItem("agents-open", id);
    document.querySelectorAll("[data-slice].on").forEach(function (el) { el.classList.remove("on"); });
    var btn = document.querySelector('[data-slice="' + id + '"]');
    if (btn) {
      btn.classList.add("on");
      if (btn.hidden) btn.hidden = false;
    }
    var bits = ['<p class="seat">' + esc(item.kind) + " · " + esc(item.state) + "</p>"];
    bits.push("<h3>" + esc((item.issue ? "#" + item.issue + " " : item.id + " ") + item.title) + "</h3>");
    if (item.paused) {
      bits.push('<p class="warn">Paused. The integrator told the lanes not to build this. The game page is the work.</p>');
    }
    if (item.lane) {
      bits.push('<p class="fine">' + esc(item.lane) + (item.section ? " · " + esc(item.section) : "") + "</p>");
    }
    if (item.issue) {
      var labelText = item.labels && item.labels.length ? item.labels.join(", ") : (item.labelText || "");
      bits.push('<p class="fine">Issue ' + esc(item.issue) + (item.issueState ? " · " + esc(item.issueState) : "") + (labelText ? " · " + esc(labelText) : "") + "</p>");
    }
    if (item.href) {
      bits.push('<p><a href="' + esc(item.href) + '" target="_blank" rel="noopener">Open on GitHub</a></p>');
    }
    if (item.sha) bits.push("<p class=\"fine\">Commit <code>" + esc(item.sha) + "</code></p>");
    if (item.files) bits.push("<h3>Files</h3><pre class=\"prose\">" + esc(item.files) + "</pre>");
    if (item.nextNote) bits.push("<h3>Named next in that queue</h3><pre class=\"prose\">" + esc(item.nextNote) + "</pre>");
    bits.push("<h3>Order</h3><pre class=\"prose\">" + esc(item.order || item.title) + "</pre>");
    if (item.body) bits.push("<h3>Issue text</h3><pre class=\"prose\">" + esc(item.body) + "</pre>");
    detail.innerHTML = bits.join("");
  }

  function showRadio(key) {
    sessionStorage.setItem("agents-tab", key);
    document.querySelectorAll("[data-radio]").forEach(function (el) {
      el.classList.toggle("on", el.getAttribute("data-radio") === key);
    });
    document.querySelectorAll("[data-pane]").forEach(function (el) {
      el.hidden = el.getAttribute("data-pane") !== key;
    });
    var pane = document.querySelector('[data-pane="' + key + '"]');
    if (pane) pane.scrollIntoView({block: "nearest"});
  }

  function showChat(id) {
    var item = null;
    catalog.chatter.forEach(function (row) { if (row.id === id) item = row; });
    var box = document.getElementById("chat-read");
    if (!item || !box) return;
    sessionStorage.setItem("agents-chat", id);
    document.querySelectorAll("[data-chat]").forEach(function (el) {
      el.classList.toggle("on", el.getAttribute("data-chat") === id);
    });
    box.innerHTML = '<p class="fine">' + esc(item.when) + " · " + esc(item.ago) + " · " + esc(item.lane) + '</p><h3>' + esc(item.subject) + '</h3><p><a href="' + esc(item.href) + '" target="_blank" rel="noopener">' + esc(item.sha) + '</a></p><pre class="prose">' + esc(item.body) + "</pre>";
  }

  document.body.addEventListener("click", function (event) {
    var slice = event.target.closest("[data-slice]");
    if (slice) {
      showSlice(slice.getAttribute("data-slice"));
      var detailBox = document.getElementById("detail");
      if (detailBox && window.matchMedia("(max-width: 980px)").matches) {
        detailBox.scrollIntoView({behavior: "smooth", block: "start"});
      }
      return;
    }
    var chat = event.target.closest("[data-chat]");
    if (chat) { showChat(chat.getAttribute("data-chat")); return; }
    var tab = event.target.closest("[data-radio]");
    if (tab) showRadio(tab.getAttribute("data-radio"));
  });

  if (find) {
    find.addEventListener("input", function () {
      var q = find.value.trim().toLowerCase();
      document.querySelectorAll("[data-slice]").forEach(function (btn) {
        var item = slices[btn.getAttribute("data-slice")];
        var hay = ((item && (item.id + " " + item.title + " " + (item.order || "") + " " + (item.body || ""))) || "").toLowerCase();
        btn.hidden = Boolean(q) && hay.indexOf(q) === -1;
      });
      document.querySelectorAll("[data-chat]").forEach(function (btn) {
        var item = null;
        catalog.chatter.forEach(function (row) { if (row.id === btn.getAttribute("data-chat")) item = row; });
        var hay = item ? (item.subject + " " + item.body + " " + item.lane).toLowerCase() : "";
        btn.hidden = Boolean(q) && hay.indexOf(q) === -1;
      });
    });
  }

  var open = sessionStorage.getItem("agents-open");
  if (open && slices[open]) showSlice(open);
  else if (slices.PLAN) showSlice("PLAN");
  else {
    var next = catalog.slices.filter(function (item) { return item.state === "next"; })[0];
    if (next) showSlice(next.id);
  }
  showRadio(sessionStorage.getItem("agents-tab") || "po");
  var chatId = sessionStorage.getItem("agents-chat");
  if (chatId) showChat(chatId);
  else if (catalog.chatter[0]) showChat(catalog.chatter[0].id);
  var y = sessionStorage.getItem("agents-y");
  if (y) scrollTo(0, Number(y));

  if (location.protocol.indexOf("http") === 0) {
    var rev = catalog.rev;
    setInterval(function () {
      fetch(location.href, {cache: "no-store"}).then(function (response) { return response.text(); }).then(function (text) {
        var match = text.match(/<script type="application\/json" id="catalog">([\s\S]*?)<\/script>/);
        if (!match) return;
        var nextRev = JSON.parse(match[1]).rev;
        if (nextRev !== rev) {
          sessionStorage.setItem("agents-y", String(scrollY));
          location.reload();
        }
      }).catch(function () {});
    }, 20000);
  }
})();
"""


def build_page() -> str:
    refresh_origin()
    tip = git(["rev-parse", "--short", "origin/main"], SITE)
    built = datetime.now().astimezone()
    built_label = built.strftime("%d %b %Y · %H:%M:%S")
    radios = {
        agent["key"]: git(["show", f"origin/main:{agent['radio']}"], SITE) for agent in AGENTS
    }
    orders = now_section(radios["integrator"])
    titles = po_titles(radios["integrator"])
    blurbs = slice_blurbs(radios["integrator"])
    marked = slice_marks(radios["integrator"])
    version, has_empire, registers_fleet = api_facts()
    checked = box_sha(radios["integrator"])

    dev2_through = radio_frontier(radios["dev2"], "U")
    dev1_through = radio_frontier(radios["dev1"], "A")
    order_u = radio_frontier(orders, "U")
    order_a = radio_frontier(orders, "A")

    def done_set(kind: str, frontier: int) -> set[int]:
        nums = series_numbers(blurbs, kind)
        finished = {num for num in nums if (kind, num) in marked}
        finished.update(num for num in nums if num <= frontier)
        return finished

    u_done = done_set("U", max(dev2_through, order_u))
    a_done = done_set("A", max(dev1_through, order_a))
    if has_empire:
        a_done.add(1)
    if registers_fleet:
        a_done.add(2)
    for key in ("dev1", "dev2", "integrator"):
        a_done |= claimed_span(radios[key], "A")
        u_done |= claimed_span(radios[key], "U")
    shas = {}
    for key in radios:
        shas.update(slice_shas(radios[key]))
    u_nums = series_numbers(blurbs, "U")
    a_nums = series_numbers(blurbs, "A")
    u_next = min((num for num in u_nums if num not in u_done), default=None)
    a_next = min((num for num in a_nums if num not in a_done), default=None)

    po_title = ""
    po_match = re.search(r"Title:\s*(.+)", radios["po"])
    if po_match:
        po_title = po_match.group(1).split(". Label")[0].strip()
    po_index = 0
    for number, title in titles:
        if title.lower() == po_title.lower():
            po_index = number
            break
    po_skip = {17, 18, 19}
    po_opened = furthest_po(titles, po_index)
    po_total = len(titles) or 64
    po_note = "Grey chips 17, 18, and 19 are skipped. Those map slices are already on main."
    if po_index and po_index != po_opened:
        po_note += (
            f" The latest radio names title {po_index}. "
            f"The furthest title written on main is {po_opened}."
        )

    commits = site_commits() + api_commits()
    commits.sort(key=lambda row: row["ts"], reverse=True)
    now_ts = int(time.time())
    hour_ago = now_ts - 3600
    in_hour = sum(1 for row in commits if row["ts"] >= hour_ago)
    in_window = sum(1 for row in commits if row["ts"] >= now_ts - WINDOW_S)
    by_lane = {key: 0 for key in ("integrator", "po", "dev1", "dev2")}
    for row in commits:
        if row["ts"] >= now_ts - WINDOW_S and row["lane"] in by_lane:
            by_lane[row["lane"]] += 1

    empire_done = len(u_done) + len(a_done)
    empire_total = len(u_nums) + len(a_nums)
    fare_done = "F1 to F30 are done" in radios["integrator"] or "F30" in radios["dev1"]

    cards = []
    for agent in AGENTS:
        stamp = git(["log", "-1", "--format=%cI", "origin/main", "--", agent["radio"]], SITE)
        subject = git(["log", "-1", "--format=%h %s", "origin/main", "--", agent["radio"]], SITE)
        when_label, ago, state = fmt_when(parse_when(stamp.splitlines()[0] if stamp else ""))
        radio_times = radio_commit_times(agent["radio"])
        now_s = int(time.time())
        turn = radio_turn(radio_times, now_s)
        turn_class = "long" if turn["verdict"] == "about 30 minutes" else "short"
        turn_line = f"Last radio {when_label} · {ago}. {turn_sentence(radio_times, now_s)}"
        said = headline(radios[agent["key"]])
        nxt = own_next(radios[agent["key"]])
        order = order_for(orders, agent["key"])
        local = checkout_line(agent["checkout"])
        next_html = (
            f'<p class="next"><span>Their note</span> {html.escape(nxt)}</p>' if nxt else ""
        )
        cards.append(
            f"""
            <article class="card" style="--lane:{agent['colour']}">
              <header>
                <p class="seat">{html.escape(agent['seat'])}</p>
                <h2>{html.escape(agent['name'])}</h2>
                <p class="role">{html.escape(agent['role'])}</p>
              </header>
              <p class="stamp"><span class="pill {state}">{state}</span><time>{html.escape(when_label)}</time><span class="ago">{html.escape(ago)}</span></p>
              <p class="turn {turn_class}">{html.escape(turn_line)}</p>
              <p class="subject">{html.escape(subject)}</p>
              <p class="said">{html.escape(said)}</p>
              {next_html}
              <h3>Order on main</h3>
              <p class="order">{html.escape(order)}</p>
              <p class="local">{html.escape(local)}</p>
            </article>
            """
        )

    recent_rows = []
    colour = {agent["key"]: agent["colour"] for agent in AGENTS}
    colour["other"] = "#94a3b8"
    for row in commits[:18]:
        when, ago, _state = fmt_when(datetime.fromtimestamp(row["ts"], timezone.utc))
        dot = colour.get(row["lane"], "#94a3b8")
        repo = "hackathon-api" if row["repo"] == "api" else "hackathon-site"
        href = f"https://github.com/Tyneside-Software/{repo}/commit/{row['sha']}"
        recent_rows.append(
            "<li>"
            f'<i class="dot" style="background:{dot}"></i>'
            f"<time>{html.escape(when)} · {html.escape(ago)}</time>"
            f'<a href="{href}" target="_blank" rel="noopener"><code>{html.escape(row["sha"])}</code></a>'
            f"<span>{html.escape(row['subject'])}</span>"
            f"<em>{html.escape(row['lane'])}</em>"
            "</li>"
        )

    po_cells = []
    for number, title in titles:
        if number <= po_opened or number in po_skip:
            state = "skip" if number in po_skip and number > po_opened else "done"
            if number in po_skip:
                state = "skip"
            elif number <= po_opened:
                state = "done"
            else:
                state = "wait"
        elif number == po_opened + 1:
            state = "next"
        else:
            state = "wait"
        po_cells.append(
            f'<button type="button" class="chip {state}" data-slice="P{number}">{number}</button>'
        )

    tracker_steps = (
        '<ol class="steps">'
        '<li class="done">Model agreed. Many people, many things.</li>'
        '<li class="blocked">Live migration blocked. Issues 22 and 29 stay blocked.</li>'
        '<li class="done">Phones still report. The known Android device stays.</li>'
        "</ol>"
    )
    office_note = (
        "Fare cards F1 to F30 are on main."
        if fare_done
        else "Fare-card count was not found in the radio."
    )
    empire_box = (
        f"Box last checked <code>{html.escape(checked)}</code>. "
        f"API <code>{html.escape(version)}</code>. "
        + (
            "empire.py is on the API main."
            if has_empire
            else "The account fleet is not in the API yet, so the box is not running that game."
        )
    )

    preamble, plan_items, plan_sections = parse_po_plan(radios["po"])
    issues = issue_index({item["number"] for item in plan_items})
    catalog_slices = []
    for kind, nums, done, nxt in (
        ("U", u_nums, u_done, u_next),
        ("A", a_nums, a_done, a_next),
    ):
        repo = "hackathon-api" if kind == "A" else "hackathon-site"
        for num in nums:
            if num in done:
                state = "done"
            elif nxt == num:
                state = "next"
            else:
                state = "wait"
            sid = f"{kind}{num}"
            sha = shas.get(sid, "")
            href = (
                f"https://github.com/Tyneside-Software/{repo}/commit/{sha}" if sha else ""
            )
            catalog_slices.append(
                {
                    "id": sid,
                    "kind": kind,
                    "state": state,
                    "title": blurbs.get((kind, num), ""),
                    "order": blurbs.get((kind, num), ""),
                    "href": href,
                    "sha": sha,
                    "issue": None,
                    "issueState": "",
                    "labels": [],
                    "body": "",
                }
            )
    for number, title in titles:
        if number in po_skip:
            state = "skip"
        elif number <= po_opened:
            state = "done"
        elif number == po_opened + 1:
            state = "next"
        else:
            state = "wait"
        issue = match_issue(title, issues)
        labels = label_names(issue) if issue else []
        href = str(issue.get("url") or "") if issue else (
            "https://github.com/Tyneside-Software/hackathon-site/issues?q="
            + re.sub(r"\s+", "+", title)
        )
        catalog_slices.append(
            {
                "id": f"P{number}",
                "kind": "Issue",
                "state": state,
                "title": title,
                "order": title,
                "href": href,
                "sha": "",
                "issue": int(issue["number"]) if issue else None,
                "issueState": str(issue.get("state") or "") if issue else "",
                "labels": labels,
                "body": str(issue.get("body") or "") if issue else "",
            }
        )

    paused = paused_issue_numbers(radios["integrator"]) | paused_issue_numbers(radios["po"])
    game_text = section_between(radios["integrator"], "## Game page", "## Account fleet")
    cars = empire_car_count()
    has_money = empire_has_money()
    has_play = path_on_main(SITE, "play.html")
    play_on_box = box_has_play()
    box_rows = github_vs_box(version)
    box_table = compare_table(box_rows)
    site_lines = code_progress(SITE)
    api_lines = code_progress(API)
    next_by_lane = {
        "grok-dev-1": named_issue(radios["dev1"]),
        "grok-dev-2": named_issue(radios["dev2"]),
    }
    po_names_play = "play.html" in radios["po"]
    dev1_empty = "queue empty" in radios["dev1"].lower()
    dev2_empty = "queue empty" in radios["dev2"].lower()
    by_number = {}
    for issue in issues:
        try:
            by_number[int(issue.get("number") or 0)] = issue
        except (TypeError, ValueError):
            continue
    catalog_slices.append(
        {
            "id": "PLAN",
            "kind": "Plan",
            "state": "planned",
            "title": "Ten taxis on play.html, with in-game money",
            "order": game_text or "The game-page order is not in the integrator radio.",
            "href": "https://github.com/Tyneside-Software/hackathon-site/blob/main/docs/TAXI.md",
            "sha": "",
            "issue": None,
            "issueState": "",
            "labels": [],
            "body": "",
            "paused": False,
            "lane": "Product owner designs the slices. The devs build them.",
            "section": "game page",
            "files": "One dev owns play.html and its script. The other owns the API fleet of 10 and the money on GET /v1/empire.",
            "nextNote": "",
            "labelText": "",
        }
    )
    open_rows: dict[str, list[str]] = {}
    done_rows: dict[str, list[str]] = {}
    held_rows: dict[str, list[str]] = {}
    paused_rows: dict[str, list[str]] = {}
    seen_numbers: dict[str, set[int]] = {}
    paused_count = 0
    unfinished_by: dict[str, int] = {}
    stale_list = not po_names_play
    for item in plan_items:
        issue = by_number.get(item["number"]) or match_issue(item["title"], issues)
        labels = label_names(issue) if issue else []
        label_text = item["labels"]
        state = queue_state(item, next_by_lane, paused, stale_list)
        is_paused = state == "paused"
        if is_paused:
            paused_count += 1
        elif item["section"] == "queue" and state in {"next", "queued"}:
            unfinished_by[item["lane"]] = unfinished_by.get(item["lane"], 0) + 1
        sid = f"Q{item['number']}"
        href = str(issue.get("url") or "") if issue else (
            f"https://github.com/Tyneside-Software/hackathon-site/issues/{item['number']}"
        )
        catalog_slices.append(
            {
                "id": sid,
                "kind": item["lane"],
                "state": state,
                "title": item["title"],
                "order": item["title"],
                "href": href,
                "sha": "",
                "issue": item["number"],
                "issueState": str(issue.get("state") or "") if issue else "",
                "labels": labels,
                "body": str(issue.get("body") or "") if issue else "",
                "paused": is_paused,
                "lane": item["lane"],
                "section": item["section"],
                "files": item["files"],
                "nextNote": item["next"],
                "labelText": label_text,
            }
        )
        button = plan_button(sid, state, item["number"], item["title"])
        seen_numbers.setdefault(item["lane"], set()).add(item["number"])
        bucket = plan_bucket(item["section"], state)
        if bucket == "done":
            done_rows.setdefault(item["lane"], []).append(button)
        elif bucket == "open":
            open_rows.setdefault(item["lane"], []).append(button)
        elif bucket == "paused":
            paused_rows.setdefault(item["lane"], []).append(button)
        else:
            held_rows.setdefault(item["lane"], []).append(button)
    for sec in plan_sections:
        if sec["section"] != "queue":
            continue
        lane = sec["lane"]
        have = seen_numbers.setdefault(lane, set())
        extra: list[str] = []
        for number in sec.get("skipped") or []:
            if number in have:
                continue
            have.add(number)
            issue = by_number.get(number)
            title = str(issue.get("title") or "").strip() if issue else ""
            if not title:
                title = "Already on main"
            sid = f"Q{number}"
            href = str(issue.get("url") or "") if issue else (
                f"https://github.com/Tyneside-Software/hackathon-site/issues/{number}"
            )
            catalog_slices.append(
                {
                    "id": sid,
                    "kind": lane,
                    "state": "done",
                    "title": title,
                    "order": title,
                    "href": href,
                    "sha": "",
                    "issue": number,
                    "issueState": str(issue.get("state") or "") if issue else "",
                    "labels": label_names(issue) if issue else [],
                    "body": str(issue.get("body") or "") if issue else "",
                    "paused": False,
                    "lane": lane,
                    "section": "queue",
                    "files": sec["files"],
                    "nextNote": sec["next"],
                    "labelText": "",
                }
            )
            extra.append(plan_button(sid, "done", number, title))
        if extra:
            done_rows[lane] = extra + done_rows.get(lane, [])
    plan_html = []
    if preamble:
        plan_html.append(f'<p class="fine">{html.escape(preamble)}</p>')
    for sec in plan_sections:
        if sec["section"] == "self":
            jobs = "".join(f"<li>{html.escape(job)}</li>" for job in sec["jobs"])
            catalog_slices.append(
                {
                    "id": "PO-NEXT",
                    "kind": "Product owner",
                    "state": "planned",
                    "title": "Next for me",
                    "order": "\n".join(sec["jobs"]) or "No jobs listed.",
                    "href": "https://github.com/Tyneside-Software/hackathon-site/blob/main/docs/radio/po.md",
                    "sha": "",
                    "issue": None,
                    "issueState": "",
                    "labels": [],
                    "body": "",
                    "paused": False,
                    "lane": "Product owner",
                    "section": "next for me",
                    "files": "",
                    "nextNote": "",
                    "labelText": "",
                }
            )
            plan_html.append(
                "<section class=\"board\">"
                f"<h3>{html.escape(sec['lane'])}</h3>"
                f"<ul class=\"steps\">{jobs}</ul>"
                '<button type="button" class="pin" data-slice="PO-NEXT">Open this list</button>'
                "</section>"
            )
            continue
        if sec["section"] == "reservoir":
            rows = held_rows.get(sec["lane"], [])
            body = (
                '<p class="fine">No issue lines in this list yet.</p>'
                if not rows
                else "<div class=\"plan-list\">" + "".join(rows) + "</div>"
            )
        else:
            body = queue_lists(
                open_rows.get(sec["lane"], []),
                done_rows.get(sec["lane"], []),
            )
            parked = paused_rows.get(sec["lane"], [])
            if parked:
                body += (
                    f"<h4>Paused · {len(parked)}</h4>"
                    "<div class=\"plan-list\">" + "".join(parked) + "</div>"
                )
        named = sec["next"]
        if sec["section"] == "reservoir":
            heading = f"{sec['lane']} · {sec['count']} waiting · target 24"
        else:
            left = unfinished_by.get(sec["lane"], 0)
            heading = f"{sec['lane']} · {left} unfinished · {sec['count']} listed · target 16"
        plan_html.append(
            "<section class=\"board\">"
            f"<h3>{html.escape(heading)}</h3>"
            f"<p class=\"fine\">{html.escape(sec['files'])}</p>"
            + (f"<p class=\"next\"><span>Next</span> {html.escape(named)}</p>" if named else "")
            + body
            + "</section>"
        )
    car_label = f"{cars} cars" if cars is not None else "an unknown fleet"
    queue_counts = [sec for sec in plan_sections if sec["section"] == "queue"]
    situation_bits = [
        f"GitHub main is {tip}. The API on main starts {car_label}. "
        + ("play.html is on main." if has_play else "play.html is not on main yet."),
        "The plan is a taxi-only page: the map, ten taxis, and the in-game money in pence. Phones and buses stay on the ops map.",
    ]
    if po_names_play:
        listed = ", ".join(
            f"{sec['lane']} {unfinished_by.get(sec['lane'], 0)} unfinished of {sec['count']} listed"
            for sec in queue_counts
        ) or "no queue headings"
        reservoir_n = next((sec["count"] for sec in plan_sections if sec["section"] == "reservoir"), 0)
        situation_bits.append(
            f"The product owner queue names play.html. {listed}. "
            f"Each dev is aimed at 16 unfinished. The reservoir has {reservoir_n} of 24."
        )
        situation_bits.append(
            f"Code on main: site {site_lines['total']} lines, API {api_lines['total']} lines. "
            f"In the last 3 hours the site added {site_lines['added_3h']} code lines and the API added {api_lines['added_3h']}."
        )
    else:
        situation_bits.append(
            f"The product owner queue does not name play.html. It lists {len(plan_items)} issues, "
            f"and {paused_count} of those numbers are paused."
        )
    for seat, empty, needle in (
        ("grok-dev-1", dev1_empty, "grok-dev-1"),
        ("grok-dev-2", dev2_empty, "grok-dev-2"),
    ):
        count = next((sec["count"] for sec in queue_counts if sec["lane"].lower() == needle), 0)
        if empty and count:
            situation_bits.append(
                f"{seat}'s last radio says queue empty. main now lists {count} slices for that seat, so the next continue should build them."
            )
        elif empty:
            situation_bits.append(
                f"{seat}'s last radio says queue empty, and that queue has no issue lines yet."
            )
    situation_html = "".join(f"<li>{html.escape(bit)}</li>" for bit in situation_bits)
    now_rows_html = []
    for cells in markdown_table(orders):
        lane, state, nxt = (cells + ["", "", ""])[:3]
        now_rows_html.append(
            "<tr>"
            f"<th>{html.escape(lane)}</th>"
            f"<td>{html.escape(state)}</td>"
            f"<td>{html.escape(nxt)}</td>"
            "</tr>"
        )
    now_table = (
        '<table class="now"><thead><tr><th>Lane</th><th>State</th><th>Next</th></tr></thead><tbody>'
        + "".join(now_rows_html)
        + "</tbody></table>"
    )
    dev_full = all(unfinished_by.get(sec["lane"], 0) >= 16 for sec in queue_counts) and bool(queue_counts)
    reservoir_n = next((sec["count"] for sec in plan_sections if sec["section"] == "reservoir"), 0)
    milestones = [
        (has_empire, "The account fleet lives in the API and keeps running when the browser is closed."),
        (cars == 10, f"A new account starts {car_label}. The plan is 10, T1 to T10."),
        (has_play, "play.html is on GitHub main. The ops map keeps phones, buses, and waypoints."),
        (play_on_box, "The box is serving the taxi game at http://100.65.94.5/play.html."),
        (has_money, "The empire feed includes the money lines, in integer pence."),
        (dev_full and reservoir_n >= 24, "Each dev has 16 unfinished slices, and the reservoir has 24."),
    ]
    depth_rows = []
    for sec in queue_counts:
        depth_rows.append((sec["lane"], unfinished_by.get(sec["lane"], 0), 16))
    depth_rows.append(("Reservoir", reservoir_n, 24))
    depth_html = "".join(
        f"<p class=\"fine\">{html.escape(label)}</p>{bar(done, total)}"
        for label, done, total in depth_rows
    )
    play_sentence = (
        'The taxi game is on the box: <a href="http://100.65.94.5/play.html">http://100.65.94.5/play.html</a>.'
        if play_on_box
        else 'The taxi game link is <a href="http://100.65.94.5/play.html">http://100.65.94.5/play.html</a>. The box is not serving that page yet.'
    )
    line_svg = (
        line_chart([("Site", "#fcd34d", recent_line(site_lines.get("points_full") or []))])
        + line_chart([("API", "#38bdf8", recent_line(api_lines.get("points_full") or []))])
    )
    milestone_html = "".join(
        f'<li class="{"done" if ok else "wait"}">{html.escape(text)}</li>'
        for ok, text in milestones
    )
    game_steps_done = sum(1 for ok, _text in milestones if ok)
    play_page = git(["show", "origin/main:play.html"], SITE) if has_play else ""
    play_script = git(["show", "origin/main:play.js"], SITE)
    if play_page.startswith("("):
        play_page = ""
    if play_script.startswith("("):
        play_script = ""
    aim_html = "".join(
        f'<li class="{"done" if ok else "wait"}">{html.escape(text)}</li>'
        for ok, text in play_shape(play_page, play_script)
    )
    empire_source = git(["show", "origin/main:app/empire.py"], API) if API.is_dir() else ""
    if empire_source.startswith("("):
        empire_source = ""
    feed_html = "".join(
        f'<li class="{"done" if ok else "wait"}">{html.escape(text)}</li>'
        for ok, text in feed_shape(empire_source)
    )

    chatter = radio_chatter()
    lane_name = {agent["key"]: agent["name"] for agent in AGENTS}
    chat_buttons = []
    for item in chatter:
        chat_buttons.append(
            "<li>"
            f'<button type="button" class="chat-btn" data-chat="{html.escape(item["id"])}" '
            f'style="--lane:{colour.get(item["lane"], "#94a3b8")}">'
            f'<time>{html.escape(item["when"])}</time>'
            f'<strong>{html.escape(lane_name.get(item["lane"], item["lane"]))}</strong>'
            f'<span>{html.escape(item["ago"])}</span>'
            f'<em>{html.escape(item["subject"])}</em>'
            "</button></li>"
        )
    radio_panes = []
    tab_buttons = []
    for agent in AGENTS:
        hidden = "" if agent["key"] == "po" else " hidden"
        radio_panes.append(
            f'<pre class="prose radio-pane" data-pane="{agent["key"]}"{hidden}>'
            f'{html.escape(radios[agent["key"]])}</pre>'
        )
        tab_buttons.append(
            f'<button type="button" data-radio="{agent["key"]}" style="--lane:{agent["colour"]}">'
            f'{html.escape(agent["name"])}</button>'
        )
    rev = hashlib.sha256(
        "\n".join(radios.values()).encode("utf-8", errors="replace")
    ).hexdigest()[:12]
    catalog = {
        "rev": f"{tip}-{rev}-{len(u_done)}-{len(a_done)}-{po_opened}",
        "slices": catalog_slices,
        "chatter": chatter,
    }
    catalog_json = json.dumps(catalog, ensure_ascii=False).replace("<", "\\u003c")

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Agents · Tyneside</title>
  <style>
    :root {{
      --bg: #0c1219;
      --text: #e8eef4;
      --muted: #94a3b8;
      --heading: #f8fafc;
      --border: #2a3544;
      --panel: #121a24;
      --font: "Segoe UI", system-ui, sans-serif;
    }}
    * {{ box-sizing: border-box; }}
    body {{
      margin: 0;
      min-height: 100vh;
      font-family: var(--font);
      background:
        radial-gradient(900px 420px at 8% -10%, rgba(245, 158, 11, 0.16), transparent 55%),
        var(--bg);
      color: var(--text);
      line-height: 1.45;
    }}
    main {{ max-width: 1180px; margin: 0 auto; padding: 1.4rem 1.1rem 3rem; }}
    header.top h1 {{ margin: 0.15rem 0; font-size: 1.8rem; letter-spacing: 0.04em; color: var(--heading); }}
    .kicker {{ margin: 0; color: #fcd34d; font-size: 0.78rem; letter-spacing: 0.14em; text-transform: uppercase; }}
    .built {{ color: var(--muted); margin: 0.2rem 0 1rem; }}
    nav.jumps {{ display: flex; gap: 0.8rem; margin: 0 0 1rem; }}
    nav.jumps a {{ color: #fcd34d; }}
    h2.band {{ margin: 1.4rem 0 0.6rem; font-size: 0.78rem; letter-spacing: 0.14em; text-transform: uppercase; color: #fcd34d; }}
    .strategy {{ display: grid; grid-template-columns: 1.1fr 1fr 1.3fr; gap: 0.9rem; }}
    .objective {{
      background: var(--panel);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 0.9rem 1rem 1rem;
      min-width: 0;
    }}
    .objective h3 {{ margin: 0; color: var(--heading); font-size: 1.15rem; letter-spacing: 0; text-transform: none; }}
    .objective .why {{ color: var(--muted); margin: 0.25rem 0 0.6rem; min-height: 2.6rem; }}
    .bar {{ height: 10px; background: #0a1016; border-radius: 999px; overflow: hidden; border: 1px solid var(--border); }}
    .bar span {{ display: block; height: 100%; background: linear-gradient(90deg, #f59e0b, #fcd34d); }}
    .objective.map .bar span {{ background: linear-gradient(90deg, #166534, #4ade80); }}
    .objective.api .bar span {{ background: linear-gradient(90deg, #075985, #38bdf8); }}
    .bar-label {{ margin: 0.3rem 0 0; font-variant-numeric: tabular-nums; }}
    td.match {{ color: #4ade80; }}
    td.behind {{ color: #fbbf24; }}
    td.quiet {{ color: var(--muted); }}
    .steps {{ margin: 0.4rem 0 0; padding-left: 1.1rem; }}
    .steps li.done {{ color: #86efac; }}
    .steps li.wait {{ color: #fde68a; }}
    .steps li.blocked {{ color: #fca5a5; }}
    .fine {{ color: var(--muted); margin: 0.45rem 0 0; font-size: 0.88rem; }}
    .pace {{
      display: flex; gap: 1.2rem; flex-wrap: wrap; align-items: baseline;
      margin: 0.2rem 0 0.4rem;
    }}
    .pace strong {{ font-size: 1.6rem; color: var(--heading); font-variant-numeric: tabular-nums; }}
    .legend {{ display: flex; gap: 0.9rem; color: var(--muted); font-size: 0.85rem; margin: 0.2rem 0 0.4rem; }}
    .legend i {{ display: inline-block; width: 0.7rem; height: 0.7rem; border-radius: 2px; margin-right: 0.3rem; }}
    .chart {{ width: 100%; height: auto; background: var(--panel); border: 1px solid var(--border); border-radius: 12px; }}
    .grid {{ display: grid; grid-template-columns: 1fr 1fr; gap: 0.9rem; }}
    .card {{
      background: var(--panel);
      border: 1px solid var(--border);
      border-left: 4px solid var(--lane);
      border-radius: 12px;
      padding: 0.9rem 1rem 1rem;
      min-width: 0;
    }}
    .seat {{ margin: 0; color: var(--lane); font-size: 0.75rem; letter-spacing: 0.12em; text-transform: uppercase; }}
    .card h2 {{ margin: 0.1rem 0; font-size: 1.25rem; color: var(--heading); }}
    .role, .order, .local, .subject, .said {{ color: var(--muted); margin: 0.25rem 0; }}
    .said {{ color: var(--text); }}
    .next span, .card h3 {{
      display: inline-block;
      margin-right: 0.4rem;
      font-size: 0.72rem;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: #cbd5e1;
    }}
    .stamp {{ display: flex; gap: 0.6rem; align-items: baseline; flex-wrap: wrap; margin: 0.7rem 0 0.2rem; }}
    .stamp time {{ font-size: 1.25rem; color: var(--heading); font-variant-numeric: tabular-nums; }}
    .ago {{ color: var(--muted); }}
    .turn {{ margin: 0.2rem 0 0.45rem; }}
    .turn.long {{ color: #86efac; }}
    .turn.short {{ color: #fecaca; }}
    .pill {{
      border-radius: 999px;
      padding: 0.1rem 0.55rem;
      font-size: 0.72rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }}
    .pill.active {{ background: rgba(74, 222, 128, 0.16); color: #86efac; }}
    .pill.quiet {{ background: rgba(148, 163, 184, 0.16); color: #cbd5e1; }}
    .board {{
      background: var(--panel);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 0.8rem 0.9rem 0.9rem;
      margin: 0 0 0.8rem;
    }}
    .board h3 {{ margin: 0 0 0.45rem; color: var(--heading); letter-spacing: 0; text-transform: none; font-size: 1rem; }}
    .board h4 {{ margin: 0.75rem 0 0.35rem; color: var(--muted); font-size: 0.78rem; letter-spacing: 0.08em; text-transform: uppercase; font-weight: 600; }}
    .chips {{ display: flex; flex-wrap: wrap; gap: 0.28rem; }}
    .chip {{
      width: 1.7rem; height: 1.7rem;
      display: inline-flex; align-items: center; justify-content: center;
      border-radius: 5px;
      font-style: normal;
      font-size: 0.68rem;
      font-variant-numeric: tabular-nums;
      background: #0a1016;
      color: #64748b;
      border: 1px solid var(--border);
    }}
    .chip.done {{ background: rgba(74, 222, 128, 0.18); color: #bbf7d0; border-color: #166534; }}
    .chip.next {{ background: rgba(245, 158, 11, 0.22); color: #fde68a; border-color: #b45309; }}
    .chip.skip {{ background: rgba(148, 163, 184, 0.12); color: #cbd5e1; }}
    .commits {{ list-style: none; padding: 0; margin: 0.4rem 0 0; }}
    .commits li {{
      display: grid;
      grid-template-columns: 0.7rem 15rem 5.2rem 1fr 6rem;
      gap: 0.55rem;
      align-items: baseline;
      padding: 0.35rem 0;
      border-bottom: 1px solid var(--border);
      font-size: 0.9rem;
    }}
    .dot {{ width: 0.55rem; height: 0.55rem; border-radius: 99px; display: inline-block; }}
    .commits em {{ color: var(--muted); font-style: normal; }}
    code {{ color: #fcd34d; }}
    a {{ color: #fcd34d; }}
    header.top {{
      position: sticky; top: 0; z-index: 4;
      background: rgba(12, 18, 25, 0.94);
      backdrop-filter: blur(8px);
      margin: -1.4rem -1.1rem 0.4rem;
      padding: 0.8rem 1.1rem 0.7rem;
      border-bottom: 1px solid var(--border);
    }}
    .find {{
      width: min(28rem, 100%);
      margin: 0.4rem 0 0;
      background: #0a1016;
      color: var(--text);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 0.45rem 0.6rem;
      font: inherit;
    }}
    .tabs, .chat-list {{ display: flex; gap: 0.4rem; flex-wrap: wrap; }}
    .tabs button, .chat-btn {{
      background: var(--panel);
      color: var(--text);
      border: 1px solid var(--border);
      border-left: 4px solid var(--lane, var(--border));
      border-radius: 8px;
      font: inherit;
      cursor: pointer;
      text-align: left;
    }}
    .tabs button {{ padding: 0.35rem 0.7rem; }}
    .tabs button.on, .chat-btn.on, .chip.on {{ outline: 2px solid #fcd34d; }}
    .reader {{
      margin-top: 0.6rem;
      max-height: 70vh;
      overflow: auto;
      background: #0a1016;
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 0.8rem 1rem;
    }}
    .prose {{
      white-space: pre-wrap;
      font-family: Consolas, "Segoe UI", sans-serif;
      font-size: 0.92rem;
      line-height: 1.45;
      margin: 0;
    }}
    .split {{ display: grid; grid-template-columns: minmax(16rem, 22rem) 1fr; gap: 0.8rem; align-items: start; }}
    .chat-list {{ display: block; max-height: 70vh; overflow: auto; margin: 0; padding: 0; list-style: none; }}
    .chat-btn {{
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 0.15rem 0.6rem;
      width: 100%;
      margin: 0 0 0.35rem;
      padding: 0.45rem 0.6rem;
    }}
    .chat-btn em {{ grid-column: 1 / -1; color: var(--muted); font-style: normal; }}
    .explorer {{ display: grid; grid-template-columns: 1fr minmax(18rem, 26rem); gap: 0.8rem; align-items: start; }}
    .detail {{
      position: sticky; top: 7.2rem;
      max-height: calc(100vh - 8rem);
      overflow: auto;
      background: var(--panel);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 0.9rem 1rem;
    }}
    .detail h3 {{ margin: 0.8rem 0 0.3rem; color: var(--heading); }}
    .chip {{ cursor: pointer; font: inherit; }}
    button.chip {{ width: 1.7rem; height: 1.7rem; padding: 0; }}
    .shell {{
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(18rem, 28rem);
      gap: 0.9rem;
      align-items: start;
    }}
    .situation {{
      background: var(--panel);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 0.2rem 1rem 0.8rem;
    }}
    .situation li {{ margin: 0.35rem 0; }}
    table.now {{
      width: 100%;
      border-collapse: collapse;
      background: var(--panel);
      border: 1px solid var(--border);
      border-radius: 12px;
      overflow: hidden;
    }}
    table.now th, table.now td {{
      text-align: left;
      vertical-align: top;
      padding: 0.55rem 0.7rem;
      border-bottom: 1px solid var(--border);
    }}
    table.now th {{ width: 8.5rem; color: #fcd34d; font-weight: 600; }}
    .brief {{ max-height: 16rem; overflow: auto; background: #0a1016; border-radius: 10px; padding: 0.7rem 0.8rem; }}
    .plan-list {{ display: flex; flex-direction: column; gap: 0.28rem; }}
    .plan-row {{
      display: grid;
      grid-template-columns: 4.4rem minmax(0, 1fr) auto;
      gap: 0.55rem;
      align-items: baseline;
      width: 100%;
      text-align: left;
      font: inherit;
      color: var(--text);
      background: #0a1016;
      border: 1px solid var(--border);
      border-left: 4px solid #64748b;
      border-radius: 8px;
      padding: 0.4rem 0.6rem;
      cursor: pointer;
    }}
    .plan-row .num {{ color: #fcd34d; font-variant-numeric: tabular-nums; }}
    .plan-row .title {{ min-width: 0; }}
    .plan-row .badge {{
      color: var(--muted);
      font-size: 0.72rem;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }}
    .plan-row.next {{ border-left-color: #f59e0b; }}
    .plan-row.paused {{ border-left-color: #f87171; }}
    .plan-row.queued {{ border-left-color: #38bdf8; }}
    .plan-row.done {{ border-left-color: #4ade80; }}
    .plan-row.on {{ outline: 2px solid #fcd34d; }}
    .warn {{
      color: #fecaca;
      background: rgba(248, 113, 113, 0.12);
      border-radius: 8px;
      padding: 0.4rem 0.55rem;
    }}
    .pin {{
      margin-top: 0.5rem;
      font: inherit;
      color: #0c1219;
      background: #fcd34d;
      border: 0;
      border-radius: 8px;
      padding: 0.4rem 0.7rem;
      cursor: pointer;
    }}
    @media (max-width: 980px) {{
      .strategy, .grid, .split, .explorer, .shell {{ grid-template-columns: 1fr; }}
      .commits li {{ grid-template-columns: 0.7rem 1fr; }}
      .commits time, .commits em {{ grid-column: 2; }}
      .detail {{ position: static; max-height: none; }}
      .plan-row {{ grid-template-columns: 4.4rem minmax(0, 1fr); }}
      .plan-row .badge {{ grid-column: 2; }}
    }}
  </style>
</head>
<body>
  <main>
    <header class="top">
      <p class="kicker">Tyneside · four agents</p>
      <h1>Hackathon dashboard</h1>
      <p class="built">Built {html.escape(built_label)} from GitHub <code>main</code> at <code>{html.escape(tip)}</code>. The page keeps your place and reloads when the radios change. Click a chip or a note to read it.</p>
      <nav class="jumps">
        <a href="#situation">Going on</a>
        <a href="#plan">Planned</a>
        <a href="#strategy">Strategy</a>
        <a href="#now">Lanes</a>
        <a href="#radios">Radios</a>
        <a href="#chatter">Chatter</a>
        <a href="#slices">History</a>
      </nav>
      <input class="find" id="find" type="search" placeholder="Find a slice, an issue, or a radio note" aria-label="Find">
    </header>

    <div class="shell">
    <div class="column">

    <h2 class="band" id="situation">What's going on</h2>
    <section class="situation"><ul>{situation_html}</ul></section>
    <h2 class="band">Orders on main</h2>
    {now_table}

    <h2 class="band" id="plan">What's planned</h2>
    <section class="board">
      <h3>The taxi game</h3>
      <p class="fine">This is the order. Click the button to keep it in the detail panel. Each issue below opens its GitHub text.</p>
      <pre class="prose brief">{html.escape(game_text or "The game-page order is not in the integrator radio.")}</pre>
      <button type="button" class="pin" data-slice="PLAN">Open the game order</button>
    </section>
    {''.join(plan_html)}

    <h2 class="band" id="strategy">Strategy</h2>
    <section class="board">
      <h3>The three products</h3>
      <ol class="steps">
        <li class="blocked">Tracker. Many phones, children, cars, and other things, linked to many people. Issues 22 and 29 stay blocked. This is not the open work.</li>
        <li class="done">Booking office. office.html is the company desk, live on the box. The company ledger stays off the game. Further office slices are waiting. This is not the open work.</li>
        <li class="{'done' if play_on_box else 'wait'}">Empire game. play.html is ten taxis and the in-game money. This is the open work. {play_sentence}</li>
      </ol>
      <p class="fine">GitHub site <code>{html.escape(tip)}</code>. The integrator last wrote the box as <code>{html.escape(checked)}</code>. The table below is a live read of the pages. It is not a deploy.</p>
      <h3>GitHub against the box</h3>
      {box_table}
    </section>
    <section class="strategy">
      <article class="objective">
        <h3>Tracker</h3>
        <p class="why">Many phones, children, cars, and other things, linked to many people.</p>
        {bar(2, 3)}
        {tracker_steps}
      </article>
      <article class="objective">
        <h3>Booking office</h3>
        <p class="why">The desk a taxi company would buy. Real data. The company ledger stays off the game.</p>
        {bar(30 if fare_done else 0, 30)}
        <p class="fine">{html.escape(office_note)} Further office slices are waiting. They are not the open work.</p>
      </article>
      <article class="objective map">
        <h3>Empire game</h3>
        <p class="why">Ten taxis on play.html, with the in-game money in pence. The ops map is a different page.</p>
        {bar(game_steps_done, len(milestones))}
        <ol class="steps">{milestone_html}</ol>
        <p class="fine">What play.html has on main.</p>
        <ol class="steps">{aim_html}</ol>
        <p class="fine">What the ten-car feed has on API main.</p>
        <ol class="steps">{feed_html}</ol>
        <div class="objective api" style="padding:0.7rem 0 0;border:0;background:transparent">
          <p class="fine">Queue depth</p>
          {depth_html}
        </div>
        <p class="fine">{empire_box}</p>
      </article>
    </section>
    <section class="board">
      <h3>Code on main</h3>
      <p class="pace"><span><strong>{site_lines['total']}</strong> site lines</span><span><strong>{api_lines['total']}</strong> API lines</span><span>Last 3 hours: site +{site_lines['added_3h']}, API +{api_lines['added_3h']}</span></p>
      <p class="legend"><span><i style="background:#fcd34d"></i>Site</span><span><i style="background:#38bdf8"></i>API</span></p>
      <p class="fine">Python, JavaScript, CSS, HTML, and Kotlin. Docs are not in this count. Each line is that repo's running total over the last 3 hours, on its own scale.</p>
      {line_svg}
    </section>

    <h2 class="band" id="now">Right now</h2>
    <section class="grid">
      {''.join(cards)}
    </section>

    <h2 class="band" id="radios">Radios</h2>
    <p class="fine">The four files on <code>main</code>, in the words last merged. This is what each session is saying now.</p>
    <div class="tabs">{''.join(tab_buttons)}</div>
    <div class="reader">{''.join(radio_panes)}</div>

    <h2 class="band" id="chatter">Chatter</h2>
    <p class="fine">Each radio note, newest first. The added words are what that commit said.</p>
    <div class="split">
      <ol class="chat-list">{''.join(chat_buttons)}</ol>
      <article class="detail" id="chat-read"><p class="fine">Choose a note.</p></article>
    </div>

    <h2 class="band" id="recent">Recent</h2>
    <p class="pace"><span><strong>{in_hour}</strong> commits in the last hour</span><span><strong>{in_window}</strong> in the last 3 hours</span></p>
    <p class="legend">
      <span><i style="background:#f59e0b"></i>Integrator {by_lane['integrator']}</span>
      <span><i style="background:#c4b5fd"></i>Product owner {by_lane['po']}</span>
      <span><i style="background:#38bdf8"></i>grok-dev-1 {by_lane['dev1']}</span>
      <span><i style="background:#4ade80"></i>grok-dev-2 {by_lane['dev2']}</span>
    </p>
    {activity_chart(commits, now_ts)}
    <ol class="commits">
      {''.join(recent_rows)}
    </ol>

    <h2 class="band" id="slices">Account-fleet history</h2>
    <p class="fine">Click a number. The detail panel shows the order for that slice. Green is on main, amber is the next unfinished number, grey is skipped.</p>
    <section class="board">
      <h3>Map · U1 to U{u_nums[-1] if u_nums else 0}</h3>
      <div class="chips">{chips("U", u_nums, u_done, u_next, blurbs)}</div>
    </section>
    <section class="board">
      <h3>API · A1 to A{a_nums[-1] if a_nums else 0}</h3>
      <div class="chips">{chips("A", a_nums, a_done, a_next, blurbs)}</div>
    </section>
    <section class="board">
      <h3>Issue titles · last named {html.escape(po_title or "none yet")}</h3>
      <div class="chips">{''.join(po_cells)}</div>
      <p class="fine">{html.escape(po_note)}</p>
    </section>

    <p class="built">Public site <a href="https://hackathon.tyneside.software/">hackathon.tyneside.software</a>. Ops map <a href="http://100.65.94.5/app/">http://100.65.94.5/app/</a>. {play_sentence} Orders live in <code>docs/radio/integrator.md</code>.</p>
    </div>
    <article class="detail" id="detail"><p class="fine">Click a planned issue or a numbered slice. The GitHub text opens here.</p></article>
    </div>
  </main>
  <script type="application/json" id="catalog">{catalog_json}</script>
  <script>
{PAGE_SCRIPT}
  </script>
</body>
</html>
"""


def publish() -> str:
    global _page
    page = build_page()
    with _lock:
        _page = page
    OUT.write_text(page, encoding="utf-8")
    return page


class Handler(BaseHTTPRequestHandler):
    def do_GET(self) -> None:  # noqa: N802
        # The background thread rebuilds the page. A click should not wait on git.
        with _lock:
            cached = _page
        if not cached or "What's planned" not in cached:
            cached = publish()
        body = cached.encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, fmt: str, *args) -> None:
        return


def serve() -> None:
    publish()

    def keep_fresh() -> None:
        while True:
            time.sleep(20)
            try:
                publish()
            except Exception as exc:
                print(f"refresh failed: {exc}", flush=True)

    threading.Thread(target=keep_fresh, daemon=True).start()
    server = ThreadingHTTPServer(("127.0.0.1", PORT), Handler)
    print(f"AGENTS-DASHBOARD http://127.0.0.1:{PORT}/", flush=True)
    server.serve_forever()


if __name__ == "__main__":
    import sys

    if "--serve" in sys.argv:
        serve()
    else:
        publish()
        print(OUT)
