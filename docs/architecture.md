# How this project is put together

Three GitHub repos, two hosts, one product. The **site** is static files. The **API** is a small FastAPI process. The **phone** is a one-switch Android app. Site and phone only meet the API over HTTP.

```
  Browser on the tailnet
     │
     ├─ HTML / CSS / JS  ← nginx on the Linux box  (http://100.65.94.5/)
     │     index, progress, map, board, wiki, api-test, account
     │
     ├─ OSM tiles + public OSRM          (map waypoints; not our API)
     │
     └─ fetch(HACKATHON_API + "/…")  ← Docker on the same box, port 8080
           /health  /v1/board  /register  /login  /users/me
           /v1/devices  /v1/locations  /v1/buses  /docs
           SQLite. Buses: cache 15s, then bustimes.org.

  GitHub Pages (https://hackathon.tyneside.software)
     └─ same static files. The page is HTTPS and the API is HTTP,
        so the browser will not call the box. The board falls back
        to board-snapshot.json.

  Phone (debug APK)
     └─ API_BASE is http://100.65.94.5:8080. Cleartext is on.
        Emulator steps: Linux box and deploy.
```

Locally the site is `python -m http.server 5500`, the API is `uvicorn` on `:8080`. `.\start.ps1` starts both. The phone is Android Studio / a debug APK.

**Current:** the live API is SQLite in Docker on the Linux box. From `hackathon-site` on Michael’s PC an AI runs `.\scripts\box.ps1 update`. That SSHs to `192.168.0.52` as `michael` and runs `/usr/local/bin/update`. The password is not in git. On Michael’s PC it is `C:\Users\MichaelThomson\Desktop\hackathon-linux.md`. Read [Linux box and deploy](#linux) before connecting.

**24 October 2026:** the debug APK posted to `http://100.65.94.5:8080` and `/health` reported the version in `app/config.py` (`0.1.26` that day). A board card was created and deleted. The board stayed at 50 cards. A physical phone is still card 35.

**11 September 2026:** phones and the map were proved against the API of that week (cards 32–34, 36–38, 41). Buses are a map toggle (`GET /v1/buses`) with a 10-minute trail. The store since the move onto the box is SQLite.

## The three repos

Clone them as **siblings**. `start.ps1` finds the API as `../hackathon-api`. The Android repo sits beside them as `hackathon-android`.

| | **hackathon-site** | **hackathon-api** | **hackathon-android** |
|--|--------------------|-------------------|-----------------------|
| Job | What people see | JSON the browser and phone can call | GPS toggle on a phone |
| Code | HTML, CSS, a little JS | Python FastAPI | Kotlin |
| Host | nginx on the Linux box, and GitHub Pages | Docker Compose on the Linux box | Sideloaded APK |
| Deploy | Push `main`, then `/usr/local/bin/update` (Pages updates on the push) | Push `main`, then the same update script | Android Studio / `gradlew assembleDebug` |
| Live | http://100.65.94.5/ and https://hackathon.tyneside.software | http://100.65.94.5:8080 | `app/build/outputs/apk/debug/app-debug.apk` |

## Site tree

```
hackathon-site/
  index.html          Home
  progress.html       Catch-up snapshot (been away?)
  app/                Map (Leaflet + map.js)
  board.html          Kanban (to do, next, in progress, ready to deploy, done)
  backlog.html        Backlog
  todo.html           All to-do cards
  done.html           All done cards
  board-app.js        Drag and edit
  board-snapshot.json Read-only copy when the API has no board
  api-test.html       Alpine.js GET /test_field
  account.html        Register / login / Fetch me (Noah, 41)
  docs/               This wiki
  onboarding.html     Clone / run / git (humans)
  lewis.html          Lewis’s log
  config.js           window.HACKATHON_API
  styles.css          Shared Tyneside skin
  logo.svg
  CNAME               hackathon.tyneside.software
  start.ps1           Site :5500 + API :8080
  scripts/
    cards.json        Git copy of the SQLite board
    update_board.py   list / move / pull (does not rewrite the pages)
```

## API tree

```
hackathon-api/
  app/main.py         FastAPI app, CORS, includes routers (Noah split, 57a1d44)
  app/routers/        health, auth, fields, locations, devices, buses, board, Katie
  app/config.py       VERSION, CORS, JWT, bus TTL + 10 min trails
  app/db.py           SQLite access for devices, pings, users, bus cache
  app/models.py       User get/create/authenticate
  app/security.py     pwdlib + JWT
  app/dependencies.py get_current_active_user (wired to /users/me)
  main.py             Re-export for the old buildpacks entry (`main:app`)
  requirements.txt    fastapi, uvicorn, sqlalchemy, pyjwt, pwdlib
  Dockerfile          What the Linux box builds (python:3.14-slim)
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

1. `config.js` sets `window.HACKATHON_API` to `http://100.65.94.5:8080`.
2. The page includes `<script src="config.js"></script>` (from `app/` use `../config.js`).
3. `fetch(base + "/test_field")` with `Accept: application/json`.
4. CORS is enforced by the API (`CORS_ORIGINS`). Serve the site from `http://127.0.0.1:5500` or Pages, never `file://`.

## How the map is put together

Full page: [The map](#map).

| Layer | Calls | Default |
|-------|--------|---------|
| Waypoints / OSRM | Public OSRM, not our API | On |
| Phones | `GET /v1/devices` every 8s; drawer `GET /v1/locations?device_id=` | On |
| Buses | Our `GET /v1/buses` every 15s | **Off** — no fetch until Show buses. API caches in SQLite, TTL 15s |

Device id on the phone is `Settings.Secure.ANDROID_ID` (not the hardware serial — Android 10+ will not give that to a sideloaded app). The tracker POSTs every minute while the switch is on, even if the pin has not moved. `recorded_at` is last communication.

New map JS stays vanilla inside the existing `app/map.js` IIFE. Alpine is for wiki and `api-test.html`. Card 11 is still “persist routes on the API”.

## How the wiki works

- Markdown in `docs/` is the source.
- `docs/pages.json` is the sidebar.
- `docs/index.html` fetches the `.md` and renders it (Alpine + marked).
- Share a page as `/docs/#architecture`.
- Add a page: [Add a wiki page](#adding).

## How the kanban works

- The API stores the cards in SQLite (`GET /v1/board`).
- `app/board_seed.json` fills an empty database once. It does not replace cards that are already there.
- `board-snapshot.json` is what the pages show when that route is missing, so the current cards stay on GitHub Pages.
- `python scripts/update_board.py pull` copies SQLite back into those files.
- Details: [Kanban board](#board).

## Deploy

| Event | What happens |
|-------|----------------|
| Push **site** `main` | GitHub Pages publishes this folder. The box copies it when `.\scripts\box.ps1 update` runs |
| Push **API** `main` | Nothing on the box changes until that same update rebuilds the image |

`update` is `git pull --ff-only`. Docker recreate runs only when the API checkout moved. A site-only pull leaves the container up. The image is `python:3.14-slim`. Recreate keeps `data/hackathon.db`. The old Cloud Run path used buildpacks and Python 3.13, and those files are still in the API repo. That host is not the live API. See [Linux box and deploy](#linux).

## Next

Live phones, drawer, ping history, live buses from a SQLite cache, and accounts are on the map and the Account page. Next product slices: job list, demo seed, localStorage. Board: [Current progress](../progress.html). [The map](#map) · [Buses](#buses) · [API](#api).

| Topic | Page |
|-------|------|
| Run it on your machine | [Run locally](#local) |
| Night clone/git loop | [Onboarding](../onboarding.html) |
| Site libraries | [Site stack](#stack) |
| Writing JS | [Alpine.js](#javascript) |
| API routes and CORS | [API](#api) |
| Point an AI at the repo | [For Grok](#grok) |
