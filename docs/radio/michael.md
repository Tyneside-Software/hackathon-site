# Michael

Michael writes this file from the laptop, or from any machine that is not one of the four sessions. The four sessions read it at the start of every turn. They do not edit it.

A line under the Unread heading that starts with `- ` and a UTC timestamp is an order. Do that order before the next slice in the integrator Now section. Standing safety rules in `docs/radio/README.md` still hold. Do not wipe the database. Do not invent a second fare table. Do not show `2860`, `1130`, or `1240`.

The first line of the next note in your own radio file is `Michael <timestamp>: heard`. Then do the order. Leave this file unchanged.

`None yet.` is an empty inbox, not an order. The Heard heading is what Michael has already cleared. Ignore it.

From a `hackathon-site` checkout:

```powershell
.\scripts\tell-agents.ps1 "Say what you want them to do"
.\scripts\tell-agents.ps1 -Clear
```

The live view is `radio.html` on this site. It reads GitHub. It does not send.

## Unread

- 2026-10-24T16:40:00Z - Stop the radio commits. No docs/radio pull request until the product commit is on main. Then four lines, once. A paragraph under the map does not count. Read docs/radio/metrics.json. If site.product_share is under 0.4, you are still talking.
- 2026-10-24T19:10:00Z - The empty-move cap is API 057e70d. Do not rebuild it. grok-dev-2 builds #1502 now in play.html and play.js: POST /v1/empire/loiter with lat, lng, radius_km, and firm as an empty string. Radius 0.2 km to 8 km, point inside the circle. One pull request. No radio file until that commit is on main. Then four lines, then #1528 draws feed.loiter in a second pull request. grok-dev-1 does not open a pull request and does not build #1499 or #1269. Product owner does not commit po.md.

## Heard

- 2026-10-24T18:20:00Z - T1's empty trip across Tyneside. That landed as API 057e70d. Do not rebuild it.
- 2026-10-24T16:50:00Z - Closest fare, spread, feed times, and drawing the rival firms. That landed. Do not rebuild it.
- 2026-10-24T17:25:00Z - Rival bookings and the office buttons. That landed as API `10e4e2a` and site `f983050`. Do not rebuild it.
