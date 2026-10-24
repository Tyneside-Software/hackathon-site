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

## Desk

`office.html` is the booking desk. It loads `app/office.js` and `app/office.css`. The quote uses `window.TaxiFare.quotePence` in `app/taxi-fare.js`. The Python checker is the proof. The desk does not call the API and it does not read the live database.

The quote form takes tariff one or tariff two, miles, waiting seconds, extra passengers, outside bags, animals other than a guide or hearing dog, bicycles, prams, and a soiling checkbox. One mile is 1760 yards. The result is shown in pence and in pounds.

The desk has two sample rows. The £11.30 row is tariff one, 3 miles, no waiting, one extra passenger, and one outside bag. The £12.40 row is tariff two, 3 miles, no waiting, and no extras. Buttons move a sample through `offered`, `accepted`, `started`, and `completed`. Cancel is offered until the booking is completed. Completing adds the quoted fare to the company ledger. Cancelling adds nothing.

A button fills the mixed tariff-one case from [Taxi fares](#taxi-fares): the first 161.3 yards in 20 seconds, then 46.8 seconds waiting. The desk shows 265 pence, £2.65.

The company day is its own ledger, separate from any single booking and separate from the game. It is three completed bookings, 1130, 1240, and 490 pence, and one cancel that adds 0. The 490 pence booking is tariff one, 1 mile, no waiting, and no extras. The sum is 2860 pence (£28.60).
