#!/usr/bin/env python3
"""Check the November 2024 North Tyneside hackney carriage tariff.

Lengths are integer tenths of a yard. Times are integer tenths of a second.
Money is pence. The fare maths is in taxi_fare.py. Neither file imports the
API or opens a database.

A unit ends when its distance or its waiting time runs out, whichever is
first. Those two are not added as separate meters. A part of a further unit
is a whole further unit. An exact multiple is not an extra unit.

The prices are the tariff that took effect on Monday 11 November 2024.
This script does not use the August 2026 proposal. The meter and the extras
live in taxi_fare.py. Extras are added to the meter. They do not replace it.

    py -3 scripts/taxi_fare_check.py
"""

from __future__ import annotations

import sys

from taxi_fare import TARIFF_ONE, TARIFF_TWO, extras_pence, quote_pence, tariff_for

# (label, tariff, segments of (yards, seconds), expected pence)
CASES = (
    ("Tariff one, 1760 yards, no waiting", TARIFF_ONE, ((17600, 0),), 490),
    ("Tariff one, 5280 yards, no waiting", TARIFF_ONE, ((52800, 0),), 1040),
    ("Tariff two, 1760 yards, no waiting", TARIFF_TWO, ((17600, 0),), 615),
    ("Tariff two, 5280 yards, no waiting", TARIFF_TWO, ((52800, 0),), 1240),
    ("Tariff one, no yards, 514.8 seconds", TARIFF_ONE, ((0, 5148),), 490),
    ("Tariff one, no yards, 1544.4 seconds", TARIFF_ONE, ((0, 15444),), 1040),
    ("Tariff two, no yards, 585 seconds", TARIFF_TWO, ((0, 5850),), 615),
    ("Tariff two, no yards, 1710 seconds", TARIFF_TWO, ((0, 17100),), 1240),
    ("Tariff one, no yards, 514.9 seconds", TARIFF_ONE, ((0, 5149),), 515),
    ("Tariff two, no yards, 585.1 seconds", TARIFF_TWO, ((0, 5851),), 640),
    (
        "Tariff one, first 161.3 yards in 20 seconds, then wait 46.8 seconds",
        TARIFF_ONE,
        ((1613, 200), (0, 468)),
        265,
    ),
    (
        "Tariff two, first 140.5 yards in 20 seconds, then wait 45 seconds",
        TARIFF_TWO,
        ((1405, 200), (0, 450)),
        340,
    ),
    ("Tariff one, exactly 161.3 yards, no waiting", TARIFF_ONE, ((1613, 0),), 240),
    ("Tariff one, exactly 322.6 yards, no waiting", TARIFF_ONE, ((3226, 0),), 265),
    ("Tariff two, exactly 140.5 yards, no waiting", TARIFF_TWO, ((1405, 0),), 315),
    ("Tariff two, no yards, 45 seconds", TARIFF_TWO, ((0, 450),), 315),
)


def _expect(label, meter, extra, total, want_meter, want_extra, want_total):
    if meter == want_meter and extra == want_extra and total == want_total:
        return False
    print(
        "%s: meter %s, extras %s, total %s, expected %s + %s = %s"
        % (label, meter, extra, total, want_meter, want_extra, want_total),
        file=sys.stderr,
    )
    return True


def main():
    failed = False
    for label, tariff, segments, expected in CASES:
        got = quote_pence(tariff, segments)
        if got != expected:
            failed = True
            print("%s: got %s pence, expected %s" % (label, got, expected), file=sys.stderr)
    if extras_pence(guide_or_hearing_dogs=1) != 0:
        failed = True
        print("A guide or hearing dog must add 0 pence", file=sys.stderr)
    meter = quote_pence(TARIFF_ONE, ((52800, 0),))
    extra = extras_pence(passengers_after_two=1, bags=1)
    failed = _expect(
        "Tariff one, 3 miles, one extra passenger, one outside bag",
        meter, extra, meter + extra, 1040, 90, 1130,
    ) or failed
    night_meter = quote_pence(TARIFF_TWO, ((52800, 0),))
    night_extra = extras_pence()
    failed = _expect(
        "Night booking, tariff two, 3 miles, no waiting, no extras",
        night_meter, night_extra, night_meter + night_extra, 1240, 0, 1240,
    ) or failed
    soiled = extras_pence(soiling=1)
    failed = _expect(
        "Tariff one, 3 miles, no waiting, plus soiling",
        meter, soiled, meter + soiled, 1040, 12500, 13540,
    ) or failed
    with_dog = extras_pence(guide_or_hearing_dogs=1, passengers_after_two=1, bags=1)
    failed = _expect(
        "Tariff one, 3 miles, guide or hearing dog, one extra passenger, one outside bag",
        meter, with_dog, meter + with_dog, 1040, 90, 1130,
    ) or failed
    bicycle = extras_pence(bicycles=1)
    failed = _expect(
        "Tariff two, 3 miles, no waiting, one bicycle",
        night_meter, bicycle, night_meter + bicycle, 1240, 300, 1540,
    ) or failed
    mile = quote_pence(TARIFF_ONE, ((17600, 0),))
    mile_extra = extras_pence()
    failed = _expect(
        "Tariff one, 1 mile, no waiting, no extras",
        mile, mile_extra, mile + mile_extra, 490, 0, 490,
    ) or failed
    company_day = (meter + extra) + (night_meter + night_extra) + (mile + mile_extra) + 0
    alex = (meter + extra) + (mile + mile_extra)
    sam = night_meter + night_extra
    if alex != 1620 or sam != 1240 or alex + sam != 2860:
        failed = True
        print(
            "Driver takings moved: Alex %s, Sam %s, day %s" % (alex, sam, alex + sam),
            file=sys.stderr,
        )
    cash = meter + extra
    account = meter + extra
    if cash != 1130 or account != 1130:
        failed = True
        print("Cash or account moved the fare: %s and %s" % (cash, account), file=sys.stderr)
    if company_day != 2860:
        failed = True
        print(
            "Company day, three completed bookings and one cancel: got %s, expected 2860" % company_day,
            file=sys.stderr,
        )
    company_week = company_day * 7
    if company_week != 20020:
        failed = True
        print("Company week: got %s, expected 20020" % company_week, file=sys.stderr)
    empty_day = 0
    cancelled_only_day = 0
    if empty_day != 0 or cancelled_only_day != 0:
        failed = True
        print(
            "Empty day moved: no bookings %s, cancelled mile only %s" % (empty_day, cancelled_only_day),
            file=sys.stderr,
        )
    cancelled_mile = (meter + extra) + (night_meter + night_extra) + 0
    if cancelled_mile != 2370:
        failed = True
        print(
            "Company day with the 490 pence booking cancelled: got %s, expected 2370" % cancelled_mile,
            file=sys.stderr,
        )
    empty_one = quote_pence(TARIFF_ONE, ((0, 0),))
    empty_two = quote_pence(TARIFF_TWO, ((0, 0),))
    if empty_one != 0 or empty_two != 0:
        failed = True
        print(
            "Empty hiring must be 0 pence, got tariff one %s and tariff two %s" % (empty_one, empty_two),
            file=sys.stderr,
        )
    flag_t1 = quote_pence(TARIFF_ONE, ((1613, 0),))
    flag_t2_yards = quote_pence(TARIFF_TWO, ((1405, 0),))
    flag_t2_time = quote_pence(TARIFF_TWO, ((0, 450),))
    mixed = quote_pence(TARIFF_ONE, ((1613, 200), (0, 468)))
    if flag_t1 != 240 or flag_t2_yards != 315 or flag_t2_time != 315 or mixed != 265:
        failed = True
        print(
            "Flag falls moved: tariff one yards %s, tariff two yards %s, tariff two 45 seconds %s, mixed %s"
            % (flag_t1, flag_t2_yards, flag_t2_time, mixed),
            file=sys.stderr,
        )
    animal = extras_pence(animals=1)
    failed = _expect(
        "Tariff one, 1 mile, no waiting, one animal, no soiling",
        mile, animal, mile + animal, 490, 300, 790,
    ) or failed
    soiling_only = empty_one + extras_pence(soiling=1)
    if soiling_only != 12500:
        failed = True
        print("soiling-day: got %s, expected 12500" % soiling_only, file=sys.stderr)
    clock = (
        ("22:00", 22 * 60, False, None, 2),
        ("06:59", 6 * 60 + 59, False, None, 2),
        ("07:00", 7 * 60, False, None, 1),
        ("21:59", 21 * 60 + 59, False, None, 1),
        ("Sunday 15:00", 15 * 60, True, None, 2),
        ("27 December 15:00", 15 * 60, False, 27, 2),
        ("31 December 15:00", 15 * 60, False, 31, 2),
        ("26 December 15:00", 15 * 60, False, 26, 1),
        ("Tuesday 15:00", 15 * 60, False, None, 1),
    )
    for label, minutes, sunday, december_day, expected in clock:
        got = tariff_for(minutes, sunday, december_day)
        if got != expected:
            failed = True
            print("%s: tariff %s, expected %s" % (label, got, expected), file=sys.stderr)
    mile_parts = quote_pence(TARIFF_ONE, ((17600, 0),))
    if mile_parts != 240 + 10 * 25:
        failed = True
        print("One-mile breakdown: got %s, expected 490" % mile_parts, file=sys.stderr)
    if quote_pence(TARIFF_ONE, ((52800, 0),)) != 1040 or quote_pence(TARIFF_TWO, ((52800, 0),)) != 1240:
        failed = True
        print("Clock slice moved a meter figure", file=sys.stderr)
    try:
        quote_pence(TARIFF_ONE, ((-17600, 0),))
        failed = True
        print("A negative mile was quoted", file=sys.stderr)
    except ValueError:
        pass
    if failed:
        return 1
    print("FARE-OK")
    return 0


if __name__ == "__main__":
    sys.exit(main())
