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


def three_cars():
    cars = []
    for taxi_id, call_sign in ((1, "T1"), (2, "T2"), (3, "T3")):
        cars.append({
            "id": taxi_id,
            "call_sign": call_sign,
            "status": "at_depot",
            "lat": DEPOT[0],
            "lng": DEPOT[1],
        })
    return cars


def three_car_day():
    """Standing for T1, T2, and T3. Only T1 runs the worked fare."""
    rows = [line("standing", -STANDING_PENCE, taxi_id=car["id"]) for car in three_cars()]
    rows.extend([
        line("fare_in", WORKED_FARE_PENCE, job_id=1, taxi_id=1),
        line("driver_share", -(WORKED_FARE_PENCE // 2), job_id=1, taxi_id=1),
        line("fuel", -(WORKED_MILES * FUEL_PENCE_A_MILE), job_id=1, taxi_id=1),
    ])
    return rows


def new_driver(name):
    return {"name": name, "cost_pence": NEW_DRIVER_PENCE}


def day_with_driver(name):
    """A new driver costs 0, so the worked day does not change."""
    new_driver(name)
    return worked_day()


def cancel_after_zero_miles():
    """Started, but no miles: no fuel and no fare."""
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


def elapsed_seconds(start_ms, now_ms):
    """One real second is one game second. There is no multiplier."""
    return (now_ms - start_ms) / 1000


FALLBACK_MPH = 30


def fallback_seconds(miles):
    """No OSRM duration. 30 miles per hour is the built-up limit. 3 miles take 360 seconds."""
    return miles * 3600 / FALLBACK_MPH


def offered_count(elapsed_s):
    """One new offer each 20 real seconds, and never more than 3 waiting."""
    if elapsed_s < 0:
        return 0
    return min(3, int(elapsed_s // 20))


def seconds_until_next_offer(elapsed_s):
    """Seconds until the next offer. None once 3 are already waiting."""
    if offered_count(elapsed_s) >= 3:
        return None
    remainder = elapsed_s % 20
    if remainder == 0:
        return 20
    return 20 - remainder


MILE_KM = 80.467 / 50
SHORT_MILES = (2, 4, 6)


def destination(origin, bearing_deg, miles):
    """Point reached from origin on a bearing. Miles use the same 80.467 km circle."""
    import math
    import taxi_geo
    km = miles * MILE_KM
    lat1 = math.radians(origin[0])
    lng1 = math.radians(origin[1])
    bearing = math.radians(bearing_deg % 360)
    ang = km / taxi_geo.EARTH_KM
    lat2 = math.asin(
        math.sin(lat1) * math.cos(ang)
        + math.cos(lat1) * math.sin(ang) * math.cos(bearing)
    )
    lng2 = lng1 + math.atan2(
        math.sin(bearing) * math.sin(ang) * math.cos(lat1),
        math.cos(ang) - math.sin(lat1) * math.sin(lat2),
    )
    lng = (math.degrees(lng2) + 540) % 360 - 180
    return (math.degrees(lat2), lng)


def live_fare_pence(miles, waiting_seconds=0):
    """Tariff one, no extras. The unit that finishes first is the one that counts."""
    import taxi_fare
    yards_tenths = int(round(miles * 1760 * 10))
    seconds_tenths = int(round(waiting_seconds * 10))
    return taxi_fare.quote_pence(taxi_fare.TARIFF_ONE, ((yards_tenths, seconds_tenths),))


def short_trip(bearing_deg, miles):
    """Pickup at the depot. Drop-off is 2, 4, or 6 miles away. No new town."""
    if miles not in SHORT_MILES:
        raise ValueError("a live trip is 2, 4, or 6 miles")
    return {
        "pickup": DEPOT,
        "dropoff": destination(DEPOT, bearing_deg, miles),
        "miles": miles,
        "fare_pence": live_fare_pence(miles, 0),
    }


def fleet_positions(routes, elapsed_s):
    """T1, T2, and T3 each follow a route at the same moment. None is a device.

    routes has three entries. An entry is (points, duration_s), or None to
    leave that car at the depot. Offers still arrive on the 20 second clock.
    """
    if len(routes) != 3:
        raise ValueError("the fleet is T1, T2, and T3")
    cars = []
    for car, route in zip(three_cars(), routes):
        if route is None:
            point = DEPOT
            status = "at_depot"
        else:
            points, duration_s = route
            point = position_on_route(points, duration_s, elapsed_s)
            status = "started"
        cars.append({
            "call_sign": car["call_sign"],
            "status": status,
            "lat": point[0],
            "lng": point[1],
        })
    return cars


def fare_pounds(pence):
    """A booking row shows the fare in pounds."""
    whole, rem = divmod(int(pence), 100)
    return f"£{whole}.{rem:02d}"


def waiting_offers(elapsed_s, bearing_deg=90):
    """One booking row for each offer that is waiting. Status is offered."""
    offers = []
    for index in range(offered_count(elapsed_s)):
        miles = SHORT_MILES[index]
        trip = short_trip((bearing_deg + index * 30) % 360, miles)
        offers.append({
            "pickup": trip["pickup"],
            "dropoff": trip["dropoff"],
            "status": "offered",
            "miles": miles,
            "fare_pence": trip["fare_pence"],
            "fare_pounds": fare_pounds(trip["fare_pence"]),
        })
    return offers


def accept_offer(offers, cars):
    """Put the oldest waiting offer onto the first car that is at the depot."""
    if not offers:
        raise ValueError("no offer is waiting")
    free = None
    for car in cars:
        if car.get("status") == "at_depot" and "device_id" not in car:
            free = car
            break
    if free is None:
        raise ValueError("no free car")
    chosen_index = None
    for index, offer in enumerate(offers):
        if offer["status"] == "offered":
            chosen_index = index
            break
    if chosen_index is None:
        raise ValueError("no offer is waiting")
    chosen = offers[chosen_index]
    accepted = dict(chosen)
    accepted["status"] = "accepted"
    accepted["call_sign"] = free["call_sign"]
    updated_offers = [dict(item) for item in offers]
    updated_offers[chosen_index] = accepted
    route = ((chosen["pickup"], chosen["dropoff"]), fallback_seconds(chosen["miles"]))
    updated_cars = []
    for car in cars:
        if car["call_sign"] != free["call_sign"]:
            updated_cars.append(dict(car))
            continue
        moved = dict(car)
        moved["status"] = "accepted"
        moved["route"] = route
        updated_cars.append(moved)
    return {"offers": updated_offers, "cars": updated_cars}


def customer_pins(offers):
    """A waiting offer marks its pickup. The marker is not a device."""
    pins = []
    for offer in offers:
        if offer.get("status") != "offered":
            continue
        pins.append({
            "lat": offer["pickup"][0],
            "lng": offer["pickup"][1],
            "kind": "customer",
        })
    return pins


def start_accepted(taken):
    """Remove the accepted offer's pin and start that car. Phones and buses stay."""
    cars = []
    for car in taken["cars"]:
        if car.get("status") == "accepted":
            moved = dict(car)
            moved["status"] = "started"
            cars.append(moved)
        else:
            cars.append(dict(car))
    return {
        "offers": [dict(offer) for offer in taken["offers"]],
        "cars": cars,
        "pins": customer_pins(taken["offers"]),
    }


def return_leg(origin, duration_s, elapsed_s):
    """After the drop-off the car drives back to the depot. Arrival sets at_depot."""
    if duration_s <= 0 or elapsed_s >= duration_s:
        return {"status": "at_depot", "lat": DEPOT[0], "lng": DEPOT[1]}
    point = position_on_route((origin, DEPOT), duration_s, elapsed_s)
    return {"status": "returning", "lat": point[0], "lng": point[1]}


def post_live_fuel(trip_id, miles, posted=()):
    """20 pence a mile, once for this trip. A second completion adds nothing."""
    already = set(posted)
    if trip_id in already or miles <= 0:
        return {"fuel_pence": 0, "lines": [], "posted": already}
    fuel = -(int(miles) * FUEL_PENCE_A_MILE)
    already.add(trip_id)
    return {
        "fuel_pence": fuel,
        "lines": [line("fuel", fuel, job_id=trip_id)],
        "posted": already,
    }


def seconds_remaining(duration_s, elapsed_s):
    """Seconds left on a moving car's booking row. One real second is one game second."""
    if duration_s <= 0 or elapsed_s >= duration_s:
        return 0
    if elapsed_s <= 0:
        return duration_s
    return duration_s - elapsed_s


def moving_row(call_sign, duration_s, elapsed_s):
    """The booking row of a car that is on a route."""
    return {
        "call_sign": call_sign,
        "status": "started",
        "seconds_remaining": seconds_remaining(duration_s, elapsed_s),
    }


def fares_waiting(elapsed_s, accepted=0):
    """At most 3 offers wait. Accepting one lets the next 20 seconds add one."""
    if elapsed_s < 0 or accepted < 0:
        return 0
    waiting = int(elapsed_s // 20) - int(accepted)
    if waiting < 0:
        return 0
    return min(3, waiting)


def waiting_label(elapsed_s, accepted=0):
    """The page says this when three offers are open."""
    if fares_waiting(elapsed_s, accepted) == 3:
        return "3 fares waiting"
    return None


def seconds_until_fare(elapsed_s, accepted=0):
    """Seconds until another offer may appear. None while 3 are waiting."""
    if fares_waiting(elapsed_s, accepted) >= 3:
        return None
    if elapsed_s < 0:
        return 20
    remainder = elapsed_s % 20
    if remainder == 0:
        return 20
    return 20 - remainder


def position_on_route(points, duration_s, elapsed_s):
    """Place on a polyline. The checker passes points and a duration. It does not call OSRM."""
    if not points:
        raise ValueError("a route needs a point")
    if duration_s <= 0 or elapsed_s <= 0:
        return points[0]
    if elapsed_s >= duration_s:
        return points[-1]
    import taxi_geo
    fraction = elapsed_s / duration_s
    distances = [0.0]
    for start, end in zip(points, points[1:]):
        distances.append(distances[-1] + taxi_geo.haversine_km(start, end))
    total = distances[-1]
    if total == 0:
        return points[0]
    target = total * fraction
    for index in range(1, len(distances)):
        if distances[index] >= target:
            span = distances[index] - distances[index - 1]
            step = 0 if span == 0 else (target - distances[index - 1]) / span
            lat1, lng1 = points[index - 1]
            lat2, lng2 = points[index]
            return (lat1 + (lat2 - lat1) * step, lng1 + (lng2 - lng1) * step)
    return points[-1]


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
