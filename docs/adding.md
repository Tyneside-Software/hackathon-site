# Add a wiki page

The wiki is meant to accumulate. Do not invent a second docs tree. How the wiki is wired: [Architecture](#architecture).

## Steps

1. Add a markdown file in `docs/`, e.g. `docs/routing.md`.
2. Open `docs/pages.json`.
3. Append a page object under the right `sections[]`:

```json
{
  "id": "routing",
  "title": "Routing and OSRM",
  "file": "routing.md",
  "summary": "How Calculate route works."
}
```

4. Link to it from another page with a hash: `[Routing](#routing)`.
5. Reload `/docs/#routing`. No Python render step.

## Rules

| Field | Meaning |
|-------|---------|
| `id` | Hash URL (`#routing`). Lowercase, no spaces. |
| `title` | Sidebar label. |
| `file` | Markdown in `docs/`. |
| `summary` | One line on the home cards and search. |
| `href` | Use instead of `file` for a real HTML page (onboarding, API test). |

- Keep product UI in the repo root; keep documentation in `docs/`.
- Prefer short pages that link each other over one giant file.
- The sidebar search matches title + summary.
- Markdown is fetched at runtime — serve over `http://127.0.0.1:5500/docs/`, not `file://`.

## Connor

Connor’s pages go in `docs/connor/` with ids prefixed `connor-`. Register them in the `connor` section of `pages.json`. Point Grok at [For Grok](#grok) — that file is the whole briefing.

## People

If you mention a new teammate on the kanban, that is `scripts/update_board.py` (`PEOPLE`), not this wiki. See [Kanban board](#board).
