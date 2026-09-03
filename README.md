# Tyneside Logistics — hackathon-site

Static front end for the Tyneside Logistics hackathon: dispatch → field work. Amber/navy chrome, a map with waypoints, and a kanban board.

**Live:** https://hackathon.tyneside.software  
**Repo:** https://github.com/Tyneside-Software/hackathon-site  
**API:** https://github.com/Tyneside-Software/hackathon-api  

Push to `main` deploys this site (GitHub Pages) and the API (Cloud Run). Local still works.

## Documentation

**Wiki:** [docs/](docs/) (Docs button in the nav). Linked pages, sidebar search, hash URLs.

| Doc | Contents |
|-----|----------|
| [docs/](docs/) | Wiki home |
| [docs/#grok](docs/#grok) | **For Grok** — briefing Connor (or anyone) points an AI at |
| [docs/#connor](docs/#connor) | Connor’s wiki shelf |
| [docs/STACK.md](docs/STACK.md) | HTML/CSS, Alpine.js, Leaflet, OSRM, Pages, board script |
| [docs/JAVASCRIPT.md](docs/JAVASCRIPT.md) | **Alpine.js is the JS layer** — CDN, conventions, migration |
| [scripts/README.md](scripts/README.md) | How to move kanban cards (`update_board.py`) |
| [onboarding.html](onboarding.html) | Clone, run, git loop (for humans on the night) |

## Tech stack (short)

- **HTML + `styles.css`** — no CSS framework
- **Alpine.js 3** (jsDelivr CDN, `defer`) — all new UI behaviour
- **Leaflet 1.9.4** + OSM + public OSRM (straight-line fallback)
- **Python 3** — `http.server` for local, stdlib script for the board
- **GitHub Pages** + `CNAME` `hackathon.tyneside.software`

No npm, no bundler. What you push is what Pages serves.

## Run locally

Clone **hackathon-site** and **hackathon-api** as siblings, then:

```powershell
cd C:\Users\MichaelThomson\source\hackathon-site
.\start.ps1
```

That opens:

- Site http://127.0.0.1:5500/
- API  http://127.0.0.1:8080/health  
- Swagger http://127.0.0.1:8080/docs

Site only:

```powershell
python -m http.server 5500
```

Do **not** open HTML as `file://` — the browser will block the API.

`serve.ps1` was removed. `start.ps1` is the one-command path (creates the API venv if needed).

## Pages

| URL | What |
|-----|------|
| `/` | Desktop home |
| `/app/` | Map, waypoints, route |
| `/board.html` | Kanban (short to-do + done summary) |
| `/todo.html` | Full to-do list |
| `/done.html` | Done archive |
| `/api-test.html` | Alpine.js GET `/test_field` against Cloud Run |
| `/docs/` | Documentation wiki |
| `/onboarding.html` | Clone / run / git |

Filter the board with `?person=lewis`. Open a card with `#t-04`.

## JavaScript

**Use Alpine.js** for new behaviour. Pin 3.14.8 from jsDelivr, `defer`, and wrap islands in `x-data`. See [docs/JAVASCRIPT.md](docs/JAVASCRIPT.md).

`board.js` and `app/map.js` are vanilla leftovers. Keep them working; migrate by card, do not rewrite the night in one go. Leaflet stays for the map.

API base URL: `config.js` → `window.HACKATHON_API` (default `http://127.0.0.1:8080`). Include that file on any page that `fetch`es the API.

## Board cards

Source of truth is `scripts/cards.json`. Do not hand-edit the `<!-- BOARD:… -->` blocks.

```powershell
python scripts/update_board.py list
python scripts/update_board.py done 13
python scripts/update_board.py move 07 doing
python scripts/update_board.py add --title "A new slice" --person lewis --hours 2 --column todo --brief "What done looks like."
```

The board shows the top four to-do cards plus a link to `todo.html`. Done is a count plus `done.html`.

## Deploy

Merge to `main` on this repo → GitHub Pages at https://hackathon.tyneside.software  

The API repo deploys to Cloud Run on its own `main`. Point `config.js` at the Cloud Run URL for the live site; leave `127.0.0.1:8080` for local.

## Rule

Each board card is a releasable slice. Home, Map, and Board must still look working when the card lands — fallbacks, never a blank page.
