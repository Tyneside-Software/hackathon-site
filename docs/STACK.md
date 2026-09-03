# Tech stack — hackathon-site

Static front end for Tyneside Logistics. No bundler, no Node toolchain. What you commit is what GitHub Pages serves.

Sibling API: [hackathon-api](https://github.com/Tyneside-Software/hackathon-api) (FastAPI on Cloud Run). Run them together with `.\start.ps1`.

## At a glance

| Layer | Choice | Why |
|-------|--------|-----|
| Pages | Static HTML | GitHub Pages, no build |
| CSS | `styles.css` (custom properties) | One Tyneside amber/navy skin |
| JavaScript | **Alpine.js 3** (CDN) | Behaviour in the markup; no npm |
| Map | Leaflet 1.9.4 + OSM tiles | Click/drag waypoints |
| Routing | Public OSRM, haversine fallback | Demo never looks dead |
| API client | `config.js` → `window.HACKATHON_API` | Local `:8080` or Cloud Run |
| Board data | `scripts/cards.json` + Python 3 stdlib | Edit cards without hand-HTML |
| Hosting | GitHub Pages + CNAME | `hackathon.tyneside.software` |
| Local serve | `python -m http.server 5500` | CORS-friendly; not `file://` |

## What we are not using

- No React, Vue, Svelte, or jQuery
- No webpack / Vite / npm scripts for the site (Alpine comes from a `<script defer>` tag)
- No CSS framework (no Tailwind, Bootstrap)
- `serve.ps1` is gone; use `start.ps1` or `python -m http.server 5500`

## HTML and CSS

- Pages are plain `.html` in the repo root (`index.html`, `board.html`, `todo.html`, `done.html`, `onboarding.html`, `lewis.html`) and `app/` for the map.
- Shared chrome: sticky nav, `logo.svg`, `styles.css`.
- Colour tokens live on `:root` in `styles.css` (`--accent`, `--panel`, `--bg`, …). Match those; do not invent a second palette.
- Layout should still work on a laptop and a phone. The map and kanban already wrap.

## JavaScript

**Alpine.js is the JavaScript layer.** New UI behaviour (filters, modals, toggles, forms) goes in Alpine directives, not a new vanilla IIFE.

Details, CDN snippet, and how to treat the existing `board.js` / `map.js`: [JAVASCRIPT.md](JAVASCRIPT.md).

Leaflet stays for the map canvas. Alpine can own the sidebar around it (stops list, buttons, status). Do not replace Leaflet with Alpine.

## Maps and routes

| Piece | Where | Notes |
|-------|--------|--------|
| Leaflet | unpkg `leaflet@1.9.4` (js + css, SRI) | `app/index.html` |
| Tiles | `tile.openstreetmap.org` | Attribution required |
| Driving geometry | `https://router.project-osrm.org/route/v1/driving/` | Public demo server; rate-limited |
| Fallback | Haversine + ~35 km/h | Straight line if OSRM fails |

Default view: Newcastle `[54.9783, -1.6178]`.

## Talking to hackathon-api

`config.js` sets `window.HACKATHON_API` (Cloud Run URL by default; override for local uvicorn).

Include it **before** any script that `fetch`es the API:

```html
<script src="config.js"></script>
```

The map does not call our API yet (it calls OSRM). Card 11 is persist-routes on the API; that fetch must use `window.HACKATHON_API` and fail visibly (or fall back to `localStorage`) so the page never goes blank.

CORS on the API must allow:

- `http://127.0.0.1:5500`
- `http://localhost:5500`
- `https://hackathon.tyneside.software`

## Board generator

| File | Role |
|------|------|
| `scripts/cards.json` | Source of truth for kanban cards |
| `scripts/update_board.py` | `list` / `done` / `move` / `add` / `render` |
| `board.html` | Live columns (to-do preview + done summary) — generated blocks |
| `todo.html` / `done.html` | Full archives — generated |

Do not hand-edit the `<!-- BOARD:… -->` regions. See [../scripts/README.md](../scripts/README.md).

Python 3 stdlib only (no pip). Run from the site root.

## Hosting and deploy

- **Live site:** https://hackathon.tyneside.software  
- **CNAME:** `hackathon.tyneside.software` in repo root (GitHub Pages custom domain)
- **Trigger:** push / merge to `main`
- **API:** Cloud Run, also from push to `main` on the API repo

Local remains the development path. Pages is the demo path.

## Runtime versions

| Tool | Expect |
|------|--------|
| Python | 3.12+ (http.server, board script, API venv) |
| PowerShell | 5.1+ (`start.ps1`) |
| Alpine.js | 3.x from jsDelivr CDN |
| Leaflet | 1.9.4 (pinned + integrity) |
| Browsers | Current Chromium / Firefox / Safari / Edge |
