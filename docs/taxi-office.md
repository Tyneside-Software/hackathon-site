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

`office.html` is the booking desk. The banner says Real data. The heading is Booking desk. The nav includes a link to `game.html` named Empire. The three panels are Quote, Bookings, and Ledger. The ledger note says the money is the company's. It loads `app/office.js` and `app/office.css`. The quote uses `window.TaxiFare.quotePence` in `app/taxi-fare.js`. The Python checker is the proof. The desk does not call the API and it does not read the live database.

The desk rejects negative miles. The previous quote stays on screen.

The help panel states the tariff one flag fall of 240 pence and the tariff two flag fall of 315 pence. It does not change a quote.

The clock chooses the tariff. Requested time 22:00 or 06:59 selects tariff two. 07:00 or 21:59 selects tariff one. A Sunday checkbox forces tariff two. 27 December through 31 December forces tariff two. A Tuesday at 15:00 stays tariff one. The meter figures do not change. The desk shows the tariff it selected.

The quote form takes tariff one or tariff two, miles, waiting seconds, extra passengers, outside bags, animals other than a guide or hearing dog, bicycles, prams, and a soiling checkbox. One mile is 1760 yards. The result is shown in pence and in pounds. The form needs a tariff. Empty miles and empty waiting quote 0 pence, and the desk adds no fare to the ledger. A soiling charge with no meter is still 12500 pence, because soiling is an extra on a hiring that happened.

Each desk row stores a pickup, a drop-off, a requested time, a vehicle call sign, and a status. The £11.30 sample picks up at Grey's Monument and drops at Shiremoor depot. The £12.40 sample picks up at Shiremoor depot and drops at Grey's Monument.

The day's rows survive a reload in this browser. The desk stores them in `localStorage` under `hackathon-office-day`. Clear day removes that key, and the next reload starts from the offered rows. Restore day rebuilds three completed bookings, 1130, 1240, and 490 pence, and the running total shows 2860. When the bookings panel has no rows, it says No bookings yet. The desk still does not call the API.

The desk has two sample rows. The £11.30 row is tariff one, 3 miles, no waiting, one extra passenger, and one outside bag. The £12.40 row is tariff two, 3 miles, no waiting, and no extras. The £11.30 row shows meter 1040, extras 90, and total 1130. The £12.40 row shows meter 1240, extras 0, and total 1240.

A completed booking renders a plain-text receipt. The slip names the tariff, the miles, the waiting seconds, the extras in pence, and the quoted pence. The £11.30 slip contains 1130 and £11.30. The slip does not include a driver share, a standing charge, or the price of a new car.

A pickup or drop-off whose text is Berwick-upon-Tweed is not saved and adds 0. Hexham, Durham, Sunderland, Grey's Monument, and Shiremoor depot may be saved. This desk does not keep a coordinate table. The fare on a saved booking is still the meter the clerk entered. Buttons move a sample through `offered`, `accepted`, `started`, and `completed`. Cancel is allowed until `completed`. A completed £11.30 booking can be marked cash or account. The pence stays 1130 either way.

Completing the £11.30 row adds 1130 pence once. A second press does not add it again. Cancel from `offered` adds 0. A completed booking does not become cancelled.

A button fills the mixed tariff-one case from [Taxi fares](#taxi-fares): the first 161.3 yards in 20 seconds, then 46.8 seconds waiting. The desk shows 265 pence, £2.65, not 290. Exact 322.6 yards on tariff one also shows 265. The mixed button stays 265. Three more buttons quote the flag falls: tariff one at exact 161.3 yards and no waiting is 240 pence, tariff two at exact 140.5 yards and no waiting is 315 pence, and tariff two at 0 yards and 45 seconds is 315 pence.

Two extras rows sit with the samples. A hiring with no miles, no waiting, and soiling is 12500 pence. A guide or hearing dog adds 0. Tariff one, 1 mile, no waiting, one animal, and no soiling is 490 + 300 = 790 pence.

Alex runs the 1130 pence booking and the 490 pence mile. Sam runs the 1240 pence night booking. Completed takings are Alex 1620 pence and Sam 1240 pence. The day is still 2860 pence. These are gross fares. The desk does not subtract a driver share.

Tariff one at 1 mile is shown as flag 240 plus 10 units of 25, total 490. Tariff one, 1 mile, one pram, and one outside bag is 490 + 50 + 40 = 580. The offered book includes Alex's 1 mile at 490 pence. Cancelling Sam's £12.40 row and completing Alex's £11.30 row and that mile leaves the running total at 1620 pence. The company day of 2860 pence stays in the ledger panel.

The company day is its own ledger, separate from any single booking and separate from the game. It is three completed bookings, 1130, 1240, and 490 pence, and one cancel that adds 0. The 490 pence booking is tariff one, 1 mile, no waiting, and no extras. The sum is 2860 pence (£28.60). The desk labels that total completed-day. One hiring with no meter and soiling on is 12500 pence. The desk labels that `soiling-day`. The 2860 day stays beside it. Seven of those days are 20020 pence. The desk labels that `company-week`. It is not the game week. A day with no bookings is 0 pence. A day whose only booking is the cancelled 490 pence mile is also 0. The desk labels both `empty-day`. The 2370 and 2860 totals stay.

The same three bookings, with the 490 pence mile cancelled before completion instead of completed, sum to 2370 pence. The desk labels that total cancelled-mile. Cancelling before `completed` leaves that fare off the ledger. A booking that has been completed does not then become cancelled.
