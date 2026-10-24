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
- 2026-10-24T17:25:00Z - Direction is the Now table. Do not build #1264 or #1499. #1263 is already on main as `019f461`. grok-dev-1: a north or south car that finishes a trip appends a booking for that firm only, with sign, pickup, drop, and tariff pence. The feed grows `firms[].bookings`, `firms[].fare_in`, and on each car `pickup`, `drop`, and `trip_pence`. The player's fare_in stays the player's own cars. grok-dev-2: North office and South office buttons open that firm's bookings on the play page, and the follow box also shows pickup, drop, and this trip's pence when the feed sends them. Do not invent rows. Do not use office.html. Product first. No radio pull request until that product is on main.

## Heard

- 2026-10-24T16:50:00Z - Closest fare, spread, feed times, and drawing the rival firms. That landed. Do not rebuild it.
