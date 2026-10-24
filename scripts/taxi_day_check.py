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
    cars = taxi_game.three_cars()
    if [car["call_sign"] for car in cars] != ["T1", "T2", "T3"]:
        print(f"call signs {cars}", file=sys.stderr)
        return 1
    if any("device_id" in car for car in cars):
        print("a car is a device", file=sys.stderr)
        return 1
    three = taxi_game.three_car_day()
    if taxi_game.sum_pence(three) != -4120 or has_device_id(three):
        print(f"three-car day {taxi_game.sum_pence(three)}", file=sys.stderr)
        return 1
    if sum(1 for row in three if row["kind"] == "fare_in") != 1:
        print("more than one car ran the fare", file=sys.stderr)
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
    if taxi_game.elapsed_seconds(0, 10000) != 10:
        print("ten real seconds were not 10", file=sys.stderr)
        return 1
    if taxi_game.elapsed_seconds(5000, 6000) != 1:
        print("the clock multiplied the seconds", file=sys.stderr)
        return 1
    route = ((0.0, 0.0), (0.0, 2.0))
    at_start = taxi_game.position_on_route(route, 600, 0)
    at_end = taxi_game.position_on_route(route, 600, 600)
    halfway = taxi_game.position_on_route(route, 600, 300)
    if at_start != route[0] or at_end != route[-1]:
        print(f"route ends {at_start} {at_end}", file=sys.stderr)
        return 1
    if abs(halfway[0] - 0.0) > 1e-9 or abs(halfway[1] - 1.0) > 1e-6:
        print(f"halfway {halfway}", file=sys.stderr)
        return 1
    if taxi_game.fallback_seconds(3) != 360 or taxi_game.FALLBACK_MPH != 30:
        print(f"fallback {taxi_game.fallback_seconds(3)}", file=sys.stderr)
        return 1
    offers = [(0, 0), (20, 1), (40, 2), (60, 3), (80, 3)]
    for elapsed, expect in offers:
        got = taxi_game.offered_count(elapsed)
        if got != expect:
            print(f"offers at {elapsed}s were {got}", file=sys.stderr)
            return 1
    if taxi_game.seconds_until_next_offer(0) != 20:
        print("the first offer was not 20 seconds away", file=sys.stderr)
        return 1
    if taxi_game.seconds_until_next_offer(80) is not None:
        print("an 80 second clock added a fourth offer", file=sys.stderr)
        return 1
    import taxi_geo
    for miles in (2, 4, 6):
        trip = taxi_game.short_trip(90, miles)
        apart = taxi_geo.haversine_km(trip["pickup"], trip["dropoff"]) / taxi_game.MILE_KM
        if trip["pickup"] != taxi_game.DEPOT or abs(apart - miles) > 0.05:
            print(f"short trip {miles} was {apart}", file=sys.stderr)
            return 1
        if not 1 <= apart <= 8:
            print(f"short trip {miles} is outside 1 to 8 miles", file=sys.stderr)
            return 1
        if not taxi_geo.inside(trip["pickup"]) or not taxi_geo.inside(trip["dropoff"]):
            print(f"short trip {miles} left the circle", file=sys.stderr)
            return 1
        if taxi_geo.haversine_km(trip["dropoff"], taxi_game.BERWICK) < 10:
            print("a short trip reached Berwick", file=sys.stderr)
            return 1
    try:
        taxi_game.short_trip(0, 9)
    except ValueError:
        pass
    else:
        print("a 9 mile trip was accepted", file=sys.stderr)
        return 1
    if taxi_game.sum_pence(taxi_game.worked_day()) != -1120:
        print("fallback changed the day", file=sys.stderr)
        return 1
    print("DAY-OK")
    print("TIME-OK")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
