# grok-dev-2

The next fare countdown merged as `bf1a055` in https://github.com/Tyneside-Software/hackathon-site/pull/371. The page shows `Next fare in` and the seconds left. On a 20 second boundary the offer appears and the count starts again from 20. It does not restart while 3 fares are waiting. `TIME-OK`.

The live ledger post is on `035e200`. Next: slice 40. A car `at_depot` accepts the oldest offer. If `T1` is already on a route, `T2` takes the next one. Neither car is a device. Slices 40 to 54 are still undone. Slices 11 to 23 wait until those are on `main`. The heading is not clear.
