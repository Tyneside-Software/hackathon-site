# Integrator

Written on `main` for the other sessions to pull. The integrator updates this file by merging a branch. Lanes do not edit it.

The human types `continue`. That means the slices below. The rule is in `docs/radio/README.md`.

A radio note that says a heading is clear is stale when this file lists Open slices for that heading. Do those Open slices. Done is history. The reservoir is not work until it is moved into Open slices.

## How to read this

Each session does the Open slices under its own heading, in order. When a slice is already on `origin/main`, skip it and say so in your radio file. Merge each finished slice before starting the next. Re-read this file from `origin/main` between slices, because it may have moved. Do not stop while an Open slice under your heading is still undone.

The product brief is `docs/TAXI.md`. Do not invent a second fare table, a second map centre, or a fourth product. Do not edit `docs/TAXI.md`. Do not add `ready`. Leave September 2026 issues 1, 2, 3, 4, and 18 alone. Do not touch API pull request `reeve-branch`. Issues 22 and 29 stay `blocked`. Do not migrate `device_links` and do not write the live database.

Queue depth is in `docs/radio/README.md`. Each of the three lanes keeps at least 12 Open slices that are not yet on `origin/main`.

## Now

The integrator leads on `continue`. The only products are the tracker, the booking office, and the empire game in `docs/TAXI.md`.

The tracker model is agreed. Issues 22 and 29 stay `blocked`. Do not migrate the live database.

The office and the empire are the same booking desk. `office.html` is the real company. `game.html` is the same desk filled with simulated rows. The banner is the visible difference: `Real data` on the office, `Simulated data` on the empire. Same nav, same `office-grid`, same three panels (`Quote`, `Bookings`, `Ledger`), same `app/office.css`. The company ledger never shows game costs. The game ledger never shows the company totals 2860, 1130, or 1240. Live progress is `http://100.65.94.5/office.html` and `http://100.65.94.5/game.html`.

| Lane | State | Next slice |
|------|--------|------------|
| Product owner | On task. Issue 182 is the one-mile fare as flag and units. | Slice 63, `Exact 322.6 yards on the desk`. Tariff one shows 265. Then 64 to 76, then 32 to 50. Do not stop. Skip a title that already has an issue. |
| grok-dev-1 | On task. Slice 15, negative miles, is on `main` at `f92272f`. A radio line that still asks for slice 15 is stale. | Slice 16. The help panel states tariff one flag fall 240 and tariff two flag fall 315. It does not change a quote. Then slices 17 to 31. Do not stop. |
| grok-dev-2 | On task. Slice 27 is in progress on `lane/grok-dev-2/moving`. | Finish that slice and merge it. The sample car moves along the depot-to-Monument route in real time. Then slice 28, a new fare every 20 seconds until 3 are waiting. Then slices 29 to 38. Slices 11 to 23 still wait. |

Do not redo a slice that is already on `main`. Do not start the reservoir.

The empire is a real-time game. One real second is one game second. There is no faster clock. When OSRM returns a duration, that duration is the journey. The car moves along the route as those seconds pass. When OSRM does not answer, the car moves in a straight line at 30 miles per hour, the built-up speed limit, and the page says `OSRM unavailable`. A new fare is offered every 20 real seconds while fewer than 3 offers are waiting. Each trip is inside the circle, not Berwick, and between 1 and 8 miles, so the drive is a few minutes rather than an hour. The checked day stays −1120. The company desk is unchanged.

The box site was `0e0b65c`. Negative miles `f92272f` are not on the box yet. Deploy after this note. The moving sample car is slice 27 and is not on `main` yet, so this deploy does not show it. A later radio-only commit is not another deploy.

## Product owner

No product code. You may commit and squash-merge a branch that changes only `docs/radio/po.md`.

Done, already on `main`: issues 30, 31, 32, 33, and 34 are open. Issues 23 and 24 are commented. Issues 22, 29, and 34 stay `blocked`. Do not open those titles again.

Open slices. One issue, then a radio note, then the next. If that exact title already exists, comment on it and do not open a second. Label `repo:site` only. The issue body is the matching dev slice in this file. Do not add `ready`. Skip a title that already has an issue. The next title is `Exact 322.6 yards on the desk`. Skip a title that already has an issue. Then open slices 64 to 76 before slices 32 to 50.

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
28. `Soiling-only company day`
29. `Cash or account does not change the fare`
30. `Desk rejects negative miles`
31. `Sunderland customer pin`
32. `Real data banner on the office desk`
33. `Office heading is Booking desk`
34. `Office page uses the three shared panels`
35. `Company ledger panel stays free of game costs`
36. `Office empty book says no bookings yet`
37. `Office bookings use the shared row`
38. `Office week strip stays 20020`
39. `Office page links to the empire`
40. `Simulated data banner on the empire desk`
41. `Empire heading is Booking desk`
42. `Empire page uses the three shared panels`
43. `Worked job shown as one booking row`
44. `Game ledger panel shows minus 1120`
45. `Empire empty book says no bookings yet`
46. `Three simulated cars as booking rows`
47. `Empire week strip shows minus 7840`
48. `Empire page links to the office`
49. Comment on issues 32 to 48. Quote `Real data`, `Simulated data`, and the pence figure from the matching slice. Do not add `ready`.
50. If fewer than 8 of these titles are still unopened, write `queue low`.
51. `Real-time clock for the empire`
52. `Car position from an OSRM duration`
53. `Straight-line fallback at 30 miles per hour`
54. `Sample car moves along the route`
55. `A new fare every 20 seconds`
56. `Live fares stay inside eight miles`
57. `Live fare uses the November 2024 tariff`
58. `Three cars can be out at once`
59. `Live offers appear on the booking desk`
60. Comment on issues 51 to 59. Quote 20 seconds, 30 miles per hour, and −1120. Do not add `ready`.
61. `Alex takings after the night booking is cancelled`
62. `One-mile fare shown as flag and units`
63. `Exact 322.6 yards on the desk`
64. `Pram and outside bag on the one-mile fare`
65. `Real data banner survives a reload`
66. `Receipt sits in the ledger panel`
67. `Switch between the full day and the empty day`
68. `Office page keeps the empire link`
69. `Customer pin for a waiting fare`
70. `Car drives back to the depot`
71. `Live fuel at 20 pence a mile`
72. `Seconds remaining on the booking row`
73. `Three fares waiting and no fourth`
74. `A live trip posts its fare once`
75. Comment on issues 61 to 74. Quote 1620, 580, 20 seconds, and −1120. Do not add `ready`.
76. If fewer than 12 Open slices remain for any lane, write `queue low`.

Reservoir. Do not open these yet.

1. `Desk help panel for the two flag falls`
2. `Sample car returns to the depot pin`
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

Done, on `fa3b6e3`: the office desk, the £11.30 and £12.40 rows, the mixed button at 265, the company day at 2860, the cancelled mile at 2370, the empty hiring at 0, and soiling-only at 12500. Open slices 1 to 9 are also on `main`, through `ce8b980`. Skip them.

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
13. Soiling-only day. One hiring, no meter, soiling on, sums the day to 12500. Label it `soiling-day`. The 2860 day stays available beside it. `FARE-OK`.
14. Cash or account. A completed £11.30 booking can be marked cash or account. The pence stays 1130 either way. `FARE-OK`.
15. Negative miles. The desk rejects them and the previous quote stays on screen. `FARE-OK`.
16. Help panel. It states the tariff one flag fall of 240 pence and the tariff two flag fall of 315 pence. It does not change a quote. `FARE-OK`.
17. Real banner. Add `<p class="desk-banner">Real data</p>` above the heading. The heading is `Booking desk`. Describe both in `docs/taxi-office.md`. The locked pence do not move. `FARE-OK`.
18. Shared panels. Keep the three panels in `office-grid`, with headings `Quote`, `Bookings`, and `Ledger`. The ledger note says the money is the company's. It does not show a driver share, fuel, standing, or −1120.
19. Empty book. When the bookings panel has no rows, it says `No bookings yet.`
20. Shared row. Each sample booking is one row showing pickup, drop-off, call sign, status, and the fare in pounds. The £11.30 row and the £12.40 row use it.
21. Week strip. The company week stays 20020 pence and is labelled `company-week` inside the ledger panel.
22. Empire link. The nav on `office.html` includes a link to `game.html` named `Empire`. Do not edit `index.html`.
23. Status words. The row status is one of `offered`, `accepted`, `started`, `completed`, or `cancelled`. Completing the £11.30 row still adds 1130 once.
24. Alex after the night booking is cancelled. Cancel Sam's 1240. Complete Alex's 1130 and 490. The desk shows 1620. The 2860 day is still available. `FARE-OK`.
25. One-mile breakdown. Tariff one at 1 mile is shown as flag 240 plus 10 units of 25, total 490. `FARE-OK`.
26. Two units. Exact 322.6 yards on tariff one shows 265. The mixed button stays 265, not 290. `FARE-OK`.
27. Pram and bag. Tariff one, 1 mile, one pram, and one outside bag is 490 + 50 + 40 = 580. `FARE-OK`.
28. Banner survives reload. After the browser book is restored, the page still says `Real data` and the total is 2860. `FARE-OK`.
29. Receipt in the ledger. The plain-text slip is inside the ledger panel. It still contains `1130` and `£11.30` and does not contain `driver_share`, `standing`, or `800000`.
30. Two saved days. A control shows the 2860 day. Another shows the empty day at 0. Switching does not add the totals together. `FARE-OK`.
31. Simulated desk link. The Empire link on `office.html` is present. The office page does not copy the game's −1120 total.

Reservoir. Do not start these.

1. A help line on the restored day repeats the tariff one flag fall of 240 and the tariff two flag fall of 315.

## grok-dev-2

Checkout `C:\Users\MichaelThomson\source\lanes\grok-dev-2\hackathon-site`. Pull request 25 is merged as `e4a2c1c`. Branch the next slice from current `origin/main` as `lane/grok-dev-2/<slug>`.

You own the circle, the game ledger, the sample car, and the map drawing for this game. You may edit `scripts/taxi_geo.py`, `scripts/taxi_geo_check.py`, `scripts/taxi_game.py`, `scripts/taxi_day_check.py`, `scripts/taxi_week_check.py`, `app/taxi-game.js`, `game.html`, `app/map.js`, `app/map.css`, `docs/taxi-game.md`, and `docs/taxi-day.md`. You may link `app/office.css` from `game.html`. Do not edit that file, `office.html`, `app/office.js`, the fare module, `index.html`, `docs/pages.json`, `docs/TAXI.md`, `docs/taxi-model.md`, or `app/models.py`. Do not write the live database. The Empire link is already on the home page.

`GEO-OK`, `DAY-OK`, and `WEEK-OK` must pass before each merge that touches those scripts. The one-car worked day stays −1120 pence. Seven of those days stay −7840. A new car stays −800000 and never has a `device_id`. No API call. Do not import the office ledger and do not show 2860, 1130, or 1240 as game cash. The priced fare in the worked day stays 1040. Do not price Hexham, Durham, or Sunderland by distance.

Done, on `e4a2c1c`: the checkers, `game.html`, the 80467 metre circle, the `Shiremoor depot` marker, and the sample car that asks OSRM or shows `OSRM unavailable` without repricing the day. Open slices 1 to 10 are also on `main`, through the seven-day list at `b1917d3`. Skip them.

Do slices 24 to 38 before slices 11 to 23. The real-time game is the priority. A radio note that names slice 11 is stale. One real second is one game second. `scripts/taxi_day_check.py` must still print `DAY-OK`, and it must also print `TIME-OK`. Do not edit `app/office.css` or `scripts/taxi_fare.py`. The page may load `app/taxi-fare.js`. A live offer must not change the checked day of −1120.

Open slices. Use the coordinates already in `scripts/taxi_geo_check.py`. Do not invent a new town.

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
13. Sunderland customer. A pin at `54.9069, -1.3838` is inside and has no fare of its own. `GEO-OK` still passes.
14. Returning pin. Status `returning` draws the sample car on the depot pin. The worked day stays −1120. `DAY-OK`.
15. Simulated banner. `game.html` links `styles.css` and `app/office.css`. Add `<p class="desk-banner">Simulated data</p>`. The heading is `Booking desk`. Do not edit `app/office.css`. The worked day stays −1120. `DAY-OK`.
16. Shared panels. Use `office-grid` and three `office-panel` sections headed `Quote`, `Bookings`, and `Ledger`. Keep the place list and the checkers' results. Do not show 2860, 1130, or 1240.
17. One booking row. The worked job is a row: pickup `Grey's Monument`, drop-off `Shiremoor depot`, call sign `T1`, status `completed`, fare £10.40. It is not a device.
18. Ledger panel. The ledger uses the same ledger line markup as the office and shows standing −£15.00, fare £10.40, driver share −£5.20, fuel −£1.40, and the sum −£11.20.
19. Empty book. Cancel before the car starts shows `No bookings yet.` and no fare. `DAY-OK` still expects no lines for that case.
20. Three rows. The three-car day shows `T1`, `T2`, and `T3` as booking rows. The sum stays −4120. `DAY-OK`.
21. Week strip. Seven rows or seven lines of −1120 sit in the ledger panel. The total is −7840. The purchase control still reaches −807840. `WEEK-OK` and `FLEET-OK`.
22. Office link. The nav on `game.html` includes `office.html` named `Office` and `game.html` named `Empire`. Do not edit `index.html`.
23. Status words. The sample car status is one of `at_depot`, `offered`, `accepted`, `started`, or `returning`, shown on the booking row. Completing the worked day still adds −1120 once.
24. Real-time clock. `elapsedSeconds(startMs, nowMs)` is the real difference in seconds. Ten real seconds return 10. There is no multiplier. `TIME-OK`.
25. Position on a route. A list of points and an OSRM duration give the car's place. At 0 seconds the car is on the first point. At the full duration it is on the last point. Halfway through a 600 second duration, 300 seconds have elapsed and the car is halfway along the points. The checker does not call OSRM. `TIME-OK`.
26. Fallback speed. With no OSRM duration, 3 miles take 360 seconds, because 30 miles per hour is the built-up limit. The page says `OSRM unavailable`. The checked day stays −1120. `TIME-OK`.
27. Moving sample car. On the map, starting the sample car moves its marker along the depot-to-Monument route in real time. The tooltip shows the seconds remaining. If OSRM does not answer, the marker uses the straight line at 30 miles per hour and the page says `OSRM unavailable`. Phones and buses stay. The marker is not a device. The −1120 ledger does not change because the marker moved.
28. Offer every 20 seconds. While fewer than 3 jobs are `offered`, the next offer appears when 20 real seconds have passed. At 0 seconds there are 0 offers. At 20, 40, and 60 seconds there are 1, 2, and 3. At 80 seconds there are still 3. The page shows the seconds until the next offer. `TIME-OK`.
29. Short trips. A live pickup and drop-off are inside the 80.467 km circle, are not Berwick-upon-Tweed, and are at least 1 mile and at most 8 miles apart. Generate them from the Shiremoor depot by a bearing and a distance of 2, 4, or 6 miles. Do not add a new town. `GEO-OK` and `TIME-OK`.
30. Live tariff. The offer's fare is `quote_pence` from `scripts/taxi_fare.py`, using the trip's yards and seconds. The unit that finishes first is the one that counts. Three miles, no waiting, tariff one, no extras, is 1040. The page may load `app/taxi-fare.js` and must not edit it. A live offer does not change the checked −1120 day. `TIME-OK`.
31. Three moving cars. `T1`, `T2`, and `T3` can each follow a route at the same time. Offers still arrive every 20 seconds until 3 are waiting. None of the cars is a device. `DAY-OK` still requires −1120 for the checked day.
32. Offers on the desk. Each waiting offer is a booking row: pickup, drop-off, status `offered`, and the fare in pounds. Accepting one sets a free car onto that route. The banner says `Simulated data` if that banner is already on the page.
33. Customer pin. A waiting offer puts a marker on its pickup. The marker is not a device. Accepting the offer removes that marker and starts the car. Phones and buses stay.
34. Drive home. After the drop-off the car status is `returning` and it drives to the Shiremoor depot in real time. Arrival sets `at_depot`. The checked day stays −1120. `TIME-OK`.
35. Live fuel. When a live trip completes, fuel is 20 pence for each mile driven, added once. Three miles add −60. A second completion does not add it again. The checked seven-mile fuel of −140 stays on the checked day. `TIME-OK`.
36. Seconds on the row. The booking row of a moving car shows the seconds remaining. At the start of a 600 second route it shows 600. Halfway it shows 300. `TIME-OK`.
37. Three waiting is the cap. The page says `3 fares waiting` when three offers are open. The twentieth second does not add a fourth. When one is accepted, the next 20 seconds may add one. `TIME-OK`.
38. One ledger post. Completing a live trip appends one fare line and one fuel line. Doing it again does not append them again. `DAY-OK` still requires −1120 for the checked day.

Reservoir. Do not start these.

1. Game drivers Jamie and Alex. Alex runs `T1`. Jamie has no share until a fare. The one-car day stays −1120.
3. Cancel after 4 miles driven: fuel −80 and no fare. The miles are given by this slice, not by OSRM.
4. A day with one car and no job is standing −1500 only.
5. A new car and a new driver on the same day: −800000 and 0. The new car cannot start.
6. The empire page lists the seven −1120 lines as well as the total.
7. Watcher and owner stories stay on the model page. Do not migrate `device_links`.

## Integrator

On `continue`, lead. Watch productivity against the three objectives: the tracker, the real booking desk, and the real-time empire. Read the radios and the lane checkouts. Do not edit those checkouts. Name the next slice in `## Now`. Keep at least 12 Open slices that are not yet on `origin/main` in front of each lane. Deploy once when product code has merged since the site commit in `## Now`. A radio-only commit is not a deploy.

Last deploy: box site `0e0b65c`, health `0.1.26`, `CHECK-OK`. Negative miles are newer. Deploy once after this note. Do not deploy a later radio-only note.
