# Game store

The empire game's tables. This page is the store, not a migration. It does not change `app/models.py` and it does not write to the live database. The brief is [Tracker, office, and game](#taxi).

No game table has a `device_id` column. A game tick must not insert into `devices`, `location_pings`, or `device_links`. A phone ping must not insert a game row. Game markers are not phone markers. See [Tracker model](#taxi-model).

## Tables

These tables and no others.

| Table | Columns |
|-------|---------|
| `game_drivers` | `id`, `name` |
| `game_taxis` | `id`, `call_sign`, `driver_id`, `status`, `lat`, `lng` |
| `game_jobs` | `id`, `taxi_id`, `pickup_lat`, `pickup_lng`, `dropoff_lat`, `dropoff_lng`, `status`, `quoted_fare_pence`, `miles_driven` |
| `game_ledger` | `id`, `game_day`, `kind`, `amount_pence`, `job_id`, `taxi_id` |

`driver_id` is a `game_drivers.id`. `game_jobs.taxi_id` is a `game_taxis.id`. On a ledger line, `job_id` is the `game_jobs.id` when the line belongs to a job, and `taxi_id` is the `game_taxis.id` when the line belongs to a car.

`game_taxis.status` is `at_depot`, `offered`, `accepted`, `started`, or `returning`.

`game_jobs.status` is `offered`, `accepted`, `started`, `completed`, or `cancelled`.

`game_ledger.kind` is `fare_in`, `driver_share`, `fuel`, `standing`, or `new_car`. `amount_pence` is an integer number of pence.

## Settings

Constants on this page. Not a change to the live database. Money is integer pence.

| Setting | Value |
|---------|-------|
| Driver share | Half the fare, paid out of that fare |
| Fuel | 20 pence a mile, including the empty return to the depot |
| Standing | 1500 pence a car at the start of each game day |
| New car | 800000 pence before it can leave the depot |
| New driver | 0 |
| Circle centre | `54.9783, -1.6178` |
| Radius | 50 miles |
| Depot | `55.0367, -1.5075` |

`quoted_fare_pence` is the November 2024 North Tyneside tariff from the brief, stored in pence. This page does not restate that table.

## Jobs

A job that starts or ends outside the circle is not offered.

Cancel before the car has started: no fare and no fuel. That is no `fare_in` line and no `fuel` line.

Cancel after it has started: fuel for the miles already driven, and no fare. `miles_driven` is those miles. There is no `fare_in` line.

## Not in this change

- No new SQLite tables on the box, and no write to the live database.
- No edit to `app/models.py`, `docs/TAXI.md`, or `app/map.js`.
- No `device_id` on a game table.

## Checkers and the map

`scripts/taxi_geo.py` is the circle. `scripts/taxi_geo_check.py` prints `GEO-OK` when the centre is `54.9783, -1.6178`, the radius is 80.467 km, and a job that starts or ends outside is refused.

`scripts/taxi_game.py` is the ledger. `scripts/taxi_day_check.py` prints `DAY-OK`. `scripts/taxi_week_check.py` prints `WEEK-OK` for seven worked days.

The map draws a circle of 80467 metres around that centre and a marker labelled Shiremoor depot. One sample car starts at the depot. It is not a device. A control asks public OSRM for the drive to Grey's Monument and back. If OSRM does not answer, the map draws the straight line and shows `OSRM unavailable`. That path does not change the ledger.
