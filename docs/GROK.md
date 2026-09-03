# For Grok — read this first

This page is the briefing for an AI (Grok, or anything similar) helping **Connor** on the Tyneside Logistics hackathon. Connor works the same way Michael does: he asks Grok, Grok reads the repo, Grok does the work.

If you have been pointed at this URL and given a task, **read this whole page, then [Architecture](#architecture), then execute**. Do not ask Connor to paste stack notes that are already here.

| Field | Value |
|-------|--------|
| **Human** | Connor (board id `connor`, ⚡) |
| **Company** | Tyneside Software / Cloud Connect — Tyneside Logistics hackathon |
| **Live wiki** | https://hackathon.tyneside.software/docs/#grok |
| **This file in git** | `docs/GROK.md` on `main` |
| **Connor’s shelf** | [Connor’s area](#connor) — `docs/connor/` |

Raw on GitHub (good to fetch as markdown):  
https://github.com/Tyneside-Software/hackathon-site/blob/main/docs/GROK.md

---

## What you are allowed to do

1. **Execute** — edit files, run commands, commit, **push `origin/main`** unless Connor says not to.
2. Prefer doing the work over telling Connor which commands to run.
3. Keep the site looking working (fallbacks, never a blank page).
4. Put Connor’s documentation under `docs/connor/` and register it in `docs/pages.json` (section `connor`).
5. New product JS is **Alpine.js 3**, not a new framework.

## What you must not do

- Do not hand-edit the `<!-- BOARD:… -->` regions in `board.html`. Use `python scripts/update_board.py`.
- Do not invent a second docs tree (no `wiki/`, no Notion export, no `Connor-docs/`).
- Do not add npm, React, Vue, Svelte, Tailwind, or a bundler.
- Do not open or rely on `file://` — the wiki `fetch`es markdown.
- Do not rewrite `board.js` / `app/map.js` in one go; migrate by small card.
- Do not impersonate Michael, Reeve, Lewis, or Noah in git author unless that is actually the machine user.
- Do not copy `C:\Users\MichaelThomson\Desktop\confidential docs` (that is Michael’s private folder, not this repo).

---

## Repos and layout

Two **sibling** folders:

```
…/hackathon-site     ← this wiki, static Pages site
…/hackathon-api      ← FastAPI, Cloud Run
```

| | Site | API |
|--|------|-----|
| GitHub | https://github.com/Tyneside-Software/hackathon-site | https://github.com/Tyneside-Software/hackathon-api |
| Live | https://hackathon.tyneside.software | https://hackathon-api-git-975511976696.europe-west2.run.app |
| Local | http://127.0.0.1:5500/ | http://127.0.0.1:8080/health |

Connor’s clone path may differ from Michael’s (`C:\Users\MichaelThomson\source\…`). Discover it with the workspace root; do not hard-code Michael’s home directory into Connor’s docs.

From the **site** folder:

```powershell
.\start.ps1
```

Site only: `python -m http.server 5500`  
Wiki: http://127.0.0.1:5500/docs/  
Onboarding (human night notes): `onboarding.html`

`serve.ps1` is gone.

---

## Tech stack (site)

| Layer | Choice |
|-------|--------|
| Pages | Static HTML, GitHub Pages, `CNAME` `hackathon.tyneside.software` |
| CSS | `styles.css` — Tyneside amber/navy tokens |
| New JS | **Alpine.js 3.14.8** from jsDelivr, `defer`, `x-data` |
| Map | Leaflet 1.9.4 + OSM + public OSRM, haversine fallback |
| API base | `config.js` → `window.HACKATHON_API` (Cloud Run URL committed) |
| Board | `scripts/cards.json` + `scripts/update_board.py` (stdlib) |

No `package.json`. What you push is what Pages serves.

Full pages: [Site stack](#stack) · [Alpine.js](#javascript) · [Pages](#pages)

Alpine include:

```html
<script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.14.8/dist/cdn.min.js"></script>
```

`[x-cloak] { display: none !important; }` is already in `styles.css`.

Working Alpine + API example: `api-test.html` (`GET /test_field`).

---

## Tech stack (API)

FastAPI + Uvicorn on Cloud Run `europe-west2`. GitHub deploys with **buildpacks** (Python **3.13**, ubuntu2404). The Dockerfile is unused by that trigger. Root `main.py` re-exports the app for pack’s `main:app`.

| Method | Path |
|--------|------|
| GET | `/` |
| GET | `/health` |
| GET | `/test_field` → `{ ok, key, value }` |
| GET | `/docs` Swagger |
| POST | `/create_field` (Datastore; optional) |

CORS must allow `https://hackathon.tyneside.software` and `http://127.0.0.1:5500`. If Cloud Run has `CORS_ORIGINS` set, code defaults are ignored.

If live `/test_field` is 404, the Cloud Run revision is behind `main`. Check `/health` for `version` (current code is **0.1.3**). See [API](#api).

---

## This wiki

| Piece | Role |
|-------|------|
| `docs/index.html` | Shell (Alpine + marked.js) |
| `docs/pages.json` | Table of contents / sidebar |
| `docs/*.md` | Page bodies |
| Hash `#javascript` | Shareable page URL |

**Add a page (Connor’s shelf):**

1. Write `docs/connor/your-page.md` (markdown).
2. Register it in `docs/pages.json` under the section `"id": "connor"`.
3. `id` is the hash (`#connor-your-page`). Lowercase, hyphenated, prefix `connor-` so it does not clash.
4. Link from other pages with `[Title](#connor-your-page)`.
5. No Python render. Reload `/docs/#connor-your-page`.
6. Commit and push `origin/main`.

Do **not** put Connor’s notes in the repo root or in `board.html`.

Shared wiki pages (stack, alpine, board) are for everyone. Edit them when the fact is team-wide. Personal / in-progress write-ups go on the Connor shelf.

---

## Kanban

```powershell
python scripts/update_board.py list
python scripts/update_board.py done 27
python scripts/update_board.py move 07 doing
python scripts/update_board.py add --title "…" --person connor --hours 1 --column todo --brief "…"
```

That rewrites `board.html`, `todo.html`, `done.html`. People ids: `reeve`, `connor`, `michael`, `lewis`, `noah`.

Nav on `todo.html` / `done.html` is generated inside `scripts/update_board.py` (`render_archive_page`). If you add a nav item there, change the template and run `render`. Other HTML navs are hand-copied — update each file.

---

## Git

- Remote: `origin` → `Tyneside-Software/hackathon-site` (and the API repo the same way).
- Branch: `main` (hackathon; everyone pushes here).
- Before push: `git pull --rebase origin main` then `git push origin main`.
- If rebase conflicts in generated board regions, prefer `python scripts/update_board.py render` after fixing `cards.json`.
- Commit messages: short, imperative, like the rest of the log.

---

## Voice and quality

- British English.
- Connor is a teammate, not “Master” (that address is Michael’s Grok). Write docs in the team voice: clear, short, no fluff.
- Cite paths as repo-relative (`docs/connor/home.md`).
- After UI changes, the site must still load Home, Map, Board.

---

## Suggested first prompt Connor can paste

> Read `docs/GROK.md` in hackathon-site (or https://hackathon.tyneside.software/docs/#grok). Then: **\<task here\>**. Put new docs in `docs/connor/`, register them in `docs/pages.json`, commit and push `origin/main`.

---

## Related wiki pages

[Wiki home](#home) · [Architecture](#architecture) · [Connor’s area](#connor) · [Add a wiki page](#adding) · [Run locally](#local) · [Site stack](#stack) · [Alpine.js](#javascript) · [Kanban](#board) · [API](#api)
