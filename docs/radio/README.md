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
3. A continue is a long turn, about 30 minutes of work. Do not finish early. Do not stop after one slice or one issue. The product owner keeps both devs supplied. The devs are not specialised: either may do API or map work, whichever queue the product owner assigned. The integrator does not write the slice text.
4. Product owner: you own short-term priority. Read `## Now`, then the dev radios, then spend the turn in `docs/radio/po.md`. You design, you communicate, and you watch turn length. Details are in `## Turn length` below.
5. grok-dev-1 and grok-dev-2: do the slices the product owner listed for you in `docs/radio/po.md`, then any slices `## Now` still names that are not already on `origin/main`. Skip a slice already on `origin/main`. A list marked Waiting is not work. Office slices, desk slices, fare cards, and map titles M1 to M32 are Waiting. If your queue runs out before the turn has run, pull `main` again. Take the next slice the product owner has put in the reservoir and assigned to either dev. Do not invent a product area. Do not write that the heading is clear. If the product owner has not posted work yet, say `queue empty` in your radio and pull once more before you stop.
6. Do not write `C:\Users\MichaelThomson\source\lanes\desk`. The integrator is the only session that deploys, and only after product code has merged.

## Queue depth

The product owner keeps the devs working. The integrator does not write slice text. A continue does not wait for the integrator to invent the next batch.

On the product owner's turn, `docs/radio/po.md` has two queues and a reservoir:

- `### grok-dev-1` and `### grok-dev-2`. Each lists the next slice and at least 16 unfinished slices. Name the files that dev may edit, so the two devs do not edit the same file.
- `## Reservoir`. At least 24 slices not yet assigned, from the tracker, the booking office, or the empire. Not a fourth product.

If either dev is under 16 unfinished slices, filling that queue is the whole turn. Write the slice, open the issue, merge the radio, and write the next, for about 30 minutes. Do not stop after one issue. Do not write that the titles are finished. Do not reopen a title that already has an issue. No `ready`. Issues 22 and 29 stay `blocked`. Slices 115 to 134 and map titles M1 to M32 stay waiting. Do not migrate the live database.

A dev turn is about 30 minutes of merges. One slice is one pull request, then the radio line, then the next slice, in the same turn. Do not batch the queue into one pull request. Do not stop because an old list such as A1 to A32 or U1 to U32 has ended, if `po.md` still has slices. A note that says a heading is clear is stale.

The integrator directs. The product owner carries it out. The integrator does not design the slices unless Master asks for an intervention. If a dev queue is short, the integrator says so in `## Now` and the product owner fills it. A refill note is not a deploy.

## Turn length

The product owner watches the length of every turn, including their own. A turn is about 30 minutes of real work. One issue, or one slice, is too short.

On each continue, read `docs/radio/grok-dev-1.md`, `docs/radio/grok-dev-2.md`, and your own last note. Look at the commit times. If a dev stopped after a slice or two, say that the turn was short, and leave them enough new slices for about 30 minutes. Tell them the next slice, the files they may edit, and to keep going.

Your own turn is the same length. Designing slices, opening issues, and writing those notes is the work. You should be busy the whole time. When a list is finished, write the next one. Leave yourself the next job in `po.md` under `## Next for me`, so the following continue already has work. Do not end because the old titles were all opened.

You choose the short-term order. Stay inside the tracker, the booking office, and the empire. The integrator points. You do the communicating.

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
