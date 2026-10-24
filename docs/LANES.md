# Lanes

How several people, or several Grok sessions, change these repos at the same time.

The branch everyone syncs with is `main`. GitHub’s default branch is `main`. The Linux box deploys only `origin/main`, by fast-forward. There is no long-lived `develop` branch. A copy of the three repos per worker is what keeps their files apart. Branches are how the work meets again.

Read [Development loop](#loop) for tests and for the integrator’s deploy. Read [Linux box and deploy](#linux) before anyone connects to the box.

## Who may deploy

| Checkout | On Michael’s PC | Merge to `main` | Deploy the box |
|----------|-----------------|-----------------|----------------|
| Integrator | `C:\Users\MichaelThomson\source\hackathon-site` and its two siblings | Yes | Yes. `.\scripts\box.ps1 update`, then `.\scripts\check.ps1` |
| Product owner | `C:\Users\MichaelThomson\source\lanes\po` | Its own radio branch | No |
| grok-dev-1 | `C:\Users\MichaelThomson\source\lanes\grok-dev-1` | Its own pull requests | No |
| grok-dev-2 | `C:\Users\MichaelThomson\source\lanes\grok-dev-2` | Its own pull requests | No |

A lane merges by squash-merging its own pull request. It does not push `main` by hand and it does not force-push `main`. It does not run `box.ps1`. It does not read `C:\Users\MichaelThomson\Desktop\hackathon-linux.md`. The PC folder `lanes\desk` is not a channel. Read `docs/radio/README.md`.

On another machine, clone the three repos as siblings, add your own `LANE.txt`, and open a pull request. You do not have the deploy password. Do not copy that Desktop file, and do not copy `C:\Users\MichaelThomson\Desktop\confidential docs` into a repo.

## Branches

Name: `lane/<owner>/<slug>`

`owner` is a GitHub login, or a lane id such as `grok-dev-1`. `slug` is a short kebab-case name of one issue. Branch from a fresh `origin/main` in every repo that issue touches.

- One issue, one branch name, used in each repo you change.
- Before you push, run `.\scripts\lane-sync.ps1` from `hackathon-site`. On `main` it fast-forwards. On a `lane/*` branch it rebases onto `origin/main`.
- After that rebase, update the remote branch with `git push --force-with-lease`. That is allowed on your own `lane/*` branch only.
- Never force-push `main`. Never force-push someone else’s branch. `reeve-branch` on hackathon-api is an existing open pull request. Leave it alone.
- The integrator checkout stays on `main`. It does not use a lane branch for its own edits.

## Issues and pull requests

Work items are GitHub issues on [hackathon-site](https://github.com/Tyneside-Software/hackathon-site) only, even when the edit is in the API or the Android repo. One issue is one unit of work.

Labels:

| Label | Meaning |
|-------|---------|
| `ready` | A dev lane may take it |
| `in-progress` | A lane has claimed it |
| `blocked` | The lane is stuck and has said why |
| `repo:site` `repo:api` `repo:android` | Which checkouts the work touches |
| `lane:grok-dev-1` `lane:grok-dev-2` | Which prepared lane has it. A human uses `lane:<github-login>` the same way |

Issues `1`, `2`, `3`, `4`, and `18` were opened in September 2026 and are not labelled `ready`. Do not start them unless the human names them.

A dev lane claims an issue before branching:

```powershell
gh issue edit ISSUE --repo Tyneside-Software/hackathon-site --add-label "in-progress,lane:OWNER,repo:api" --remove-label ready
gh issue view ISSUE --repo Tyneside-Software/hackathon-site --json labels,title
```

If the labels show a different lane, stop. That issue is no longer yours.

The pull request is opened on the repo whose files changed, into `main`. The body links the issue as `Tyneside-Software/hackathon-site#ISSUE`. The lane that owns the branch squash-merges it when that slice passes its check. Do not wait until the end of the turn.

```powershell
gh pr merge NUMBER --repo Tyneside-Software/REPO --squash --delete-branch
```

The integrator deploys from `C:\Users\MichaelThomson\source\hackathon-site` after product code has merged. A radio-only merge is not a deploy. Do not use the words Closes, Fixes, or Resolves in a pull request body.

## What each session does

**Product owner.** Read `docs/radio/integrator.md` on `origin/main`. File the issues listed there. Do not edit product code. After each issue, merge `docs/radio/po.md`. Keep going through that heading in the same turn.

**Dev lane.** Read `docs/radio/integrator.md`. Do your heading, one slice at a time. Commit, rebase onto `origin/main`, push, and squash-merge before the next slice. Update your own radio file by its own merge in the middle of the turn. Read the other radio files before the next slice.

**Integrator.** This is the session on the `source\hackathon-*` folders. It is the session Michael talks to. It writes orders in `docs/radio/integrator.md` and reads the other radio files on `origin/main`. It deploys after product merges. It does not use the desk folder.

## Commands

From `hackathon-site`:

```powershell
.\scripts\lane-sync.ps1
.\scripts\lane-status.ps1
```

`lane-status.ps1` lists site issues, open pull requests in all three repos, live `/health`, and `VERSION` on `origin/main`. A matching version means the API image matches that string. The integrator still confirms the site checkout on the box.

A new dev lane on this PC:

```powershell
.\scripts\new-lane.ps1 -Lane grok-dev-3
```

## Paste-ready prompts

Paste this one word into each session, including the integrator:

```
continue
```

The session is whichever checkout that tab is already using. The meaning is in `docs/radio/README.md`. The work list is `docs/radio/integrator.md`.

Git author on Michael’s PC is `Michael Thomson <michael.thomson@cloudconnectsoftware.com>`. A human on another machine uses their own name and email.
