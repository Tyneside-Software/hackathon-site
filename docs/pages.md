# Pages on the site

| URL | File | What |
|-----|------|------|
| `/` | `index.html` | Desktop home |
| `/progress.html` | `progress.html` | Catch-up snapshot (been away?) |
| `/app/` | `app/index.html` | Map, waypoints, OSRM (vanilla `map.js`) |
| `/board.html` | `board.html` + `board.js` | Kanban preview |
| `/todo.html` | generated | Full to-do list |
| `/done.html` | generated | Done archive |
| `/api-test.html` | `api-test.html` | Alpine `GET /test_field` |
| `/docs/` | `docs/index.html` | This wiki |
| `/onboarding.html` | `onboarding.html` | Clone / run / git |
| `/lewis.html` | `lewis.html` | Lewis’s night log |

Shared: `styles.css`, `logo.svg`, sticky nav. **Docs** in the nav is `/docs/`.

## Nav

Most HTML files copy the same nav by hand. `todo.html` and `done.html` get theirs from `scripts/update_board.py` (`render_archive_page`). If you add a nav item, update the static files **and** that template, then `python scripts/update_board.py render`.

## Where new files go

| Kind | Where |
|------|--------|
| Product screen | Repo root or `app/` |
| Documentation | `docs/` (register in `pages.json`) |
| Connor’s notes | `docs/connor/` with id prefix `connor-` |

See [Add a wiki page](#adding).
