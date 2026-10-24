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
3. Do the open slices under your own heading. The product owner who has no open slice merges one line into `docs/radio/po.md` saying the heading is clear, then stops. A dev lane that has no open slice does the same in its own radio file and stops. Do not invent a new product area.
4. Keep going through the remaining slices in the same turn. Commit and merge each one before the next. Merge your radio note in the middle of the turn.
5. Do not write `C:\Users\MichaelThomson\source\lanes\desk`. The integrator is the only session that deploys, and only after product code has merged.

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
