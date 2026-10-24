# Linux box and deploy

The live API and the board the team edits run on one Linux PC, reached over Tailscale. GitHub Pages still publishes the static site. Cloud Run is not the live API.

The SSH password is not in this repository. On Michael’s PC it is in:

`C:\Users\MichaelThomson\Desktop\hackathon-linux.md`

That file is local only. Do not copy it into git, GitHub, Hermione, or `cc_repos`. Connor’s clone does not have it. Read it for the password, the askpass snippet, and `sudo`.

## Addresses

| Use | Address |
|-----|---------|
| SSH | `michael@192.168.0.52` (LAN). Windows OpenSSH. No key on Michael’s PC. |
| Do not SSH to | `100.65.94.5`. Tailscale SSH asks for a browser check. The password does not finish that login. |
| Site the team uses | http://100.65.94.5/ nginx port 80, files in `/var/www/hackathon-site` |
| Board | http://100.65.94.5/board.html |
| API | http://100.65.94.5:8080/health |
| Pages | https://hackathon.tyneside.software |

`config.js` sets `window.HACKATHON_API` to `http://100.65.94.5:8080`. Pages is HTTPS, so a browser there will not call that HTTP API. The public board then shows `board-snapshot.json` and will not save. Edits happen on the tailnet URL above.

Hostname `michael-System-Product-Name`. MagicDNS `michael-system-product-name.taild4eca3.ts.net`. This Windows PC is Tailscale node `cc-michael` (`100.73.27.4`). `tailscale.exe` is `C:\Program Files\Tailscale\tailscale.exe` and is not on PATH.

`192.168.0.52` answers only when the PC is on the same LAN as the box.

## Accounts

| User | What they can do |
|------|------------------|
| michael | SSH and sudo. Password required for root. Not in the `docker` group. |
| noah | sudo and docker. |
| reeve | sudo. Not in docker. |
| website | Owns `/home/website` (mode 750) and the API checkout. In docker. |

`/etc/sudoers.d/hackathon-update` lets michael, reeve, noah, and website run this one command with no password:

```
(website) NOPASSWD: /usr/local/bin/update
```

Anything else as root needs michael’s password via `sudo -S`. The desktop file has that password and a PowerShell pattern that does not leave an askpass script behind.

## Layout on the box

| Path | Role |
|------|------|
| `/home/website/hackathon-api` | API git checkout. Compose project name `hackathon`. |
| `/home/website/hackathon-api/data/hackathon.db` | Live SQLite. Mounted at `/data/hackathon.db`. |
| `/home/website/hackathon-api/.env` | Runtime env. Not in git. Do not copy it out into a repo. |
| `/var/www/hackathon-site` | nginx root. Its own git checkout. |
| `/usr/local/bin/update` | The deploy script. |

The image copies the app in at build. Only `./data` is a volume. `docker compose up` without `--build` keeps the old code. Recreate does not delete the database.

Store is SQLite. Firestore helpers in the API are switched off. `VERSION` is `hackathon-api/app/config.py`. After a deploy, `GET /health` must report that same string.

## Development loop

Clones are siblings under `C:\Users\MichaelThomson\source`: `hackathon-site`, `hackathon-api`, `hackathon-android`.

Git author for these pushes: `Michael Thomson <michael.thomson@cloudconnectsoftware.com>`.

1. Edit on the PC.
2. From the site folder, `.\start.ps1`. Site http://127.0.0.1:5500/ and API http://127.0.0.1:8080/health .
3. The board, on localhost only, tries `http://127.0.0.1:8080` and then `window.HACKATHON_API`. The map, account page, progress page, and Katie shop always use `config.js`, including during local work.
4. From `hackathon-api`: `python -m unittest tests.test_board`.
5. In each repo that changed: `git pull --rebase origin main`, commit, `git push origin main`.
6. `.\scripts\box.ps1 update` from this repo. That SSHes as `michael` and runs `/usr/local/bin/update`.
7. Open http://100.65.94.5:8080/health and http://100.65.94.5/board.html .

`origin` on the box is `Tyneside-Software`. A push that only reaches the `personal` remote (`michaelthomsoncc`) is invisible to `/usr/local/bin/update`.

Pushing site `main` also updates GitHub Pages. That is a second copy of the same static files. It does not restart the API.

## What `/usr/local/bin/update` does

Run it as michael. No sudo password. The script switches to `website` itself.

1. If the user is not `website`: `exec sudo -n -u website -H -- /usr/local/bin/update`.
2. `git pull --ff-only origin main` in `/home/website/hackathon-api`.
3. `docker compose up -d --build --force-recreate`.
4. `git pull --ff-only origin main` in `/var/www/hackathon-site` when that directory is a checkout.
5. Poll `http://127.0.0.1:8080/health`. Non-zero exit if it never answers.
6. `docker compose ps`.

`GIT_TERMINAL_PROMPT=0`. A failed pull is the `website` user’s git credentials or a non-fast-forward, not the SSH password.

## Board data

The running SQLite file is the board. The API never pushes it to git.

`python scripts/update_board.py pull` (site folder) reads `GET /v1/board/export` and overwrites `scripts/cards.json`, `board-snapshot.json`, and `hackathon-api/app/board_seed.json`. Do that only when those seeds should change, then commit them.

Do not delete `data/hackathon.db`. Do not `docker compose down -v`. Do not re-seed. Startup imports `app/board_seed.json` only when the database has never held cards. Wiping the file and leaving a `board_meta.seeded` row does not refill it. A brand-new file imports the git seed once, which is older than the live board.

## Commands an AI runs

From `hackathon-site`, with no password typed:

```powershell
.\scripts\box.ps1 health
.\scripts\box.ps1 update
.\scripts\box.ps1 ssh "hostname"
.\scripts\check.ps1
```

`box.ps1` reads `SSH_HOST`, `SSH_USER`, and `SSH_PASSWORD` from `C:\Users\MichaelThomson\Desktop\hackathon-linux.md`. The script is in git. The password is not.

`update` is the deploy. It pulls both repos on the box and rebuilds the API. Push `origin/main` first or the box stays on the old commit.

`health` checks the API, the site, and SSH.

`check.ps1` is the read-only proof after a deploy. It must print `CHECK-OK`. It compares `app/config.py` with live `/health`, counts the board, calls `/v1/buses`, and runs `tests.test_board`. It does not write a card. A queued list of changes follows [Development loop](#loop).

## Android, from this PC

AVD name: `Pixel_6a`. JDK 17: `C:\Program Files\Microsoft\jdk-17.0.20.101-hotspot`. SDK: `%LOCALAPPDATA%\Android\Sdk`.

The debug and release `API_BASE` is `http://100.65.94.5:8080`. The manifest allows cleartext because that host is an IP and has no TLS.

```powershell
$env:JAVA_HOME = "C:\Program Files\Microsoft\jdk-17.0.20.101-hotspot"
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$env:ANDROID_SDK_ROOT = $env:ANDROID_HOME
cd C:\Users\MichaelThomson\source\hackathon-android
.\gradlew.bat assembleDebug
& "$env:ANDROID_HOME\emulator\emulator.exe" -avd Pixel_6a -no-window -no-audio -no-boot-anim -gpu swiftshader_indirect
```

Keep that emulator process alive. A short-lived shell exits and takes the emulator with it. Wait until `adb devices` shows `emulator-5554`, then:

```powershell
$adb = "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe"
& $adb install -r app\build\outputs\apk\debug\app-debug.apk
& $adb shell pm grant software.tyneside.tracker android.permission.ACCESS_FINE_LOCATION
& $adb shell pm grant software.tyneside.tracker android.permission.ACCESS_COARSE_LOCATION
& $adb shell pm grant software.tyneside.tracker android.permission.POST_NOTIFICATIONS
& $adb shell am start -n software.tyneside.tracker/.MainActivity --ez start_tracking true
& $adb logcat -s TynesideTracker
```

A fresh boot has no cached fix. Logcat says `lastLocation null`. `adb emu geo fix` can print OK and still deliver nothing until the shell is allowed to inject a location. Granting mock location to `software.tyneside.tracker` is not enough: uid 2000 is rejected. This sequence produced a POST on 24 October 2026:

```powershell
& $adb -s emulator-5554 shell cmd location set-location-enabled true
& $adb -s emulator-5554 shell settings put secure location_mode 3
& $adb -s emulator-5554 shell appops set com.android.shell android:mock_location allow
& $adb -s emulator-5554 shell cmd location providers add-test-provider gps --requiresSatellite --supportsAltitude --supportsSpeed --supportsBearing
& $adb -s emulator-5554 shell cmd location providers set-test-provider-enabled gps true
& $adb -s emulator-5554 shell cmd location providers set-test-provider-location gps --location 37.4219983,-122.084 --accuracy 5
& $adb -s emulator-5554 emu geo fix -1.6178 54.9783
```

Wait until logcat shows `POST result HTTP 200` and `"stored":"sqlite"`. `GET /v1/devices` should list `android-c55e59830b71ba38`. That id has existed since 8 October 2026. A test updates `last_seen_at`. Do not delete that row. A fix within 0.002° of Google HQ (`37.4219983, -122.084`) is rewritten to Grey’s Monument (`54.9783, -1.6178`). On this run the first posted point was a metre off those constants (`54.9782983, -1.6177983`). A later ping landed on the constants.

Stop the tracker when the proof is done so it does not keep posting every minute:

```powershell
& $adb -s emulator-5554 shell am force-stop software.tyneside.tracker
& $adb -s emulator-5554 emu kill
```

## Database

The live board is SQLite on the box. Prove a write with the API, then remove the probe:

```powershell
curl.exe -fsS -X POST "$env:API/v1/board/cards" -H "Content-Type: application/json" -d "{\"title\":\"Workflow probe\",\"column\":\"todo\"}"
curl.exe -fsS -X DELETE "$env:API/v1/board/cards/THE_ID"
curl.exe -fsS "$env:API/v1/board"
```

`API` is `http://100.65.94.5:8080`. The write responses are the whole board. The DELETE body can still list the card, because that payload is built in the same database session as the delete. The following GET is the proof: the title is gone and the card count is back where it started. On 24 October 2026 that count was 50 (9 todo, 2 ready, 39 done) and 5 people. Parse the JSON in Python. A PowerShell `Where-Object` on `Invoke-RestMethod` once failed to see a card the server had stored, which left a second probe to delete.

`python -m unittest tests.test_board` from `hackathon-api`, using `.\.venv\Scripts\python.exe`, covers the same routes against an in-memory database and does not touch the box. The working directory must be the API repo. System Python on this PC has no SQLAlchemy.

Do not delete `data/hackathon.db`. Do not `docker compose down -v`. Do not re-seed.

## Cloud Run

The old host `https://hackathon-api-git-975511976696.europe-west2.run.app` is not what `config.js` calls, and it was not serving on 24 October 2026. Buildpacks files (`Procfile`, `project.toml`, root `main.py`, `.python-version` 3.13) remain for that trigger. The box uses the Dockerfile (`python:3.14-slim`) and `compose.yaml`.
