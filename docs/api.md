# API stack and routes

Sibling repo: [Tyneside-Software/hackathon-api](https://github.com/Tyneside-Software/hackathon-api).

How it fits the site: [Architecture](#architecture). Deploy notes in the API repo: [DEPLOY.md](https://github.com/Tyneside-Software/hackathon-api/blob/main/docs/DEPLOY.md).

**Live:** `https://hackathon-api-git-975511976696.europe-west2.run.app`  
The site stores that in `config.js` as `window.HACKATHON_API`.

## How Cloud Run builds this

The GitHub trigger uses **Google Cloud buildpacks** (`pack` on **ubuntu2404**), **not** the Dockerfile.

| File | Why it exists |
|------|----------------|
| `app/main.py` | Real FastAPI app (`app.main:app`) |
| `main.py` (repo root) | Re-exports `app` because pack defaults to `main:app` |
| `Procfile` | `web: uvicorn app.main:app --host 0.0.0.0 --port $PORT` |
| `.python-version` / `project.toml` | **Python 3.13** — ubuntu2404 has 3.13 and 3.14 only. **3.12 fails the build** |
| `Dockerfile` | For a Docker-based trigger only. Base image is `mirror.gcr.io/library/python:3.12-slim` |

A Cloud Build log that says `gcr.io/k8s-skaffold/pack` is buildpacks. A log that says `invalid Python version specified: 3.12` means the pin is wrong for that OS.

After a good deploy, `GET /health` should show `"version": "0.1.3"` or later.

## Stack

| Layer | Choice |
|-------|--------|
| Language | Python **3.13** on Cloud Run (laptop may be 3.12 or 3.14) |
| Framework | FastAPI `>=0.115,<0.117` |
| Server | Uvicorn `[standard]` `>=0.34,<0.36` |
| Extra | `google-cloud-datastore` (only `/create_field`; imported inside the handler) |
| Auth | None (`--allow-unauthenticated`) |

`/health` and `/test_field` do not need Datastore. Keep `/health` free of extra I/O.

## Routes

| Method | Path | Returns |
|--------|------|---------|
| GET | `/` | `service`, `docs`, `health`, `test_field`, `version` |
| GET | `/health` | `ok`, `service`, `utc`, `version` |
| GET | `/test_field` | `ok`, `key`, `value` |
| POST | `/create_field` | Datastore write (needs GCP credentials) |
| GET | `/docs` | Swagger UI |
| GET | `/openapi.json` | OpenAPI |

`VERSION` lives in `app/main.py`.

CORS methods: `GET`, `POST`, `OPTIONS`. Add `PUT`/`PATCH` in middleware when a card needs them.

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

UI: [Alpine API test](../api-test.html).

If live `/test_field` is 404, the Cloud Run revision is older than `main`. Check `/health` `version`. Local uvicorn on `:8080` has the current routes.

## Manual deploy

```powershell
gcloud run deploy hackathon-api `
  --source . `
  --region europe-west2 `
  --allow-unauthenticated `
  --set-env-vars "CORS_ORIGINS=https://hackathon.tyneside.software,http://127.0.0.1:5500,http://localhost:5500"
```

`--source .` uses the Dockerfile **if** that service is set to Docker. The GitHub-connected service uses pack instead.
