#!/usr/bin/env python3
"""Update the hackathon kanban.

The live board is SQLite, through the API, once that API is running.
scripts/cards.json, board-snapshot.json, and hackathon-api/app/board_seed.json
are the copy that survives when the database is not deployed yet.

Examples (from the repo root):

    python scripts/update_board.py list
    python scripts/update_board.py pull
    python scripts/update_board.py done 12 --by michael
    python scripts/update_board.py move 07 todo --by michael --reason "Not ready."
    python scripts/update_board.py move 07 backlog --by michael
    python scripts/update_board.py assign 07 lewis+noah --by michael
    python scripts/update_board.py add --title "…" --person michael --hours 2 --column backlog
"""

from __future__ import annotations

import argparse
import html
import json
import os
import re
import sys
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SCRIPTS = Path(__file__).resolve().parent
CARDS_PATH = SCRIPTS / "cards.json"
SNAPSHOT_PATH = ROOT / "board-snapshot.json"
SEED_PATH = ROOT.parent / "hackathon-api" / "app" / "board_seed.json"
BOARD_PATH = ROOT / "board.html"
DONE_PATH = ROOT / "done.html"
TODO_PATH = ROOT / "todo.html"
TODO_PREVIEW = 4

PEOPLE = [
    {"id": "reeve", "name": "Reeve", "emoji": "🧭"},
    {"id": "connor", "name": "Connor", "emoji": "⚡"},
    {"id": "michael", "name": "Michael", "emoji": "🏗️"},
    {"id": "lewis", "name": "Lewis", "emoji": "🌱"},
    {"id": "noah", "name": "Noah", "emoji": "🔧"},
]
PEOPLE_BY_ID = {p["id"]: p for p in PEOPLE}
COLUMNS = ("backlog", "todo", "next", "doing", "ready", "done")
COL_LABEL = {
    "backlog": "Backlog",
    "todo": "To do",
    "next": "Next",
    "doing": "In progress",
    "ready": "Ready to deploy",
    "done": "Done",
}
EMPTY_ALL = {
    "backlog": "Nothing waiting.",
    "todo": "Nothing here.",
    "next": "Nothing lined up.",
    "doing": "Empty on purpose. Pull a Ready card and ship it.",
    "ready": "Nothing here.",
    "done": "Nothing here.",
}
COL_HEAD_CLASS = {
    "backlog": "backlog",
    "todo": "todo",
    "next": "next",
    "doing": "doing",
    "ready": "ready",
    "done": "done",
}


def fmt_hours(n: float) -> str:
    n = round(float(n) * 100) / 100
    return str(int(n)) if n == int(n) else str(n)


def api_base() -> str:
    return os.environ.get("HACKATHON_API", "http://127.0.0.1:8080").rstrip("/")


def api_alive() -> bool:
    try:
        with urllib.request.urlopen(api_base() + "/v1/board", timeout=2) as res:
            return res.status == 200
    except (urllib.error.URLError, TimeoutError, OSError):
        return False


def api_json(method: str, path: str, body: dict | None = None, timeout: float = 8) -> dict:
    data = None if body is None else json.dumps(body).encode("utf-8")
    req = urllib.request.Request(
        api_base() + path,
        data=data,
        method=method,
        headers={"Content-Type": "application/json", "Accept": "application/json"},
    )
    try:
        with urllib.request.urlopen(req, timeout=timeout) as res:
            return json.loads(res.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        raw = exc.read().decode("utf-8", errors="replace")
        try:
            detail = json.loads(raw).get("detail", raw)
        except json.JSONDecodeError:
            detail = raw
        sys.exit(f"API {method} {path} failed ({exc.code}): {detail}")
    except urllib.error.URLError as exc:
        sys.exit(f"API {method} {path} failed: {exc}")


def write_bundle(payload: dict) -> None:
    text = json.dumps(
        {
            "people": payload.get("people") or PEOPLE,
            "cards": payload.get("cards") or [],
            "events": payload.get("events") or [],
        },
        ensure_ascii=False,
        indent=2,
    ) + "\n"
    CARDS_PATH.write_text(text, encoding="utf-8")
    SNAPSHOT_PATH.write_text(text, encoding="utf-8")
    if SEED_PATH.parent.is_dir():
        SEED_PATH.write_text(text, encoding="utf-8")


def load_state() -> dict:
    if not CARDS_PATH.exists():
        sys.exit(f"No {CARDS_PATH.relative_to(ROOT)} — the board seed is missing.")
    data = json.loads(CARDS_PATH.read_text(encoding="utf-8"))
    if isinstance(data, list):
        return {"people": PEOPLE, "cards": data, "events": []}
    cards = data.get("cards")
    if not isinstance(cards, list):
        sys.exit('cards.json must be a list or {"cards": [...]}')
    return {
        "people": data.get("people") or PEOPLE,
        "cards": cards,
        "events": data.get("events") or [],
    }


def load_cards() -> list[dict]:
    return load_state()["cards"]


def save_cards(cards: list[dict]) -> None:
    state = load_state() if CARDS_PATH.exists() else {"people": PEOPLE, "events": []}
    write_bundle({"people": state.get("people") or PEOPLE, "cards": cards, "events": state.get("events") or []})


def warn_offline() -> None:
    print("API is not running, so this edit is in the JSON seed only.")
    db_paths = [
        ROOT.parent / "hackathon-api" / "hackathon.db",
        ROOT.parent / "hackathon-api" / "data" / "hackathon.db",
    ]
    if any(path.exists() for path in db_paths):
        print("A SQLite file is already on disk and was not changed.")
        print("Start the API and edit there. An existing database does not re-import this file.")


def cmd_pull(args: argparse.Namespace | None = None) -> None:
    try:
        with urllib.request.urlopen(api_base() + "/v1/board/export", timeout=8) as res:
            payload = json.loads(res.read().decode("utf-8"))
    except (urllib.error.URLError, TimeoutError, OSError, json.JSONDecodeError) as exc:
        sys.exit(f"Could not export the board from {api_base()}: {exc}")
    if not isinstance(payload, dict) or not isinstance(payload.get("cards"), list):
        sys.exit("Export did not include cards.")
    write_bundle(payload)
    print(
        f"Copied {len(payload['cards'])} cards from SQLite into "
        "scripts/cards.json, board-snapshot.json, and hackathon-api/app/board_seed.json."
    )


def find_card(cards: list[dict], cid: str) -> dict:
    cid = str(cid).zfill(2) if str(cid).isdigit() else str(cid)
    for card in cards:
        if str(card["id"]).zfill(2) == cid.zfill(2):
            return card
    sys.exit(f"No card {cid}")


def take_card(cards: list[dict], cid: str) -> dict:
    cid = str(cid).zfill(2) if str(cid).isdigit() else str(cid)
    for i, card in enumerate(cards):
        if str(card["id"]).zfill(2) == cid.zfill(2):
            return cards.pop(i)
    sys.exit(f"No card {cid}")


def next_id(cards: list[dict]) -> str:
    nums = [int(c["id"]) for c in cards if str(c["id"]).isdigit()]
    return f"{max(nums, default=0) + 1:02d}"


def in_column(cards: list[dict], column: str) -> list[dict]:
    rows = [c for c in cards if c.get("column") == column]
    if any(isinstance(c.get("rank"), int) for c in rows):
        rows.sort(key=lambda c: (c.get("rank") if isinstance(c.get("rank"), int) else 0, str(c.get("id"))))
    return rows


def hours_of(cards: list[dict]) -> float:
    return sum(float(c["hours"]) for c in cards if c.get("hours") is not None)


def _owner_list(text: str) -> list[str]:
    raw = (text or "").strip().lower()
    if raw in ("", "none", "-", "unassigned"):
        return []
    found = []
    for part in raw.replace("+", ",").split(","):
        key = part.strip()
        if key and key not in found:
            found.append(key)
    return found


def owners_of(card: dict) -> list[str]:
    raw = card.get("owners")
    if isinstance(raw, list) and raw:
        return [str(item) for item in raw if str(item).strip()]
    if card.get("person"):
        return [str(card["person"])]
    return []


def person_cards(cards: list[dict], pid: str) -> list[dict]:
    return [c for c in cards if c.get("person") == pid]


def person_meta(cards: list[dict], pid: str) -> str:
    theirs = person_cards(cards, pid)
    bits = []
    for col, label in (("done", "done"), ("ready", "ready"), ("doing", "in progress"), ("next", "next"), ("todo", "to do")):
        n = sum(1 for c in theirs if c.get("column") == col)
        if n:
            bits.append(f"{n} {label}")
    return " · ".join(bits) or "no cards"


# --- import from existing board.html ---------------------------------------

def _split_columns(board_html: str) -> dict[str, str]:
    found: dict[str, str] = {}
    for col in COLUMNS:
        m = re.search(
            rf'<div class="col {col}">(.*?)(?=<div class="col |\Z)',
            board_html,
            re.S,
        )
        if m:
            found[col] = m.group(1)
    return found


def _card_chunks(section: str) -> list[str]:
    starts = [m.start() for m in re.finditer(r'<a class="card"', section)]
    chunks = []
    for i, start in enumerate(starts):
        end = starts[i + 1] if i + 1 < len(starts) else len(section)
        piece = section[start:end]
        close = re.search(r"</template>\s*</a>", piece, re.S)
        if close:
            piece = piece[: close.end()]
        else:
            close = re.search(r"</a>", piece)
            if close:
                piece = piece[: close.end()]
        if "done-index" in piece or "todo-index" in piece:
            continue
        chunks.append(piece)
    return chunks


def parse_card_html(chunk: str, column: str) -> dict | None:
    id_m = re.search(r'id="card-(\d+)"', chunk)
    person_m = re.search(r'data-person="(\w+)"', chunk)
    hours_m = re.search(r'data-hours="([^"]+)"', chunk)
    if not (id_m and person_m and hours_m):
        return None
    emoji_m = re.search(r'<span class="emoji">([^<]*)</span>', chunk)
    title_m = re.search(r'<div class="title">(.*?)</div>', chunk, re.S)
    tag_m = re.search(r'<span class="tag tag-(ok|wait)">(.*?)</span>', chunk, re.S)
    brief_m = re.search(r'<template class="card-brief">(.*?)</template>', chunk, re.S)
    raw_hours = float(hours_m.group(1))
    hours: float | int = int(raw_hours) if raw_hours == int(raw_hours) else raw_hours
    card = {
        "id": id_m.group(1).zfill(2),
        "person": person_m.group(1),
        "hours": hours,
        "emoji": (emoji_m.group(1).strip() if emoji_m else ""),
        "title": re.sub(r"\s+", " ", title_m.group(1)).strip() if title_m else f"Card {id_m.group(1)}",
        "column": column,
        "brief": brief_m.group(1).strip() if brief_m else "",
    }
    if tag_m:
        card["tag"] = re.sub(r"\s+", " ", tag_m.group(2)).strip()
        card["tag_kind"] = tag_m.group(1)
    return card


def cmd_import_html(args: argparse.Namespace) -> None:
    if CARDS_PATH.exists() and not args.force:
        sys.exit(f"{CARDS_PATH.name} already exists. Pass --force to overwrite from board.html.")
    board_html = BOARD_PATH.read_text(encoding="utf-8")
    if "BOARD:KANBAN" not in board_html:
        sys.exit("board.html is the live board. import-html only reads the old generated markup.")
    cards: list[dict] = []
    seen: set[str] = set()
    for col, section in _split_columns(board_html).items():
        for chunk in _card_chunks(section):
            card = parse_card_html(chunk, col)
            if not card:
                continue
            if card["id"] in seen:
                continue
            seen.add(card["id"])
            cards.append(card)
    if not cards:
        sys.exit("import-html found no cards in board.html")
    save_cards(cards)
    print(f"Imported {len(cards)} cards → {CARDS_PATH.relative_to(ROOT)}")


# --- render HTML ------------------------------------------------------------

def render_card(card: dict, indent: str = "            ") -> str:
    cid = str(card["id"]).zfill(2)
    person = card["person"]
    hours = fmt_hours(card.get("hours") or 0)
    name = PEOPLE_BY_ID.get(person, {}).get("name", person.title())
    emoji = card.get("emoji") or PEOPLE_BY_ID.get(person, {}).get("emoji", "")
    title = card.get("title") or f"Card {cid}"
    tag = card.get("tag")
    tag_kind = card.get("tag_kind") or "wait"
    brief = card.get("brief") or f"<p>{html.escape(title)}</p>"
    lines = [
        f'{indent}<a class="card" id="card-{cid}" href="#t-{cid}" data-person="{html.escape(person)}" data-hours="{card.get("hours") or 0}">',
        f'{indent}  <div class="top"><span class="id">{cid}</span><span class="emoji">{emoji}</span></div>',
        f'{indent}  <div class="title">{title}</div>',
    ]
    if tag:
        lines.append(f'{indent}  <span class="tag tag-{tag_kind}">{tag}</span>')
    lines.append(f'{indent}  <div class="bot"><span>{hours}h</span><span>{html.escape(name)}</span></div>')
    lines.append(f'{indent}  <template class="card-brief">')
    for brief_line in brief.splitlines() or [brief]:
        lines.append(f"{indent}    {brief_line}" if brief_line.strip() else f"{indent}    ")
    lines.append(f"{indent}  </template>")
    lines.append(f"{indent}</a>")
    return "\n".join(lines)


def render_people(cards: list[dict]) -> str:
    blocks = ['    <div class="people">']
    for person in PEOPLE:
        pid = person["id"]
        hrs = hours_of(person_cards(cards, pid))
        meta = person_meta(cards, pid)
        blocks.append(
            "\n".join(
                [
                    f'      <button type="button" class="person" data-person="{pid}" aria-pressed="false">',
                    f'        <div class="who"><span class="emoji">{person["emoji"]}</span> {person["name"]}</div>',
                    f'        <div class="hrs">{fmt_hours(hrs)} <span>hrs</span></div>',
                    f'        <div class="meta">{html.escape(meta)}</div>',
                    "      </button>",
                ]
            )
        )
    blocks.append("    </div>")
    return "\n".join(blocks)


def render_live_column(cards: list[dict], column: str) -> str:
    col_cards = in_column(cards, column)
    n, h = len(col_cards), hours_of(col_cards)
    empty_hidden = "" if not col_cards else " is-hidden"
    empty_text = EMPTY_ALL[column] if not col_cards else ""
    parts = [
        f'        <div class="col {COL_HEAD_CLASS[column]}">',
        f'          <div class="head"><span class="col-name">{COL_LABEL[column]}</span><span class="count">{n} · {fmt_hours(h)}h</span></div>',
        '          <div class="stack">',
        f'            <p class="empty-col{empty_hidden}" data-all="{html.escape(EMPTY_ALL[column])}">{empty_text}</p>',
    ]
    for card in col_cards:
        parts.append(render_card(card))
    parts += ["          </div>", "        </div>"]
    return "\n".join(parts)


def card_index_json(cards: list[dict]) -> str:
    return json.dumps(
        [{"id": str(c["id"]).zfill(2), "person": c["person"], "hours": c.get("hours") or 0} for c in cards],
        ensure_ascii=False,
        separators=(",", ":"),
    )


def render_todo_column(cards: list[dict]) -> str:
    todos = in_column(cards, "todo")
    preview = todos[:TODO_PREVIEW]
    rest = max(0, len(todos) - len(preview))
    n, h = len(todos), hours_of(todos)
    empty_hidden = "" if not preview else " is-hidden"
    empty_text = EMPTY_ALL["todo"] if not preview else ""
    more = f"{rest} more · all {n} →" if rest else f"{n} cards · {fmt_hours(h)}h · all to-do →"
    parts = [
        '        <div class="col todo">',
        f'          <div class="head"><span class="col-name">To do</span><span class="count" id="todo-col-count">{n} · {fmt_hours(h)}h</span></div>',
        '          <div class="stack">',
        f'            <script type="application/json" id="todo-cards-index">{card_index_json(todos)}</script>',
        f'            <p class="empty-col{empty_hidden}" data-all="{html.escape(EMPTY_ALL["todo"])}">{empty_text}</p>',
    ]
    for card in preview:
        parts.append(render_card(card))
    if todos:
        parts += [
            '            <a class="card todo-index" id="todo-index" href="todo.html">',
            f'              <div class="todo-index-count" id="todo-index-count">{n}</div>',
            '              <div class="title">All to-do cards</div>',
            f'              <p class="todo-index-meta" id="todo-index-meta">{more}</p>',
            "            </a>",
        ]
    parts += ["          </div>", "        </div>"]
    return "\n".join(parts)


def render_done_summary(cards: list[dict]) -> str:
    done = in_column(cards, "done")
    n, h = len(done), hours_of(done)
    return "\n".join(
        [
            '        <div class="col done">',
            f'          <div class="head"><span class="col-name">Done</span><span class="count" id="done-col-count">{n} · {fmt_hours(h)}h</span></div>',
            '          <div class="stack">',
            f'            <script type="application/json" id="done-cards-index">{card_index_json(done)}</script>',
            '            <a class="card done-index" id="done-index" href="done.html">',
            f'              <div class="done-index-count" id="done-index-count">{n}</div>',
            '              <div class="title">All done cards</div>',
            f'              <p class="done-index-meta" id="done-index-meta">{n} cards · {fmt_hours(h)}h · archive →</p>',
            "            </a>",
            "          </div>",
            "        </div>",
        ]
    )


def render_kanban(cards: list[dict]) -> str:
    return "\n".join(
        [
            '    <div class="kanban-scroll">',
            '      <div class="kanban">',
            "",
            render_todo_column(cards),
            "",
            render_live_column(cards, "doing"),
            "",
            render_live_column(cards, "ready"),
            "",
            render_done_summary(cards),
            "",
            "      </div>",
            "    </div>",
        ]
    )


def render_who(cards: list[dict]) -> str:
    rows = []
    col_word = {"todo": "", "doing": ", in progress", "ready": ", ready", "done": ", done"}
    for person in PEOPLE:
        pid = person["id"]
        theirs = person_cards(cards, pid)
        bits = []
        for card in theirs:
            bits.append(
                f"{card['title']} ({fmt_hours(card.get('hours') or 0)}h{col_word.get(card.get('column'), '')})"
            )
        claimed = " · ".join(bits) if bits else "—"
        rows.append(
            "\n".join(
                [
                    f'        <tr data-person="{pid}">',
                    f'          <td>{person["emoji"]}</td>',
                    f'          <td><strong>{person["name"]}</strong></td>',
                    f"          <td>{claimed}</td>",
                    f'          <td><strong>{fmt_hours(hours_of(theirs))}h</strong></td>',
                    "        </tr>",
                ]
            )
        )
    return "\n".join(
        [
            '    <div class="who-wrap">',
            '    <table class="who-table">',
            "      <thead>",
            "        <tr><th></th><th>Owner</th><th>Claimed work</th><th>Hours</th></tr>",
            "      </thead>",
            "      <tbody>",
            "\n".join(rows),
            "      </tbody>",
            "    </table>",
            "    </div>",
        ]
    )


def replace_marked_or_block(text: str, name: str, inner: str, fallback: tuple[str, str]) -> str:
    variants = [
        (f"    <!-- BOARD:{name} -->", f"    <!-- /BOARD:{name} -->"),
        (f"<!-- BOARD:{name} -->", f"<!-- /BOARD:{name} -->"),
    ]
    block = f"    <!-- BOARD:{name} -->\n{inner}\n    <!-- /BOARD:{name} -->\n"
    for start, end in variants:
        if start in text and end in text:
            pattern = re.compile(re.escape(start) + r".*?" + re.escape(end), re.S)

            def _repl(_m: re.Match[str], _block: str = block) -> str:
                return _block

            return pattern.sub(_repl, text, count=1)
    pat, _ = fallback
    m = re.search(pat, text, re.S)
    if not m:
        sys.exit(f"Could not find {name} section in board.html to replace")
    return text[: m.start()] + block + text[m.end() :]


def patch_board_html(cards: list[dict]) -> None:
    text = BOARD_PATH.read_text(encoding="utf-8")
    text = replace_marked_or_block(
        text,
        "PEOPLE",
        render_people(cards),
        (r'<div class="people">.*?</div>\s*(?=<div class="kanban-scroll">|<!-- BOARD:KANBAN)', "people"),
    )
    text = replace_marked_or_block(
        text,
        "KANBAN",
        render_kanban(cards),
        (r'<div class="kanban-scroll">.*?</div>\s*</div>\s*(?=<h2|<!-- BOARD:WHO)', "kanban"),
    )
    text = replace_marked_or_block(
        text,
        "WHO",
        render_who(cards),
        (r'<div class="who-wrap">.*?</div>\s*(?=<h2|<!-- )', "who"),
    )
    BOARD_PATH.write_text(text, encoding="utf-8")


def render_archive_page(cards: list[dict], column: str) -> str:
    items = in_column(cards, column)
    n, h = len(items), hours_of(items)
    if column == "todo":
        slug, heading, kicker, blurb = (
            "todo",
            "To-do cards",
            "Hackathon night · backlog",
            "The board only shows the top few. Everything still open lives here.",
        )
    else:
        slug, heading, kicker, blurb = (
            "done",
            "Done cards",
            "Hackathon night · archive",
            "Finished increments live here so the board stays short.",
        )
    card_html = "\n".join(render_card(c, indent="          ") for c in items) or (
        f'          <p class="empty-col">Nothing {column} yet.</p>'
    )
    people_html = render_people(cards)
    todo_cur = ' class="is-current" aria-current="page"' if column == "todo" else ""
    done_cur = ' class="is-current" aria-current="page"' if column == "done" else ""
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Tyneside Logistics — {slug}</title>
  <link rel="icon" href="logo.svg" type="image/svg+xml">
  <link rel="stylesheet" href="styles.css">
</head>
<body class="site">
  <nav class="site-nav" aria-label="Primary">
    <div class="inner">
      <a href="index.html" class="brand-link">
        <img src="logo.svg" width="36" height="36" alt="Tyneside">
        <span>TYNESIDE</span>
        <span class="brand-sub">LOGISTICS</span>
      </a>
      <div class="nav-links">
        <a href="index.html">Home</a>
        <a href="progress.html" class="nav-now">Progress</a>
        <a href="app/">Map</a>
        <a href="board.html">Board</a>
        <a href="todo.html"{todo_cur}>To do</a>
        <a href="done.html"{done_cur}>Done</a>
        <a href="docs/" class="nav-docs">Docs</a>
        <a href="api-test.html">API test</a>
        <a href="account.html">Account</a>
        <a href="onboarding.html">Onboarding</a>
        <a href="lewis.html">Lewis</a>
      </div>
      <a class="btn btn-fill" href="app/">Open map →</a>
    </div>
  </nav>

  <div class="wrap-wide" style="padding: 1.5rem 0 3rem">
    <p class="hero-kicker">{kicker}</p>
    <h1 style="font-size:1.7rem;margin-bottom:0.4rem">{heading}</h1>
    <p style="color:var(--muted);max-width:42rem">
      {blurb}
      <strong>{n} cards · {fmt_hours(h)}h</strong>.
      Click a card for the brief. Filter with the chips, hour cards, or <code>?person=lewis</code>.
    </p>

    <div class="filters" role="toolbar" aria-label="Filter by person">
      <button type="button" class="filter is-on" data-person="all" aria-pressed="true">Everyone</button>
      <button type="button" class="filter" data-person="reeve" aria-pressed="false">🧭 Reeve</button>
      <button type="button" class="filter" data-person="connor" aria-pressed="false">⚡ Connor</button>
      <button type="button" class="filter" data-person="michael" aria-pressed="false">🏗️ Michael</button>
      <button type="button" class="filter" data-person="lewis" aria-pressed="false">🌱 Lewis</button>
      <button type="button" class="filter" data-person="noah" aria-pressed="false">🔧 Noah</button>
    </div>
    <p class="filter-status" id="filter-status">Showing everyone.</p>

{people_html}

    <div class="card-archive" id="{slug}-archive">
{card_html}
    </div>
  </div>

  <footer class="foot">
    <div class="wrap-wide">Tyneside Logistics hackathon · Reeve · Connor · Michael · Lewis · Noah</div>
  </footer>

  <dialog class="card-modal" id="card-modal" aria-labelledby="card-modal-title">
    <div class="card-modal-inner">
      <button type="button" class="card-modal-close" id="card-modal-close">Close</button>
      <p class="hero-kicker" id="card-modal-meta"></p>
      <h2 id="card-modal-title"></h2>
      <div class="card-modal-body" id="card-modal-body"></div>
    </div>
  </dialog>
  <script src="board.js"></script>
</body>
</html>
"""


def cmd_render(args: argparse.Namespace | None = None) -> None:
    """Refresh the git copies. Does not rewrite the board pages."""
    if api_alive():
        cmd_pull(args)
        return
    state = load_state()
    write_bundle(state)
    print(f"API is not running. Wrote the snapshot from {CARDS_PATH.name} ({len(state['cards'])} cards).")
    warn_offline()


def move_cards(cards: list[dict], ids: list[str], column: str, tag: str | None, tag_kind: str | None) -> None:
    if column not in COLUMNS:
        sys.exit(f"column must be one of {', '.join(COLUMNS)}")
    taken = [take_card(cards, cid) for cid in ids]
    for card in reversed(taken):
        card["column"] = column
        if tag is not None:
            card["tag"] = tag
        if tag_kind is not None:
            card["tag_kind"] = tag_kind
        elif column == "done":
            card["tag_kind"] = "ok"
        if column == "done":
            cards.insert(0, card)
        else:
            cards.append(card)
        print(f"  #{str(card['id']).zfill(2)} → {column}  {card['title']}")


def _card_lookup(cards: list[dict]) -> dict[str, dict]:
    found = {}
    for card in cards:
        key = str(card["id"])
        found[key] = card
        if key.isdigit():
            found[key.zfill(2)] = card
            found[str(int(key))] = card
    return found


def _actor(args: argparse.Namespace, card: dict) -> str:
    by = getattr(args, "by", None)
    if by:
        return str(by).lower()
    return str(card.get("person") or "michael")


def cmd_done(args: argparse.Namespace) -> None:
    if api_alive():
        state = api_json("GET", "/v1/board")
        found = _card_lookup(state["cards"])
        for cid in args.ids:
            card = found.get(str(cid)) or found.get(str(cid).zfill(2))
            if card is None:
                sys.exit(f"No card {cid}")
            api_json(
                "POST",
                f"/v1/board/cards/{card['id']}/move",
                {"column": "done", "by": _actor(args, card), "reason": args.reason or ""},
            )
        cmd_pull(args)
        return
    cards = load_cards()
    move_cards(cards, args.ids, "done", args.tag, args.tag_kind)
    save_cards(cards)
    warn_offline()


def cmd_move(args: argparse.Namespace) -> None:
    if api_alive():
        state = api_json("GET", "/v1/board")
        found = _card_lookup(state["cards"])
        for cid in args.ids:
            card = found.get(str(cid)) or found.get(str(cid).zfill(2))
            if card is None:
                sys.exit(f"No card {cid}")
            api_json(
                "POST",
                f"/v1/board/cards/{card['id']}/move",
                {"column": args.column, "by": _actor(args, card), "reason": args.reason or ""},
            )
        cmd_pull(args)
        return
    cards = load_cards()
    move_cards(cards, args.ids, args.column, args.tag, args.tag_kind)
    save_cards(cards)
    warn_offline()


def cmd_add(args: argparse.Namespace) -> None:
    if api_alive():
        if args.id:
            sys.exit("The API assigns the card id. Leave out --id, or stop the API to edit the JSON seed.")
        brief = args.brief or f"<p>{html.escape(args.title)}</p>"
        owners = _owner_list(args.owners) if args.owners else ([args.person.lower()] if args.person else [])
        body = {
            "title": args.title,
            "by": "",
            "owners": owners,
            "hours": args.hours,
            "column": args.column,
            "brief": brief,
            "tag": args.tag or "",
            "tag_kind": args.tag_kind or "",
            "value": args.value,
        }
        api_json("POST", "/v1/board/cards", body)
        print(f"  added to {args.column}: {args.title}")
        cmd_pull(args)
        return
    cards = load_cards()
    cid = args.id.zfill(2) if args.id else next_id(cards)
    if any(str(c["id"]).zfill(2) == cid for c in cards):
        sys.exit(f"Card {cid} already exists")
    owners = _owner_list(args.owners) if args.owners else ([args.person.lower()] if args.person else [])
    for person in owners:
        if person not in PEOPLE_BY_ID:
            sys.exit(f"person must be one of {', '.join(PEOPLE_BY_ID)}")
    person = owners[0] if owners else ""
    column = args.column
    if column not in COLUMNS:
        sys.exit(f"column must be one of {', '.join(COLUMNS)}")
    hours = args.hours
    if isinstance(hours, float) and hours == int(hours):
        hours = int(hours)
    brief = args.brief or f"<p>{html.escape(args.title)}</p>"
    if not brief.strip().startswith("<"):
        brief = f"<p>{brief}</p>"
    card = {
        "id": cid,
        "person": person,
        "hours": hours,
        "emoji": args.emoji or (PEOPLE_BY_ID[person]["emoji"] if person else ""),
        "owners": owners,
        "value": args.value,
        "title": args.title,
        "column": column,
        "brief": brief,
    }
    if args.tag:
        card["tag"] = args.tag
        card["tag_kind"] = args.tag_kind or ("ok" if column == "done" else "wait")
    if column == "done":
        cards.insert(0, card)
    else:
        cards.append(card)
    save_cards(cards)
    print(f"  added #{cid} in {column}: {args.title}")
    warn_offline()


def _find_live(args_ids: list[str]) -> list[dict]:
    state = api_json("GET", "/v1/board")
    found = _card_lookup(state["cards"])
    cards = []
    for cid in args_ids:
        card = found.get(str(cid)) or found.get(str(cid).zfill(2))
        if card is None:
            sys.exit(f"No card {cid}")
        cards.append(card)
    return cards


def cmd_assign(args: argparse.Namespace) -> None:
    owners = _owner_list(args.owners)
    for person in owners:
        if person not in PEOPLE_BY_ID:
            sys.exit(f"person must be one of {', '.join(PEOPLE_BY_ID)}")
    if api_alive():
        for card in _find_live(args.ids):
            api_json(
                "PATCH",
                f"/v1/board/cards/{card['id']}",
                {"by": _actor(args, card), "owners": owners},
            )
        cmd_pull(args)
        return
    cards = load_cards()
    found = _card_lookup(cards)
    for cid in args.ids:
        card = found.get(str(cid)) or found.get(str(cid).zfill(2))
        if card is None:
            sys.exit(f"No card {cid}")
        card["owners"] = owners
        card["person"] = owners[0] if owners else ""
        if owners:
            card["emoji"] = PEOPLE_BY_ID[owners[0]]["emoji"]
        print(f"  #{card['id']} assignees: {'+'.join(owners) if owners else 'nobody'}")
    save_cards(cards)
    warn_offline()


def cmd_list(args: argparse.Namespace) -> None:
    if api_alive():
        cards = api_json("GET", "/v1/board")["cards"]
        print(f"(from {api_base()})")
    else:
        cards = load_cards()
        print("(from scripts/cards.json — API is not running)")
    col_filter = args.column
    person_filter = args.person.lower() if args.person else None
    for col in COLUMNS:
        group = in_column(cards, col)
        if col_filter and col != col_filter:
            continue
        print(f"{COL_LABEL[col]}  ({len(group)} · {fmt_hours(hours_of(group))}h)")
        for card in group:
            names = owners_of(card)
            if person_filter and person_filter not in names:
                continue
            who = "+".join(names) if names else "—"
            if card.get("hours") is None:
                hours = "    ∅"
            else:
                hours = f"{fmt_hours(card.get('hours')):>5}h"
            print(f"  {str(card['id']).zfill(2)}  {who:<16}  {hours}  {card['title']}")
        print()


def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = p.add_subparsers(dest="cmd", required=True)

    imp = sub.add_parser("import-html", help="Build cards.json from the current board.html")
    imp.add_argument("--force", action="store_true")
    imp.set_defaults(func=cmd_import_html)

    rend = sub.add_parser("render", help="Copy the API board into the git seed, or refresh the snapshot from cards.json")
    rend.set_defaults(func=cmd_render)

    pull = sub.add_parser("pull", help="Copy the SQLite board into cards.json, the snapshot, and the API seed")
    pull.set_defaults(func=cmd_pull)

    lst = sub.add_parser("list", help="Print cards")
    lst.add_argument("--column", choices=COLUMNS)
    lst.add_argument("--person")
    lst.set_defaults(func=cmd_list)

    done = sub.add_parser("done", help="Move cards to Done")
    done.add_argument("ids", nargs="+")
    done.add_argument("--by", help="Accepted and ignored. The board does not keep a history.")
    done.add_argument("--reason", default="", help="Accepted and ignored.")
    done.add_argument("--tag")
    done.add_argument("--tag-kind", choices=("ok", "wait"))
    done.set_defaults(func=cmd_done)

    mv = sub.add_parser("move", help="Move cards to a column")
    mv.add_argument("ids", nargs="+")
    mv.add_argument("column", choices=COLUMNS)
    mv.add_argument("--by", help="Accepted and ignored. The board does not keep a history.")
    mv.add_argument("--reason", default="", help="Accepted and ignored.")
    mv.add_argument("--tag")
    mv.add_argument("--tag-kind", choices=("ok", "wait"))
    mv.set_defaults(func=cmd_move)

    add = sub.add_parser("add", help="Add a card and re-render")
    add.add_argument("--id")
    add.add_argument("--title", required=True)
    add.add_argument("--person", default="", help="One person. Use --owners for more than one, or leave both blank.")
    add.add_argument("--owners", help="lewis+noah. When set, this is the whole list.")
    add.add_argument("--hours", type=float, default=None, help="Leave blank when the card is not estimated.")
    add.add_argument("--value", type=int, default=3, choices=(1, 2, 3, 4, 5))
    add.add_argument("--column", default="todo", choices=COLUMNS)
    add.add_argument("--emoji")
    add.add_argument("--tag")
    add.add_argument("--tag-kind", choices=("ok", "wait"))
    add.add_argument("--by", help="Accepted and ignored. The board does not keep a history.")
    add.add_argument("--brief", help="HTML or plain text for the modal")
    add.set_defaults(func=cmd_add)

    assign = sub.add_parser("assign", help="Set the people on a card. none clears them.")
    assign.add_argument("ids", nargs="+")
    assign.add_argument("owners", help="One person, lewis+noah, or none")
    assign.add_argument("--by", help="Accepted and ignored. The board does not keep a history.")
    assign.set_defaults(func=cmd_assign)

    return p


def main(argv: list[str] | None = None) -> None:
    args = build_parser().parse_args(argv)
    args.func(args)


if __name__ == "__main__":
    main()
