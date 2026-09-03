# Tyneside Logistics wiki

Documentation for the hackathon. The **Docs** control in the site nav always comes here.

If you do not know how the site is wired, start with **[Architecture](#architecture)**.

**Live:** https://hackathon.tyneside.software  
**Site:** [Tyneside-Software/hackathon-site](https://github.com/Tyneside-Software/hackathon-site)  
**API:** [Tyneside-Software/hackathon-api](https://github.com/Tyneside-Software/hackathon-api)

## Go here first

| If you need… | Open |
|--------------|------|
| Been away — current picture | [Current progress](../progress.html) |
| How the two repos fit | [Architecture](#architecture) |
| Clone, run, git (human) | [Onboarding](../onboarding.html) · [Run locally](#local) |
| Libraries on the site | [Site stack](#stack) |
| New JavaScript | [Alpine.js](#javascript) |
| Move a kanban card | [Kanban board](#board) |
| Call the API | [API](#api) · [Alpine test](../api-test.html) |
| Add a wiki page | [Add a wiki page](#adding) |
| Connor + Grok | [Connor’s area](#connor) · [For Grok](#grok) |

## How this wiki works

- Source of truth: markdown in `docs/` plus `pages.json` (sidebar).
- Shell: `docs/index.html` (Alpine.js + marked). Share pages as `/docs/#architecture`.
- Product UI stays in the repo root / `app/`. Documentation stays in `docs/`.
- Serve over HTTP (`http://127.0.0.1:5500/docs/`), not `file://`.

## Repos in one line

The **site** is static HTML on GitHub Pages. The **API** is FastAPI on Cloud Run. They meet only when the browser `fetch`es `window.HACKATHON_API`. [Architecture](#architecture) has the diagram.
