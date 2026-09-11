# API stack and routes

Sibling repo: [Tyneside-Software/hackathon-api](https://github.com/Tyneside-Software/hackathon-api).

How it fits the site: [Architecture](#architecture). Map consumers: [The map](#map). Deploy notes in the API repo: [DEPLOY.md](https://github.com/Tyneside-Software/hackathon-api/blob/main/docs/DEPLOY.md).

**Live:** `https://hackathon-api-git-975511976696.europe-west2.run.app`  
The site stores that in `config.js` as `window.HACKATHON_API`.

Code `VERSION` is **0.1.6**. After a deploy, `GET /health` should match that (or later). If live `/test_field` is 404, the Cloud Run revision is behind `main`.

Layout: routes live in `app/routers/` (`health`, `auth`, `fields`, `locations`, `devices`). `app/main.py` builds the app and still has `uvicorn.run(app)` at the bottom for Cloud Run.

Accounts (Noah, `830036a`, card **41**): `POST /register`, `POST /login` (JSON), `POST /token` (OAuth2 password form for Swagger Authorize), `GET /users/me` (bearer). Users are a `User` model in Firestore (`User` documents), Datastore fallback, process cache. Passwords hashed with pwdlib; JWT via PyJWT. Set `JWT_SECRET_KEY` on Cloud Run or tokens die on a new revision. Site page: [account.html](../account.html).

GPS, fields, `/health`, and map reads stay **unauthenticated**.

## How Cloud Run builds this

The GitHub trigger uses **Google Cloud buildpacks** (`pack` on **ubuntu2404**), **not** the Dockerfile.

| File | Why it exists |
|------|----------------|
| `app/main.py` | Real FastAPI app (`app.main:app`) |
| `main.py` (repo root) | Re-exports `app` because pack defaults to `main:app` |
| `Procfile` | `web: uvicorn app.main:app --host 0.0.0.0 --port $PORT` |
| `.python-version` / `project.toml` | **Python 3.13** — ubuntu2404 has 3.13 and 3.14 only. **3.12 fails the build** |
| `Dockerfile` | For a Docker-based trigger only |

A Cloud Build log that says `gcr.io/k8s-skaffold/pack` is buildpacks. A log that says `invalid Python version specified: 3.12` means the pin is wrong for that OS.

`GOOGLE_ENTRYPOINT=app/main.py` on Cloud Run: keep `uvicorn.run(app)` at the bottom of `app/main.py`.

## Stack

| Layer | Choice |
|-------|--------|
| Language | Python **3.13** on Cloud Run (laptop may be 3.12 or 3.14) |
| Framework | FastAPI `>=0.115,<0.117` |
| Server | Uvicorn `[standard]` `>=0.34,<0.36` |
| Extra | `google-cloud-datastore` (fields + Device/LocationPing + User writes); `google-cloud-firestore` (history + User reads). Imported inside handlers, not at module top |
| Auth | Cloud Run still `--allow-unauthenticated`. App-level JWT on `/users/me` only. `pwdlib` + `PyJWT` |

`/health` and `/test_field` do not need Datastore or Firestore. Keep `/health` free of extra I/O.

## Routes

| Method | Path | Returns |
|--------|------|---------|
| GET | `/` | `service`, `docs`, `health`, `test_field`, `register`, `login`, `token`, `users_me`, `locations`, `devices`, `version` |
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
