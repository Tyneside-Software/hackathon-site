# How this project is put together

Three GitHub repos, two hosts, one product. The **site** is static files. The **API** is a small FastAPI process. The **phone** is a one-switch Android app. Site and phone only meet the API over HTTP.

```
  Browser
     │
     ├─ HTML / CSS / JS  ← GitHub Pages  (hackathon.tyneside.software)
     │     index, progress, map, board, wiki, api-test
     │
     ├─ OSM tiles + public OSRM          (map waypoints; not our API)
     │     optional: bustimes.org /vehicles.json (live buses, off by default)
     │
     └─ fetch(HACKATHON_API + "/…")  ← Cloud Run  (hackathon-api-….run.app)
           /health  /test_field  /v1/devices  /v1/locations  /docs

  Phone (Tyneside Tracker APK)
     └─ POST /v1/locations  ← same Cloud Run
```

Locally the site is `python -m http.server 5500`, the API is `uvicorn` on `:8080`. `.\start.ps1` starts both. The phone is Android Studio / a debug APK.

**11 September 2026:** live phones work end to end (cards 32–34). The emulator POSTs every minute; last-seen is last communication; Newcastle is on the map. Noah shipped the device drawer and ping-history path (36–38). `GET /v1/locations?device_id=` reads Firestore, Datastore fallback. Live buses are a map toggle (39, 43, **44**): viewport only, dots at city zoom, chips when you zoom in. A physical phone is still card 35.

## The three repos

Clone them as **siblings**. `start.ps1` finds the API as `../hackathon-api`. The Android repo sits beside them as `hackathon-android`.

| | **hackathon-site** | **hackathon-api** | **hackathon-android** |
|--|--------------------|-------------------|-----------------------|
| Job | What people see | JSON the browser and phone can call | GPS toggle on a phone |
| Code | HTML, CSS, a little JS | Python FastAPI | Kotlin |
| Host | GitHub Pages | Cloud Run `europe-west2` | Sideloaded APK |
| Deploy | Push `main` | Push `main` (Cloud Build **buildpacks**, not the Dockerfile) | Android Studio / `gradlew assembleDebug` |
| Live | https://hackathon.tyneside.software | https://hackathon-api-git-975511976696.europe-west2.run.app | `app/build/outputs/apk/debug/app-debug.apk` |

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
  app/main.py         FastAPI app, CORS, includes routers (Noah split, 57a1d44)
  app/routers/        health, fields, locations, devices
  app/config.py       VERSION, CORS origins
  app/db.py           Datastore / Firestore helpers
  app/dependencies.py OAuth2 stub (card 41 — not wired yet)
  main.py             Re-export for buildpacks (`main:app`)
  requirements.txt    fastapi, uvicorn, google-cloud-datastore, google-cloud-firestore
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

New **chrome** (wiki, API test) goes in **Alpine.js**. New **map** behaviour stays vanilla in `app/map.js`. Do not add React/Vue/npm. Leaflet stays for the map canvas. See [Alpine.js](#javascript) · [The map](#map).

## How a page talks to the API

1. `config.js` sets `window.HACKATHON_API` (Cloud Run URL in git).
2. The page includes `<script src="config.js"></script>` (from `app/` use `../config.js`).
3. `fetch(base + "/test_field")` with `Accept: application/json`.
4. CORS is enforced by the API (`CORS_ORIGINS`). Serve the site from `http://127.0.0.1:5500` or Pages, never `file://`.

## How the map is put together

Full page: [The map](#map).

| Layer | Calls | Default |
|-------|--------|---------|
| Waypoints / OSRM | Public OSRM, not our API | On |
| Phones | `GET /v1/devices` every 8s; drawer `GET /v1/locations?device_id=` | On |
| Buses | bustimes.org `/vehicles.json` every 15s | **Off** — no fetch until Show buses |

Device id on the phone is `Settings.Secure.ANDROID_ID` (not the hardware serial — Android 10+ will not give that to a sideloaded app). The tracker POSTs every minute while the switch is on, even if the pin has not moved. `recorded_at` is last communication.

New map JS stays vanilla inside the existing `app/map.js` IIFE. Alpine is for wiki and `api-test.html`. Card 11 is still “persist routes on the API”.

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

Live phones, drawer, ping history, and live buses (dots then chips) are on the map. Next product slices: job list, demo seed, localStorage. Board: [Current progress](../progress.html). [The map](#map) · [Buses](#buses).

| Topic | Page |
|-------|------|
| Run it on your machine | [Run locally](#local) |
| Night clone/git loop | [Onboarding](../onboarding.html) |
| Site libraries | [Site stack](#stack) |
| Writing JS | [Alpine.js](#javascript) |
| API routes and CORS | [API](#api) |
| Point an AI at the repo | [For Grok](#grok) |
