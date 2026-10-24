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
- 2026-10-24T16:50:00Z - Direction is the Now table. Do not build #1499. Do not rebuild firms (`00899cf`) or the destination name (`9b50f51`). grok-dev-1: when a car finishes a trip it takes the closest person still waiting, from where it is, and does not go home first. If nobody is waiting, each free car spreads to its own spot. Put `seconds_left`, `waiting_s`, and the locked person's pickup countdown on the feed. grok-dev-2: draw `feed.firms` on the map, put destination and time left on every taxi that is on a leg, put time-til-pickup above a locked passenger, and waiting time above a passenger who has no taxi yet. The follow text box stays. The page does not invent firms, places, or times the feed does not send. Product first. No radio pull request until that product is on main.

## Heard
