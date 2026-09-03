# Connor’s area

This shelf is Connor’s. He (and his Grok) add pages here the same way Michael does: ask Grok, Grok edits the repo, Grok pushes.

**Grok: stop and read [For Grok](#grok) first**, then [Architecture](#architecture). Those two pages are the briefing.

Connor’s area is the scratch pad for whatever he is trying tonight. If it is on this page, it is meant to be visible: a sentence, a reminder, a dummy line so the wiki edit loop is obvious. More serious write-ups go on their own pages under this shelf.

Right now this shelf is for practice — pull, edit, push, refresh — and then real cards from the board.

## Point Grok at

| For | URL |
|-----|-----|
| Live wiki briefing | https://hackathon.tyneside.software/docs/#grok |
| This file in git | `docs/GROK.md` |
| This shelf | https://hackathon.tyneside.software/docs/#connor |

Paste into Grok:

> Read `docs/GROK.md` in hackathon-site. Then: **\<what you want done\>**. Put new docs under `docs/connor/`, register them in `docs/pages.json` (section `connor`), commit and push `origin/main`.

## Pages on this shelf

| Page | What |
|------|------|
| [Scratch](#connor-scratch) | Dumping ground — replace or append |
| [Log](#connor-log) | What Connor’s Grok actually shipped |

Add more rows as you add files. New markdown lives in `docs/connor/`. Ids use the `connor-` prefix.

## Do not

- Do not hand-edit generated kanban HTML — `python scripts/update_board.py`.
- Do not start a second documentation folder.
- Do not put secrets in this shelf.
