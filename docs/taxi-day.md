# One empire day

One worked day at the Shiremoor depot. The player already owns the car, so the 800000 pence purchase is not a line on this day. The miles in this example are for this page only. They are not a new rule.

The fare is the brief's checked figure, tariff one for 3 miles, £10.40. This page does not calculate a different one. The tariff is in [Tracker, office, and game](#taxi). The ledger kinds are in [Game store](#taxi-game).

| Line | Pence |
|------|-------|
| Standing for the one car | −1500 |
| Fare in, tariff one, 3 miles, the brief's £10.40 | +1040 |
| Driver share, half of that fare | −520 |
| Fuel, 2 miles empty to the pickup, 3 miles with the passenger, 2 miles empty home, 7 × 20 | −140 |
| Sum | −1120 |

Standing is 1500 pence for the one car. The fare in is 1040 pence. The driver's share is half of that fare, 520 pence, paid out of it. The fuel is the seven miles in this example at 20 pence a mile, 140 pence. Those four lines sum to −1120 pence.

## Other cases

These cases are not lines on the worked day above. They do not change the sum of −1120.

Cancel before the car starts: no `fare_in` line and no `fuel` line.

Cancel after 1 mile: a `fuel` line of −20 pence, and no fare. That is this one mile at 20 pence. There is no `fare_in` line.

A second car is a `new_car` line of −800000 pence, then a `game_taxis` row. It is never a row in `devices`. It cannot leave the depot until that line is paid.

Issue 28 is One empire day at Shiremoor: https://github.com/Tyneside-Software/hackathon-site/issues/28

## Checkers

The worked day still sums to −1120. `scripts/taxi_day_check.py` prints `DAY-OK` and `TIME-OK`. One real second is one game second. Ten real seconds are 10. There is no multiplier. Seven identical days are `scripts/taxi_week_check.py`, which prints `WEEK-OK` and sums to −7840. `scripts/taxi_geo_check.py` prints `GEO-OK`.

The map shows the circle and the Shiremoor depot. The sample car is not a device. Its drawn path does not reprice this day.
