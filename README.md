# Tyneside Logistics — hackathon

Front end for tonight. **GitHub Pages** later; **local first**.

**Site:** https://github.com/Tyneside-Software/hackathon-site  
**API:** https://github.com/Tyneside-Software/hackathon-api  
**Board:** [board.html](board.html) (Reeve, Connor, Michael, Lewis)

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

Michael is away for the first two hours — **no Cloud Run until he is back**. Cards 10–11 are blocked on that.

## What is already demoable

| Page | Increment |
|------|-----------|
| `/` | Desktop chrome in Tyneside / logistics style |
| `/app/` | Map, waypoints, OSRM route (straight-line fallback) |
| `/board.html` | Kanban |

## Rule

Each board card is a releasable slice. The site must still look working when the card lands.
