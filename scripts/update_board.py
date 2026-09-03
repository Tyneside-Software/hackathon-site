#!/usr/bin/env python3
"""Update the hackathon kanban without hand-editing HTML.

Source of truth: scripts/cards.json
Writes: board.html (live columns + done summary) and done.html (archive)

Examples (from the repo root):

    python scripts/update_board.py list
    python scripts/update_board.py done 12 15 16
    python scripts/update_board.py done 10 --tag "Cloud Run · CORS"
    python scripts/update_board.py move 07 doing
    python scripts/update_board.py add --title "…" --person michael --hours 2 --column done
    python scripts/update_board.py render
    python scripts/update_board.py import-html   # bootstrap cards.json from board.html
"""

from __future__ import annotations

import argparse
import html
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SCRIPTS = Path(__file__).resolve().parent
CARDS_PATH = SCRIPTS / "cards.json"
BOARD_PATH = ROOT / "board.html"
DONE_PATH = ROOT / "done.html"

PEOPLE = [
    {"id": "reeve", "name": "Reeve", "emoji": "🧭"},
    {"id": "connor", "name": "Connor", "emoji": "⚡"},
    {"id": "michael", "name": "Michael", "emoji": "🏗️"},
    {"id": "lewis", "name": "Lewis", "emoji": "🌱"},
    {"id": "noah", "name": "Noah", "emoji": "🔧"},
]
PEOPLE_BY_ID = {p["id"]: p for p in PEOPLE}
COLUMNS = ("todo", "doing", "ready", "done")
COL_LABEL = {
    "todo": "To do",
    "doing": "In progress",
    "ready": "Ready to demo",
    "done": "Done",
}
EMPTY_ALL = {
    "todo": "Nothing here.",
    "doing": "Empty on purpose. Pull a Ready card and ship it.",
    "ready": "Nothing here.",
    "done": "Nothing here.",
}
COL_HEAD_CLASS = {
    "todo": "todo",
    "doing": "doing",
    "ready": "ready",
    "done": "done",
}


def fmt_hours(n: float) -> str:
    n = round(float(n) * 100) / 100
    return str(int(n)) if n == int(n) else str(n)


def load_cards() -> list[dict]:
    if not CARDS_PATH.exists():
        sys.exit(f"No {CARDS_PATH.relative_to(ROOT)} — run: python scripts/update_board.py import-html")
    data = json.loads(CARDS_PATH.read_text(encoding="utf-8"))
    cards = data["cards"] if isinstance(data, dict) and "cards" in data else data
    if not isinstance(cards, list):
        sys.exit("cards.json must be a list or {\"cards\": [...]}")
    return cards


def save_cards(cards: list[dict]) -> None:
    CARDS_PATH.write_text(
        json.dumps({"people": PEOPLE, "cards": cards}, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
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
    return [c for c in cards if c.get("column") == column]


def hours_of(cards: list[dict]) -> float:
    return sum(float(c.get("hours") or 0) for c in cards)


def person_cards(cards: list[dict], pid: str) -> list[dict]:
    return [c for c in cards if c.get("person") == pid]


def person_meta(cards: list[dict], pid: str) -> str:
    theirs = person_cards(cards, pid)
    bits = []
    for col, label in (("done", "done"), ("ready", "ready"), ("doing", "in progress"), ("todo", "to do")):
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
        if 'class="done-index"' in piece:
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


def render_done_summary(cards: list[dict]) -> str:
    done = in_column(cards, "done")
    n, h = len(done), hours_of(done)
    index = json.dumps(
        [{"id": str(c["id"]).zfill(2), "person": c["person"], "hours": c.get("hours") or 0} for c in done],
        ensure_ascii=False,
        separators=(",", ":"),
    )
    return "\n".join(
        [
            '        <div class="col done">',
            f'          <div class="head"><span class="col-name">Done</span><span class="count" id="done-col-count">{n} · {fmt_hours(h)}h</span></div>',
            '          <div class="stack">',
            f'            <script type="application/json" id="done-cards-index">{index}</script>',
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
            render_live_column(cards, "todo"),
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


def render_done_page(cards: list[dict]) -> str:
    done = in_column(cards, "done")
    n, h = len(done), hours_of(done)
    card_html = "\n".join(render_card(c, indent="          ") for c in done) or (
        '          <p class="empty-col">Nothing done yet.</p>'
    )
    people_html = render_people(cards)
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Tyneside Logistics — done</title>
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
        <a href="app/">Map</a>
        <a href="board.html">Board</a>
        <a href="done.html" class="is-current" aria-current="page">Done</a>
        <a href="onboarding.html">Onboarding</a>
        <a href="lewis.html">Lewis</a>
      </div>
      <a class="btn btn-fill" href="board.html">Back to board</a>
    </div>
  </nav>

  <div class="wrap-wide" style="padding: 1.5rem 0 3rem">
    <p class="hero-kicker">Hackathon night · archive</p>
    <h1 style="font-size:1.7rem;margin-bottom:0.4rem">Done cards</h1>
    <p style="color:var(--muted);max-width:42rem">
      Finished increments live here so the board stays short.
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

    <div class="done-archive" id="done-archive">
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
    cards = load_cards()
    patch_board_html(cards)
    DONE_PATH.write_text(render_done_page(cards), encoding="utf-8")
    done = in_column(cards, "done")
    print(
        f"Rendered board.html + done.html "
        f"({len(in_column(cards, 'todo'))} todo, "
        f"{len(in_column(cards, 'doing'))} doing, "
        f"{len(in_column(cards, 'ready'))} ready, "
        f"{len(done)} done)"
    )


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


def cmd_done(args: argparse.Namespace) -> None:
    cards = load_cards()
    move_cards(cards, args.ids, "done", args.tag, args.tag_kind)
    save_cards(cards)
    cmd_render()


def cmd_move(args: argparse.Namespace) -> None:
    cards = load_cards()
    move_cards(cards, args.ids, args.column, args.tag, args.tag_kind)
    save_cards(cards)
    cmd_render()


def cmd_add(args: argparse.Namespace) -> None:
    cards = load_cards()
    cid = args.id.zfill(2) if args.id else next_id(cards)
    if any(str(c["id"]).zfill(2) == cid for c in cards):
        sys.exit(f"Card {cid} already exists")
    person = args.person.lower()
    if person not in PEOPLE_BY_ID:
        sys.exit(f"person must be one of {', '.join(PEOPLE_BY_ID)}")
    column = args.column
    if column not in COLUMNS:
        sys.exit(f"column must be one of {', '.join(COLUMNS)}")
    hours = args.hours
    if hours == int(hours):
        hours = int(hours)
    brief = args.brief or f"<p>{html.escape(args.title)}</p>"
    if not brief.strip().startswith("<"):
        brief = f"<p>{brief}</p>"
    card = {
        "id": cid,
        "person": person,
        "hours": hours,
        "emoji": args.emoji or PEOPLE_BY_ID[person]["emoji"],
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
    cmd_render()


def cmd_list(args: argparse.Namespace) -> None:
    cards = load_cards()
    col_filter = args.column
    person_filter = args.person.lower() if args.person else None
    for col in COLUMNS:
        group = in_column(cards, col)
        if col_filter and col != col_filter:
            continue
        print(f"{COL_LABEL[col]}  ({len(group)} · {fmt_hours(hours_of(group))}h)")
        for card in group:
            if person_filter and card.get("person") != person_filter:
                continue
            print(
                f"  {str(card['id']).zfill(2)}  {card.get('person', '?'):<8}  "
                f"{fmt_hours(card.get('hours') or 0):>5}h  {card['title']}"
            )
        print()


def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = p.add_subparsers(dest="cmd", required=True)

    imp = sub.add_parser("import-html", help="Build cards.json from the current board.html")
    imp.add_argument("--force", action="store_true")
    imp.set_defaults(func=cmd_import_html)

    rend = sub.add_parser("render", help="Rewrite board.html + done.html from cards.json")
    rend.set_defaults(func=cmd_render)

    lst = sub.add_parser("list", help="Print cards")
    lst.add_argument("--column", choices=COLUMNS)
    lst.add_argument("--person")
    lst.set_defaults(func=cmd_list)

    done = sub.add_parser("done", help="Move cards to Done and re-render")
    done.add_argument("ids", nargs="+")
    done.add_argument("--tag")
    done.add_argument("--tag-kind", choices=("ok", "wait"))
    done.set_defaults(func=cmd_done)

    mv = sub.add_parser("move", help="Move cards to a column and re-render")
    mv.add_argument("ids", nargs="+")
    mv.add_argument("column", choices=COLUMNS)
    mv.add_argument("--tag")
    mv.add_argument("--tag-kind", choices=("ok", "wait"))
    mv.set_defaults(func=cmd_move)

    add = sub.add_parser("add", help="Add a card and re-render")
    add.add_argument("--id")
    add.add_argument("--title", required=True)
    add.add_argument("--person", required=True)
    add.add_argument("--hours", type=float, required=True)
    add.add_argument("--column", default="todo", choices=COLUMNS)
    add.add_argument("--emoji")
    add.add_argument("--tag")
    add.add_argument("--tag-kind", choices=("ok", "wait"))
    add.add_argument("--brief", help="HTML or plain text for the modal")
    add.set_defaults(func=cmd_add)

    return p


def main(argv: list[str] | None = None) -> None:
    args = build_parser().parse_args(argv)
    args.func(args)


if __name__ == "__main__":
    main()
