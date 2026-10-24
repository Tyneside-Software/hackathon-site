#!/usr/bin/env python3
"""Check the November 2024 North Tyneside hackney carriage tariff.

Lengths are integer tenths of a yard. Times are integer tenths of a second.
Money is pence. The script uses the standard library only. It does not import
the API and it does not open a database.

A unit ends when its distance or its waiting time runs out, whichever is
first. Those two are not added as separate meters. A part of a further unit
is a whole further unit. An exact multiple is not an extra unit.

The prices are the tariff that took effect on Monday 11 November 2024.
This script does not use the August 2026 proposal.

    py -3 scripts/taxi_fare_check.py
"""

from __future__ import annotations

import sys

# (unit yards, unit seconds, flag fall pence, further unit pence)
TARIFF_ONE = (1613, 468, 240, 25)
TARIFF_TWO = (1405, 450, 315, 25)

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
)


def quote_pence(tariff, segments):
    """Return the meter fare for a hiring made of ordered segments."""
    unit_yards, unit_seconds, flag, further = tariff
    units = 0
    into_yards = 0
    into_seconds = 0
    for yards, seconds in segments:
        if yards < 0 or seconds < 0:
            raise ValueError("a segment cannot be negative")
        units, into_yards, into_seconds = _apply_segment(
            yards,
            seconds,
            unit_yards,
            unit_seconds,
            into_yards,
            into_seconds,
            units,
        )
    if into_yards > 0 or into_seconds > 0:
        units += 1
    if units == 0:
        return 0
    return flag + (units - 1) * further


def _apply_segment(yards, seconds, unit_yards, unit_seconds, into_yards, into_seconds, units):
    """Advance one segment. Return units completed and progress into the open unit."""
    guard = 0
    while yards > 0 or seconds > 0:
        guard += 1
        if guard > 100000:
            raise RuntimeError("fare unit loop did not finish")
        need_yards = unit_yards - into_yards
        need_seconds = unit_seconds - into_seconds
        if need_yards <= 0 or need_seconds <= 0:
            units += 1
            into_yards = 0
            into_seconds = 0
            continue
        if seconds == 0:
            if yards >= need_yards:
                yards -= need_yards
                units += 1
                into_yards = 0
                into_seconds = 0
            else:
                into_yards += yards
                yards = 0
            continue
        if yards == 0:
            if seconds >= need_seconds:
                seconds -= need_seconds
                units += 1
                into_yards = 0
                into_seconds = 0
            else:
                into_seconds += seconds
                seconds = 0
            continue
        distance_first = yards >= need_yards and seconds * need_yards <= need_seconds * yards
        time_first = seconds >= need_seconds and yards * need_seconds < need_yards * seconds
        if distance_first:
            yards_left = yards - need_yards
            seconds = seconds * yards_left // yards
            yards = yards_left
            units += 1
            into_yards = 0
            into_seconds = 0
        elif time_first:
            seconds_left = seconds - need_seconds
            yards = yards * seconds_left // seconds
            seconds = seconds_left
            units += 1
            into_yards = 0
            into_seconds = 0
        else:
            into_yards += yards
            into_seconds += seconds
            yards = 0
            seconds = 0
    return units, into_yards, into_seconds


def main():
    failed = False
    for label, tariff, segments, expected in CASES:
        got = quote_pence(tariff, segments)
        if got != expected:
            failed = True
            print("%s: got %s pence, expected %s" % (label, got, expected), file=sys.stderr)
    if failed:
        return 1
    print("FARE-OK")
    return 0


if __name__ == "__main__":
    sys.exit(main())
