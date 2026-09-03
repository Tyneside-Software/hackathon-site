# Connor’s area

This shelf is Connor’s. He (and his Grok) add pages here the same way Michael does: ask Grok, Grok edits the repo, Grok pushes.

**Grok: stop and read [For Grok](#grok) first** if you have not already. That page is the whole briefing.

## Point Grok at

| For | URL |
|-----|-----|
| Live wiki briefing | https://hackathon.tyneside.software/docs/#grok |
| This file in git | `docs/GROK.md` |
| This shelf | https://hackathon.tyneside.software/docs/#connor |

Paste into Grok:

> Read `docs/GROK.md` in hackathon-site. Then: **\<what you want done\>**. Put new docs under `docs/connor/`, register them in `docs/pages.json` (section `connor`), commit and push `origin/main`.

hello word

## Tonight’s desk

Connor is on the GitHub loop: pull, change something visible, push, refresh the live site. The first practice card is done. Next is proving the same loop on a real product slice — the map job list, or whatever the board says is still his.

Machine notes, in case future-Connor forgets:

- Site lives in `C:\Users\abc\source\hackathon-site`
- API is the sibling folder `hackathon-api`
- Local site is http://127.0.0.1:5500/ — wiki is `/docs/#connor`
- GitHub account for this machine is `conor59`
- Do not open HTML as `file://`; the wiki fetches markdown over HTTP

If the page looks empty after a push, hard-refresh. Pages is just files. What is on `main` is what the wiki shows.

## Pages on this shelf

| Page | What |
|------|------|
| [hello word](#connor-hello-word) | hello word |
| [Scratch](#connor-scratch) | Dumping ground — replace or append |
| [Log](#connor-log) | What Connor’s Grok actually shipped |

Add more rows as you add files. New markdown lives in `docs/connor/`. Ids use the `connor-` prefix.

## Do not

- Do not hand-edit generated kanban HTML — `python scripts/update_board.py`.
- Do not start a second documentation folder.
- Do not put secrets in this shelf.
