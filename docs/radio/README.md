# Radio

This is the manual for the four sessions that build the taxi game. A session that has just started has no other context. Read this file, then the three sections of `docs/radio/integrator.md` named below. The checkout path is the role.

Sessions talk through GitHub `main`. There is no `master` branch. There is no shared folder on the PC. `lanes\desk` is retired.

| File | Who may change it |
|------|-------------------|
| `docs/radio/integrator.md` | The integrator session only |
| `docs/radio/po.md` | The product owner only |
| `docs/radio/grok-dev-1.md` | grok-dev-1 only |
| `docs/radio/grok-dev-2.md` | grok-dev-2 only |

Read all four before a slice and again after a merge. Write only your own file.

## The four sessions

| Checkout | Role | Deploys |
|----------|------|---------|
| `C:\Users\MichaelThomson\source\hackathon-site` and the sibling `hackathon-api` and `hackathon-android` | Integrator. Michael talks to this session. | Yes |
| `C:\Users\MichaelThomson\source\lanes\po` | Product owner | No |
| `C:\Users\MichaelThomson\source\lanes\grok-dev-1` | Dev | No |
| `C:\Users\MichaelThomson\source\lanes\grok-dev-2` | Dev | No |

Each lane folder holds the three repos as siblings, plus `LANE.txt` (`DEPLOY=no`) and `PROMPT.md`. Do not edit the integrator copies from a lane. Do not edit a lane copy from the integrator session.

The human pastes `continue` into each session. That word is the whole order. Do not ask what it means.

## First actions

1. Confirm the checkout path. That is the role. Read `LANE.txt` if it sits beside the three repos.
2. In every repo you will touch: `git fetch origin`, then `git pull --rebase origin main` on `main`, or `.\scripts\lane-sync.ps1` from `hackathon-site` on a `lane/*` branch.
3. Read this file.
4. In `docs/radio/integrator.md`, read only `## Now`, `## A running game stays up`, and `## The route is the gap`. Every other heading in that file is history. Do not follow it.
5. Read `docs/radio/po.md` and the two dev radio files.
6. Do the work for the role, for about 30 minutes. Do not stop after one slice.

When two docs disagree, the code on `origin/main` wins over a SHA named in an old paragraph. `## Now` wins over `po.md` when `po.md` names a finished slice, a clear of one field, or a control the API cannot do yet. A lane radio that still names a finished issue is stale. Skip that issue.

## What each role does

**Integrator.** Write orders in `## Now`. Do not write the slice text unless Michael asks for an intervention. Do not edit `po.md`, `grok-dev-1.md`, `grok-dev-2.md`, `play.html`, `play.js`, or the API while a lane owns that work. Deploy with `.\scripts\deploy-if-product.ps1` after product code is on `origin/main`. A radio-only commit is not a deploy.

**Product owner.** Number the work `## Now` names. Set each dev `Next` to that work. Keep at least 16 unfinished slices in front of each dev, and at least 24 in the reservoir. Those slices are behaviours someone can watch, or the seam that makes the next slice smaller. A clear of one field on one event is not one of them. Park that kind of line. Do not edit product code. Commit only `docs/radio/po.md`, on a `lane/po/<slug>` branch, squash-merge it, and keep going. Do not deploy.

**grok-dev-1.** Build the unfinished API line `## Now` names. One slice is one pull request. Four radio lines come after that merge, not as a pull request before the code. Then the next slice in the same turn.

**grok-dev-2.** Build the unfinished page line `## Now` names, the same way. The page shows what the feed already carries. Do not invent people, firms, places, or positions in `play.js`.

A dev does not invent a slice. A dev does not write `queue empty` while `## Now` names work. The words `the heading is not clear` do not mean stop. Do not write `morning order not at the front`.

## Who edits which files

| Files | Owner |
|-------|--------|
| `hackathon-api` `app/empire.py`, `app/routers/empire.py`, `app/models.py`, `tests/test_empire.py` | grok-dev-1 |
| `hackathon-api` `app/database.py` when a column is added | grok-dev-1, in the same change as the model |
| `play.html`, `play.js` | grok-dev-2 |
| `config.js` | Leave it. Do not point GitHub Pages at `http://100.65.94.5:8080`. Do not remove the `config.js` script tag. |
| `docs/TAXI.md` | Nobody, unless Michael says so |
| `docs/radio/integrator.md` | Integrator |
| `docs/radio/po.md` | Product owner |
| One dev radio file | That dev |

Do not give both devs the same file. Issues live on `Tyneside-Software/hackathon-site` only, even when the edit is in the API. One issue, one branch, one pull request.

## A turn

A turn is about 30 minutes. One slice is too short. A turn is product on `main` that a refresh can show, or the seam that makes the next slice smaller. The seam is a seeded draw, one function for a rule, and the feed carrying the choice the page shows. Tests live beside the engine. There is no second app and no dev-only page.

A radio note is at most four lines after the product merge: the issue, the commit, what it did, and the next issue. A second pull request that only notes the slice is not the turn. A clear of one field is not the turn. A turn with more radio commits than product commits has not produced enough software.

Do not batch two slices into one pull request. Do not open a second pull request about the same slice.

## How a slice lands

1. Branch `lane/<owner>/<slug>` from a fresh `origin/main`, in each repo the slice touches.
2. From `hackathon-site`, `.\scripts\lane-sync.ps1` before the edit and again before the push. On `main` it fast-forwards. On a `lane/*` branch it rebases.
3. Commit. Author on this PC: `Michael Thomson <michael.thomson@cloudconnectsoftware.com>`.
4. `git push --force-with-lease` is allowed on that lane branch only. Never force-push `main`. Never force-push someone else's branch.
5. Open the pull request into `main` on the repo whose files changed. Link `Tyneside-Software/hackathon-site#ISSUE`. Do not use the words Closes, Fixes, or Resolves.
6. Squash-merge when the slice passes its check: `gh pr merge NUMBER --repo Tyneside-Software/REPO --squash --delete-branch`.
7. On a fresh branch from the new `origin/main`, edit only your radio file. Four lines. Squash-merge that note straight away.
8. Pull `main`. Read the other radio files. Start the next slice.

`origin` is the Tyneside-Software org. A push to a personal remote does not reach the box.

The `ready` label is not how this game is assigned. `## Now` and `po.md` are the assignment. Do not add `ready`. Do not wait for it.

## The game, standing rules

The live work is the empire game on `play.html`. The products in `docs/TAXI.md` are the tracker, the booking office, and that game. Do not invent a fourth product. Office slices, desk slices, fare cards, and map titles M1 to M32 are Waiting. Issues `#699` through `#786` stay paused.

- Centre Grey's Monument `54.9783, -1.6178`. Radius 50 miles (`CIRCLE_RADIUS_KM` 80.467). Opening depot Shiremoor `55.0367, -1.5075`. The opening depot stays Shiremoor until the numbered depot slice.
- One real second is one game second. Money is integer pence. `800000` is the price of a car. It is not a fare and it is not a depot. A depot does not add a car. The opening ten stay. Do not show `2860`, `1130`, or `1240`.
- One North Tyneside tariff. Do not invent a second fare table or a second map centre.
- OSRM duration is the journey. If OSRM does not answer, the car moves straight at 30 mph and the page says `OSRM unavailable`. Do not call the network for each draw.
- One Start when there is no saved account: `POST /register`, then `POST /login`. The token is `hackathon-empire-token`. The password is at least 8 characters.
- The tick that already advances the account is the engine. There is no second runtime and no new framework. On a tick it draws the next people, the journeys, and where an idle taxi goes. The draw takes a seed, so a test can replay it. The live tick still varies. One rule lives in one function. Weights are where people live inside the circle, the `Europe/London` hour, and the journeys people here make. A commute, a night out, a hospital run, an airport run, a trip to the coast, and a short hop are examples the draw can produce. They are not separate functions and they are not new place lists.
- One taxi claims one person and collects that person, starting from where that taxi already is. Every other taxi leaves that person alone. Several people wait at once, across the circle, thicker where people live. A new person does not add a car.
- A taxi with nobody claimed draws a strategic waiting spot and goes there. The depot is where a taxi clocks off for a break when few people are waiting beside the free taxis. When the people outnumber the free taxis, an idle taxi is likely to stay out. A busy spell can still send one car home. A quiet spell can still leave one car out. The break is a few minutes. The feed job is `on break`. Status stays `at_depot` during that hold. The even-numbered night hold until 01:00 is not the rule.
- A leg starts where the car already is. Do not force a collecting leg or an empty leg back onto the Shiremoor point. A car already on a leg keeps that leg.
- A depot's advantage is distance. The same draw prefers the nearer depot's free car. A later depot, including a competitor's depot, wins the ground around itself. Competitors use this engine and their own draws. There is no second AI and no list of towns per depot.
- The feed carries the choice the page shows. The page draws every person on the feed. Do not offset markers to hide a shared destination.
- Account rows stay in SQLite. Do not wipe the database. Do not `docker compose down -v`. Do not migrate `device_links`.

## Tests

From `hackathon-api`, with that repo as the working directory:

```powershell
.\.venv\Scripts\python.exe -m unittest tests.test_empire
```

System Python on this PC has no SQLAlchemy. Use the venv. A board change also runs `tests.test_board`. A game change runs `tests.test_empire` before the pull request. Do not wipe a database to make a test easier.

`play.html` has no npm build. The proof is the feed: the page shows the people, routes, and job strings the API sends.

## Deploy

Only the integrator deploys, from `C:\Users\MichaelThomson\source\hackathon-site`:

```powershell
.\scripts\deploy-if-product.ps1
```

That script compares `play.html`, `play.js`, and `config.js`, and the API `app/` tree, with the last deploy recorded in `C:\Users\MichaelThomson\source\hackathon-deploy-loop.json`. That file is not in git. If nothing product-shaped changed, it prints `DEPLOY-SKIP`. If it prints `DEPLOY-FAIL`, do not run it a second time until the failure is understood.

The box command is `/usr/local/bin/update`, via `scripts\box.ps1`. It pulls `origin/main` as `website`. It recreates the API container only when the pull changed `app/`, `main.py`, `requirements.txt`, `Dockerfile`, or `docker-entrypoint.sh`. Otherwise it prints `api image unchanged; container left running`. A recreate lasts a few seconds and resumes from the stored leg. Do not run two updates at once.

Do not invoke `box.ps1` with PowerShell's call operator from the current shell. The script ends in `exit`, which would exit that shell. `deploy-if-product.ps1` starts a child PowerShell.

SSH to `192.168.0.52` as `michael`. Do not SSH to `100.65.94.5`. The password stays in `C:\Users\MichaelThomson\Desktop\hackathon-linux.md`. Do not print it, do not commit it, and do not copy that file or `C:\Users\MichaelThomson\Desktop\confidential docs` into a repo. After a product deploy, `.\scripts\check.ps1` must print `CHECK-OK`.

An open browser keeps the JavaScript it already loaded. A refresh loads the new `play.js`.

## Do not

- Touch September 2026 issues 1, 2, 3, 4, or 18.
- Touch API pull request `reeve-branch`.
- Move issues 22 or 29 off `blocked`.
- Edit another session's radio file.
- Commit `build-err.txt`, `*.db`, `.env`, or the Desktop SSH sheet.
- Hand git, SSH, or deploy commands back to the human. Do them, or say what failed.
- Restart the agent dashboard on port 5510 unless Michael asks.
