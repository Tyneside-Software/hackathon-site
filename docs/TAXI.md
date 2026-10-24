# Tracker, office, and game

Three products, one map, one API, one phone app. This page is the brief. A lane does not invent a second centre, a second depot, or a second fare table.

| Product | Who it is for | What moves |
|---------|---------------|------------|
| Tracker | A person watching things that carry an Android phone | Real devices |
| Booking office | A taxi company we sell the software to | That company's real jobs |
| Empire game | Its own page, `play.html` | Ten simulated taxis and their fares |

The hackathon board stays as it is. This brief does not re-seed it and does not change the live database.

## Map

The play area and the office area are the same circle.

| | Value |
|--|--|
| Centre | Grey's Monument, Newcastle upon Tyne. `54.9783, -1.6178`. This is already the map centre. |
| Radius | 50 miles (80.467 km) from that centre. A job that starts or ends outside the circle is refused. |
| Depot | Shiremoor, North Tyneside. Working pin `55.0367, -1.5075` (about 6 miles north-east of the Monument, inside the circle). The booking office and the fleet's home base are this pin until a street address is chosen. |
| Roads | The map already asks public OSRM for driving geometry. Simulated cars use that, not straight lines, when OSRM answers. |

The east of the circle is the North Sea. Durham, Sunderland, the coast, and Hexham sit inside it. Berwick is outside it.

## Tracker

A device is anything a phone can be fixed to: a child's phone, your own phone, a car, or something else. A person is an account. The link between them is many to many.

Today `device_links` has one row per `device_id`, so one phone belongs to one account. That is the wrong shape. The replacement is a link table with both ids in the key:

| Column | Meaning |
|--------|---------|
| `username` | The account |
| `device_id` | The phone |
| `role` | `owner` or `watcher` |
| `kind` | `phone`, `child`, `car`, or `other` |
| `nickname` | What this person calls it |

One device can have several watchers. One person can watch several devices. Removing one link does not delete the device or its pings. `devices` and `location_pings` stay the store for last-known position and history.

Do not apply this change to the live database in the prep. `android-c55e59830b71ba38` stays. The live board stays. A later issue, after `docs/taxi-model.md` is agreed, does the migration.

The phone app keeps posting `POST /v1/locations`. Who is allowed to see a device is a read rule on `GET /v1/devices`, not a change to the ping. Until that issue lands, the map still shows every device, as it does now.

## Booking office

Software we sell to a taxi company. It is not the game.

A company has a depot, a fleet, drivers, and bookings. A booking has a pickup, a drop-off, a requested time, a quoted fare, a status (`offered`, `accepted`, `started`, `completed`, `cancelled`), and the vehicle that ran it. Money for a real company is that company's ledger. It must not be written into the game ledger, and the game must not write into it.

The first office screen is not in this prep. The fare rule below is the quote.

## Empire game

The player runs a taxi business from the Shiremoor depot. Simulated taxis idle at the depot, accept simulated customers inside the circle, drive the road route, and return. The player spends cash to add a car or a driver, and earns the fare when a job completes.

The game is drawn on its own Leaflet page, `play.html`. Same centre, same circle, same depot. That page does not show phones, buses, or waypoint stops. `app/` stays the ops map for phones, buses, and routes. Simulated vehicles are not rows in `devices`. They live in their own tables so a phone ping cannot appear as a game taxi, and a game taxi cannot appear as a tracked child.

A shift starts with 10 cars at the depot, T1 to T10. Customers appear inside the circle. A free car is offered the job. On accept, the fare is quoted from the tariff, the car drives, and completion adds the fare to the game cash and pays the driver's share out of it. The play page shows that in-game money as it changes. It does not show the company totals. A job outside the circle is not offered.

## Fares

The realistic fare is the North Tyneside hackney carriage tariff that North Tyneside Council says took effect on Monday 11 November 2024. Source: [Taxi ranks and tariffs](https://www.northtyneside.gov.uk/licensing/taxis-and-private-hire/taxi-ranks-and-tariffs). Hackney carriages must use the meter. A private-hire booking office is not legally bound to that meter. We still use this table as the default quote for the office and for the game, so the numbers are a published tariff and not a guess.

An August 2026 proposal asked for about 8 per cent more (a three-mile average they put at £5.52 a mile). That proposal is not on the council's current tariff page. Do not use it.

**Tariff one.** Other times. First 161.3 yards, or 46.8 seconds, £2.40. Each further 161.3 yards, or 46.8 seconds, £0.25.

**Tariff two.** 22:00–07:00, all Sunday, bank holidays, and 27–31 December. First 140.5 yards, or 45 seconds, £3.15. Each further 140.5 yards, or 45 seconds, £0.25.

The meter unit is whichever runs out first, distance or waiting time. Charge the number of units, not both added together.

**Extras, on top.** Soiling the carriage £125. Each passenger after two, £0.50. Each bag carried outside, £0.40. Each animal except a guide or hearing dog, £3. Each bicycle £3. Each pram £0.50. Tolls are passed on at cost.

161.3 yards is 147.49 metres. 140.5 yards is 128.47 metres.

Worked distance-only examples, with no waiting and no extras. `docs/taxi-fares.md` checks these and adds the waiting-time cases. It does not replace this table.

| Journey | Tariff one | Tariff two |
|---------|------------|------------|
| 1 mile (1760 yards) | £4.90 | £6.15 |
| 3 miles (5280 yards) | £10.40 | £12.40 |

Tariff one, 3 miles: the first unit is £2.40 and leaves 5118.7 yards. That is 32 further units at £0.25, so £2.40 + £8.00 = £10.40. Tariff two leaves 5139.5 yards after the first 140.5, which is 37 further units, so £3.15 + £9.25 = £12.40. One mile is the same method: 10 further units on tariff one (£4.90) and 12 further units on tariff two (£6.15).

## Game money

Keep the first ledger small. All of it is game cash, in pence, so the code does not use binary floats for money.

| Line | Rule until a later issue replaces it |
|------|--------------------------------------|
| Fare in | The quote above, when the job completes |
| Driver | Half the fare, paid out of that fare |
| Fuel | £0.20 a mile driven on the job, including the empty return to the depot |
| Standing | £15 a car, taken at the start of each game day |
| New car | £8000, paid before the car can leave the depot |
| New driver | £0 to hire. The driver is paid only the share of fares |

These cost figures are game settings so the empire can run before a full cost study. They are not the council tariff. The tariff page must not change them. A later issue can replace fuel and standing with figures from a cited source.

Cancel before the car has started: no fare, no fuel. Cancel after it has started: fuel for the miles already driven, no fare.

## What is not in this prep

- No change to `device_links`, and no new SQLite tables on the box.
- No edit to `app/map.js` beyond what a later agreed issue allows. The circle and the depot are not drawn yet.
- No mixing of game rows and phone rows.
- No use of the August 2026 fare proposal.
- The September 2026 board issues 1, 2, 3, 4, and 18 stay untouched.

## Issues to open

The product owner opens these on `Tyneside-Software/hackathon-site` and does not implement them. Titles stay as written.

| Title | Labels | Notes |
|-------|--------|-------|
| `Fares worksheet for the North Tyneside tariff` | `in-progress`, `lane:grok-dev-1`, `repo:site` | Page `docs/taxi-fares.md`. Not `ready`. |
| `Many-to-many tracker model` | `in-progress`, `lane:grok-dev-2`, `repo:site` | Page `docs/taxi-model.md`. Not `ready`. |
| `Migrate device links to many-to-many` | `repo:api`, `blocked` | After the model page is agreed. Do not touch the live database until then. |
| `Draw the 50-mile circle and the Shiremoor depot` | `repo:site` | No `ready` label. Blocked on this brief staying the source of the coordinates. |
| `Simulated taxis on the map` | `repo:site`, `repo:api` | No `ready` label. Game rows must not be `devices`. |

If an issue with that title already exists, do not open a second one. Comment with the lane and the pull request, if there is one.
