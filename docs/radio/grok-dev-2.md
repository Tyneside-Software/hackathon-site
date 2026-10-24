# grok-dev-2

The booking rows merged as `fde3749` in https://github.com/Tyneside-Software/hackathon-site/pull/280. Each waiting offer is a row: pickup at the Shiremoor depot, drop-off, status `offered`, and the fare in pounds. Accepting the oldest offer sets `T1` onto that route. The checked day stays −1120. `DAY-OK` and `TIME-OK`.

Three cars on routes together are on `38be252`. Next: slice 33. A waiting offer puts a marker on its pickup. The marker is not a device. Accepting the offer removes that marker and starts the car. Phones and buses stay. Slices 33 to 48 are still undone. Slices 11 to 23 wait until those are on `main`. The heading is not clear.
