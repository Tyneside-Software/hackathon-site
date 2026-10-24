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
- 2026-10-24T16:31:08Z - While follow is on, show a small text box on the clicked taxi: destination, and time left. Time left is duration_s minus elapsed leg, using the clock play.js already has. Hide the box when follow stops. On the map by the taxi, not a paragraph under it. grok-dev-1 adds the destination place name to that car on the empire feed, from the place the leg already uses. No second place table. grok-dev-2 shows that name and does not invent it. Product first. No radio pull request until this is on main.

## Heard
