# Kanban board

How this sits in the product: [Architecture](#architecture).

The board, backlog, to-do list, and done list are one SQLite board on the API (`GET /v1/board`). Drag a card by its body, or open it and use the buttons. While a card is held over a column, the Done count, or a list, that zone shows a violet dashed frame. The board does not ask who you are, and it does not keep a card history.

Click a name tag to switch that person. Michael is light purple, Reeve is teal, Connor is blue, Lewis is amber, and Noah is rose. No one clears that name. A card that already has several people keeps a tag for each, and the menu changes the one that was clicked. The first person is the group the card sits under. Find matches a title or a note. Undo and Redo step back the last saves in this browser.

Value is 1 to 5. Hours can be blank, which shows as no estimate. A card can move to any column, including back, with no reason. The backlog is a side pile. On the work board, Done is a count with a link to the done page. Drop a card on that count to finish it. To do is twice as wide as the other columns, with two cards to a row. The four columns share the screen, so the page does not scroll sideways.

| Page | What it shows |
|------|----------------|
| [board.html](../board.html) | To do (wide), Next, In progress, Ready to deploy, and a Done count |
| [backlog.html](../backlog.html) | Not on the board yet |
| [todo.html](../todo.html) | Every to-do card |
| [done.html](../done.html) | Finished cards |

On this machine, `http://127.0.0.1:5500/board.html` talks to `http://127.0.0.1:8080`. The public site uses `config.js`, then falls back if that API has no board yet.

## The cards are not only in the database

The database deployment is not the live server yet. Current cards are also in git, in three files that stay copies of each other:

| File | Why it exists |
|------|----------------|
| `hackathon-api/app/board_seed.json` | Loaded the first time a database has no cards. Never overwrites a database that already has cards, and does not refill a board that was emptied. |
| `scripts/cards.json` | Same copy, in the site repo |
| `board-snapshot.json` | What the pages show when `/v1/board` does not answer, so GitHub Pages still has every card |

After edits in SQLite, copy them back before you depend on a new machine or a fresh deploy:

```powershell
python scripts/update_board.py pull
```

That writes all three files. Commit them when you want the next empty database, and the public fallback, to include those edits.

```powershell
python scripts/update_board.py list
python scripts/update_board.py done 12 --by michael
python scripts/update_board.py move 07 doing --by connor
python scripts/update_board.py move 07 backlog --by connor
python scripts/update_board.py move 07 todo --by connor --reason "Not ready."
python scripts/update_board.py assign 07 lewis+noah --by michael
python scripts/update_board.py commit 12 --repo hackathon-site --sha abcdef1 --by michael --summary "What it did"
python scripts/update_board.py add --title "A new slice" --person lewis --hours 2 --column backlog --brief "What done looks like."
```

When the API is running, those commands change SQLite and then pull. When it is not, they change the JSON seed only, and they will not import over a database that already exists.

People: Reeve, Connor, Michael, Lewis, Noah.
