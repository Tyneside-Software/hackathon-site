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
    routes = (
        (((0.0, 0.0), (0.0, 2.0)), 600),
        (((1.0, 0.0), (1.0, 4.0)), 400),
        None,
    )
    fleet = taxi_game.fleet_positions(routes, 300)
    if [car["call_sign"] for car in fleet] != ["T1", "T2", "T3"] or has_device_id(fleet):
        print(f"fleet {fleet}", file=sys.stderr)
        return 1
    if abs(fleet[0]["lat"] - 0.0) > 1e-9 or abs(fleet[0]["lng"] - 1.0) > 1e-6:
        print(f"T1 {fleet[0]}", file=sys.stderr)
        return 1
    if abs(fleet[1]["lat"] - 1.0) > 1e-9 or abs(fleet[1]["lng"] - 3.0) > 1e-6:
        print(f"T2 {fleet[1]}", file=sys.stderr)
        return 1
    if (fleet[2]["lat"], fleet[2]["lng"]) != taxi_game.DEPOT or fleet[2]["status"] != "at_depot":
        print(f"T3 {fleet[2]}", file=sys.stderr)
        return 1
    if taxi_game.offered_count(60) != 3 or taxi_game.offered_count(80) != 3:
        print("three moving cars changed the offer cap", file=sys.stderr)
        return 1
    try:
        taxi_game.fleet_positions((None, None, None, None), 0)
    except ValueError:
        pass
    else:
        print("a fourth car joined the fleet", file=sys.stderr)
        return 1
    if taxi_game.waiting_offers(0) != []:
        print("a fare was waiting at 0 seconds", file=sys.stderr)
        return 1
    waiting = taxi_game.waiting_offers(40)
    if len(waiting) != 2 or any(offer["status"] != "offered" for offer in waiting):
        print(f"waiting offers {waiting}", file=sys.stderr)
        return 1
    if waiting[0]["pickup"] != taxi_game.DEPOT:
        print("an offer did not start at the depot", file=sys.stderr)
        return 1
    if waiting[0]["fare_pence"] != taxi_game.live_fare_pence(2, 0):
        print("an offer did not use the meter", file=sys.stderr)
        return 1
    if waiting[0]["fare_pounds"] != taxi_game.fare_pounds(waiting[0]["fare_pence"]):
        print("the row did not show pounds", file=sys.stderr)
        return 1
    if len(taxi_game.waiting_offers(80)) != 3:
        print("the desk showed a fourth offer", file=sys.stderr)
        return 1
    taken = taxi_game.accept_offer(taxi_game.waiting_offers(20), taxi_game.three_cars())
    if has_device_id(taken) or taken["offers"][0]["status"] != "accepted":
        print("accept did not take the offer", file=sys.stderr)
        return 1
    if taken["cars"][0]["call_sign"] != "T1" or taken["cars"][0]["status"] != "accepted":
        print(f"accept car {taken['cars'][0]}", file=sys.stderr)
        return 1
    if taken["cars"][1]["status"] != "at_depot" or taken["cars"][2]["status"] != "at_depot":
        print("accept moved a second car", file=sys.stderr)
        return 1
    points, duration = taken["cars"][0]["route"]
    if points[0] != taxi_game.DEPOT or taxi_game.position_on_route(points, duration, 0) != points[0]:
        print("the accepted car did not start on the route", file=sys.stderr)
        return 1
    waiting_two = taxi_game.waiting_offers(40)
    pins = taxi_game.customer_pins(waiting_two)
    if len(pins) != 2 or any("device_id" in pin or pin["kind"] != "customer" for pin in pins):
        print(f"customer pins {pins}", file=sys.stderr)
        return 1
    if (pins[0]["lat"], pins[0]["lng"]) != taxi_game.DEPOT:
        print("a customer pin left the pickup", file=sys.stderr)
        return 1
    started = taxi_game.start_accepted(taxi_game.accept_offer(waiting_two, taxi_game.three_cars()))
    if len(started["pins"]) != 1 or started["cars"][0]["status"] != "started" or has_device_id(started):
        print(f"start {started['cars'][0]} pins {len(started['pins'])}", file=sys.stderr)
        return 1
    if started["cars"][1]["status"] != "at_depot":
        print("starting T1 moved another car", file=sys.stderr)
        return 1
    dropoff = taxi_game.short_trip(90, 2)["dropoff"]
    leaving = taxi_game.return_leg(dropoff, 600, 0)
    if leaving["status"] != "returning" or (leaving["lat"], leaving["lng"]) != dropoff:
        print(f"return start {leaving}", file=sys.stderr)
        return 1
    halfway_home = taxi_game.return_leg(dropoff, 600, 300)
    expect_home = taxi_game.position_on_route((dropoff, taxi_game.DEPOT), 600, 300)
    if halfway_home["status"] != "returning" or (halfway_home["lat"], halfway_home["lng"]) != expect_home:
        print(f"return halfway {halfway_home}", file=sys.stderr)
        return 1
    arrived_home = taxi_game.return_leg(dropoff, 600, 600)
    if arrived_home["status"] != "at_depot" or (arrived_home["lat"], arrived_home["lng"]) != taxi_game.DEPOT:
        print(f"return arrival {arrived_home}", file=sys.stderr)
        return 1
    if "device_id" in arrived_home:
        print("the returning car was a device", file=sys.stderr)
        return 1
    checked_fuel = [row for row in taxi_game.worked_day() if row["kind"] == "fuel"]
    if len(checked_fuel) != 1 or checked_fuel[0]["amount_pence"] != -140:
        print(f"checked fuel {checked_fuel}", file=sys.stderr)
        return 1
    first_fuel = taxi_game.post_live_fuel(9, 3, ())
    if first_fuel["fuel_pence"] != -60 or taxi_game.sum_pence(first_fuel["lines"]) != -60:
        print(f"live fuel {first_fuel}", file=sys.stderr)
        return 1
    second_fuel = taxi_game.post_live_fuel(9, 3, first_fuel["posted"])
    if second_fuel["fuel_pence"] != 0 or second_fuel["lines"] != []:
        print("a second completion added fuel", file=sys.stderr)
        return 1
    start_row = taxi_game.moving_row("T1", 600, 0)
    half_row = taxi_game.moving_row("T1", 600, 300)
    if start_row["seconds_remaining"] != 600 or start_row["status"] != "started":
        print(f"row start {start_row}", file=sys.stderr)
        return 1
    if half_row["seconds_remaining"] != 300 or half_row["call_sign"] != "T1":
        print(f"row halfway {half_row}", file=sys.stderr)
        return 1
    if taxi_game.seconds_remaining(600, 600) != 0:
        print("a finished route still showed seconds", file=sys.stderr)
        return 1
    if taxi_game.fares_waiting(60, 0) != 3 or taxi_game.waiting_label(60, 0) != "3 fares waiting":
        print("three open fares were not named", file=sys.stderr)
        return 1
    if taxi_game.fares_waiting(80, 0) != 3 or taxi_game.seconds_until_fare(80, 0) is not None:
        print("the twentieth second added a fourth fare", file=sys.stderr)
        return 1
    if taxi_game.fares_waiting(60, 1) != 2 or taxi_game.seconds_until_fare(60, 1) != 20:
        print("accepting a fare did not open the next 20 seconds", file=sys.stderr)
        return 1
    if taxi_game.fares_waiting(80, 1) != 3:
        print("the next 20 seconds did not add one fare", file=sys.stderr)
        return 1
    if taxi_game.next_fare_label(0, 0) != "Next fare in 20":
        print("the countdown did not start at 20", file=sys.stderr)
        return 1
    if taxi_game.fares_waiting(19, 0) != 0 or taxi_game.next_fare_label(19, 0) != "Next fare in 1":
        print("the countdown skipped a second", file=sys.stderr)
        return 1
    if taxi_game.fares_waiting(20, 0) != 1 or taxi_game.next_fare_label(20, 0) != "Next fare in 20":
        print("the offer did not appear and restart at 20", file=sys.stderr)
        return 1
    if taxi_game.next_fare_label(60, 0) is not None or taxi_game.next_fare_label(80, 0) is not None:
        print("the countdown restarted while 3 fares were waiting", file=sys.stderr)
        return 1
    oldest = taxi_game.waiting_offers(40)
    taken_by_t1 = taxi_game.free_car_takes(oldest, taxi_game.three_cars())
    if has_device_id(taken_by_t1) or taken_by_t1["offers"][0]["call_sign"] != "T1":
        print("T1 did not take the oldest offer", file=sys.stderr)
        return 1
    if taken_by_t1["offers"][1]["status"] != "offered":
        print("T1 took more than the oldest offer", file=sys.stderr)
        return 1
    busy = taxi_game.three_cars()
    busy[0]["status"] = "started"
    taken_by_t2 = taxi_game.free_car_takes(oldest, busy)
    if has_device_id(taken_by_t2) or taken_by_t2["offers"][0]["call_sign"] != "T2":
        print("T2 did not take the offer while T1 was out", file=sys.stderr)
        return 1
    if taken_by_t2["cars"][0]["status"] != "started" or taken_by_t2["cars"][1]["status"] != "accepted":
        print(f"free car {taken_by_t2['cars']}", file=sys.stderr)
        return 1
    out = taxi_game.two_cars_out(0)
    later = taxi_game.two_cars_out(120)
    if has_device_id(out) or has_device_id(later):
        print("a moving car is a device", file=sys.stderr)
        return 1
    if [car["status"] for car in out["cars"]] != ["started", "started", "at_depot"]:
        print(f"two cars out {out['cars']}", file=sys.stderr)
        return 1
    if out["offers"][0]["call_sign"] != "T1" or out["offers"][1]["call_sign"] != "T2":
        print(f"accepted offers {out['offers']}", file=sys.stderr)
        return 1
    if out["offers"][0]["status"] != "accepted" or out["offers"][1]["status"] != "accepted":
        print("an accepted offer was not accepted", file=sys.stderr)
        return 1
    if later["cars"][2]["status"] != "at_depot":
        print("T3 left the depot", file=sys.stderr)
        return 1
    if (later["cars"][2]["lat"], later["cars"][2]["lng"]) != taxi_game.DEPOT:
        print("T3 left the depot pin", file=sys.stderr)
        return 1
    if (out["cars"][0]["lat"], out["cars"][0]["lng"]) == (later["cars"][0]["lat"], later["cars"][0]["lng"]):
        print("T1 did not move with T2", file=sys.stderr)
        return 1
    if (out["cars"][1]["lat"], out["cars"][1]["lng"]) == (later["cars"][1]["lat"], later["cars"][1]["lng"]):
        print("T2 did not move with T1", file=sys.stderr)
        return 1
    posted_trip = taxi_game.post_live_trip(7, 3, ())
    posted_kinds = [row["kind"] for row in posted_trip["lines"]]
    posted_amounts = [row["amount_pence"] for row in posted_trip["lines"]]
    if posted_kinds != ["fare_in", "fuel"] or posted_amounts != [1040, -60]:
        print(f"live post {posted_trip['lines']}", file=sys.stderr)
        return 1
    posted_again = taxi_game.post_live_trip(7, 3, posted_trip["posted"])
    if posted_again["lines"] != []:
        print("a second completion appended lines", file=sys.stderr)
        return 1
    checked_day = taxi_game.worked_day()
    if [row["amount_pence"] for row in checked_day if row["kind"] == "fuel"] != [-140]:
        print("the live post changed the checked fuel", file=sys.stderr)
        return 1
    if taxi_game.live_fare_pence(3, 0) != 1040:
        print(f"live fare {taxi_game.live_fare_pence(3, 0)}", file=sys.stderr)
        return 1
    for miles in (2, 4, 6):
        if taxi_game.short_trip(90, miles)["fare_pence"] != taxi_game.live_fare_pence(miles, 0):
            print(f"short trip {miles} did not use the meter", file=sys.stderr)
            return 1
    if taxi_game.sum_pence(taxi_game.worked_day()) != -1120:
        print("fallback changed the day", file=sys.stderr)
        return 1
    print("DAY-OK")
    print("TIME-OK")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
