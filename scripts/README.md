# Board updates

Do not hand-edit the kanban columns, hour cards, or Who’s who in `board.html`. Those blocks are generated.

**Source of truth:** `scripts/cards.json`  
**Script:** `python scripts/update_board.py` (stdlib only)

From the repo root:

```powershell
python scripts/update_board.py list
python scripts/update_board.py done 12 15 16
python scripts/update_board.py done 10 --tag "Cloud Run · CORS"
python scripts/update_board.py move 07 doing
python scripts/update_board.py add --title "A new slice" --person lewis --hours 2 --column todo --brief "What done looks like."
python scripts/update_board.py render
```

`done`, `move`, and `add` rewrite `board.html` and `done.html` for you.

`import-html` rebuilds `cards.json` from the current `board.html` if the JSON is missing (`--force` to overwrite).
