# Booking office

The booking office is software for a taxi company. It is not the empire game. The brief is [Tracker, office, and game](#taxi). The quoted fare uses the rules in [Taxi fares](#taxi-fares) and in `scripts/taxi_fare_check.py`.

Issue 27: Booking office quote and completion. Tyneside-Software/hackathon-site#27

## Booking

A company has a depot, a fleet, drivers, and bookings. A booking has these fields.

| Field | Meaning |
|-------|---------|
| Pickup | Where the vehicle collects the passenger |
| Drop-off | Where the journey ends |
| Requested time | When the customer asked for the car |
| Quoted fare | The fare from `scripts/taxi_fare_check.py` |
| Vehicle | The vehicle that ran the booking |

The status is one of `offered`, `accepted`, `started`, `completed`, or `cancelled`.

This page is not the office screen. The brief leaves that screen out of this prep.

## Quote

The quote is the November 2024 meter, plus extras on top of it. The checker charges the unit that finishes first. It does not add a distance meter to a time meter.

Worked quote. Tariff one, 3 miles, no waiting, one extra passenger, one bag carried outside. The meter is 1040 pence (£10.40). The extras are 50 + 40 = 90 pence. The quoted fare is 1130 pence (£11.30).

Night booking. Tariff two is 22:00–07:00, all Sunday, bank holidays, and 27–31 December. Three miles, no waiting, no extras. The meter is 1240 pence (£12.40). Extras are 0. The quoted fare is 1240 pence (£12.40).

## Ledger

Money for a real company is that company's ledger. It is separate from the game ledger. Company money is not written into the game ledger, and the game does not write into the company ledger.

These figures are game settings. They are not this company's charges.

| Game line | Amount |
|-----------|--------|
| Driver | Half the fare |
| Fuel | £0.20 a mile |
| Standing | £15 a car |
| New car | £8000 |
