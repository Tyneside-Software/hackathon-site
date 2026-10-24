"""Local agent dashboard.

Reads the four radio files on origin/main and writes
C:\\Users\\MichaelThomson\\Desktop\\agents.html.
With --serve, http://127.0.0.1:5510/ rebuilds the page on each load.
"""
from __future__ import annotations

import html
import re
import subprocess
import threading
import time
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
        "role": "Opens the issues. No product code.",
    },
    {
        "key": "dev1",
        "name": "grok-dev-1",
        "seat": "API",
        "colour": "#38bdf8",
        "radio": "docs/radio/grok-dev-1.md",
        "checkout": Path(r"C:\Users\MichaelThomson\source\lanes\grok-dev-1\hackathon-api"),
        "role": "Account-fleet API. Fare cards are finished.",
    },
    {
        "key": "dev2",
        "name": "grok-dev-2",
        "seat": "Map",
        "colour": "#4ade80",
        "radio": "docs/radio/grok-dev-2.md",
        "checkout": Path(r"C:\Users\MichaelThomson\source\lanes\grok-dev-2\hackathon-site"),
        "role": "Account-fleet map. The browser must not invent the cars.",
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
        title = blurbs.get((kind, num), "")
        cells.append(
            f'<i class="chip {state}" title="{html.escape(kind + str(num) + " " + title)}">{num}</i>'
        )
    return "".join(cells)


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
        recent_rows.append(
            "<li>"
            f'<i class="dot" style="background:{dot}"></i>'
            f"<time>{html.escape(when)} · {html.escape(ago)}</time>"
            f"<code>{html.escape(row['sha'])}</code>"
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
            f'<i class="chip {state}" title="{html.escape(str(number) + " " + title)}">{number}</i>'
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

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="refresh" content="20">
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
    .steps {{ margin: 0.4rem 0 0; padding-left: 1.1rem; }}
    .steps li.done {{ color: #86efac; }}
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
    @media (max-width: 980px) {{
      .strategy, .grid {{ grid-template-columns: 1fr; }}
      .commits li {{ grid-template-columns: 0.7rem 1fr; }}
      .commits time, .commits em {{ grid-column: 2; }}
    }}
  </style>
</head>
<body>
  <main>
    <header class="top">
      <p class="kicker">Tyneside · four agents</p>
      <h1>Hackathon dashboard</h1>
      <p class="built">Built {html.escape(built_label)} from GitHub <code>main</code> at <code>{html.escape(tip)}</code>. This page reloads every 20 seconds. A green chip is on main. An amber chip is the next slice.</p>
      <nav class="jumps">
        <a href="#strategy">Strategy</a>
        <a href="#now">Right now</a>
        <a href="#recent">Recent</a>
        <a href="#slices">Slices</a>
      </nav>
    </header>

    <h2 class="band" id="strategy">Strategy</h2>
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
        <h3>Empire</h3>
        <p class="why">An account, then that account's taxis run on the Linux box, with a trail and a waiting fare.</p>
        {bar(empire_done, empire_total)}
        <p class="fine">Map {len(u_done)} / {len(u_nums)}. API {len(a_done)} / {len(a_nums)}. Issues reached {po_opened} / {po_total}.</p>
        <div class="objective api" style="padding:0.7rem 0 0;border:0;background:transparent">
          <p class="fine">Map</p>
          {bar(len(u_done), len(u_nums))}
          <p class="fine">API</p>
          {bar(len(a_done), len(a_nums))}
        </div>
        <p class="fine">{empire_box}</p>
      </article>
    </section>

    <h2 class="band" id="now">Right now</h2>
    <section class="grid">
      {''.join(cards)}
    </section>

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

    <h2 class="band" id="slices">Account fleet slices</h2>
    <section class="board">
      <h3>Map · U1 to U{u_nums[-1] if u_nums else 0}</h3>
      <div class="chips">{chips("U", u_nums, u_done, u_next, blurbs)}</div>
    </section>
    <section class="board">
      <h3>API · A1 to A{a_nums[-1] if a_nums else 0}</h3>
      <div class="chips">{chips("A", a_nums, a_done, a_next, blurbs)}</div>
    </section>
    <section class="board">
      <h3>Issues · product owner · last title {html.escape(po_title or "none yet")}</h3>
      <div class="chips">{''.join(po_cells)}</div>
      <p class="fine">{html.escape(po_note)}</p>
    </section>

    <p class="built">Public site <a href="https://hackathon.tyneside.software/">hackathon.tyneside.software</a>. Play on the box when it has this map: <a href="http://100.65.94.5/app/">http://100.65.94.5/app/</a>. Orders live in <code>docs/radio/integrator.md</code>.</p>
  </main>
</body>
</html>
"""


def publish() -> str:
    global _page
    with _lock:
        page = build_page()
        _page = page
        OUT.write_text(page, encoding="utf-8")
        return page


class Handler(BaseHTTPRequestHandler):
    def do_GET(self) -> None:  # noqa: N802
        body = publish().encode("utf-8")
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
