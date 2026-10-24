"""Local agent dashboard.

Reads the four radio files on origin/main and writes
C:\\Users\\MichaelThomson\\Desktop\\agents.html.
With --serve, http://127.0.0.1:5510/ rebuilds the page on each load.
"""
from __future__ import annotations

import html
import subprocess
import threading
import time
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

SITE = Path(r"C:\Users\MichaelThomson\source\hackathon-site")
OUT = Path(r"C:\Users\MichaelThomson\Desktop\agents.html")
PORT = 5510
FETCH_GAP_S = 15

AGENTS = (
    {
        "key": "integrator",
        "name": "Integrator",
        "seat": "Dobby",
        "colour": "#f59e0b",
        "radio": "docs/radio/integrator.md",
        "checkout": SITE,
        "role": "Leads the team, names the next slice, and deploys the box.",
    },
    {
        "key": "po",
        "name": "Product owner",
        "seat": "PO",
        "colour": "#c4b5fd",
        "radio": "docs/radio/po.md",
        "checkout": Path(r"C:\Users\MichaelThomson\source\lanes\po\hackathon-site"),
        "role": "Opens the issues and keeps the queue honest. No product code.",
    },
    {
        "key": "dev1",
        "name": "grok-dev-1",
        "seat": "Fares and office",
        "colour": "#38bdf8",
        "radio": "docs/radio/grok-dev-1.md",
        "checkout": Path(r"C:\Users\MichaelThomson\source\lanes\grok-dev-1\hackathon-site"),
        "role": "Fare maths, the real booking desk, and the account-fleet API when ordered.",
    },
    {
        "key": "dev2",
        "name": "grok-dev-2",
        "seat": "Map and empire",
        "colour": "#4ade80",
        "radio": "docs/radio/grok-dev-2.md",
        "checkout": Path(r"C:\Users\MichaelThomson\source\lanes\grok-dev-2\hackathon-site"),
        "role": "The map, the circle, and the empire cars.",
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
            return f"{cells[1]} Next: {cells[2]}"
    return "No order row in the Now table."


def checkout_line(path: Path) -> str:
    if not path.is_dir():
        return "Checkout folder is not on this PC."
    branch = git(["status", "-sb"], path)
    first = branch.splitlines()[0] if branch else "(no status)"
    stamp = git(["log", "-1", "--format=%cI"], path)
    subject = git(["log", "-1", "--format=%h %s"], path)
    when, ago, _state = fmt_when(parse_when(stamp.splitlines()[0] if stamp else ""))
    return f"{first}. Last local commit {when} ({ago}). {subject}"


def radio_view(text: str, key: str) -> str:
    if key == "integrator":
        return now_section(text)
    lines = text.strip().splitlines()
    # The lane radios are short. Keep the whole note.
    return "\n".join(lines[:40]).strip()


def recent_commits() -> list[tuple[str, str, str]]:
    raw = git(["log", "-12", "--format=%cI%x09%h%x09%s", "origin/main"], SITE)
    rows = []
    for line in raw.splitlines():
        parts = line.split("\t", 2)
        if len(parts) != 3:
            continue
        when, ago, _state = fmt_when(parse_when(parts[0]))
        rows.append((f"{when} · {ago}", parts[1], parts[2]))
    return rows


def build_page() -> str:
    refresh_origin()
    tip = git(["rev-parse", "--short", "origin/main"], SITE)
    built = datetime.now().astimezone()
    built_label = built.strftime("%d %b %Y · %H:%M:%S")
    radios = {}
    for agent in AGENTS:
        radios[agent["key"]] = git(["show", f"origin/main:{agent['radio']}"], SITE)
    orders = now_section(radios["integrator"])
    cards = []
    for agent in AGENTS:
        stamp = git(["log", "-1", "--format=%cI", "origin/main", "--", agent["radio"]], SITE)
        subject = git(["log", "-1", "--format=%h %s", "origin/main", "--", agent["radio"]], SITE)
        when_label, ago, state = fmt_when(parse_when(stamp.splitlines()[0] if stamp else ""))
        said = radio_view(radios[agent["key"]], agent["key"])
        order = order_for(orders, agent["key"])
        local = checkout_line(agent["checkout"])
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
              <h3>They last wrote</h3>
              <pre>{html.escape(said)}</pre>
              <h3>Order on main</h3>
              <p class="order">{html.escape(order)}</p>
              <h3>Checkout on this PC</h3>
              <p class="local">{html.escape(local)}</p>
            </article>
            """
        )
    commit_rows = []
    for when, sha, subject in recent_commits():
        commit_rows.append(
            f"<li><time>{html.escape(when)}</time><code>{html.escape(sha)}</code><span>{html.escape(subject)}</span></li>"
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
    h2 {{ margin: 0.1rem 0; font-size: 1.35rem; color: var(--heading); }}
    .role, .order, .local, .subject {{ color: var(--muted); margin: 0.25rem 0; }}
    .stamp {{ display: flex; gap: 0.6rem; align-items: baseline; flex-wrap: wrap; margin: 0.7rem 0 0.2rem; }}
    .stamp time {{ font-size: 1.35rem; color: var(--heading); font-variant-numeric: tabular-nums; }}
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
    h3 {{ margin: 0.8rem 0 0.25rem; font-size: 0.72rem; letter-spacing: 0.12em; text-transform: uppercase; color: #cbd5e1; }}
    pre {{
      margin: 0;
      white-space: pre-wrap;
      background: #0a1016;
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 0.7rem 0.75rem;
      max-height: 16rem;
      overflow: auto;
      font: 0.84rem/1.45 ui-monospace, Consolas, monospace;
    }}
    .commits {{ list-style: none; padding: 0; margin: 0.4rem 0 0; }}
    .commits li {{
      display: grid;
      grid-template-columns: 16rem 5.5rem 1fr;
      gap: 0.6rem;
      padding: 0.35rem 0;
      border-bottom: 1px solid var(--border);
      font-size: 0.9rem;
    }}
    code {{ color: #fcd34d; }}
    a {{ color: #fcd34d; }}
    @media (max-width: 860px) {{
      .grid {{ grid-template-columns: 1fr; }}
      .commits li {{ grid-template-columns: 1fr; }}
    }}
  </style>
</head>
<body>
  <main>
    <header class="top">
      <p class="kicker">Tyneside · four agents</p>
      <h1>What everyone is doing</h1>
      <p class="built">Built {html.escape(built_label)} from GitHub <code>main</code> at <code>{html.escape(tip)}</code>. This page reloads every 20 seconds. Radio time is when that agent last wrote their note.</p>
    </header>
    <section class="grid">
      {''.join(cards)}
    </section>
    <h3>Latest on main</h3>
    <ol class="commits">
      {''.join(commit_rows)}
    </ol>
    <p class="built">Map to play: <a href="http://100.65.94.5/app/">http://100.65.94.5/app/</a>. Orders live in <code>docs/radio/integrator.md</code>.</p>
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
