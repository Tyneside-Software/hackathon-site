# Radio

Sessions on this project talk through GitHub `main`. They do not leave orders in a folder on the PC.

`main` is the branch GitHub calls the default branch. There is no `master` branch.

| File | Who may change it |
|------|-------------------|
| `docs/radio/integrator.md` | The integrator session only |
| `docs/radio/po.md` | The product owner only |
| `docs/radio/grok-dev-1.md` | grok-dev-1 only |
| `docs/radio/grok-dev-2.md` | grok-dev-2 only |

Read all four before a slice and again after you merge. Write only your own file.

## The word continue

The human pastes `continue` into each session. That word is the whole order. Do not ask what it means.

You are the session for the checkout you are already in.

| Checkout | Role |
|----------|------|
| `C:\Users\MichaelThomson\source\hackathon-site` | Integrator |
| `C:\Users\MichaelThomson\source\lanes\po\hackathon-site` | Product owner |
| `C:\Users\MichaelThomson\source\lanes\grok-dev-1\hackathon-site` | grok-dev-1 |
| `C:\Users\MichaelThomson\source\lanes\grok-dev-2\hackathon-site` | grok-dev-2 |

On `continue`:

1. Fetch and rebase onto `origin/main`, or fast-forward if you are on `main`.
2. Read this file, `docs/radio/integrator.md`, and the other radio files.
3. Do the Open slices under your own heading, in order. Done slices are not work. The reservoir is not work. A heading is clear only when that Open slices list is empty. A radio note that already says the heading is clear is stale when Open slices are listed. If the list is empty, merge one line saying so, then stop. Do not invent a new product area.
4. Keep going through the remaining Open slices in the same turn. Commit and merge each one before the next. Merge your radio note in the middle of the turn. Do not stop while any Open slice under your heading is still undone.
5. Do not write `C:\Users\MichaelThomson\source\lanes\desk`. The integrator is the only session that deploys, and only after product code has merged.

## Queue depth

The integrator's `continue` is the leadership pass. Read every radio, keep each lane on its next Open slice, and deploy product that has merged. The integrator does not leave a lane idle. Before a deploy, count Open slices that are not yet on `origin/main` for the product owner, grok-dev-1, and grok-dev-2. If any of those three has fewer than 8, move slices out of that lane's reservoir until it has 8, or write new slices from the tracker, the booking office, or the empire game. Do not invent a fourth product. Do not add `ready`. Do not migrate the live database. Issues 22 and 29 stay `blocked`. A refill commit is not a deploy.

A lane that still has an Open slice must not write that its heading is clear.

## During a turn

A turn is long. Do not save the commits, the merges, or the notes for the end.

After each slice that works:

1. Commit it on `lane/<owner>/<slug>`. Author on this PC: `Michael Thomson <michael.thomson@cloudconnectsoftware.com>`.
2. From `hackathon-site`, run `.\scripts\lane-sync.ps1` so the branch rebases onto `origin/main`.
3. `git push --force-with-lease` is allowed on that lane branch only. Never force-push `main`.
4. Open the pull request if it is not open, then `gh pr merge NUMBER --repo Tyneside-Software/hackathon-site --squash --delete-branch`.
5. On a fresh branch from the new `origin/main`, edit only your radio file. Say what merged, the commit, and what you are doing next. Open a pull request and squash-merge it straight away.
6. Pull `main`. Read the other radio files. Start the next slice in the same turn.

A radio note is its own small merge so the others can see it before the next product slice is finished.

## Limits

- The integrator is the only session that runs `box.ps1`. A radio commit is not a deploy. The integrator deploys after product code has merged.
- Do not write `C:\Users\MichaelThomson\source\lanes\desk`.
- Do not read `C:\Users\MichaelThomson\Desktop\hackathon-linux.md` from a lane checkout, and do not copy it or `C:\Users\MichaelThomson\Desktop\confidential docs` into a repo.
- Do not touch September 2026 issues 1, 2, 3, 4, or 18. Do not touch API pull request `reeve-branch`.
- Do not edit another session's radio file. If two slices need the same product file, the integrator's file says who owns it.
