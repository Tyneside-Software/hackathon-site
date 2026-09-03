# Site stack

Libraries and files on **hackathon-site**. For how the two repos fit together, start at [Architecture](#architecture).

Static files only. No bundler, no `package.json`. What you commit is what GitHub Pages serves.

## At a glance

| Layer | Choice | Notes |
|-------|--------|--------|
| Pages | Static HTML | Root `*.html` plus `app/` and `docs/` |
| CSS | `styles.css` | Custom properties; Tyneside amber/navy |
| New JS | **Alpine.js 3.14.8** (jsDelivr, `defer`) | [Alpine.js](#javascript) |
| Map | Leaflet 1.9.4 + OSM | `app/index.html`, `app/map.js` |
| Driving geometry | Public OSRM | Straight-line haversine if OSRM fails |
| Our API | `config.js` → `window.HACKATHON_API` | Cloud Run URL in git |
| Kanban | `scripts/cards.json` + Python 3 | [Kanban board](#board) |
| Wiki | Alpine + marked.js | This folder |
| Host | GitHub Pages + `CNAME` | https://hackathon.tyneside.software |
| Local | `python -m http.server 5500` | Or `.\start.ps1` with the API |

## Not in this project

- React, Vue, Svelte, jQuery
- npm / webpack / Vite / Tailwind / Bootstrap
- `serve.ps1` (removed — use `start.ps1` or `http.server`)

## HTML and CSS

Shared chrome: sticky nav, `logo.svg`, `styles.css`. Tokens on `:root` (`--accent`, `--panel`, `--bg`, `--text`, `--muted`). Match those; do not invent a second palette.

Pages that exist today are listed on [Pages](#pages). New **product** UI goes in the repo root or `app/`. New **documentation** goes in `docs/`.

Layout should still work on a laptop and a phone.

## JavaScript

**Alpine.js is the JavaScript layer** for new behaviour. Vanilla leftovers: `board.js`, `app/map.js`. Leaflet stays for the map canvas.

Details: [Alpine.js](#javascript).

## Map

| Piece | Where |
|-------|--------|
| Leaflet 1.9.4 (js + css, SRI) | unpkg, from `app/index.html` |
| Tiles | `tile.openstreetmap.org` (attribution required) |
| Route | `https://router.project-osrm.org/route/v1/driving/` |
| Fallback | Haversine, ~35 km/h estimate |

Default centre: Newcastle `[54.9783, -1.6178]`. The map does not call hackathon-api.

## Our API from the browser

`config.js` (no `defer`) must load **before** any script that `fetch`es:

```html
<script src="config.js"></script>
```

From `app/` use `../config.js`. From `docs/` use `../config.js` if a wiki page ever calls the API (today they do not).

Committed default is the Cloud Run URL. Override locally with `window.HACKATHON_API = "http://127.0.0.1:8080"` in the console, or a local edit you do not push.

CORS must allow the page origin: `http://127.0.0.1:5500`, `http://localhost:5500`, `https://hackathon.tyneside.software`. That is configured on the API, not here.

## Kanban generator

| File | Role |
|------|------|
| `scripts/cards.json` | Source of truth |
| `scripts/update_board.py` | `list` / `done` / `move` / `add` / `render` |
| `board.html` | Live columns — only inside `<!-- BOARD:… -->` |
| `todo.html` / `done.html` | Archives, generated whole-file |

Python 3 stdlib. Run from the site root. See [Kanban board](#board).

## Hosting

Push **site** `main` → GitHub Pages.  
Push **API** `main` → Cloud Run (buildpacks). That path is documented on [API](#api).

## Versions we actually use

| Tool | Version |
|------|---------|
| Alpine.js | 3.14.8 (pinned CDN) |
| Leaflet | 1.9.4 (pinned + integrity) |
| marked.js (wiki) | 11.1.1 |
| Python (board script, `http.server`) | 3.12+ on the laptop is fine |
| Python (Cloud Run buildpacks) | **3.13** (ubuntu2404 has no 3.12) |
| FastAPI | `>=0.115,<0.117` |
| PowerShell | 5.1+ (`start.ps1`) |
