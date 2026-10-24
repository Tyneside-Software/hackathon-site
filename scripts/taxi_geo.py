"""The 50 mile circle around Grey's Monument.

A job that starts or ends outside the circle is refused. The radius is
80.467 km. The haversine uses the same 6371 km earth as app/map.js.
"""

import math

CENTRE = (54.9783, -1.6178)
RADIUS_KM = 80.467
EARTH_KM = 6371.0


def haversine_km(a, b):
    lat1, lng1 = a
    lat2, lng2 = b
    dlat = math.radians(lat2 - lat1)
    dlng = math.radians(lng2 - lng1)
    half = (
        math.sin(dlat / 2) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(dlng / 2) ** 2
    )
    return 2 * EARTH_KM * math.asin(math.sqrt(half))


def inside(point):
    return haversine_km(CENTRE, point) <= RADIUS_KM


def job_refused(start, end):
    """True when the pickup or the dropoff is outside the circle."""
    return (not inside(start)) or (not inside(end))
