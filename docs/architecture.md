# How this project is put together

Two GitHub repos, two hosts, one product. The **site** is static files. The **API** is a small FastAPI process. They only meet in the browser, when a page `fetch`es `window.HACKATHON_API`.

```
  Browser
     │
     ├─ HTML / CSS / JS  ← GitHub Pages  (hackathon.tyneside.software)
     │     index, progress, map, board, wiki, api-test
     │
     ├─ OSM tiles + public OSRM          (map only; not our API)
     │
     └─ fetch(HACKATHON_API + "/…")  ← Cloud Run  (hackathon-api-….run.app)
           /health  /test_field  /docs
```

Locally the same split: Pages is `python -m http.server 5500`, the API is `uvicorn` on `:8080`. `.\start.ps1` starts both.

## The two repos

Clone them as **siblings**. `start.ps1` finds the API as `../hackathon-api`.

| | **hackathon-site** | **hackathon-api** |
|--|--------------------|-------------------|
| Job | What people see | JSON the browser can call |
| Code | HTML, CSS, a little JS | Python FastAPI |
| Host | GitHub Pages | Cloud Run `europe-west2` |
| Deploy | Push `main` | Push `main` (Cloud Build **buildpacks**, not the Dockerfile) |
| Live | https://hackathon.tyneside.software | https://hackathon-api-git-975511976696.europe-west2.run.app |

## Site tree

```
hackathon-site/
  index.html          Home
  progress.html       Catch-up snapshot (been away?)
  app/                Map (Leaflet + map.js)
  board.html          Kanban (preview columns)
  board.js            Filter, card modal, scroll lock
  todo.html           All to-do cards (generated)
  done.html           All done cards (generated)
  api-test.html       Alpine.js GET /test_field
  docs/               This wiki
  onboarding.html     Clone / run / git (humans)
  lewis.html          Lewis’s log
  config.js           window.HACKATHON_API
  styles.css          Shared Tyneside skin
  logo.svg
  CNAME               hackathon.tyneside.software
  start.ps1           Site :5500 + API :8080
  scripts/
    cards.json        Kanban source of truth
    update_board.py   Rewrites board / todo / done
```

## API tree

```
hackathon-api/
  app/main.py         Routes, CORS, VERSION
  main.py             Re-export for buildpacks (`main:app`)
  requirements.txt    fastapi, uvicorn, google-cloud-datastore
  Dockerfile          Used only if the trigger builds with Docker
  Procfile            web: uvicorn app.main:app …
  project.toml        Python 3.13 + entrypoint for pack
  .python-version     3.13
```

## Which JavaScript does what

| File | Style | Used on |
|------|--------|---------|
| `config.js` | Plain | Any page that calls our API (include first) |
| `api-test.html` | **Alpine.js 3.14.8** | API test only |
| `docs/index.html` + `wiki.js` | **Alpine.js** + marked | Wiki |
| `board.js` | Vanilla | Board, todo, done |
| `app/map.js` | Vanilla + Leaflet | Map |

New UI behaviour goes in **Alpine.js**. Do not add React/Vue/npm. Leaflet stays for the map canvas. See [Alpine.js](#javascript).

## How a page talks to the API

1. `config.js` sets `window.HACKATHON_API` (Cloud Run URL in git).
2. The page includes `<script src="config.js"></script>` (from `app/` use `../config.js`).
3. `fetch(base + "/test_field")` with `Accept: application/json`.
4. CORS is enforced by the API (`CORS_ORIGINS`). Serve the site from `http://127.0.0.1:5500` or Pages, never `file://`.

The map does **not** call our API. It calls OSM and public OSRM. Card 11 is “persist routes on the API”.

## How the wiki works

- Markdown in `docs/` is the source.
- `docs/pages.json` is the sidebar.
- `docs/index.html` fetches the `.md` and renders it (Alpine + marked).
- Share a page as `/docs/#architecture`.
- Add a page: [Add a wiki page](#adding).

## How the kanban works

- Edit `scripts/cards.json` or run `python scripts/update_board.py`.
- Do not hand-edit `<!-- BOARD:… -->` in `board.html`.
- To-do on the board is the top four cards plus a link to `todo.html`. Done is a count plus `done.html`.
- Details: [Kanban board](#board).

## Deploy

| Event | What happens |
|-------|----------------|
| Push **site** `main` | GitHub Pages publishes this folder |
| Push **API** `main` | Cloud Build **pack/buildpacks** (ubuntu2404, Python **3.13**) builds and deploys Cloud Run |

The API Dockerfile exists for a Docker-based trigger. The GitHub-connected service **does not use it**; it uses buildpacks. That is why `main.py` at the repo root and `.python-version` = `3.13` exist. Pinning 3.12 failed: that builder has no 3.12. See [API](#api).

## Next

| Topic | Page |
|-------|------|
| Run it on your machine | [Run locally](#local) |
| Night clone/git loop | [Onboarding](../onboarding.html) |
| Site libraries | [Site stack](#stack) |
| Writing JS | [Alpine.js](#javascript) |
| API routes and CORS | [API](#api) |
| Point an AI at the repo | [For Grok](#grok) |
