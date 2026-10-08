# Board updates

The live board is SQLite on the API. These files are the copy for a machine that does not have that database yet.

Wiki: [docs/#board](../docs/#board).

| File | Role |
|------|------|
| `scripts/cards.json` | Git copy of the cards |
| `../board-snapshot.json` | Read-only fallback the pages load when the API has no board |
| `hackathon-api/app/board_seed.json` | Imported only into an empty board |

```powershell
python scripts/update_board.py list
python scripts/update_board.py pull
python scripts/update_board.py done 12 --by michael
python scripts/update_board.py move 07 doing --by connor
python scripts/update_board.py move 07 backlog --by connor
python scripts/update_board.py move 07 todo --by connor --reason "Not ready."
python scripts/update_board.py assign 07 lewis+noah --by michael
python scripts/update_board.py commit 12 --repo hackathon-site --sha abcdef1 --by michael --summary "What it did"
python scripts/update_board.py add --title "A new slice" --person lewis --hours 2 --column backlog --brief "What done looks like."
```

`pull` copies SQLite into the three files above. Run it after real edits if those edits have to survive a new database.
