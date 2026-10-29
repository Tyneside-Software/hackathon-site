# Deploy

This is the short page. Read it, then ship. The long notes are [Linux box and deploy](#linux) and [Development loop](#loop).

The live site and the live API are one Linux PC. GitHub is where the box pulls from. The Android app is not deployed by the box.

## Where things run

| What | Where |
|------|--------|
| Site the team uses | http://100.65.94.5/ — nginx, files in `/var/www/hackathon-site` |
| API | http://100.65.94.5:8080 — Docker Compose, project `hackathon` |
| Health | http://100.65.94.5:8080/health — `version` must match `hackathon-api/app/config.py` |
| Pages | https://hackathon.tyneside.software — a second copy of the static site. A push of site `main` publishes it |
| Phone | Debug APK. `assembleDebug`, then sideload. The box does not install it |

`config.js` chooses the API. On the box and on localhost it is `http://100.65.94.5:8080`. On `hackathon.tyneside.software`, `tyneside.software`, and `github.io` it is the HTTPS URL in that file, a Cloudflare tunnel in front of the same API. If that host stops answering, change the URL in `config.js`. The board people edit is http://100.65.94.5/board.html.

SSH is `michael@192.168.0.52`. Do not SSH to `100.65.94.5`. Tailscale SSH stops on a browser check. The password is not in git. On Michael’s PC it is `C:\Users\MichaelThomson\Desktop\hackathon-linux.md`. Do not copy that file into a repo or a chat log.

## Who may deploy

Deploy from the integrator checkouts:

```
C:\Users\MichaelThomson\source\hackathon-site
C:\Users\MichaelThomson\source\hackathon-api
C:\Users\MichaelThomson\source\hackathon-android
```

A folder with `LANE.txt` beside the three repos is a lane. A lane opens a pull request and stops. It does not run `box.ps1` or `deploy-if-product.ps1`.

`origin` must be `Tyneside-Software`. The box pulls that remote. A push to the personal `michaelthomsoncc` remote does not deploy.

## Order

1. Edit the sibling repos. If a change would make a wiki page lie, edit that page and register a new page in `docs/pages.json`.
2. Prove the API before any push. From `hackathon-api`:

```powershell
.\.venv\Scripts\python.exe -m unittest tests.test_board
```

System Python on Michael’s PC has no SQLAlchemy. The working directory must be the API repo.

3. Commit each repo this change touched. Leave unrelated dirt alone. Do not commit `build-err.txt`, `*.db`, `.env`, or the Desktop sheet. Author `Michael Thomson <michael.thomson@cloudconnectsoftware.com>`.
4. In each repo: `git pull --rebase origin main`, then `git push origin main`. Do not force-push `main`.
5. From `hackathon-site`, in its own PowerShell process:

```powershell
pwsh -NoProfile -File .\scripts\deploy-if-product.ps1
```

Do not invoke `.\scripts\box.ps1` with the call operator from the current shell. That script ends in `exit` and would close the shell.

6. `.\scripts\check.ps1` must print `CHECK-OK`.
7. Open the live URL you changed. For this API, `GET /health` must show the `version` in `app/config.py`.

## What the box runs

`deploy-if-product.ps1` reads `C:\Users\MichaelThomson\source\hackathon-deploy-loop.json` and compares it with `origin/main`. It runs the box update when the commits since the last product deploy changed `play.html`, `play.js`, `config.js`, or anything under the API `app/` tree. A radio-only or docs-only push prints `DEPLOY-SKIP` and leaves the box as it is. GitHub Pages still updates on the site push.

The box command is `/usr/local/bin/update`. `scripts\box.ps1` SSHes to `192.168.0.52` as `michael` and runs it. Passwordless sudo is that one command, as the `website` user. The script then:

1. `git pull --ff-only origin main` in `/home/website/hackathon-api`.
2. Rebuilds only when that pull changed `app/`, `main.py`, `requirements.txt`, `Dockerfile`, or `docker-entrypoint.sh`: `docker compose up -d --build --force-recreate`. Anything else prints `api image unchanged; container left running`.
3. `git pull --ff-only origin main` in `/var/www/hackathon-site`.
4. Polls `http://127.0.0.1:8080/health`.

The image is `python:3.14-slim`. The process is one uvicorn worker. SQLite is `/home/website/hackathon-api/data/hackathon.db`, mounted at `/data/hackathon.db`. A recreate keeps that file. The Python code is copied into the image at build, so a pull without a rebuild leaves the old process running.

`check.ps1` is read-only. It compares `app/config.py` with live `/health`, counts the board, calls `/v1/buses`, and runs `tests.test_board`. It fails if a card titled `Workflow probe` is still on the board.

## Do not

- Delete `data/hackathon.db`, run `docker compose down -v`, or re-seed. Startup imports `app/board_seed.json` only into a database that has never held cards.
- Run two updates at once.
- Put the SSH password or `/home/website/hackathon-api/.env` into a repo.
- Treat Cloud Run as the live API. `Procfile` and `project.toml` belong to that old path. The box uses the Dockerfile and `compose.yaml`.
