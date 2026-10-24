#!/usr/bin/env python3
"""November 2024 North Tyneside hackney carriage meter and extras.

Lengths are integer tenths of a yard. Times are integer tenths of a second.
Money is pence. This module uses the standard library only. It does not import
the API and it does not open a database.

A unit ends when its distance or its waiting time runs out, whichever is
first. Those two are not added as separate meters. A part of a further unit
is a whole further unit. An exact multiple is not an extra unit.

The prices took effect on Monday 11 November 2024. This module does not use
the August 2026 proposal. Extras are added to the meter. They do not replace
it. A guide or hearing dog adds nothing. A toll is whatever it cost, in pence,
because the tariff names no fixed toll.
"""

from __future__ import annotations

# (unit yards, unit seconds, flag fall pence, further unit pence)
TARIFF_ONE = (1613, 468, 240, 25)
TARIFF_TWO = (1405, 450, 315, 25)

# November 2024 extras, in pence, on top of the meter.
SOILING = 12500
PASSENGER_AFTER_TWO = 50
BAG_OUTSIDE = 40
ANIMAL = 300
GUIDE_OR_HEARING_DOG = 0
BICYCLE = 300
PRAM = 50


def extras_pence(
    soiling=0,
    passengers_after_two=0,
    bags=0,
    animals=0,
    guide_or_hearing_dogs=0,
    bicycles=0,
    prams=0,
    tolls_pence=0,
):
    """Return extras in pence. Counts are whole items. Tolls are already pence."""
    counts = (
        soiling,
        passengers_after_two,
        bags,
        animals,
        guide_or_hearing_dogs,
        bicycles,
        prams,
    )
    if tolls_pence < 0 or any(count < 0 for count in counts):
        raise ValueError("an extra cannot be negative")
    return (
        soiling * SOILING
        + passengers_after_two * PASSENGER_AFTER_TWO
        + bags * BAG_OUTSIDE
        + animals * ANIMAL
        + guide_or_hearing_dogs * GUIDE_OR_HEARING_DOG
        + bicycles * BICYCLE
        + prams * PRAM
        + tolls_pence
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


def hiring_pence(tariff, segments, **extras):
    """Return the meter plus extras. An empty hiring with no extras is 0."""
    return quote_pence(tariff, segments) + extras_pence(**extras)


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
