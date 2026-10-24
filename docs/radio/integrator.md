# Integrator

Written on `main` for the other sessions to pull. The integrator updates this file by merging a branch. Lanes do not edit it.

## How to read this

Each session does the slices under its own heading, in order. When a slice is already on `origin/main`, skip it and say so in your radio file. Merge each finished slice before starting the next. Re-read this file from `origin/main` between slices, because it may have moved.

The product brief is `docs/TAXI.md`. Do not invent a second fare table or a second map centre. Do not edit `docs/TAXI.md` unless a slice here names that file.

## Product owner

No product code. Open the issue, or comment if that title already exists. Do not add `ready`. After each issue, merge a radio note.

1. Issue titled `Office desk screen for quotes and bookings`, label `repo:site`. `office.html` quotes the November 2024 tariff, shows the £11.30 booking and the £12.40 night booking, and does not call the API. grok-dev-1 builds it.
2. Issue titled `Company day of three bookings`, label `repo:site`. Completed bookings of 1130, 1240, and 490 pence sum to 2860. A cancel adds nothing. That ledger is not the game.
3. Issue titled `Circle geometry for the fifty-mile map`, label `repo:site`. Centre `54.9783, -1.6178`, radius 80.467 km. Depot, Hexham, Durham, and Sunderland inside. Berwick-upon-Tweed outside. Proof is `GEO-OK`.
4. Issue titled `Game day and week ledger checkers`, label `repo:site`. `DAY-OK` is the −1120 pence day. `WEEK-OK` is seven of those days, −7840 pence. A new car is −800000 pence and has no `device_id`.
5. Comment on issue 23 with the 80467 metre circle and the `Shiremoor depot` marker. Comment on issue 24: the sample car is not a device, uses OSRM when it answers, and does not reprice the −1120 pence day. Do not add `ready`.
6. Comment on issues 22 and 29. They stay `blocked`. The new work must not migrate `device_links` or change `POST /v1/locations`.
7. Issue titled `Watcher and owner stories for a device`, labels `repo:site`, `repo:api`, `blocked`. Three stories only: two parents watch one child phone; one account watches a phone and a car; removing one watcher does not delete pings. Do not add `ready`.

## grok-dev-1

Checkout `C:\Users\MichaelThomson\source\lanes\grok-dev-1\hackathon-site`. Branch `lane/grok-dev-1/fares`, pull request 26, until that pull request is merged. Then branch the next slice from the new `main`.

You own the fare maths and the office desk. You may edit `scripts/taxi_fare.py`, `scripts/taxi_fare_check.py`, `app/taxi-fare.js`, `office.html`, `app/office.js`, `app/office.css`, `docs/taxi-fares.md`, and `docs/taxi-office.md`. In `index.html` add only the Office link. Do not edit `app/map.js`, `game.html`, or `app/taxi-game.js`.

The fare module and the checker are already on the branch. Do not rewrite the locked results: 490, 1040, 615, 1240, the 1130 extras quote, and the 1240 night booking. `py -3 scripts\taxi_fare_check.py` must print `FARE-OK` before each merge.

1. Commit the office desk if it is still uncommitted: `office.html`, `app/office.js`, `app/office.css`, and the Office link. The form calls `TaxiFare.quotePence`. Sample rows are £11.30 and £12.40. A mixed button shows 265 pence, not 290. No API call. No game costs on the company ledger. Merge that slice.
2. Company day on the desk and in the checker: 1130 + 1240 + 490 = 2860 pence. A cancelled booking adds 0. Merge.
3. Describe that screen in `docs/taxi-office.md`. Merge.
4. Cancelling the 490 pence booking instead of completing it sums the day to 2370 pence. Show both totals. Merge.
5. An empty hiring, no miles and no waiting, quotes 0 and adds nothing. Soiling with no meter is 12500 pence. Add both to the checker. Merge.

## grok-dev-2

Checkout `C:\Users\MichaelThomson\source\lanes\grok-dev-2\hackathon-site`. Branch `lane/grok-dev-2/model`, pull request 25, until that pull request is merged. Then branch the next slice from the new `main`.

You own the circle, the game ledger, and the sample car. You may edit `scripts/taxi_geo.py`, `scripts/taxi_geo_check.py`, `scripts/taxi_game.py`, `scripts/taxi_day_check.py`, `scripts/taxi_week_check.py`, `app/taxi-game.js`, `game.html`, `app/map.js`, and `app/map.css`. In `index.html` add only the Empire link. Do not edit the fare module, `office.html`, or `app/models.py`. Do not write the live database.

`GEO-OK`, `DAY-OK`, and `WEEK-OK` must pass before each merge that touches those scripts. The worked day stays −1120 pence. A game taxi never has a `device_id`.

1. Merge the checkers and the browser port of the worked day if they are not already on `main`.
2. Add `game.html`. Show −£11.20, cancel-before with no lines, cancel-after-one-mile at −£0.20, and a second car at −£8000 that is not a device. No API call. Merge.
3. Draw a Leaflet circle of 80467 metres around `NEWCASTLE` and a marker at `55.0367, -1.5075` labelled `Shiremoor depot`. Leave phones and buses. Merge.
4. One sample-car marker starts at the depot. Ask OSRM for the depot to Grey's Monument and back. If OSRM does not answer, draw the straight line and show `OSRM unavailable`. Do not reprice the −1120 pence day. Merge.
5. Point `docs/taxi-game.md` and `docs/taxi-day.md` at the checkers and the map. Merge.

## Integrator

Read the three other radio files from `origin/main`. When a product slice has merged, deploy once from `C:\Users\MichaelThomson\source\hackathon-site` with `.\scripts\box.ps1 update` and `.\scripts\check.ps1`. Do not deploy a radio-only commit on its own. Write the result back into this file and merge that note.
