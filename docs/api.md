# API stack and routes

Sibling repo: [Tyneside-Software/hackathon-api](https://github.com/Tyneside-Software/hackathon-api). Python **FastAPI** on **Cloud Run** (`europe-west2`).

**Live:** `https://hackathon-api-git-975511976696.europe-west2.run.app`  
Set in the site as `window.HACKATHON_API` (`config.js`).

Longer notes in the API repo: [STACK.md](https://github.com/Tyneside-Software/hackathon-api/blob/main/docs/STACK.md) · [DEPLOY.md](https://github.com/Tyneside-Software/hackathon-api/blob/main/docs/DEPLOY.md).

## Stack

| Layer | Choice |
|-------|--------|
| Language | Python 3.12 |
| Framework | FastAPI `>=0.115,<0.117` |
| Server | Uvicorn |
| Container | `python:3.12-slim` + repo `Dockerfile` |
| Auth | None (`--allow-unauthenticated`) |

No database required for `/health` or `/test_field`.

## Routes

| Method | Path | Returns |
|--------|------|---------|
| GET | `/` | service, docs, health, test_field, version |
| GET | `/health` | `ok`, service, utc, version |
| GET | `/test_field` | `ok`, `key`, `value` (Alpine test) |
| POST | `/create_field` | Datastore experiment (optional extra dep) |
| GET | `/docs` | Swagger UI |
| GET | `/openapi.json` | OpenAPI schema |

`VERSION` is in `app/main.py` (see `/health`).

## CORS

`CORS_ORIGINS` — comma-separated, no trailing slashes. Must include:

```
https://hackathon.tyneside.software
http://127.0.0.1:5500
http://localhost:5500
```

If the env var is set on Cloud Run, code defaults are ignored — keep the live origin in that env.

## From the site

```html
<script src="config.js"></script>
```

```js
const base = (window.HACKATHON_API || "").replace(/\/$/, "");
const res = await fetch(base + "/test_field", { headers: { Accept: "application/json" } });
```

Working UI: [Alpine API test](../api-test.html).

If Cloud Run is behind `main`, `/test_field` 404s until that service is redeployed. Local uvicorn on `:8080` already has the route.

## Deploy

Push to API `main` if a Cloud Build trigger exists; otherwise:

```powershell
gcloud run deploy hackathon-api `
  --source . `
  --region europe-west2 `
  --allow-unauthenticated `
  --set-env-vars "CORS_ORIGINS=https://hackathon.tyneside.software,http://127.0.0.1:5500,http://localhost:5500"
```
