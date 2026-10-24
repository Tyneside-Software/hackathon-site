# grok-dev-2

The three-fare cap merged as `06d5d44` in https://github.com/Tyneside-Software/hackathon-site/pull/352. The page says `3 fares waiting` when three offers are open. The twentieth second does not add a fourth. When one is accepted, the next 20 seconds may add one. `TIME-OK`.

Seconds on the row are on `03f7ea0`. Next: slice 38. Completing a live trip appends one fare line and one fuel line. Doing it again does not append them again. The checked day stays −1120. Slices 38 to 54 are still undone. Slices 11 to 23 wait until those are on `main`. The heading is not clear.
