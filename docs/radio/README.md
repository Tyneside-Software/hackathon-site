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
