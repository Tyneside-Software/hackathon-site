# Tyneside Logistics — hackathon

Front end for tonight. **GitHub Pages** on push to `main` (`hackathon.tyneside.software`); API likewise from `main`. Local still works.

**Site:** https://github.com/Tyneside-Software/hackathon-site  
**API:** https://github.com/Tyneside-Software/hackathon-api  
**Board:** [board.html](board.html) — Reeve, Connor, Michael, Lewis, Noah. Backlog: [todo.html](todo.html). Done: [done.html](done.html). Filter by person. Click a card for the brief. Share with `?person=lewis` or `#t-04`.

Move board cards with `python scripts/update_board.py` — see [scripts/README.md](scripts/README.md).

Clone from the **Tyneside-Software** org. First cards: Lewis and Reeve get front end **and** back end running; everyone proves **edit → run → push**.

## Run locally (card 21 — Reeve)

Clone **hackathon-site** and **hackathon-api** as sibling folders, then:

```powershell
cd C:\Users\MichaelThomson\source\hackathon-site
.\start.ps1
```

That opens two windows: site on http://127.0.0.1:5500/ and API on http://127.0.0.1:8080/health.

Site only (card 01):

```powershell
cd C:\Users\MichaelThomson\source\hackathon-site
.\serve.ps1
```

Open http://127.0.0.1:5500/ — home, map, board.

Do **not** open `index.html` as `file://` if you want the API; browsers block that.

## Optional local API (card 02)

```powershell
cd C:\Users\MichaelThomson\source\hackathon-api
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8080
```

http://127.0.0.1:8080/health

Push to `main` deploys the site and the API. Card 11 (persist routes on the API) still follows that.

## What is already demoable

| Page | Increment |
|------|-----------|
| `/` | Desktop chrome in Tyneside / logistics style |
| `/app/` | Map, waypoints, OSRM route (straight-line fallback) |
| `/board.html` | Kanban |

## Rule

Each board card is a releasable slice. The site must still look working when the card lands.
