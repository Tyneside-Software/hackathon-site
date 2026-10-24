# Development loop

This is the page an AI follows when someone queues several changes and expects them to land without being asked to run a command.

Read [For Grok](#grok) and [Linux box and deploy](#linux) as well. This page is the order of work for the integrator checkout.

## If this checkout is a lane

If `LANE.txt` sits beside these three repos, you are a dev lane or the product owner. Follow [Lanes](#lanes). Do not push `main`. Do not run `.\scripts\box.ps1`. The steps below are for the integrator folders `C:\Users\MichaelThomson\source\hackathon-site`, `hackathon-api`, and `hackathon-android`. That session is the one that deploys.

## What a queue is

A queue is the whole message: a numbered list, a set of sentences, or several repos in one go. It is one job.

- Do every item before reporting back.
- Do not stop after the first item to ask whether to continue.
- Do not ask the human to commit, push, SSH, build, or start the emulator.
- Ship once, at the end. One `.\scripts\box.ps1 update` covers the site and the API. The box pulls `origin/main` only.

Connor’s PC does not have the Desktop password file. On Michael’s PC the file is `C:\Users\MichaelThomson\Desktop\hackathon-linux.md`. Never copy it into a repo, a commit, or a chat log.

## Order

1. Read the wiki pages the items touch. The live store is SQLite on the Linux box. `config.js` is `http://100.65.94.5:8080`.
2. Edit the sibling repos under the workspace. Usual paths on Michael’s PC: `C:\Users\MichaelThomson\source\hackathon-site`, `hackathon-api`, `hackathon-android`.
3. If a change would make a wiki page lie, edit that page in the same queue. Register a new page in `docs/pages.json`.
4. Prove locally, before any push:
   - API behaviour: from `hackathon-api`, `.\.venv\Scripts\python.exe -m unittest tests.test_board`. The working directory must be the API repo. System Python on this PC has no SQLAlchemy.
   - Android code: JDK 17 at `C:\Program Files\Microsoft\jdk-17.0.20.101-hotspot`, then `.\gradlew.bat assembleDebug` from `hackathon-android`.
5. Commit each repo that this queue changed. Leave unrelated dirt alone. Do not commit `build-err.txt`, `*.db`, `.env`, or the Desktop sheet. Author `Michael Thomson <michael.thomson@cloudconnectsoftware.com>`.
6. In each repo: `git pull --rebase origin main`, then `git push origin main`. `origin` is the Tyneside-Software org. Do not force-push. Do not push the `personal` remote and expect the box to see it.
7. From `hackathon-site`: `.\scripts\box.ps1 update`. That SSHs to `192.168.0.52` as `michael` and runs `/usr/local/bin/update`. Do not SSH to `100.65.94.5`.
8. From `hackathon-site`: `.\scripts\check.ps1`. It must print `CHECK-OK`.
9. Run the extra proofs in the table below when the queue touched that area. Then report the SHAs, the health version, and the proof for each item.

`update` rebuilds the API image and fast-forwards the site. It keeps `data/hackathon.db`. A pull on the box without that script leaves the old image running.

## Proofs

| The queue touched | Proof, after `update` |
|-------------------|------------------------|
| Any repo | `.\scripts\check.ps1` prints `CHECK-OK`. Live `/health` matches `hackathon-api/app/config.py`. |
| Site pages | `GET http://100.65.94.5/` and the changed path return 200. The wiki page is `http://100.65.94.5/docs/<file>.md`. |
| API behaviour | The unit tests already passed. Exercise the changed route with `curl.exe` against `http://100.65.94.5:8080`. |
| Board writes | Create one card titled `Workflow probe`, then delete it. Trust a following `GET /v1/board`, not the DELETE body. The count must match the count from before the probe. See [Linux box and deploy](#linux). |
| Android or location posting | Emulator steps in [Linux box and deploy](#linux). `POST /v1/locations` returns `stored=sqlite`. Force-stop the app and `adb emu kill` when the log line is in. Do not delete device `android-c55e59830b71ba38`. |

`check.ps1` is read-only. It does not deploy, does not write a card, and does not start the emulator. It fails if the live version disagrees with `app/config.py`, if the unit tests fail, if `/v1/buses` is down, or if a `Workflow probe` card is still on the board.

## Do not

- Delete `data/hackathon.db`, run `docker compose down -v`, or re-seed. Startup imports `board_seed.json` only into a database that has never held cards.
- Put the SSH password, `/home/website/hackathon-api/.env`, or `C:\Users\MichaelThomson\Desktop\confidential docs` into a repo.
- Edit card HTML by hand. The board is `GET /v1/board`.
- Treat Cloud Run or Firestore as the live path. Those hosts are not serving. Phones, the board, and the bus cache are SQLite.
- Leave the emulator tracking. It posts every minute.
- Expect GitHub Pages (`https://hackathon.tyneside.software`) to call the API. The page is HTTPS and the API is HTTP. The board people edit is `http://100.65.94.5/board.html`.

## When something fails

| What failed | What to do |
|-------------|------------|
| `check.ps1` version mismatch | The box is still on the old image. Push `origin/main`, then `.\scripts\box.ps1 update` once. |
| `update` pull is not a fast-forward | Fix `main` on GitHub. Do not reset the box checkout by hand. |
| SSH to `100.65.94.5` waits on a browser | Stop. Use `.\scripts\box.ps1`, which connects to `192.168.0.52`. That works when this PC is on the same LAN. |
| Unit tests fail | Fix and re-run before pushing. |
| Emulator has no fix | Use the shell mock-location commands in [Linux box and deploy](#linux). `adb emu geo fix` alone can return OK and still deliver nothing. |
| A `Workflow probe` card remains | `DELETE /v1/board/cards/<id>`, then `GET /v1/board`. `check.ps1` fails while that title is present. |
