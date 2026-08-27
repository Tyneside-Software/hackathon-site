# hackathon-site

GitHub Pages front end for tonight’s hackathon.

**Repo:** https://github.com/michaelthomsoncc/hackathon-site  
**API:** https://github.com/michaelthomsoncc/hackathon-api

## Local

Open `index.html` in a browser, or:

```powershell
python -m http.server 5500
```

Then set `window.HACKATHON_API` in `config.js` (local default is `http://127.0.0.1:8080`).

## GitHub Pages

Settings → Pages → **Deploy from a branch** → `main` / `/ (root)`.

After the first Pages build, the site is:

https://michaelthomsoncc.github.io/hackathon-site/

When the Cloud Run API is up, put that URL in `config.js` and allow this origin in the API `CORS_ORIGINS`.
