# Pages on the site

| URL | File | What |
|-----|------|------|
| `/` | `index.html` | Desktop home |
| `/progress.html` | `progress.html` | Catch-up snapshot (been away?) |
| `/app/` | `app/index.html` | Map — waypoints, phones, drawer, optional buses. See [The map](#map) |
| `/board.html` | `board.html` + `board-app.js` | To do, Next, In progress, Ready to deploy, Done |
| `/backlog.html` | `backlog.html` | Backlog |
| `/todo.html` | `todo.html` | Full to-do list |
| `/done.html` | `done.html` | Done archive |
| `/api-test.html` | `api-test.html` | Alpine `GET /test_field` |
| `/account.html` | `account.html` | Register / login / `GET /users/me` |
| `/docs/` | `docs/index.html` | This wiki |
| `/onboarding.html` | `onboarding.html` | Clone / run / git |
| `/lewis.html` | `lewis.html` | Lewis’s night log |

Shared: `styles.css`, `logo.svg`, sticky nav. **Docs** in the nav is `/docs/`.

## Nav

Most HTML files copy the same nav by hand, including the board pages. If you add a nav item, update each file. `update_board.py` does not rewrite them.

## Where new files go

| Kind | Where |
|------|--------|
| Product screen | Repo root or `app/` |
| Documentation | `docs/` (register in `pages.json`) |
| Connor’s notes | `docs/connor/` with id prefix `connor-` |

See [Add a wiki page](#adding).
