# Alpine.js

**Alpine.js 3 is the JavaScript layer** for new UI on hackathon-site. Official guide: [alpinejs.dev/start-here](https://alpinejs.dev/start-here).

The site is static files on GitHub Pages. Alpine loads from a CDN. No npm, no bundler, no SPA framework.

Leaflet still draws the map. Alpine owns chrome around it (lists, buttons, dialogs, filters) and already runs the wiki and the API test page.

## Include it

In `<head>`, `defer`, pinned:

```html
<script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.14.8/dist/cdn.min.js"></script>
```

Do not use an unpinned `@3` / `@3.x.x` URL on Pages.

`styles.css` already has:

```css
[x-cloak] { display: none !important; }
```

Every island needs `x-data` or nothing runs:

```html
<div x-data="{ open: false }">
  <button type="button" @click="open = !open">Toggle</button>
  <p x-show="open" x-cloak>Visible when open.</p>
</div>
```

Working pages:

- [Alpine API test](../api-test.html) — `GET /test_field`
- This wiki — `docs/index.html` + `docs/wiki.js`

## Conventions

| Do | Do not |
|----|--------|
| One `x-data` island (filter, modal, sidebar) | One giant `x-data` on `<body>` |
| `@click`, `x-show`, `x-for`, `x-model` | React, Vue, jQuery, npm |
| Keep Leaflet in `app/map.js` | Reimplement the map in Alpine |
| `fetch((window.HACKATHON_API \|\| "").replace(/\/$/, "") + "/health")` | Hard-code Cloud Run URLs in components |
| Visible fallback if the API or OSRM is down | Blank page on network failure |
| `type="button"` on buttons | Accidental submit / navigate |

Keys and functions: camelCase (`personFilter`, `load()`). Prefer methods on the data object over long `@click` strings.

### Dialogs

Native `<dialog>` plus Alpine is the intended board-modal shape:

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

`board.js` already locks body scroll while the modal is open. Port that when the modal moves to Alpine.

## What is still vanilla

Leave these working. Migrate by card, not as a rewrite.

| File | Role | Later |
|------|------|--------|
| `board.js` | Person filter, card modal, `#t-04`, to-do/done summaries, scroll lock | Alpine on board / archives |
| `app/map.js` | Leaflet, waypoints, OSRM + straight line | Keep Leaflet; sidebar can be Alpine |
| `config.js` | `window.HACKATHON_API` | Stay a blocking script, included first |

Do not delete `board.js` until filters + modal + hash work without it.

Migrate a slice:

1. Add the Alpine `<script defer>` on that page.
2. Rebuild one island with `x-data`.
3. Confirm Home, Map, and Board still load.
4. Remove only the vanilla that island replaced.

## Calling the API

```html
<script src="config.js"></script>
```

From `app/` the path is `../config.js`. There is no site-root `/config.js` on GitHub Pages.

```js
async function health() {
  const base = (window.HACKATHON_API || "").replace(/\/$/, "");
  const res = await fetch(base + "/health", { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error("health " + res.status);
  return res.json();
}
```

The committed default in `config.js` is the Cloud Run URL. CORS is the API’s job (`CORS_ORIGINS`). Serve from `http://127.0.0.1:5500` or Pages, never `file://`.

## Cheatsheet

| Need | Alpine |
|------|--------|
| State | `x-data="{ count: 0 }"` |
| Click | `@click="count++"` |
| Text | `x-text="count"` |
| Show / hide | `x-show="open"` |
| List | `template x-for="stop in stops"` |
| Input | `x-model="name"` |
| Classes | `:class="open && 'is-on'"` |
| Init | `x-init="load()"` or `init()` on the object |
