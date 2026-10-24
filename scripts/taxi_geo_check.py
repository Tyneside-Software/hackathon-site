"""Print GEO-OK when the circle contains the right towns."""

import sys

import taxi_geo

POINTS = (
    ("Grey's Monument", (54.9783, -1.6178), True),
    ("Shiremoor depot", (55.0367, -1.5075), True),
    ("Hexham", (54.9716, -2.1015), True),
    ("Durham", (54.7753, -1.5849), True),
    ("Sunderland", (54.9069, -1.3838), True),
    ("Berwick-upon-Tweed", (55.7704, -2.0068), False),
)


def main():
    if taxi_geo.CENTRE != (54.9783, -1.6178) or taxi_geo.RADIUS_KM != 80.467:
        print("circle constants are wrong", file=sys.stderr)
        return 1
    for name, point, expect in POINTS:
        got = taxi_geo.inside(point)
        if got != expect:
            print(f"{name} inside={got} expected={expect}", file=sys.stderr)
            return 1
    monument = (54.9783, -1.6178)
    depot = (55.0367, -1.5075)
    berwick = (55.7704, -2.0068)
    if taxi_geo.job_refused(monument, depot):
        print("a job inside the circle was refused", file=sys.stderr)
        return 1
    if not taxi_geo.job_refused(berwick, monument):
        print("a job that starts outside was not refused", file=sys.stderr)
        return 1
    if not taxi_geo.job_refused(monument, berwick):
        print("a job that ends outside was not refused", file=sys.stderr)
        return 1
    print("GEO-OK")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
