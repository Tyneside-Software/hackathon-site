# Tyneside Logistics — hackathon-site

Static front end for the Tyneside Logistics hackathon: dispatch → field work. Amber/navy chrome, a map with waypoints and live phones, and a kanban board.

**Live:** https://hackathon.tyneside.software  
**Been away?** [Current progress](https://hackathon.tyneside.software/progress.html)  
**Repo:** https://github.com/Tyneside-Software/hackathon-site  
**API:** https://github.com/Tyneside-Software/hackathon-api  
**Android:** https://github.com/Tyneside-Software/hackathon-android  

Push to `main` updates GitHub Pages. The board the team edits, and the API, update when `/usr/local/bin/update` runs on the Linux box. See [docs/linux.md](docs/linux.md). The SSH password is not in git. On Michael’s PC it is `C:\Users\MichaelThomson\Desktop\hackathon-linux.md`.

## Documentation

**Wiki:** [docs/](docs/) (Docs button in the nav). Linked pages, sidebar search, hash URLs.

| Doc | Contents |
|-----|----------|
| [docs/](docs/) | Wiki home |
| [docs/#architecture](docs/#architecture) | **How the three repos fit together** |
| [docs/#android](docs/#android) | Android tracker (emulator test, logcat) |
| [docs/#map](docs/#map) | Map layers: waypoints, phones, drawer, buses |
| [docs/#buses](docs/#buses) | Live buses via `GET /v1/buses` (Firestore cache, 30 miles) |
| [docs/#linux](docs/#linux) | **Linux box and deploy** — SSH, then `/usr/local/bin/update` |
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
| `/progress.html` | Catch-up snapshot if you have been away |
| `/app/` | Map, waypoints, route, live phones, optional buses |
| `/board.html` | Kanban — to do, next, in progress, ready to deploy, done |
| `/backlog.html` | Backlog |
| `/todo.html` | Full to-do list |
| `/done.html` | Done archive |
| `/api-test.html` | Alpine.js GET `/test_field` against Cloud Run |
| `/docs/` | Documentation wiki |
| `/onboarding.html` | Clone / run / git |

Filter the board with `?person=lewis`. Open a card with `#t-04`.

## JavaScript

**Use Alpine.js** for new behaviour. Pin 3.14.8 from jsDelivr, `defer`, and wrap islands in `x-data`. See [docs/JAVASCRIPT.md](docs/JAVASCRIPT.md).

`board.js` and `app/map.js` are vanilla leftovers. Keep them working; migrate by card, do not rewrite the night in one go. Leaflet stays for the map.

API base URL: `config.js` → `window.HACKATHON_API` (`http://100.65.94.5:8080`). Include that file on any page that `fetch`es the API. The board on localhost tries `http://127.0.0.1:8080` first. Other pages do not.

## Board cards

The board is stored in the API’s SQLite database. Drag a card on the page, or open it. `scripts/cards.json`, `board-snapshot.json`, and `hackathon-api/app/board_seed.json` are the copy that still has every card while that database is not deployed. The pages show that copy if `/v1/board` does not answer.

```powershell
python scripts/update_board.py pull
python scripts/update_board.py list
python scripts/update_board.py done 13 --by michael
python scripts/update_board.py move 07 doing --by connor
```

`pull` copies SQLite back into those three files. See [scripts/README.md](scripts/README.md).

## Deploy

1. `git pull --rebase origin main`, commit, `git push origin main` on this repo and, if the API changed, on `hackathon-api`. `origin` is `Tyneside-Software`.
2. From this folder run `.\scripts\box.ps1 update`. That SSHes to the box and runs `/usr/local/bin/update`.

That fast-forwards nginx at `/var/www/hackathon-site` and rebuilds the API container. GitHub Pages updates from the site push alone. Password and the askpass snippet: `C:\Users\MichaelThomson\Desktop\hackathon-linux.md`. Details: [docs/linux.md](docs/linux.md).

## Rule

Each board card is a releasable slice. Home, Map, and Board must still look working when the card lands — fallbacks, never a blank page.
