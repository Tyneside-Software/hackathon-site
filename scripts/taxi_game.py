"""Integer-pence ledger for the empire game.

The worked fare is 1040 pence. This module does not calculate a different fare.
A taxi record never has a device_id.
"""

STANDING_PENCE = 1500
FUEL_PENCE_A_MILE = 20
NEW_CAR_PENCE = 800000
NEW_DRIVER_PENCE = 0
WORKED_FARE_PENCE = 1040
WORKED_MILES = 7
DEPOT = (55.0367, -1.5075)
MONUMENT = (54.9783, -1.6178)
BERWICK = (55.7704, -2.0068)
HEXHAM = (54.9716, -2.1015)


def line(kind, amount_pence, game_day=1, job_id=None, taxi_id=None):
    row = {
        "game_day": game_day,
        "kind": kind,
        "amount_pence": int(amount_pence),
    }
    if job_id is not None:
        row["job_id"] = job_id
    if taxi_id is not None:
        row["taxi_id"] = taxi_id
    return row


def sum_pence(rows):
    return sum(row["amount_pence"] for row in rows)


def worked_day(game_day=1):
    fare = WORKED_FARE_PENCE
    return [
        line("standing", -STANDING_PENCE, game_day, taxi_id=1),
        line("fare_in", fare, game_day, job_id=1, taxi_id=1),
        line("driver_share", -(fare // 2), game_day, job_id=1, taxi_id=1),
        line("fuel", -(WORKED_MILES * FUEL_PENCE_A_MILE), game_day, job_id=1, taxi_id=1),
    ]


def dropoff_offered(point):
    import taxi_geo
    return not taxi_geo.job_refused(MONUMENT, point)


def dropoff_lines(point):
    """An outside drop-off is not a job. An inside drop-off has no fare of its own."""
    if not dropoff_offered(point):
        return []
    return []


def cancel_before():
    return []


def cancel_after_one_mile(game_day=1):
    return [line("fuel", -FUEL_PENCE_A_MILE, game_day, job_id=1, taxi_id=1)]


def worked_week():
    """Seven identical worked days. The second car is not bought."""
    rows = []
    for game_day in range(1, 8):
        rows.extend(worked_day(game_day))
    return rows


def unpaid_second_car():
    return {
        "lines": [],
        "taxi": {
            "id": 2,
            "call_sign": "second",
            "status": "at_depot",
            "lat": DEPOT[0],
            "lng": DEPOT[1],
        },
    }


def start_unpaid_car():
    """No purchase line, so the car cannot leave and there is no fare."""
    return []


def fleet_week():
    """Seven worked days plus the second-car purchase on day 1."""
    rows = [line("new_car", -NEW_CAR_PENCE, game_day=1, taxi_id=2)]
    rows.extend(worked_week())
    return rows


def second_car():
    taxi = {
        "id": 2,
        "call_sign": "second",
        "status": "at_depot",
        "lat": DEPOT[0],
        "lng": DEPOT[1],
    }
    return {
        "lines": [line("new_car", -NEW_CAR_PENCE, taxi_id=taxi["id"])],
        "taxi": taxi,
    }
