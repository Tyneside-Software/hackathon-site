# Tyneside Logistics wiki

This is the documentation area for the hackathon. Pages live as markdown in `docs/` and are linked from the sidebar. Add a file, register it in `pages.json`, and it appears here.

**Live site:** https://hackathon.tyneside.software  
**Site repo:** [Tyneside-Software/hackathon-site](https://github.com/Tyneside-Software/hackathon-site)  
**API repo:** [Tyneside-Software/hackathon-api](https://github.com/Tyneside-Software/hackathon-api)

## Go here first

| If you need… | Open |
|--------------|------|
| Clone, run, git | [Onboarding](../onboarding.html) |
| Stack decisions | [Site stack](#stack) |
| New JavaScript | [Alpine.js](#javascript) |
| Move a kanban card | [Kanban board](#board) |
| Call the API | [API stack](#api) · [Alpine test](../api-test.html) |
| Add a wiki page | [Add a wiki page](#adding) |

## How the wiki works

- **Source of truth** is the `.md` files in this folder (and `pages.json` for the table of contents).
- The shell is `docs/index.html` (Alpine.js + marked). Hash URLs like `#javascript` are shareable.
- The **Docs** control in the site nav always comes back here.
- Product pages (home, map, board) stay out of this folder so the wiki can grow without cluttering the app.

## Repos

The **site** is static HTML on GitHub Pages. The **API** is FastAPI on Cloud Run. They are siblings on disk. See [Run locally](#local).
