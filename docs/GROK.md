# For Grok — read this first

This page is the briefing for an AI (Grok, or anything similar) helping **Connor** on the Tyneside Logistics hackathon. Connor works the same way Michael does: he asks Grok, Grok reads the repo, Grok does the work.

If you have been pointed at this URL and given a task, **read this whole page, then [Architecture](#architecture), then execute**. Do not ask the human to paste stack notes that are already here.

A queued list of changes is one job. On the integrator checkout, follow [Development loop](#loop), including `.\scripts\box.ps1 update` and `.\scripts\check.ps1`. If several sessions are working at once, follow [Lanes](#lanes). A checkout with `LANE.txt` beside it does not push `main` and does not deploy.

Been away, or the board looks noisy: the human catch-up page is [Current progress](../progress.html).

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

## Live box — read this before a deploy

The API and the board the team edits run on the Linux box. Cloud Run is not the live API. The procedure is [Linux box and deploy](#linux) (`docs/linux.md`).

SSH as `michael` to `192.168.0.52`. Do not SSH to `100.65.94.5` (Tailscale SSH wants a browser check). After `git push origin main`, from the site folder run `.\scripts\box.ps1 update`. That is `/usr/local/bin/update` on the box. `.\scripts\box.ps1 health` checks the API, the site, and SSH.

The SSH password is not in git. On Michael’s PC it is in `C:\Users\MichaelThomson\Desktop\hackathon-linux.md`. Do not copy that file into a repo. Connor’s machine does not have it.

---

## What you are allowed to do

1. **Execute** — edit files, run commands, commit, **push `origin/main`** unless Connor says not to.
2. Prefer doing the work over telling Connor which commands to run.
3. Keep the site looking working (fallbacks, never a blank page).
4. Put Connor’s documentation under `docs/connor/` and register it in `docs/pages.json` (section `connor`).
5. New product JS is **Alpine.js 3**, not a new framework.

## What you must not do

- Do not hand-edit card HTML. The board is SQLite (`GET /v1/board`). `python scripts/update_board.py pull` copies it back into the git seed.
- Do not invent a second docs tree (no `wiki/`, no Notion export, no `Connor-docs/`).
- Do not add npm, React, Vue, Svelte, Tailwind, or a bundler.
- Do not open or rely on `file://` — the wiki `fetch`es markdown.
- Do not rewrite `board.js` / `app/map.js` in one go. New map behaviour is a module inside the existing IIFE (phones, buses).
- Do not impersonate Michael, Reeve, Lewis, or Noah in git author unless that is actually the machine user.
- Do not copy `C:\Users\MichaelThomson\Desktop\confidential docs` (that is Michael’s private folder, not this repo).
- Do not copy `C:\Users\MichaelThomson\Desktop\hackathon-linux.md` into git. That file holds the SSH password.
- Do not delete the live SQLite file, `docker compose down -v`, or re-seed the board. `/usr/local/bin/update` rebuilds the image and keeps `data/hackathon.db`.
- Do not push `main` or deploy from a lane checkout (`LANE.txt` next to the three repos). Open a pull request. See [Lanes](#lanes).

---

## Repos and layout

Three **sibling** folders:

```
…/hackathon-site       ← this wiki, static Pages site
…/hackathon-api        ← FastAPI, Docker on the Linux box
…/hackathon-android    ← Kotlin tracker APK
```

| | Site | API | Android |
|--|------|-----|---------|
| GitHub | https://github.com/Tyneside-Software/hackathon-site | https://github.com/Tyneside-Software/hackathon-api | https://github.com/Tyneside-Software/hackathon-android |
| Live | http://100.65.94.5/ and Pages | http://100.65.94.5:8080/health | debug APK |
| Local | http://127.0.0.1:5500/ | http://127.0.0.1:8080/health | Android Studio |

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
| New chrome JS | **Alpine.js 3.14.8** from jsDelivr, `defer`, `x-data` (wiki, API test) |
| Map | Leaflet 1.9.4 + OSM + public OSRM. **Vanilla `app/map.js` IIFE** — append, do not rewrite. Phones, drawer, buses live here |
| API base | `config.js` → `window.HACKATHON_API` (`http://100.65.94.5:8080`) |
| Board | SQLite `GET /v1/board`. Git seed: `scripts/cards.json`, `board-snapshot.json`, `hackathon-api/app/board_seed.json` |

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

FastAPI + Uvicorn in Docker Compose on the Linux box. Image `python:3.14-slim`, one worker, SQLite. `VERSION` is `hackathon-api/app/config.py`. After deploy, `/health` must show that same string. From the site folder an AI runs `.\scripts\box.ps1 update` (password stays in the Desktop sheet). See [Linux box and deploy](#linux). Buildpacks files are still in the API repo for the old Cloud Run trigger. That host is not what the site calls.

| Method | Path |
|--------|------|
| GET | `/` |
| GET | `/health` |
| GET | `/test_field` → `{ ok, key, value }` |
| GET | `/docs` Swagger |
| POST | `/create_field` (SQLite) |
| GET | `/view_field/{key}` |
| POST | `/register` · `/login` · `/token` (Noah, card 41) |
| GET | `/users/me` (bearer) |
| POST | `/v1/locations` (phone GPS, SQLite) |
| GET | `/v1/devices` (map poll) |
| GET | `/v1/locations?device_id=` (ping history, SQLite) |
| GET | `/v1/board` (kanban, SQLite) |
| GET | `/v1/buses` (SQLite cache, 15s; bustimes.org when the cache is stale) |

CORS always keeps `https://hackathon.tyneside.software`, localhost port 5500, and `http://100.65.94.5`, and adds whatever `CORS_ORIGINS` lists. See [API](#api) and [Linux box and deploy](#linux).

Live health is http://100.65.94.5:8080/health . Its `version` must match `app/config.py`.

Android tracker: [Android](#android). Map surface: [The map](#map). Live buses: [Buses](#buses). Emulator posts every minute; last-seen is last communication. Cards 32–34, 36–41, 43–48 are done. Account page: `/account.html`. Buses: `/v1/buses` (card 45) with a 10-minute fading trail (46) snapped to streets via OSRM (48). Noah: phone show/hide (47).

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

The pages are `board.html`, `backlog.html`, `todo.html`, and `done.html` (`board-app.js`). On localhost they use `http://127.0.0.1:8080`. If `/v1/board` is missing they stay read-only and show `board-snapshot.json`.

```powershell
python scripts/update_board.py list
python scripts/update_board.py pull
python scripts/update_board.py done 27 --by connor
python scripts/update_board.py move 07 doing --by connor
python scripts/update_board.py add --title "…" --person connor --hours 1 --column backlog --brief "…"
```

People ids: `reeve`, `connor`, `michael`, `lewis`, `noah`. The board does not ask who you are, and it does not keep a card history. `--by` on the script is accepted and ignored. Nav is copied by hand in each HTML file — update each file. Do not run a generator over `board.html`.

---

## Git

- Remote: `origin` → `Tyneside-Software/hackathon-site` (and the API repo the same way).
- Branch: `main` (hackathon; everyone pushes here).
- Before push: `git pull --rebase origin main` then `git push origin main`.
- If the board seed conflicts, keep the SQLite export: start the API and run `python scripts/update_board.py pull`.
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

[Wiki home](#home) · [Architecture](#architecture) · [The map](#map) · [Buses](#buses) · [Android](#android) · [Connor’s area](#connor) · [Add a wiki page](#adding) · [Run locally](#local) · [Site stack](#stack) · [Alpine.js](#javascript) · [Kanban](#board) · [API](#api)
