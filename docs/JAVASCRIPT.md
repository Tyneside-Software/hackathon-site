# JavaScript — Alpine.js

**Alpine.js 3 is the JavaScript layer for hackathon-site.** New interactive behaviour is Alpine in the HTML, not a fresh vanilla module and not a SPA framework.

Official guide: https://alpinejs.dev/start-here

## Why Alpine

The site is static files on GitHub Pages. Alpine loads from a CDN, needs no npm or bundler, and keeps state next to the markup the team already edits. That matches “releasable each card” better than introducing React/Vue.

Leaflet still draws the map. Alpine owns UI around it (lists, buttons, dialogs, filters).

## How to include it

Put this in `<head>` on any page that uses Alpine, **before** other deferred scripts that expect Alpine to exist. Keep `defer`.

```html
<script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.14.8/dist/cdn.min.js"></script>
```

Pin `3.14.8` (or a later 3.x you have tried). Do not use an unpinned `@3` / `@3.x.x` URL on Pages.

Nothing else to install. No `package.json`.

Every interactive island needs `x-data` or it will not run:

```html
<div x-data="{ open: false }">
  <button type="button" @click="open = !open">Toggle</button>
  <p x-show="open" x-cloak>Visible when open.</p>
</div>
```

Add this CSS once in `styles.css` so `x-cloak` does not flash:

```css
[x-cloak] { display: none !important; }
```

## Conventions

| Do | Don't |
|----|--------|
| One `x-data` object per island (nav filter, modal, map sidebar) | One giant `x-data` on `<body>` for the whole site |
| `@click`, `x-show`, `x-for`, `x-model` for UI | New jQuery, Vue, or React |
| Keep Leaflet in `app/map.js` until an Alpine island wraps the sidebar | Reimplement the map in Alpine |
| `fetch(window.HACKATHON_API + "/health")` for our API | Hard-code Cloud Run URLs in components |
| Fallbacks when the API or OSRM is down | Blank pages on network failure |
| `type="button"` on buttons inside forms / dialogs | Let a button submit or navigate by accident |

### Names

- Directives and `x-data` keys: camelCase (`personFilter`, `waypoints`).
- Prefer small functions on the data object (`init()`, `openCard(id)`) over inline novels in `@click`.

### Dialogs

Native `<dialog>` + Alpine is the board-modal pattern going forward:

```html
<div x-data="cardModal()">
  <dialog x-ref="dlg" @close="onClose()">
    <div class="card-modal-inner" @click.stop>
      <h2 x-text="title"></h2>
      <button type="button" @click="$refs.dlg.close()">Close</button>
    </div>
  </dialog>
</div>
```

Define `cardModal()` in a small page script, or inline `x-data="{ … }"` if it stays tiny.

Lock body scroll while open (the current `board.js` already does this). Port that behaviour when the modal moves to Alpine.

## Existing vanilla files

These predate the Alpine decision. Leave them working. Migrate by card, not as a rewrite.

| File | What it does | Alpine destination |
|------|----------------|--------------------|
| `board.js` | Person filter, card modal, hash `#t-04`, to-do/done summaries, scroll lock | `x-data` on the board / archive pages |
| `app/map.js` | Leaflet map, waypoints, OSRM + straight-line fallback | Keep Leaflet; sidebar/status can become Alpine |
| `config.js` | `window.HACKATHON_API` | Stay as a plain script, included first |

Do not delete `board.js` until the same page does filters + modal + hash without it.

When you migrate a page:

1. Add the Alpine `<script defer>` in `<head>`.
2. Reimplement one island (e.g. person chips) with `x-data`.
3. Confirm Home, Map, Board still load.
4. Remove only the vanilla that that island replaced.

## Talking to the API

```html
<script src="/config.js"></script>
```

From `app/` the path is `../config.js`.

```js
async function health() {
  const base = window.HACKATHON_API || "http://127.0.0.1:8080";
  const res = await fetch(base + "/health", { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error("health " + res.status);
  return res.json();
}
```

CORS is the API’s problem (`CORS_ORIGINS`). The site must be served from `http://127.0.0.1:5500` (or Pages), never `file://`.

## Cheatsheet

| Need | Alpine |
|------|--------|
| State | `x-data="{ count: 0 }"` |
| Click | `@click="count++"` |
| Text | `x-text="count"` |
| Show/hide | `x-show="open"` |
| List | `template x-for="stop in stops"` |
| Input | `x-model="name"` |
| Classes | `:class="open && 'is-on'"` |
| Init | `x-init="load()"` or `init()` on the data object |

Full directive list: https://alpinejs.dev/start-here
