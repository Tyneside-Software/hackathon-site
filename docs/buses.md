# Live buses on the map

A **Show buses** toggle on [the map](../app/). Off by default. While on, the page polls **our API** `GET /v1/buses` every 15 seconds and draws vehicles inside a **30 mile** circle of Newcastle. How it sits next to waypoints and phones: [The map](#map).

The browser does **not** call bustimes.org. It does **not** call BODS. One looking tab is enough to refresh a Firestore snapshot; every other tab reads that snapshot. If nobody has the layer on, nothing is fetched.

## Behaviour

| | |
|--|--|
| Default | Off. No `/v1/buses` request on page load. |
| On | `GET /v1/buses` once immediately, then every 15s while the tab is visible. |
| Hidden tab | Skip the tick; fetch again when the tab is shown. |
| Off | Abort in-flight fetch, stop the timer, remove every bus marker. Status returns to `Off — no data fetched.` |
| Map view | Do not `fitBounds` to buses — waypoints stay the camera. Pan/zoom repaints from the last payload (no extra request). |
| Viewport | Only vehicles in the current map bounds (plus a small pad) are drawn. Zoomed out, that is the whole 30-mile circle. |
| Any zoom below 14 | Coloured **dots** — still drawn, including when the map is wide. |
| Zoom 14+ | Upright **line-number chips** with a heading pip. |
| Stale vehicle | Pings older than **10 minutes** are not drawn. |
| Status | Count in view, 30-mile count, newest ping age, **cache age** or **refreshed**. |
| Click | Popup. Does **not** drop a waypoint. |
| Feed down | Status line. Waypoints and phones stay. |

Demo URL: [`/app/?buses=1`](../app/?buses=1) (optional `&zoom=14` for chips).

## Shared cache

```
  Map tab(s)                  hackathon-api                 Firestore
  GET /v1/buses  ──────────►  snapshot younger than 15s? ──► BusCache/newcastle
       ▲                         │ no: fetch bustimes.org
       │                         │ write snapshot
       └──── vehicles JSON ──────┘
```

- **TTL 15s.** Fresh snapshot is served from memory (same Cloud Run instance) or Firestore (every instance).
- **Lazy.** No Cloud Scheduler. No looking clients → no GET → no bustimes.org hit.
- **One upstream.** A lock plus a second cache read stop a thundering herd on one instance. Occasional double-fetch across instances is still far cheaper than every browser hitting bustimes.org.
- **Slim payload.** id, coordinates `[lng,lat]`, heading, datetime, destination, line name, colours. ~300 vehicles, well under the 1MB document limit.
- **Fallback.** Firestore first, Datastore `BusCache` blob, then in-memory. If bustimes.org is quiet we serve the last snapshot with `stale: true`.

`GET /v1/buses` stays **unauthenticated**, same as map phone reads. Card **45**. First toggle: **39**. Readable chips: **44**.

## Code

| File | What |
|------|------|
| `hackathon-api/app/routers/buses.py` | GET, TTL, upstream fetch, slim |
| `hackathon-api/app/db.py` | `BusCache` read/write |
| `app/index.html` | Buses kicker, Show buses, `#bus-status` |
| `app/map.js` | Poll `/v1/buses`, viewport + zoom mode, chips |
| `app/map.css` | Dots, chips, heading pip |

API `VERSION` **0.1.7**.
