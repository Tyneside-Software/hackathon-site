# Live buses on the map

A **Show buses** toggle on [the map](../app/). Off by default. While on, the page polls [bustimes.org](https://bustimes.org/data) every 15 seconds and draws vehicles inside a **30 mile** circle of Newcastle. How it sits next to waypoints and phones: [The map](#map).

This is a **site** slice. It does **not** call our API, and it does **not** call BODS from the browser (that needs a DfT key and SIRI-VM / GTFS-RT). bustimes.org already ingest BODS (OGL v3.0) plus Stagecoach and others; we reuse their public JSON.

## Behaviour

| | |
|--|--|
| Default | Off. No `vehicles.json` request on page load. |
| On | Fetch once immediately, then every 15s while the tab is visible. |
| Hidden tab | Skip the tick; fetch again when the tab is shown. |
| Off | Abort in-flight fetch, stop the timer, remove every bus marker. Status returns to `Off — no data fetched.` |
| Map view | Do not `fitBounds` to buses — waypoints stay the camera. Pan/zoom repaints from the last fetch (no extra request). |
| Viewport | Only vehicles in the current map bounds (plus a small pad) are drawn. The rest of the 30-mile circle stays in memory. |
| City zoom (12–13) | Coloured **dots**. Status says how many, and that zooming in shows line numbers. |
| Street zoom (14+) | Upright **line-number chips**. A heading pip rotates; the number stays readable. |
| Zoomed out (&lt; 12) | Markers hidden. Status: zoom in — N live within 30 miles. |
| Stale | Pings older than **10 minutes** are not drawn. |
| Status | Count in view, count in the 30-mile circle, stale hidden, **newest ping** age (so you can see the feed is moving). |
| Click | Opens a popup (service, destination, vehicle, age). Does **not** drop a waypoint (`bubblingMouseEvents: false` plus a map-click guard). Popup does not pan the map. |
| Feed down | Status line says so. Waypoints and phones stay. |

Demo URL: [`/app/?buses=1`](../app/?buses=1) (optional `&zoom=14` for chips).

The feed is about **300** vehicles in the 30-mile circle. Drawing all of them as labels at city zoom was unreadable. Viewport + dots-then-chips is the fix. Card **44**.

## Feed

```
GET https://bustimes.org/vehicles.json?ymin=54.5446&ymax=55.4120&xmin=-2.3740&xmax=-0.8616
```

That bbox is a 30-mile **square**. After the fetch we haversine-filter to a 30-mile **circle** around `[54.9783, -1.6178]` (`NEWCASTLE` in `app/map.js`) so the square corners (Durham / Carlisle edge cases) drop.

`coordinates` is **`[lng, lat]`**. Leaflet wants `[lat, lng]`.

CORS on `/vehicles.json` is `Access-Control-Allow-Origin: *`. Confirmed from the browser.

Operator colour comes from `vehicle.css` (or `vehicle.colour`) when it is a hex. Chip text uses `vehicle.text_colour` when present.

## Code

Vanilla JS inside the existing `app/map.js` IIFE — same pattern as the phone layer. Do not add npm, Alpine, or a second map file for this.

| File | What |
|------|------|
| `app/index.html` | Buses kicker, Show buses button, `#bus-status`. Cache-bust query on map assets. |
| `app/map.js` | Fetch, circle + viewport filter, zoom mode, `L.divIcon` dots/chips, poll |
| `app/map.css` | Dots, upright chips, heading pip, toggle on-state |

Board: cards **39** (first toggle), **43** (first fetch was aborting), **44** (this polish).
