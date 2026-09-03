# Run locally

Clone **hackathon-site** and **hackathon-api** as sibling folders.

```powershell
cd C:\Users\MichaelThomson\source\hackathon-site
.\start.ps1
```

That opens two windows:

| What | URL |
|------|-----|
| Site | http://127.0.0.1:5500/ |
| API health | http://127.0.0.1:8080/health |
| API Swagger | http://127.0.0.1:8080/docs |
| This wiki | http://127.0.0.1:5500/docs/ |

Site only:

```powershell
python -m http.server 5500
```

Do **not** open HTML as `file://`. The browser will block the API (CORS) and this wiki cannot `fetch` its markdown.

`serve.ps1` was removed. `start.ps1` creates the API venv if needed.

## API only

```powershell
cd C:\Users\MichaelThomson\source\hackathon-api
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8080
```

## Config

`config.js` sets `window.HACKATHON_API`. The committed default is the Cloud Run URL. To hit local uvicorn instead, in the browser console:

```js
window.HACKATHON_API = "http://127.0.0.1:8080"
```

or edit `config.js` on your machine and do not push that change unless the team agrees.

## Night walkthrough

The longer clone / PATH / git loop is on [onboarding](../onboarding.html).
