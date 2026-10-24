# API stack and routes

Sibling repo: [Tyneside-Software/hackathon-api](https://github.com/Tyneside-Software/hackathon-api).

How it fits the site: [Architecture](#architecture). Map consumers: [The map](#map). Deploy: [Linux box and deploy](#linux) and, in the API repo, [DEPLOY.md](https://github.com/Tyneside-Software/hackathon-api/blob/main/docs/DEPLOY.md).

**Live:** `http://100.65.94.5:8080`  
`config.js` sets `window.HACKATHON_API` to that. The SSH password is not in git. On Michael’s PC: `C:\Users\MichaelThomson\Desktop\hackathon-linux.md`.

Code `VERSION` is `app/config.py`. `GET /health` on the box must match it after `.\scripts\box.ps1 update`. The old Cloud Run URL is not this API.

Layout: routes live in `app/routers/` (`health`, `auth`, `fields`, `locations`, `devices`, `buses`, `board`, Katie). `app/main.py` builds the app. The box runs it from the Dockerfile. The `__main__` uvicorn block is there for the old buildpacks entrypoint.

Accounts (Noah, card **41**): `POST /register`, `POST /login` (JSON), `POST /token` (OAuth2 password form for Swagger Authorize), `GET /users/me` (bearer). Users are SQLite. Passwords hashed with pwdlib; JWT via PyJWT. Set `JWT_SECRET_KEY` in the box `.env` or tokens die when the container restarts. Site page: [account.html](../account.html).

GPS, fields, `/health`, and map reads stay **unauthenticated**.

## How the box runs this

`/usr/local/bin/update` builds the Dockerfile and recreates the container. See [Linux box and deploy](#linux).

The old Cloud Run trigger used **buildpacks** (`pack` on **ubuntu2404**), not the Dockerfile. Those files are still in the API repo:

| File | Why it exists |
|------|----------------|
| `app/main.py` | Real FastAPI app (`app.main:app`) |
| `main.py` (repo root) | Re-exports `app` because pack defaults to `main:app` |
| `Procfile` | `web: uvicorn app.main:app --host 0.0.0.0 --port $PORT` |
| `.python-version` / `project.toml` | **Python 3.13** — ubuntu2404 has 3.13 and 3.14 only. **3.12 fails the build** |
| `Dockerfile` | What the Linux box builds. `python:3.14-slim`. |

A Cloud Build log that says `gcr.io/k8s-skaffold/pack` is buildpacks. A log that says `invalid Python version specified: 3.12` means the pin is wrong for that OS.

`GOOGLE_ENTRYPOINT=app/main.py` on Cloud Run: keep `uvicorn.run(app)` at the bottom of `app/main.py`.

## Stack

| Layer | Choice |
|-------|--------|
| Language | Python **3.13** on Cloud Run (laptop may be 3.12 or 3.14) |
| Framework | FastAPI `>=0.115,<0.117` |
| Server | Uvicorn `[standard]` `>=0.34,<0.36` |
| Extra | `google-cloud-datastore` (fields + Device/LocationPing + User + BusCache writes); `google-cloud-firestore` (history + User + BusCache reads). Imported inside handlers, not at module top |
| Auth | Cloud Run still `--allow-unauthenticated`. App-level JWT on `/users/me` only. `pwdlib` + `PyJWT` |

`/health` and `/test_field` do not need Datastore or Firestore. Keep `/health` free of extra I/O.

## Routes

| Method | Path | Returns |
|--------|------|---------|
| GET | `/` | `service`, `docs`, `health`, `test_field`, `register`, `login`, `token`, `users_me`, `locations`, `devices`, `buses`, `version` |
| GET | `/health` | `ok`, `service`, `utc`, `version` |
| GET | `/test_field` | `ok`, `key`, `value` |
| POST | `/register` | Create a user (JSON). 201 + public user |
| POST | `/login` | JSON username/password → `{ access_token, token_type }` |
| POST | `/token` | OAuth2 form (Swagger Authorize) → same token |
| GET | `/users/me` | Bearer required. Public user |
| POST | `/create_field` | Datastore write (needs GCP credentials) |
| GET | `/view_field/{key}` | Datastore read |
| POST | `/v1/locations` | Phone GPS ping → Device last-known + LocationPing history |
| GET | `/v1/devices` | All last-known phones (map poll) |
| GET | `/v1/devices/{id}` | One phone |
| GET | `/v1/locations?device_id=` | Ping history. JSON includes `source`: `firestore`, `datastore`, or `none` |
| GET | `/v1/buses` | Live buses + `trails` (10 min of `[lng,lat,unix]` per id). Firestore `BusCache/newcastle`, TTL 15s. Fetches bustimes.org only when a looking tab finds the snapshot stale. Unauthenticated. |
| GET | `/docs` | Swagger UI |
| GET | `/openapi.json` | OpenAPI |

`VERSION` lives in `app/config.py`.

**Proven 11 September 2026:** emulator `POST /v1/locations` → HTTP 200 `stored=datastore`; `GET /v1/devices` returned that device. History GET is what the map drawer uses (card 38).

CORS methods: `GET`, `POST`, `DELETE`, `OPTIONS`. Add `PUT`/`PATCH` in middleware when a card needs them.

## CORS

Environment variable `CORS_ORIGINS` — comma-separated, no trailing slashes.

If **unset**, code defaults to localhost plus `https://hackathon.tyneside.software`. If **set on Cloud Run**, that list **replaces** the defaults. Production must include:

```
https://hackathon.tyneside.software
http://127.0.0.1:5500
http://localhost:5500
```

## From the site

```html
<script src="config.js"></script>
```

```js
const base = (window.HACKATHON_API || "").replace(/\/$/, "");
const res = await fetch(base + "/test_field", { headers: { Accept: "application/json" } });
```

UI: [Alpine API test](../api-test.html). Phones and history: [The map](#map).

## Manual deploy

```powershell
gcloud run deploy hackathon-api `
  --source . `
  --region europe-west2 `
  --allow-unauthenticated `
  --set-env-vars "CORS_ORIGINS=https://hackathon.tyneside.software,http://127.0.0.1:5500,http://localhost:5500"
```

`--source .` uses the Dockerfile **if** that service is set to Docker. The GitHub-connected service uses pack instead.

## Board

`GET /v1/board` reads the kanban from SQLite. Moves, edits, and new cards are on that same route (`POST /v1/board/cards`, `PATCH /v1/board/cards/{id}`, `POST /v1/board/cards/{id}/move`, `POST /v1/board/reorder`). `reason` may be sent and is ignored. `owners` is the list of people on a card. `hours` may be null. `value` is 1 to 5. `by` may be sent and is ignored. The board does not record a history.

`app/board_seed.json` is imported only when the board tables have never held cards. `GET /v1/board/export` is the copy to commit back. The site pages use the snapshot in git when this route is not deployed yet. See the site wiki [Kanban board](#board).
