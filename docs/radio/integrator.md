# Integrator

Written on `main` for the other sessions to pull. The integrator updates this file by merging a branch. Lanes do not edit it.

The human types `continue`. That means the slices below. The rule is in `docs/radio/README.md`.

A radio note that says a heading is clear is stale when this file lists Open slices for that heading. Do those Open slices. Done is history. The reservoir is not work until it is moved into Open slices.

## How to read this

Each session does the Open slices under its own heading, in order. When a slice is already on `origin/main`, skip it and say so in your radio file. Merge each finished slice before starting the next. Re-read this file from `origin/main` between slices, because it may have moved. Do not stop while an Open slice under your heading is still undone.

The product brief is `docs/TAXI.md`. Do not invent a second fare table, a second map centre, or a fourth product. Do not edit `docs/TAXI.md`. Do not add `ready`. Leave September 2026 issues 1, 2, 3, 4, and 18 alone. Do not touch API pull request `reeve-branch`. Issues 22 and 29 stay `blocked`. Do not migrate `device_links` and do not write the live database.

Queue depth is in `docs/radio/README.md`. Each of the three lanes keeps at least 8 Open slices that are not yet on `origin/main`.

## Now

The integrator leads on `continue`. The only products are the tracker, the booking office, and the empire game in `docs/TAXI.md`.

The tracker model is agreed. Issues 22 and 29 stay `blocked`. Do not migrate the live database. The office and the empire are the work in progress.

| Lane | State | Next slice |
|------|--------|------------|
| Product owner | On task. Issues through 70 are open, up to the meter-and-extras quote. | `Office refuses a Berwick booking by name`, then the rest of the list through slice 27. Do not stop after one issue. |
| grok-dev-1 | On task. Slices 1 to 3 are on `main` (`5c34052`, `944aadc`, `dcc53b1`). | Slice 4. Flag-fall buttons: mixed 265, tariff two at 140.5 yards is 315, tariff two at 45 seconds is 315, tariff one at 161.3 yards is 240. `FARE-OK`. Then slice 5. |
| grok-dev-2 | On task. Slices 1 and 2 are on `main` (`4bb7f9b`, `107b62c`). The status slice is in progress on `lane/grok-dev-2/status`. | Finish that slice and merge it. Completing the worked day still shows −1120 once. Then slice 4, the Berwick job. |

Do not redo a slice that is already on `main`. Do not start the reservoir.

The box site is `694f0c3`. `/health` is `0.1.26`. `.\scripts\check.ps1` printed `CHECK-OK`. That deploy includes the office fields, the once-only fare, the places list, and the sample pins. A later radio commit is not another deploy.

## Product owner

No product code. You may commit and squash-merge a branch that changes only `docs/radio/po.md`.

Done, already on `main`: issues 30, 31, 32, 33, and 34 are open. Issues 23 and 24 are commented. Issues 22, 29, and 34 stay `blocked`. Do not open those titles again.

Open slices. One issue, then a radio note, then the next. If that exact title already exists, comment on it and do not open a second. Label `repo:site` only. The issue body is the matching dev slice in this file. Do not add `ready`. Skip a title that already has an issue. The next title is `Office refuses a Berwick booking by name`.

1. `Office booking fields for pickup and drop-off`
2. `Office status changes add the fare once`
3. `Office extras rows for soiling and an animal`
4. `Office buttons for the flag-fall boundaries`
5. `Company week of seven desk days`
6. `Empty company day sums to zero`
7. `Office quote shows meter and extras separately`
8. `Office refuses a Berwick booking by name`
9. `Office day kept in the browser`
10. `Plain-text receipt for a completed booking`
11. `Company takings by driver Alex and Sam`
12. `Tariff chosen from the requested clock`
13. `Inside and outside places on the empire page`
14. `Sample pickup and drop-off markers`
15. `Sample car hiring statuses`
16. `Game refuses a Berwick job`
17. `Second car stays at the depot until it is paid for`
18. `Cancel with no miles adds no fuel`
19. `New driver Jamie costs nothing`
20. `Three cars standing at Shiremoor`
21. `Durham customer pin and OSRM`
22. `Seven game days listed on the empire page`
23. `Empire page keeps off the company ledger`
24. `Map legend for phones, buses, depot, and the sample car`
25. Comment on each office issue opened above. Quote the pence figure from the matching grok-dev-1 slice. Do not add `ready`.
26. Comment on each game issue opened above. Quote the pence figure from the matching grok-dev-2 slice. Do not add `ready`.
27. In `docs/radio/po.md`, name any Open slice of yours that is still not done. If fewer than 8 remain, write `queue low`.

Reservoir. Do not open these yet.

1. `Soiling-only company day`
2. `Cash or account does not change the fare`
3. `Desk help panel for the two flag falls`
4. `Desk rejects negative miles`
5. `Alex takings after the night booking is cancelled`
6. `One-mile fare shown as flag and units`
7. `Exact 322.6 yards on the desk`
8. `Pram and outside bag on the one-mile fare`
9. `Sunderland customer pin`
10. `Sample car returns to the depot pin`
11. `Game drivers Jamie and Alex`
12. `Fuel for four miles after the start`
13. `Standing only, when no job runs`
14. `New car and a new driver on the same day`
15. `Seven lines of the worked day on the empire page`
16. `Watcher stories stay words until the migration is agreed`

## grok-dev-1

Checkout `C:\Users\MichaelThomson\source\lanes\grok-dev-1\hackathon-site`. Pull request 26 is merged as `fa3b6e3`. Branch the next slice from current `origin/main` as `lane/grok-dev-1/<slug>`.

You own the fare maths and the office desk. You may edit `scripts/taxi_fare.py`, `scripts/taxi_fare_check.py`, `app/taxi-fare.js`, `office.html`, `app/office.js`, `app/office.css`, `docs/taxi-fares.md`, and `docs/taxi-office.md`. Do not edit `app/map.js`, `game.html`, `app/taxi-game.js`, `index.html`, `docs/pages.json`, `docs/TAXI.md`, or the API. The Office link is already on the home page.

Do not rewrite the locked results: 490, 1040, 615, 1240, 1130, 265, 2370, 2860, and 12500. Money is integer pence. `py -3 scripts\taxi_fare_check.py` must print `FARE-OK` before each merge. The company ledger is not the game ledger. No driver share, no fuel, no standing, and no new-car cost on this desk. No API call and no database.

Done, on `fa3b6e3`: the office desk, the £11.30 and £12.40 rows, the mixed button at 265, the company day at 2860, the cancelled mile at 2370, the empty hiring at 0, and soiling-only at 12500. Open slices 1 to 3 are also on `main` (`5c34052`, `944aadc`, `dcc53b1`). Skip them.

Open slices.

1. Booking fields. Each row stores pickup, drop-off, requested time, vehicle call sign, and status. The £11.30 sample picks up at `Grey's Monument` and drops at `Shiremoor depot`. The £12.40 sample is the reverse. Describe the fields in `docs/taxi-office.md`.
2. Status adds the fare once. Buttons move `offered` to `accepted` to `started` to `completed`. Cancel is allowed until `completed`. Completing the £11.30 row adds 1130 once. A second press does not add it again. Cancel from `offered` adds 0. A completed booking does not become cancelled.
3. Extras rows. A hiring with no miles, no waiting, and soiling is 12500. A guide or hearing dog adds 0. Tariff one, 1 mile, no waiting, one animal, no soiling, is 490 + 300 = 790. Show both rows. The checker fails if either figure moves.
4. Flag-fall buttons. Keep the mixed button at 265, not 290. Add tariff two at exact 140.5 yards and no waiting: 315. Add tariff two at 0 yards and 45 seconds: 315. Add tariff one at exact 161.3 yards and no waiting: 240. The checker fails if any of those move.
5. Company week. Seven completed days of 2860 pence sum to 20020. Label it `company-week`. This is not the game week of −7840. The checker fails if the week is not 20020. Show it on the desk.
6. Empty day. No bookings sum to 0. A day whose only booking is the cancelled 490 pence mile sums to 0. Label it `empty-day`. The 2370 and 2860 totals stay.
7. Split quote. The £11.30 row shows meter 1040, extras 90, total 1130. The £12.40 row shows meter 1240, extras 0, total 1240. The checker fails if the split moves.
8. Berwick by name. A pickup or drop-off whose text is `Berwick-upon-Tweed` is not saved and adds 0. `Hexham`, `Durham`, `Sunderland`, `Grey's Monument`, and `Shiremoor depot` may be saved. Do not add a coordinate table and do not edit the geo module. The fare is still the meter the clerk entered.
9. Browser book. The day's rows survive a reload in `localStorage` under `hackathon-office-day`. A clear control removes that key. A restore control rebuilds the three completed bookings 1130, 1240, and 490 and shows 2860. Still no API.
10. Receipt. A completed booking renders a plain-text slip with tariff, miles, waiting, extras, and quoted pence. The £11.30 slip contains `1130` and `£11.30`. It does not contain `driver_share`, `standing`, or `800000`.
11. Drivers on the company book. `Alex` runs the 1130 and the 490. `Sam` runs the 1240. Completed takings are Alex 1620 and Sam 1240, and the day is still 2860. These are gross fares. Do not subtract a driver share.
12. Clock chooses the tariff. Requested time `22:00` or `06:59` selects tariff two. `07:00` or `21:59` selects tariff one. A Sunday checkbox forces tariff two. 27 December through 31 December forces tariff two. A Tuesday at `15:00` stays tariff one. The meter figures do not change. The checker covers those boundaries. The desk shows the tariff it selected.

Reservoir. Do not start these.

1. A soiling-only day is 12500 and is labelled `soiling-day`.
2. A booking marked cash or account keeps the same pence.
3. A help panel states tariff one flag fall 240 and tariff two flag fall 315.
4. Negative miles are rejected and the previous quote stays.
5. Cancelling Sam's 1240 and completing Alex's 1130 and 490 sums to 1620.
6. The 1-mile tariff-one fare is shown as flag 240 plus 10 units of 25, total 490.
7. Exact 322.6 yards on tariff one shows 265.
8. Tariff one, 1 mile, one pram, and one outside bag is 490 + 50 + 40 = 580.

## grok-dev-2

Checkout `C:\Users\MichaelThomson\source\lanes\grok-dev-2\hackathon-site`. Pull request 25 is merged as `e4a2c1c`. Branch the next slice from current `origin/main` as `lane/grok-dev-2/<slug>`.

You own the circle, the game ledger, the sample car, and the map drawing for this game. You may edit `scripts/taxi_geo.py`, `scripts/taxi_geo_check.py`, `scripts/taxi_game.py`, `scripts/taxi_day_check.py`, `scripts/taxi_week_check.py`, `app/taxi-game.js`, `game.html`, `app/map.js`, `app/map.css`, `docs/taxi-game.md`, and `docs/taxi-day.md`. Do not edit the fare module, `office.html`, `index.html`, `docs/pages.json`, `docs/TAXI.md`, `docs/taxi-model.md`, or `app/models.py`. Do not write the live database. The Empire link is already on the home page. Do not edit `docs/pages.json`.

`GEO-OK`, `DAY-OK`, and `WEEK-OK` must pass before each merge that touches those scripts. The one-car worked day stays −1120 pence. Seven of those days stay −7840. A new car stays −800000 and never has a `device_id`. No API call. Do not import the office ledger and do not show 2860, 1130, or 1240 as game cash. The priced fare in the worked day stays 1040. Do not price Hexham, Durham, or Sunderland by distance.

Done, on `e4a2c1c`: the checkers, `game.html`, the 80467 metre circle, the `Shiremoor depot` marker, and the sample car that asks OSRM or shows `OSRM unavailable` without repricing the day. Open slices 1 and 2 are also on `main` (`4bb7f9b`, `107b62c`). Skip them.

Open slices. Use the coordinates already in `scripts/taxi_geo_check.py`. Do not invent a new pin.

1. Places on the empire page. Show Grey's Monument, Shiremoor depot, Hexham, Durham, and Sunderland as inside, and Berwick-upon-Tweed as outside. A job that starts or ends at Berwick is not offered. `GEO-OK` still passes.
2. Job pins. On the map, add `Sample pickup` at Grey's Monument and `Sample drop-off` at the depot, beside the sample car. Phones and buses stay. These markers are not devices.
3. Hiring statuses. Buttons set the sample car to `at_depot`, `offered`, `accepted`, `started`, and `returning`. Pressing `complete the worked day` still shows −1120 once. Changing status does not add a second fare. `DAY-OK` stays the one-car day.
4. Berwick is not a game job. Drop-off `55.7704, -2.0068` adds no ledger lines. A Hexham drop-off may be offered. Do not give Hexham its own fare. The priced day remains the 3-mile example at 1040.
5. The second car cannot leave unpaid. The purchase line is −800000 and the car stays `at_depot` until that line exists. Starting a job on the unpaid car adds no `fare_in`. `scripts/taxi_week_check.py` still prints `WEEK-OK` for −7840 with no purchase. It then prints `FLEET-OK` for the same seven days plus the purchase on day 1, summing to −807840. The bought car is not a device.
6. No miles, no fuel. A cancel after the status has reached `started`, with 0 miles driven, adds no fuel line and no fare. The one-mile cancel stays −20 and no fare. Show the zero-mile cancel on `game.html`.
7. Driver Jamie. A new driver costs 0. The worked fare 1040 still pays a driver share of −520. Adding Jamie does not change the −1120 day. The checker fails if a new driver costs anything else.
8. Three cars. Call signs `T1`, `T2`, and `T3` start at the depot. Only `T1` runs the worked fare. Standing is −1500 for each car, so −4500, then fare +1040, driver share −520, fuel −140. The three-car day sums to −4120. Label it `three-car day` on `game.html`. `DAY-OK` still requires the one-car day at −1120, and it also requires −4120 for this case. None of the cars is a device.
9. Durham customer. A pin at `54.7753, -1.5849` is labelled `Durham customer`. It is offered because it is inside. The sample car may ask OSRM for the depot to that pin and back. If OSRM does not answer, show `OSRM unavailable`. That path does not change the −1120 day.
10. Week list. `game.html` lists seven worked days, each −1120, total −7840. A control that also buys the second car on day 1 shows −807840 and says the car is not a device. `WEEK-OK` and `FLEET-OK` still pass.
11. Separate ledgers. `game.html` states `Company ledger is not this page`. It does not show 2860, 1130, or 1240. Do not edit the office files.
12. Map legend. The map names phones, buses, the depot, the circle, and the sample car as different things. The sample-car popup says `not a device`. The circle text includes `80467 m`. The depot label stays `Shiremoor depot`.

Reservoir. Do not start these.

1. A customer pin at Sunderland `54.9069, -1.3838` is inside and has no fare of its own.
2. Status `returning` draws the sample car on the depot pin.
3. Game drivers Jamie and Alex. Alex runs `T1`. Jamie has no share until a fare. The one-car day stays −1120.
4. Cancel after 4 miles driven: fuel −80 and no fare. The miles are given by this slice, not by OSRM.
5. A day with one car and no job is standing −1500 only.
6. A new car and a new driver on the same day: −800000 and 0. The new car cannot start.
7. The empire page lists the seven −1120 lines as well as the total.
8. Watcher and owner stories stay on the model page. Do not migrate `device_links`.

## Integrator

On `continue`, lead. Read the three radio files and look at the lane checkouts. Do not edit those checkouts. Name the next slice in `## Now`. Top up any lane with fewer than 8 Open slices not yet on `origin/main`. Deploy once when product code has merged since the site commit in `## Now`. Write the result back here. A radio-only commit is not a deploy.

Last deploy: box site `694f0c3`, health `0.1.26`, `CHECK-OK` (board 50, 9 todo, 2 ready, 39 done, buses sqlite). Do not deploy this leadership note.
