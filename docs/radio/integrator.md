# Integrator

Written on `main` for the other sessions to pull. The integrator updates this file by merging a branch. Lanes do not edit it.

The human types `continue`. That means the slices below. The rule is in `docs/radio/README.md`.

A radio note that says a heading is clear is stale when this file lists Open slices for that heading. Do those Open slices. Done is history. The reservoir is not work until it is moved into Open slices.

## How to read this

`continue` is a long turn, about 30 minutes. The rule is in `docs/radio/README.md`. The product owner writes the next slices in `docs/radio/po.md`. The devs build those slices. They are not specialised. The integrator does not write the slice text.

When a slice is already on `origin/main`, skip it. A list marked Waiting is not work. Office slices, desk slices, fare cards, and map titles M1 to M32 are Waiting. Do not stop after one slice. Do not write that a heading is clear while `po.md` still lists work.

The product brief is `docs/TAXI.md`. Do not invent a second fare table, a second map centre, or a fourth product. Do not edit `docs/TAXI.md`. Do not add `ready`. Leave September 2026 issues 1, 2, 3, 4, and 18 alone. Do not touch API pull request `reeve-branch`. Issues 22 and 29 stay `blocked`. Do not migrate `device_links` and do not write the live database.

Queue depth is in `docs/radio/README.md`. The product owner keeps at least 16 unfinished slices in front of each dev, and at least 24 more in the reservoir.

## Now

The integrator leads on `continue`. The only products are the tracker, the booking office, and the empire game in `docs/TAXI.md`.

The tracker model is agreed. Issues 22 and 29 stay `blocked`. Do not migrate the live database.

The office and the empire are the same booking desk. `office.html` is the real company. `game.html` is the same desk filled with simulated rows. The banner is the visible difference: `Real data` on the office, `Simulated data` on the empire. Same nav, same `office-grid`, same three panels (`Quote`, `Bookings`, `Ledger`), same `app/office.css`. The company ledger never shows game costs. The game ledger never shows the company totals 2860, 1130, or 1240. Live progress is `http://100.65.94.5/office.html` and `http://100.65.94.5/game.html`.

| Lane | State | Next slice |
|------|--------|------------|
| Product owner | You are autonomous. Master talks to the integrator. You feed both devs and yourself unless `## Now` gives a direct order. The direct order is still the ten-taxi `play.html` game. `po.md` is that game. Issues #699 through #786 stay paused. Both queues are under 16 unfinished, and the reservoir is under 24. | This turn, about 30 minutes, top both queues up to 16 unfinished slices and the reservoir up to 24. All of them are `play.html` and the ten-car money. One issue, then the radio, then the next. Leave `## Next for me` with at least four jobs. Do not stop after one issue. Do not wait for the integrator to name the slices. |
| grok-dev-1 | #790 is on API main as `d999751`. Your radio says next is #792. The queue in `po.md` is real work. Do not say `queue empty`. | Build #792, then the rest of `### grok-dev-1`, for about 30 minutes. One pull request, then the radio, then the next. Skip a slice already on `main`. Do not invent. Do not start the reservoir. Do not edit `play.html` or `play.js`. |
| grok-dev-2 | `play.html` is on main as `5b4e215`. The Monument circle is on main as `24994c3`, so #822 is done. Your radio still names #822. Skip it. | Build #824, then the rest of `### grok-dev-2`, for about 30 minutes. One pull request, then the radio, then the next. Do not edit `app/map.js`. Do not say `queue empty` while that list still has issues. |

Do not redo a slice that is already on `main`. Do not start the reservoir.

## Game page

Master's order. The product owner designs the slices. The integrator does not.

The taxi game is `play.html`. It is not `app/`. `app/` keeps phones, buses, and waypoints. `play.html` shows the game only: the map, the ten taxis, and the in-game money. No phone list, no bus toggle, no Place stops. Same centre `54.9783, -1.6178`, same 50-mile circle, same Shiremoor depot `55.0367, -1.5075`.

An account still starts the fleet, and the fleet still runs on the box when the browser is closed. `ensure_game` creates T1 to T10 at the depot, not three. T1 stays `#f5b942`, T2 `#38bdf8`, T3 `#4ade80`. The product owner names seven more colours in the slices. Cars are not devices. One real second is one game second. OSRM duration is the journey. If OSRM does not answer, the car moves straight at 30 mph and the page says `OSRM unavailable`.

The page shows in-game money as it changes: fares earned, and the game costs already fixed (driver share, fuel at 20 pence a mile, standing). Integer pence. The North Tyneside tariff already in `docs/TAXI.md` is the fare. Do not invent a second fare table. Do not show the company totals 2860, 1130, or 1240 on `play.html`. Do not show game costs on `office.html`. `game.html` stays the simulated booking desk. Do not turn it into this map.

The product owner writes at least 16 unfinished slices for each dev, and 24 in the reservoir, all for this game page. Name the files. One dev should own `play.html` and its script. The other should own the API fleet of 10 and the money figures on `GET /v1/empire`. Do not give both the same file. Say in the radio that the old `app/` queue is paused. Leave `## Next for me`.

`po.md` is that queue now. Keep writing it. Issues #699 through #786 stay paused. Do not go back to three cars, `app/map.js`, or the office waiting list. When a dev has finished slices, the unfinished count falls. Top it back up to 16, and keep 24 in the reservoir. That topping-up is your work. Do not wait to be asked.

The empire is a real-time game. One real second is one game second. There is no faster clock. When OSRM returns a duration, that duration is the journey. The car moves along the route as those seconds pass. When OSRM does not answer, the car moves in a straight line at 30 miles per hour, the built-up speed limit, and the page says `OSRM unavailable`. The account fleet does not use the old 20-second offer rule. A car finishes, waits four seconds at the depot, then takes the next fare. Each trip is inside the circle, not Berwick. The checked day stays −1120. The company desk is unchanged.

GitHub Pages publishes https://hackathon.tyneside.software from `main` on every push. The home page and `progress.html` must describe that `main`. The box site last checked was `ff1e142`. `/health` was `0.1.27`. `check.ps1` printed `CHECK-OK`. The board was 50 cards. Map clicks do not add a waypoint unless Place stops is on. This note is orders only. It is not a deploy.

## Account fleet

This is the objective. It replaces the fare-card queue and the map slices M6 to M32. Re-read this section from `origin/main` between slices. Write your own radio after each slice. The product owner opens the issue. The dev builds it. The integrator deploys. Nobody deploys but the integrator.

A person creates a username and password. The fleet then runs on the Linux box all the time, one real second per game second, even when the browser is closed. A1 to A32 started that fleet with three cars. Those slices are done. Do not rebuild them. The next fleet is ten cars on `play.html`. Read `## Game page`. The three-taxi sentences below are the history of A1 to A32, not the next queue. Each account has its own cars, fares, and trails. Game rows are never devices.

Each car follows a route. Every 10 seconds it checks in. The position is calculated from how far it should be along that route. The map draws a fading trail from those check-ins, the same idea as the bus trails, and the car marker glides along the route between check-ins. A fare that is waiting has a marker until that taxi arrives. Hide taxis hides only that account's cars. Phones and buses stay. The sample car stays, and it is not T1.

Play on `http://100.65.94.5/app/`. The HTTPS site cannot call the HTTP API. Password at least 8 characters. Username at least 3. Use the existing `POST /register` and `POST /login`. Do not invent a second user table. Do not wipe SQLite. Do not migrate `device_links`. Issues 22 and 29 stay blocked. Do not add `ready`.

`GET /v1/empire` requires `Authorization: Bearer`. It returns only that account. `server_now` is unix seconds. `check_s` is 10. `trail_s` is 600. Each car has `sign`, `colour`, `status`, `passenger`, `lat`, `lng`, `route` as `[lat, lng]` pairs, `duration_s`, `leg_started`, `osrm`, and `trail` as `[lng, lat, unix]` triples like the buses. `fares` lists waiting pickups only, with `name`, `lat`, `lng`, and `sign`. Colours are T1 `#f5b942`, T2 `#38bdf8`, T3 `#4ade80`. Depot is `55.0367, -1.5075`. Status is `at_depot`, `to_passenger`, `with_passenger`, or `returning`. Four seconds at the depot, then the next fare. OSRM driving, or a straight line at 30 mph when OSRM does not answer, and then `osrm` is false. Names cycle Mina, Owen, Priya, Jack, Helen, Tom. The username shifts the bearing so two accounts do not drive the same streets.

### Product owner titles

One issue, then a radio note, then the next. Body is the matching slice. If the exact title exists, comment and do not open a second. No `ready`.

Titles 1 to 16 and 33 to 48: label `repo:api` only. Titles 20 to 32 and 49 to 64: label `repo:site` only. Skip titles 17, 18, and 19. Those slices are already on `main`: `15d66fb`, `d41eed7`, and `c0c2f02`. Do not open them again. Titles 1 to 64 except those three are already opened. The next slices are yours to write in `docs/radio/po.md`. Do not wait for the integrator to name them.

1. `Empire tables are not devices`
2. `Register starts the fleet on the box`
3. `The box ticks every account every second`
4. `A car checks in every ten seconds`
5. `OSRM or a straight line at 30 mph`
6. `Depot pause then the next fare`
7. `Waiting fare has a marker position`
8. `Empire feed is one account`
9. `Two accounts do not share a fleet`
10. `A tick does not write a device`
11. `Trails keep ten minutes`
12. `Health version is 0.1.27`
13. `Accounts drive different streets`
14. `Passenger names cycle`
15. `A car at the depot still checks in`
16. `One car failing does not stop the others`
17. `The map asks for an account first`
18. `Create account and sign in on the map`
19. `The token is kept in the browser`
20. `The map polls the account fleet`
21. `The car glides along the server route`
22. `The taxi trail fades like a bus`
23. `Waiting fares are markers`
24. `Hide taxis leaves phones and buses`
25. `A taxi tooltip does not say device`
26. `A click on a fare does not add a waypoint`
27. `The sample car is not one of the account taxis`
28. `The status says the fleet runs on the box`
29. `A rejected token shows the account form`
30. `The public HTTPS page points at the box`
31. `Panning does not restart the fleet`
32. `Sign out clears the cars`
33. `The three cars leave a few seconds apart`
34. `Trips stay inland of the North Sea`
35. `Pickup and drop-off stay inside the circle`
36. `The clock does not start during tests`
37. `The fleet survives a new session`
38. `An old account starts on the feed`
39. `Car colours are on the feed`
40. `Position is the fraction of the route`
41. `One account has one game row`
42. `A check-in writes one trail point`
43. `Three cars can be on different legs`
44. `The feed names the clock and the trail`
45. `The feed says when OSRM missed`
46. `A leaving leg starts at the depot`
47. `Car status is one of four words`
48. `Empire tests pass before the merge`
49. `Signed in hides the account form`
50. `A failed sign-in shows the error`
51. `The map does not invent cars while it loads`
52. `The trail fades with age`
53. `A car at the depot sits on the depot`
54. `Chip colours come from the feed`
55. `The waiting chip says the name`
56. `A quiet feed keeps the last cars`
57. `Sign out is not hide taxis`
58. `The account form leaves the sample car`
59. `Hide taxis keeps the token`
60. `A late poll does not jump the car back`
61. `The empire block hides both ledgers`
62. `The status says the fleet is loading`
63. `The map files are cache-busted`
64. `Phones and buses stay for a signed-in player`

### grok-dev-1 — API slices A1 to A32

Checkout `C:\Users\MichaelThomson\source\lanes\grok-dev-1\hackathon-api`. Branch `lane/grok-dev-1/<slug>` from `origin/main`. Squash-merge into `Tyneside-Software/hackathon-api`. Do not run `box.ps1`.

You may add `app/empire.py`, `tests/test_empire.py`, `app/routers/empire.py`, and the smallest hooks in `app/models.py`, `app/main.py`, `app/routers/auth.py`, and `app/config.py`. Tables are `empire_games` and `empire_cars` only. No `device_id`. `create_all` only. Do not wipe the live database. Do not change `devices`, `location_pings`, or `device_links`. Do not edit the site map.

A1. Add `empire_games` and `empire_cars`. No `device_id`. A test reads the columns and fails if `device_id` is one of them.
A2. `POST /register` still creates the user. After that row is stored, `ensure_game` creates T1, T2, and T3 at the depot for that username.
A3. A background tick in the API process advances every account once a second. One real second is one game second. It keeps going when no browser is open.
A4. Each car checks in every 10 seconds. The lat and lng come from the route and the leg clock. A test shows no check-in at 9 seconds and a check-in at 10.
A5. A leg asks OSRM. If OSRM does not answer, the car moves in a straight line at 30 mph and `osrm` is false. The test does not call the network.
A6. After the drop-off the car is `returning` until the depot, then `at_depot`. Four seconds later the next fare starts.
A7. While status is `to_passenger`, the feed includes that fare's name and pickup. After arrival the fare is gone.
A8. `GET /v1/empire` with the bearer token returns only that account. `401` with no token.
A9. A test with two usernames shows that one's feed does not contain the other's fare coordinates.
A10. A test runs a tick and shows `devices`, `location_pings`, and `device_links` gained no rows.
A11. Pings older than 600 seconds are dropped. Trail points are `[lng, lat, unix]`.
A12. `VERSION` in `app/config.py` becomes `0.1.27`. `/health` returns that version. Do not change the board.
A13. The bearing is shifted by the username. Two accounts do not get the same pickup point.
A14. Names cycle Mina, Owen, Priya, Jack, Helen, Tom.
A15. A car at the depot still checks in, so it has a position.
A16. If one car raises, the tick logs it and still advances the other accounts. `tests/test_empire.py` passes before the merge.
A17. The three cars do not start the first fare on the same second. Stagger the first departures by about 7 seconds.
A18. Bearings used for a trip stay inside 160 to 300 inclusive, so the trip does not go into the North Sea. A username whose raw bearing falls outside that range is clamped. The test does not call the network.
A19. The pickup is about 1.2 miles from the depot. The drop-off is further along the inland bearing. Both points are inside the 50-mile circle and are not Berwick.
A20. The clock starts in the FastAPI lifespan and stops on shutdown. Importing the app inside `tests/test_empire.py` does not start the clock and does not open the live database file.
A21. Create a game, close that session, open a new session, and T1, T2, and T3 are still there for that username. The rows are in SQLite, so the game survives a process restart. Do not wipe the live database.
A22. `GET /v1/empire` for a user who has no empire row yet calls `ensure_game` and then returns the three cars. No token is still 401.
A23. The feed colours are T1 `#f5b942`, T2 `#38bdf8`, and T3 `#4ade80`.
A24. The position is the fraction of the route by elapsed time over `duration_s`. At 0 the car is on the first point. At `duration_s` it is on the last point. Halfway it is halfway along the points. The test uses a known route and does not call OSRM.
A25. Many ticks still leave one `empire_games` row for that username.
A26. A check-in appends one trail point. A one-second tick that is not a check-in does not append a point. Points stay `[lng, lat, unix]`.
A27. T1, T2, and T3 of one account can be on three different statuses at the same time.
A28. The feed includes `ok`, `username`, `server_now`, `check_s`, `trail_s`, `osrm_unavailable`, `cars`, and `fares`. `check_s` is 10. `trail_s` is 600. `server_now` is the server clock.
A29. `osrm_unavailable` is true when a current leg did not get an OSRM route. It is false when every current leg did.
A30. Each car's `route` is `[lat, lng]` pairs. A leg that leaves the depot starts at `55.0367, -1.5075`.
A31. Status is only `at_depot`, `to_passenger`, `with_passenger`, or `returning`.
A32. `tests/test_empire.py` passes for A1 to A31 before the merge. No network. No live database file.

A1 to A32 are on `main`. Skip them. A1 is `82363dc`. A2 is `64460c3`. A3 to A32 are `1a22a90`. Do not rebuild them. The next API slices are written by the product owner in `docs/radio/po.md`, not here.

### grok-dev-2 — map slices U1 to U32

Checkout `C:\Users\MichaelThomson\source\lanes\grok-dev-2\hackathon-site`. You may edit `app/map.js`, `app/map.css`, and the Empire block in `app/index.html`. Do not edit the API. Do not bring back a browser-only fleet as the source of truth. The sample car button stays.

U1 is on `main` at `15d66fb`. Skip it. The account form is the first empire control, and the page does not start T1, T2, and T3 by itself.
U2 is on `main` at `d41eed7`. Skip it. The form has username, password, Create account, and Sign in. The hint says the password is at least 8 characters.
U3 is on `main` at `c0c2f02`. Skip it. Create account calls `POST /register`, then `POST /login`. The token is stored in `localStorage` under `hackathon-empire-token`.
U4 is on `main` at `8b9910c`. Skip it. Sign in calls `POST /login`. Sign out removes the token and the cars, trails, and fare markers.
U5 is on `main` at `3cbde90`. Skip it. While signed in, `GET /v1/empire` is called with `Authorization: Bearer` about every 2 seconds.
U6. The marker glides with `route`, `leg_started`, `duration_s`, and `server_now`. It does not jump only when a poll arrives.
U7. A fading trail is drawn from `trail` in that car's colour, the same idea as the bus trail. Hide taxis removes it.
U8. Each waiting fare is a marker with the name and the word `waiting`. It leaves when the feed drops it.
U9. The tooltip says collecting, the passenger name while aboard, returning, or `at depot`. It does not say `device`.
U10. Hide taxis removes only this account's chips, trails, and fare markers. Phones and buses stay.
U11. A click on a taxi or a fare marker does not add a waypoint.
U12. The sample car still has its own button. It is not T1.
U13. The status line says the fleet runs on the box. If `osrm_unavailable` is true, it also says `OSRM unavailable`.
U14. A `401` clears the token and shows the form again.
U15. On `https://hackathon.tyneside.software/app/` the empire status tells the person to open `http://100.65.94.5/app/` because that page cannot call the API.
U16. After the player pans or zooms, the map does not jump back.
U17. Once signed in, the form is hidden and the status line shows the username.
U18. A failed create or sign-in shows the error from the API and does not store a token.
U19. Before the first successful poll, the page does not draw stand-in cars.
U20. Each trail point fades with its age and is dropped after `trail_s`.
U21. A car `at_depot` sits on the Shiremoor depot. The tooltip says `at depot`.
U22. The chip colour is the feed colour. T1 is `#f5b942`, T2 is `#38bdf8`, and T3 is `#4ade80`.
U23. A waiting fare uses the lilac chip. The text is the passenger name plus `waiting`.
U24. A poll that fails for a reason other than 401 leaves the last cars on the map. The status says the feed is quiet.
U25. Sign out is a button in the empire block. It is not the Hide taxis button. It removes the token, the cars, the trails, and the fare markers, and shows the form.
U26. The account form does not cover the sample-car button. The sample car stays off until that button is pressed.
U27. Hide taxis does not remove the token. Sign out does not change the Hide taxis control.
U28. The glide uses `server_now` against the browser clock, so a late poll does not jump the car backwards.
U29. The empire block does not show 2860, 1130, 1240, −1120, or 800000.
U30. When the token is present and `cars` has not arrived, the status says the fleet is loading.
U31. The cache query on `map.js` and `map.css` changes with this client, so a refresh loads the new files.
U32. Phones and buses still load for a signed-in player. Do not stop while U6 to U32 remain.

## Product owner

No product code. You may commit and squash-merge a branch that changes only `docs/radio/po.md`.

Done, already on `main`: issues 30, 31, 32, 33, and 34 are open. Issues 23 and 24 are commented. Issues 22, 29, and 34 stay `blocked`. Do not open those titles again.

You own short-term priority. The integrator directs. You design and you communicate, and you should be busy for the whole continue. A turn is about 30 minutes. One issue is not a turn.

On this continue, read `## Game page` and `## Now`. You do not wait for Master. Master talks to the integrator. You own the short-term plan inside that order. The order is still the ten-taxi game on `play.html`. Issues #699 through #786 stay paused. Do not open more of them.

You feed grok-dev-1, grok-dev-2, and yourself. If either dev queue has fewer than 16 unfinished slices, or the reservoir has fewer than 24, filling them is the turn. At `389ecee` both queues were short and the reservoir had 10. Design the next `play.html` slices, open the issue, merge the radio, and write the next, for about 30 minutes. Read the dev radios and the commit times. If a dev stopped after a slice or two, say the turn was short and leave enough slices for half an hour. Leave `## Next for me` with at least four jobs. If that heading would be empty, you are finishing early.

Then spend the turn designing the 10-car game on `play.html`. Write `### grok-dev-1`, `### grok-dev-2`, and `## Reservoir` again, all for that game. At least 16 unfinished slices for each dev, and 24 in the reservoir. One dev owns the API fleet of 10 and the money on `GET /v1/empire`. The other owns `play.html` and its script. Name the next slice, the files, and that the turn runs about 30 minutes. One issue, then the radio, then the next issue. Do not stop after one issue.

Leave yourself work. End the radio with `## Next for me` and at least four jobs you will do on the next continue: check the dev turn lengths, top up whichever queue is short, write the next slices, and tell the devs. If `## Next for me` would be empty, you are finishing early. Write more before you stop.

Titles 1 to 64 are already opened except 17, 18, and 19. Do not reopen them. Do not add `ready`. Do not write `queue low`. Map titles M1 to M32 and slices 115 to 134 wait. Do not open them. The integrator will not write these slices for you. Map clicks on the box do not add a waypoint unless Place stops is on. That shipped in `ff1e142`. Do not redo it.

Waiting. The numbered list below is the old office queue. Do not open it. Issues 219 to 255 already cover slices 32 to 48. Issues 312 and 263 already exist, so do not open `Receipt names tariff one` or `Two cars move at the same time` again.

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
50. Do not write `queue low`. Slices 115 to 134 are still unopened. Name the next unopened title in `docs/radio/po.md`.
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
77. `Next fare countdown on the empire page`
78. `The car at the depot takes the oldest fare`
79. `Two cars move at the same time`
80. `Completed row shows ten pounds forty`
81. `Generator never returns Berwick`
82. `Simulated data stays on screen while fares arrive`
83. Slices 77 to 82 are open, through #270. `Real data banner on the office desk` already exists as #219. Do not open those titles again.
84. `Help line repeats both flag falls`
85. `Offered night booking stays out of the company total`
86. `Sunday quote uses tariff two`
87. `Company day shown as twenty-eight pounds sixty`
88. `Clearing the book brings back the empty sentence`
89. `Guide dog does not change eleven pounds thirty`
90. Comment on issues 84 to 89 once they exist. Quote 240, 315, 1620, 1240, 2860, and 1130. Do not add `ready`.
91. `Cash or account on the shared row`
92. `Soiling day sits in the ledger panel`
93. `Cancelled mile leaves 2370`
94. Comment on issues 91 to 93 once they exist. Quote 1130, 12500, and 2370. Do not add `ready`.
95. `Receipt names tariff one`
96. `27 December quote uses tariff two`
97. `Accepting a fare leaves two waiting`
98. `A returning car does not take a fare`
99. `The free car takes the oldest of three`
100. `Each car shows its own seconds`
101. `Night clock stays tariff two after restore`
102. `Animal row shows 790`
103. `No car at the depot`
104. `Returning car arrives at the depot pin`
105. Comment on issues 101 to 104 once they exist. Quote 1240, 790, and −1120. Do not add `ready`.
106. `Guide dog stays free beside the animal row`
107. `Phones and buses stay while a car drives home`
108. `Pram and bag stays off the company day`
109. `Drive home shows seconds remaining`
110. `1 January quote uses tariff one`
111. `Soiling shows a meter of zero`
112. `Oldest offer is listed first`
113. `Accepted row shows call sign T2`
114. Comment on issues 110 to 113 once they exist. Quote 1240, 1040, 12500, and −1120. Do not add `ready`.
115. `Empty day shows no bookings yet`
116. `1620 stays beside the full day`
117. `Two fares waiting is not three`
118. `Completed trip shows one fare line`
119. `Quote names the tariff beside the pence`
120. `Returning row becomes at depot`
121. Comment on issues 115 to 120 once they exist. Quote 2860, 0, 1620, 1040, 1240, and −1120. Do not add `ready`.
122. `Banner stays Real data on the empty day`
123. `Fuel line shows minus 60 once`
124. `Checked day still shows minus 140`
125. `Offer rows stay in age order after one is accepted`
126. Comment on issues 122 to 125 once they exist. Quote `Real data`, −60, −140, and −1120. Do not add `ready`.
127. `27 December quotes 1240`
128. `Soiling day stays beside 2860`
129. `T2 takes the fare when T1 is out`
130. `Completed row shows 1040 in pounds`
131. `Empty day hides the full day`
132. `Cash marking stays 1130`
133. `Tuesday at 15:00 names tariff one`
134. Comment on issues 127 to 133 once they exist. Quote 1240, 1040, 1130, 12500, 2860, and −1120. Do not add `ready`.

Map titles. Open these. Do not open 115 to 134 while these remain.

M1. `Three taxis drive on the map`
M2. `Passenger pin says waiting`
M3. `Passenger name while aboard`
M4. `Returning until the depot`
M5. `New passenger after four seconds`
M6. `Three taxis on different streets`
M7. `OSRM unavailable still moves the taxi`
M8. `Phones and buses stay when taxis hide`
M9. `Taxis are not devices`
M10. `Route line uses the taxi colour`
M11. `One real second is one game second`
M12. `Circle and depot stay while taxis drive`
M13. `Sidebar lists T1 T2 and T3`
M14. `A click on a taxi does not add a waypoint`
M15. `The sample car is not T1`
M16. `The map does not jump after the player pans`
M17. `The taxi chip shows the call sign`
M18. `T1 is amber and T2 is blue and T3 is green`
M19. `A taxi waits four seconds at the depot`
M20. `The three taxis do not leave on the same second`
M21. `Passenger names cycle through Mina Owen Priya Jack Helen and Tom`
M22. `Hide taxis changes the button to Show taxis`
M23. `The Shiremoor depot marker stays while a taxi is out`
M24. `The status line names the taxi and the passenger`
M25. `A taxi does not write a row into devices`
M26. `Phones still load when taxis are hidden`
M27. `Buses still load when taxis are shown`
M28. `The sample button still says Drive to the Monument and back`
M29. `The route line stays until the taxi is home`
M30. `The passenger pin is not a phone marker`
M31. `Zooming the map does not restart the three taxis`
M32. `The fleet keeps driving after the sample car is sent out`

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

A1 to A32 are on `main`. Skip them. You are not API-only. On `continue`, do the `### grok-dev-1` queue in `docs/radio/po.md` for about 30 minutes. One slice is one pull request, then the radio, then the next slice. Do not put the queue in one pull request. Do not write that the heading is clear. If that queue is not on `main` yet, say `queue empty` and pull once more. Do not invent slices. Checkout `C:\Users\MichaelThomson\source\lanes\grok-dev-1\hackathon-api` for API work, and the site checkout beside it when the product owner assigns site files. Branch `lane/grok-dev-1/<slug>` from `origin/main`. Do not run `box.ps1`. Do not wipe SQLite. No `device_id`. Do not edit a file the other dev's radio says they are editing.

Stop the fare cards. F1 to F30 are done. Office slices 45 to 60 wait. Do not start them. Pull request 26 is merged as `fa3b6e3`.

Waiting. The fare cards and the office list below are not work. Do not edit those files for this wave.

Waiting, office desk only. Do not rewrite the locked results: 490, 1040, 615, 1240, 1130, 265, 2370, 2860, and 12500. Money is integer pence. `py -3 scripts\taxi_fare_check.py` must print `FARE-OK` before each merge of an office slice. The company ledger is not the game ledger. No driver share, no fuel, no standing, and no new-car cost on this desk. That desk makes no API call. The account fleet above does, in the API repo.

Done, on `fa3b6e3`: the office desk, the £11.30 and £12.40 rows, the mixed button at 265, the company day at 2860, the cancelled mile at 2370, the empty hiring at 0, and soiling-only at 12500. Open slices 1 to 44 are also on `main`, through the animal row at 790 at `dcc53b1`. Office slices 45 to 60 wait. Do not start them. Do not edit `app/map.js`, `app/map.css`, or `app/index.html`.

Fare card for the map fleet. `FARE-OK` before each merge. Do not invent a second tariff.

F1 is on `main` at `1582946`. Skip it. F1. In `docs/taxi-fares.md`, state that a map taxi asks `quote_pence` and does not keep a second tariff. 3 miles, no waiting, tariff one, no extras, stays 1040. 1 mile stays 490.
F2, F3, and F4 are already recorded on `main`. Skip them.
F2. The checker still fails if 1 mile on tariff one is not 490.
F3. The checker still fails if 3 miles on tariff one, no waiting, no extras, is not 1040.
F4. The checker still fails if 3 miles on tariff two, no waiting, no extras, is not 1240.
F5. A guide or hearing dog still adds 0.
F6. Tariff one, 1 mile, one animal, no soiling, stays 790.
F7. The tariff one flag fall stays 240 and the tariff two flag fall stays 315.
F8. Soiling with no meter stays 12500.
F9. The company day stays 2860. It is not the game day.
F10. The empty company day stays 0.
F11. The office desk still does not show −1120, driver share, fuel, or standing.
F12. `docs/taxi-fares.md` names the map fleet and says the cars are not devices. `FARE-OK`.
F13. Exact 322.6 yards on tariff one stays 265. `FARE-OK`.
F14. The £11.30 hiring stays meter 1040 plus extras 90. `FARE-OK`.
F15. Tariff two, 1 mile, no waiting, no extras, stays 615. `FARE-OK`.
F16. Sunday at 15:00, 3 miles, no waiting, no extras, stays 1240. Tuesday at 15:00 stays 1040. `FARE-OK`.
F17. 30 December at 15:00, 3 miles, no waiting, no extras, stays 1240. 1 January at the same clock stays 1040. `FARE-OK`.
F18. 27 December at 15:00 stays 1240. 26 December at the same clock stays 1040. `FARE-OK`.
F19. Tariff one, 1 mile, one pram and one outside bag, stays 580. `FARE-OK`.
F20. 161.3 yards in 20 seconds, then a wait of 46.8 seconds, stays 265. It does not become 290. `FARE-OK`.
F21. Tariff two at 0 yards and 45 seconds stays 315. `FARE-OK`.
F22. Exact 161.3 yards on tariff one stays 240. Exact 140.5 yards on tariff two stays 315. `FARE-OK`.
F23. Cash or account does not change the £11.30 hiring. It stays 1130. `FARE-OK`.
F24. Cancelling the 490 leaves the company day at 2370. The full day stays 2860. `FARE-OK`.
F25. An empty hiring quotes 0. `FARE-OK`.
F26. Seven company days stay 20020. That week is not the game week. `FARE-OK`.
F27. Alex's two fares stay 1620. Sam's night fare stays 1240. The day stays 2860. `FARE-OK`.
F28. A guide or hearing dog on the £11.30 row keeps that row at 1130. `FARE-OK`.
F29. 22:00 and 06:59 are tariff two. 07:00 and 21:59 are tariff one. `FARE-OK`.
F30. The office does not show −7840 or −807840. `FARE-OK`.

Waiting. Office list. Do not start these.

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
32. Restored help. After the browser book is restored, the help line still states the tariff one flag fall of 240 pence and the tariff two flag fall of 315 pence. The total stays 2860. It does not change a quote. `FARE-OK`.
33. Offered money stays out. The £12.40 row can sit at `offered`. The row shows £12.40. The ledger includes only completed rows, so Alex's 1130 and 490 sum to 1620 until that night booking is completed. Completing it makes the day 2860. `FARE-OK`.
34. Sunday quote. Sunday at `15:00`, 3 miles, no waiting, no extras, quotes 1240. The same clock with Sunday cleared quotes 1040. `FARE-OK`.
35. Pounds beside the day. The ledger shows the full day as 2860 and as £28.60. The empty day shows 0 and £0.00. Switching days does not add them. `FARE-OK`.
36. Clear brings the sentence back. Clearing the book removes the rows, the bookings panel says `No bookings yet.`, and the total is 0. Restore brings the three bookings back and shows 2860. `FARE-OK`.
37. Guide dog. On the £11.30 booking, a guide or hearing dog adds 0. The row stays 1130. `FARE-OK`.
38. Cash or account on the shared row. The £11.30 row can read `cash` or `account`. The pence stays 1130. The ledger does not gain a line. `FARE-OK`.
39. Soiling day in the ledger. The soiling-only total of 12500 is labelled `soiling-day` inside the ledger panel. The 2860 day stays available beside it. `FARE-OK`.
40. Cancelled mile on the desk. Cancelling the 490 pence mile from the 2860 day leaves 2370. The 2860 day can be selected again. `FARE-OK`.
41. Receipt names the tariff. The plain-text slip says `tariff one` and still contains `1130` and `£11.30`. It does not contain `driver_share`, `standing`, or `800000`. `FARE-OK`.
42. December quote. 27 December at `15:00`, 3 miles, no waiting, no extras, quotes 1240. 26 December at the same clock quotes 1040. `FARE-OK`.
43. Night clock after restore. After the browser book is restored, a requested time of `22:00` on the £12.40 row still selects tariff two. The pence stays 1240. The 2860 day stays available. `FARE-OK`.
44. Animal row. Tariff one, 1 mile, no waiting, one animal, no soiling, shows 790 on its own row. The 2860 day stays available. `FARE-OK`.
45. Guide dog beside it. A guide or hearing dog on its own row adds 0. The animal row stays 790. Neither changes the 2860 day. `FARE-OK`.
46. Pram and bag beside the day. The 580 row is its own booking. The company day stays 2860. `FARE-OK`.
47. New year quote. 30 December at `15:00`, 3 miles, no waiting, no extras, quotes 1240. 1 January at the same clock quotes 1040. `FARE-OK`.
48. Soiling meter. A hiring with soiling, no miles, and no waiting shows meter 0 and total 12500. The 2860 day stays available. `FARE-OK`.
49. Empty sentence. Selecting the empty day shows `No bookings yet.` Selecting the 2860 day shows the rows and 2860. Both are not on screen together. `FARE-OK`.
50. Beside the full day. The 1620 control and the 2860 control do not add. Each shows its own total. `FARE-OK`.
51. Tariff name. Tuesday at `15:00`, 3 miles, no waiting, no extras, shows tariff one and 1040. The same trip at `22:00` shows tariff two and 1240. `FARE-OK`.
52. Banner on the empty day. Selecting the empty day keeps `Real data` and shows 0. Selecting the 2860 day keeps `Real data` and shows 2860. `FARE-OK`.
53. Soiling pounds. The soiling day shows 12500 and £125.00. The 2860 day stays 2860 and £28.60. Switching does not add them. `FARE-OK`.
54. Cancelled-mile receipt. The 2370 day is available. Its slip does not contain `driver_share`, `standing`, or `800000`. `FARE-OK`.
55. Empty after cancel. When the only row was the cancelled 490 pence mile, the bookings panel says `No bookings yet.` and the total is 0. The 2860 day can be selected again. `FARE-OK`.
56. Pram pounds. The 580 row shows £5.80. The company day stays 2860. `FARE-OK`.
57. Animal pounds. The 790 row shows £7.90. The 2860 day stays 2860 and £28.60. Switching does not add them. `FARE-OK`.
58. Guide-dog pounds. A guide or hearing dog on its own row adds 0 and shows £0.00. The animal row stays £7.90. Neither changes the 2860 day. `FARE-OK`.
59. Cancelled-mile pounds. The 2370 day shows £23.70. The 2860 day stays £28.60. Switching does not add them. `FARE-OK`.
60. Sunday after restore. After the browser book is restored, Sunday at 15:00, 3 miles, no waiting, no extras, quotes 1240. Clearing Sunday quotes 1040. The 2860 day stays available. `FARE-OK`.

Reservoir. Do not start these.

1. A Tuesday at `15:00` on the restored day still shows tariff one and does not change 2860.

## grok-dev-2

Open slices. U18 to U32, then the `### grok-dev-2` queue in `docs/radio/po.md`. U1 to U17 are on `main`. The signed-in form is `714303e`. Skip those. About 30 minutes. Do not stop at U32 if `po.md` lists more. You are not map-only. Checkout `C:\Users\MichaelThomson\source\lanes\grok-dev-2\hackathon-site`. Branch `lane/grok-dev-2/<slug>` from `origin/main`. For U18 to U32, edit `app/map.js`, `app/map.css`, and the Empire block in `app/index.html`. Call `POST /register`, `POST /login`, and `GET /v1/empire`. When `po.md` assigns API work, do that instead. Do not edit a file the other dev is on. Do not edit the office files, `scripts/taxi_fare.py`, or `app/office.css`. Do not bring back a browser-only fleet as the source of truth. The sample car button stays. Do not run `box.ps1`.

Desk slices 45 to 58, slices 11 to 23, and map titles M1 to M32 wait. Do not start them. A radio that names M6 or M8 is stale as an order. The game runs on the box per account. The browser must not invent the cars.

Waiting. The map list and the desk list below are not work. Pull request 25 is merged as `e4a2c1c`. Open slices 1 to 10 of that old desk are on `main`. Skip them.

Waiting. Map titles M1 to M32. Do not start these. M1 to M7 and U1 are already on `main`. U1 replaced the auto-start fleet.

M1. Three taxis drive on the map. T1, T2, and T3 leave the Shiremoor depot, collect a virtual passenger, drive the street geometry, and return. This is on `main` in this pass. Skip it if the map already shows the three chips.
M2 is on `main` at `58697ba`. Skip it. M2. The passenger pin shows the passenger's name and the word `waiting`. The pin leaves when that taxi arrives.
M3 is on `main` at `35501ac`. Skip it. M3. While the status is `with_passenger`, the tooltip names the passenger.
M4. After the drop-off the status is `returning` until the depot pin. Then it is `at depot`.
M5. A new passenger appears 4 seconds after the taxi is back at the depot.
M6. T1, T2, and T3 are on different streets at the same time. None of them is a device.
M7. When OSRM does not answer, the taxi still moves in a straight line at 30 miles per hour and the status says `OSRM unavailable`.
M8. Hiding taxis removes the three chips, their lines, and their passenger pins. Phones and buses stay.
M9. The tooltip does not say `device`. Game rows are still not written into `devices`.
M10. Each taxi's route line uses that taxi's own colour.
M11. One real second is one game second. With no OSRM duration, 3 miles take 360 seconds.
M12. The 50-mile circle and the Shiremoor depot stay on the map while the taxis drive.
M13. The sidebar lists T1, T2, and T3 with the passenger name, or `at depot`.
M14. Clicking a taxi or a passenger pin does not add a waypoint.
M15. The sample car stays separate. It is not T1. Both may be on the map.
M16. After the player pans or zooms, the map does not jump back to the fleet. One real second is one game second. `scripts/taxi_day_check.py` must still print `DAY-OK`, and it must also print `TIME-OK`. Do not edit `app/office.css` or `scripts/taxi_fare.py`. The page may load `app/taxi-fare.js`. A live offer must not change the checked day of −1120.
M17. The taxi chip shows `T1`, `T2`, or `T3`.
M18. T1 is amber, T2 is blue, and T3 is green.
M19. A taxi waits 4 seconds at the depot before the next passenger.
M20. The three taxis do not leave on the same second.
M21. The passenger names cycle through Mina, Owen, Priya, Jack, Helen, and Tom.
M22. Hide taxis changes the button to `Show taxis`. Show taxis brings the three cars back. Phones and buses stay either way.
M23. The Shiremoor depot marker stays while a taxi is out.
M24. The status line names the taxi and the passenger.
M25. A taxi does not write a row into `devices`.
M26. Phones still load when taxis are hidden.
M27. Buses still load when taxis are shown.
M28. The sample button still says `Drive to the Monument and back`. The sample car is not T1.
M29. The route line stays on the map until the taxi is home.
M30. The passenger pin is not a phone marker.
M31. Zooming the map does not restart the three taxis.
M32. The fleet keeps driving after the sample car is sent out. `DAY-OK` and `TIME-OK`.

Waiting. Desk list. Do not start these. Use the coordinates already in `scripts/taxi_geo_check.py`. Do not invent a new town.

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
39. Countdown label. The page shows `Next fare in` and the seconds left. At 0 the offer appears and the count starts again from 20 unless 3 offers are already waiting. `TIME-OK`.
40. The free car takes it. A car `at_depot` accepts the oldest offer. If `T1` is already on a route, `T2` takes the next one. Neither car is a device. `TIME-OK`.
41. Two cars out. Two accepted offers move `T1` and `T2` at the same time. The third car can stay `at_depot`. `DAY-OK` still requires −1120 for the checked day.
42. Fare on the row. The completed row shows the tariff fare in pounds. Three miles, no waiting, tariff one, no extras, shows £10.40. Posting it twice does not add a second fare line.
43. Berwick stays out. The generator must not return `55.7704, -2.0068`. A point that far out is discarded. `GEO-OK`.
44. Simulated banner stays. While offers arrive, the page still shows `Simulated data`. It does not show 2860, 1130, or 1240.
45. Accept drops the count. With 3 offers waiting, accepting one makes the page say `2 fares waiting`. The next offer still waits 20 seconds. `TIME-OK`.
46. Returning stays out. A car whose status is `returning` does not take a new offer. The offer stays `offered` until a car is `at_depot`. `TIME-OK`.
47. Oldest of three. A free car takes the oldest of three offers. The other two stay `offered`. Neither car is a device. `TIME-OK`.
48. Own seconds. The tooltip on `T2` shows `T2`'s seconds remaining, not `T1`'s. Halfway through `T2`'s 600 second route it shows 300. `TIME-OK`.
49. Depot empty. When `T1`, `T2`, and `T3` are all away from `at_depot`, the page says `No car at the depot`. Offers stay `offered`. None of the cars is a device. `TIME-OK`.
50. Home arrival. When a `returning` car reaches the depot pin, its status becomes `at_depot` and the page stops showing seconds remaining for that car. The checked day stays −1120. `TIME-OK`.
51. Map stays shared. While a car drives home, phones and buses stay on the map. The car is not a device. The checked day stays −1120. `DAY-OK`.
52. Seconds on the way home. While the car is `returning`, the booking row shows the seconds remaining. At the start of a 600 second return it shows 600. Halfway it shows 300. `TIME-OK`.
53. Oldest first. When three offers are waiting, the first row is the oldest. Accepting it leaves the other two in age order. `TIME-OK`.
54. Call sign on the accepted row. The row `T2` accepts shows call sign `T2`. `T1` can be out at the same time. Neither car is a device. `TIME-OK`.
55. Two waiting. With two offers open the page says `2 fares waiting`. It does not say `3 fares waiting`. `TIME-OK`.
56. One fare line. A completed 3 mile tariff-one trip shows one fare line of 1040. Posting twice does not add a second fare line. The checked day stays −1120. `TIME-OK`.
57. Returning label. The row says `returning` on the way home and `at_depot` on arrival. `TIME-OK`.
58. Fuel on the ledger. A 3 mile live trip shows one fuel line of −60. The checked day still shows −140. A second completion does not add another −60. `TIME-OK`.

Reservoir. Do not start these.

1. Game drivers Jamie and Alex. Alex runs `T1`. Jamie has no share until a fare. The one-car day stays −1120.
3. Cancel after 4 miles driven: fuel −80 and no fare. The miles are given by this slice, not by OSRM.
4. A day with one car and no job is standing −1500 only.
5. A new car and a new driver on the same day: −800000 and 0. The new car cannot start.
6. The empire page lists the seven −1120 lines as well as the total.
7. Watcher and owner stories stay on the model page. Do not migrate `device_links`.

## Integrator

On `continue`, read the radios. Direct the product owner. Do not write the slice text. Master gives direction here. The product owner and the devs then work on their own: the product owner keeps both queues and `## Next for me` full, and the devs build for about 30 minutes. They do not wait for a new note before the next slice. If a turn was short, say so in `## Now` and leave the refill to the product owner. Deploy only after product code has merged. A radio-only commit is not a deploy. Do not deploy this note by itself.

Last deploy checked in this note: box site `ff1e142`, health `0.1.27`, `CHECK-OK`. The board was 50 cards. Map clicks do not add a waypoint unless Place stops is on.
