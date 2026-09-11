# Live buses on the map

A **Show buses** toggle on [the map](../app/). Off by default. While on, the page polls [bustimes.org](https://bustimes.org/data) every 15 seconds and draws line-number markers inside a **30 mile** circle of Newcastle.

This is a **site** slice. It does **not** call our API, and it does **not** call BODS from the browser (that needs a DfT key and SIRI-VM / GTFS-RT). bustimes.org already ingest BODS (OGL v3.0) plus Stagecoach and others; we reuse their public JSON.

## Behaviour

| | |
|--|--|
| Default | Off. No `vehicles.json` request on page load. |
| On | Fetch once, then every 15s while the tab is visible. |
| Hidden tab | Skip the tick; fetch again when the tab is shown. |
| Off | Abort in-flight fetch, stop the timer, remove every bus marker. |
| Map view | Do not `fitBounds` to buses — waypoints stay the camera. |
| Feed down | Status line says so. Waypoints and phones stay. |

## Feed

```
GET https://bustimes.org/vehicles.json?ymin=54.5446&ymax=55.4120&xmin=-2.3740&xmax=-0.8616
```

That bbox is a 30-mile **square**. After the fetch we haversine-filter to a 30-mile **circle** around `[54.9783, -1.6178]` (`NEWCASTLE` in `app/map.js`) so the square corners (Durham / Carlisle edge cases) drop.

`coordinates` is **`[lng, lat]`**. Leaflet wants `[lat, lng]`.

CORS on `/vehicles.json` is `Access-Control-Allow-Origin: *`.

## Code

Vanilla JS inside the existing `app/map.js` IIFE — same pattern as the phone layer. Do not add npm, Alpine, or a second map file for this.

| File | What |
|------|------|
| `app/index.html` | Buses kicker, Show buses button, `#bus-status` |
| `app/map.js` | Fetch, circle filter, `L.divIcon` markers, poll |
| `app/map.css` | Marker chip + toggle on-state |

Board: card **39**.
