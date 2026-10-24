"""Print DAY-OK when the worked day matches the page."""

import sys

import taxi_game


def has_device_id(value):
    if isinstance(value, dict):
        if "device_id" in value:
            return True
        return any(has_device_id(item) for item in value.values())
    if isinstance(value, (list, tuple)):
        return any(has_device_id(item) for item in value)
    return False


def main():
    if taxi_game.dropoff_lines(taxi_game.BERWICK) != []:
        print("Berwick wrote lines", file=sys.stderr)
        return 1
    if not taxi_game.dropoff_offered(taxi_game.HEXHAM):
        print("Hexham was not offered", file=sys.stderr)
        return 1
    if taxi_game.dropoff_lines(taxi_game.HEXHAM) != []:
        print("Hexham was given a fare", file=sys.stderr)
        return 1
    if taxi_game.WORKED_FARE_PENCE != 1040:
        print("fare is not the given 1040", file=sys.stderr)
        return 1
    jamie = taxi_game.new_driver("Jamie")
    if jamie["name"] != "Jamie" or jamie["cost_pence"] != 0:
        print(f"Jamie cost {jamie}", file=sys.stderr)
        return 1
    if taxi_game.sum_pence(taxi_game.day_with_driver("Jamie")) != -1120:
        print("Jamie changed the day", file=sys.stderr)
        return 1
    if taxi_game.NEW_DRIVER_PENCE != 0:
        print("a new driver is not 0", file=sys.stderr)
        return 1
    rows = taxi_game.worked_day()
    amounts = [(row["kind"], row["amount_pence"]) for row in rows]
    expect = [
        ("standing", -1500),
        ("fare_in", 1040),
        ("driver_share", -520),
        ("fuel", -140),
    ]
    if amounts != expect or taxi_game.sum_pence(rows) != -1120:
        print(f"worked day {amounts} sum {taxi_game.sum_pence(rows)}", file=sys.stderr)
        return 1
    if taxi_game.cancel_before() != []:
        print("cancel before wrote lines", file=sys.stderr)
        return 1
    after = taxi_game.cancel_after_one_mile()
    if [(row["kind"], row["amount_pence"]) for row in after] != [("fuel", -20)]:
        print(f"cancel after {after}", file=sys.stderr)
        return 1
    if taxi_game.cancel_after_zero_miles() != []:
        print("zero miles wrote lines", file=sys.stderr)
        return 1
    if any(row["kind"] == "fare_in" for row in after):
        print("cancel after wrote a fare", file=sys.stderr)
        return 1
    bought = taxi_game.second_car()
    car_lines = [(row["kind"], row["amount_pence"]) for row in bought["lines"]]
    if car_lines != [("new_car", -800000)]:
        print(f"second car {car_lines}", file=sys.stderr)
        return 1
    if "device_id" in bought["taxi"] or has_device_id(rows) or has_device_id(after) or has_device_id(bought):
        print("a game row has a device_id", file=sys.stderr)
        return 1
    print("DAY-OK")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
