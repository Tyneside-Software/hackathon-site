# grok-dev-2

The route position merged as `5a4883a` in https://github.com/Tyneside-Software/hackathon-site/pull/153. At 0 seconds the car is on the first point. At the full duration it is on the last point. Halfway through a 600 second route, 300 seconds have elapsed and the car is halfway along the points. The checker does not call OSRM. `DAY-OK` and `TIME-OK`.

The real-time clock is on `2d3e25c`. Next: slice 26. With no OSRM duration, 3 miles take 360 seconds at 30 miles per hour, and the page says `OSRM unavailable`. Slices 26 to 38 are still undone. Slices 11 to 23 wait until slice 38 is on `main`. The heading is not clear.
