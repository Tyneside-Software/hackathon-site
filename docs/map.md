# The map

Live at [hackathon.tyneside.software/app/](../app/). One Leaflet canvas, three layers, one vanilla IIFE in `app/map.js`. Do **not** rewrite that file. Append a module, the same way phones and buses were added.

Centre: Newcastle `[54.9783, -1.6178]`.

## Layers

| Layer | Default | Data | Poll |
|-------|---------|------|------|
| Waypoints + route | On | Clicks on the map. Public OSRM driving geometry; haversine straight-line if OSRM fails | None |
| Phones | On | Our API `GET /v1/devices` last-known. Drawer: `GET /v1/locations?device_id=` | 8s |
| Buses | **Off** | Our API `GET /v1/buses` (Firestore cache of bustimes.org). Browser never calls bustimes.org | 15s, only while the toggle is on |

None of these `fitBounds` over the others except: clicking a phone card flies to that device, and **Show history on map** may pad to the ping path. **Show buses** must not steal the camera.

If our API is quiet, waypoints still work. If bustimes.org is quiet, phones and waypoints still work. Never a blank map.

## Waypoints

Click to drop a stop, drag to move, remove from the list, **Calculate route**, **Clear**. Sidebar shows distance, time, and engine (`OSRM driving` or `straight-line`). Card 04 / 05.

## Phones

Amber circle markers from last-known devices. Sidebar cards: id, age (`last_seen_at` = last communication from the phone), fresh/stale styling. Click a card to zoom and open a **device drawer**.

The drawer lists LocationPings. Consecutive pings at the same place are hidden (`uniquePings` in `app/map.js`). **Show history on map** draws a polyline of the remaining points; hide it and you are back to last-known only.

`last_seen_at` is when the ping **left the phone**, not a stale GPS clock. The Android app POSTs every minute even if lat/lng have not moved. [Android tracker](#android).

## Buses

**Show buses** / **Hide buses**. Off means no request at all. While on: `GET /v1/buses` every 15s. The API serves a Firestore snapshot (TTL 15s) or, if that snapshot is stale, fetches bustimes.org once and writes it. Only vehicles in the **current view** are drawn. City zoom (12–13) is coloured dots; zoom 14+ is upright line-number chips. Hidden tab: skip the tick. Clicking a bus opens a popup and does **not** add a waypoint.

Full page: [Live buses](#buses).

Full page: [Live buses](#buses).

## Files

| File | Role |
|------|------|
| `app/index.html` | Sidebar (route, buses, phones) + phone drawer |
| `app/map.js` | One IIFE. Leaflet + OSRM + phones + buses |
| `app/map.css` | Shell, cards, drawer, bus chips |
| `../config.js` | `window.HACKATHON_API` |

New map behaviour stays **vanilla JS inside that IIFE**. Alpine is for wiki / API-test chrome, not a second map stack.

## Related

[Architecture](#architecture) · [API](#api) · [Android](#android) · [Buses](#buses) · [Alpine.js](#javascript)
