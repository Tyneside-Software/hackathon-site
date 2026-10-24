# Create or refresh a lane checkout beside the integrator repos.
# Clones the three Tyneside-Software repos, writes LANE.txt and PROMPT.md.
# Does not deploy and does not add the personal remote.
#
#   .\scripts\new-lane.ps1 -Lane grok-dev-3
#   .\scripts\new-lane.ps1 -Lane po -Role po

param(
    [Parameter(Mandatory = $true)]
    [string]$Lane,

    [ValidateSet("dev", "po")]
    [string]$Role = "dev",

    [string]$Root = "C:\Users\MichaelThomson\source\lanes"
)

$ErrorActionPreference = "Stop"
if ($Lane -notmatch '^[a-z0-9][a-z0-9-]{0,40}$') {
    throw "Lane id must be short and lowercase, such as grok-dev-3 or po."
}

$dest = Join-Path $Root $Lane
New-Item -ItemType Directory -Force -Path $dest | Out-Null

@(
    "LANE=$Lane",
    "ROLE=$Role",
    "DEPLOY=no"
) | Set-Content -Path (Join-Path $dest "LANE.txt") -Encoding ascii

$repos = @(
    "Tyneside-Software/hackathon-site",
    "Tyneside-Software/hackathon-api",
    "Tyneside-Software/hackathon-android"
)
foreach ($repo in $repos) {
    $name = ($repo -split "/")[1]
    $path = Join-Path $dest $name
    if (Test-Path (Join-Path $path ".git")) {
        Write-Host "fetch $name"
        git -C $path fetch origin
        if ($LASTEXITCODE -ne 0) { throw "fetch failed for $name" }
    }
    else {
        Write-Host "clone $name"
        gh repo clone $repo $path
        if ($LASTEXITCODE -ne 0) { throw "clone failed for $name" }
    }
}

$prompt = Join-Path $dest "PROMPT.md"
if ($Role -eq "po") {
    $body = @"
# Product owner ($Lane)

You are the product-owner lane. You watch the queue and you write the next piece of work. You do not implement it.

Checkouts, all on ``main``:

- $dest\hackathon-site
- $dest\hackathon-api
- $dest\hackathon-android

Read ``hackathon-site\docs\LANES.md`` and follow it.

Standing orders:

1. Do not edit product code. Do not commit. Do not push. Do not merge a pull request.
2. Do not deploy. Do not run ``box.ps1``. Do not read ``C:\Users\MichaelThomson\Desktop\hackathon-linux.md``. Do not copy ``C:\Users\MichaelThomson\Desktop\confidential docs`` into a repo.
3. Do not touch ``C:\Users\MichaelThomson\source\hackathon-site``, ``hackathon-api``, or ``hackathon-android``. Those folders belong to the integrator session.
4. From ``hackathon-site``, run ``.\scripts\lane-sync.ps1`` and then ``.\scripts\lane-status.ps1``.
5. Turn the human's priorities into GitHub issues on ``Tyneside-Software/hackathon-site``. One issue is one unit of work. Include acceptance criteria, the ``repo:`` labels, and ``ready`` when a dev lane may start. Leave September 2026 issues 1, 2, 3, 4, and 18 alone unless the human names them.
6. Do not give the same ``ready`` issue to two lanes. ``grok-dev-1`` and ``grok-dev-2`` are the prepared dev lanes.
7. When a pull request is open, read it and say whether the test notes are enough. When it is merged, tell the human the integrator session should deploy. You do not deploy.
8. Report the open ``ready`` issues, the open pull requests, and whether live ``/health`` matches ``VERSION`` on ``origin/main``. Then stop, unless the human asked you to keep watching.
"@
}
else {
    $body = @"
# Dev lane ($Lane)

You are development lane ``$Lane``. You implement one ready issue and you open a pull request.

Checkouts:

- $dest\hackathon-site
- $dest\hackathon-api
- $dest\hackathon-android

Read ``hackathon-site\docs\LANES.md`` and follow it. Use ``hackathon-site\docs\LOOP.md`` for how to build and test. Ignore that page's steps that push ``main`` or run ``box.ps1``. Those are for the integrator.

Standing orders:

1. Do not deploy. Do not run ``box.ps1``. Do not read ``C:\Users\MichaelThomson\Desktop\hackathon-linux.md``. Do not copy ``C:\Users\MichaelThomson\Desktop\confidential docs`` into a repo.
2. Do not edit ``C:\Users\MichaelThomson\source\hackathon-site``, ``hackathon-api``, or ``hackathon-android``. Those folders belong to the integrator session.
3. From ``hackathon-site``, run ``.\scripts\lane-sync.ps1`` before you edit and again before you push.
4. Take one issue on ``Tyneside-Software/hackathon-site`` that is labelled ``ready``. Claim it with ``in-progress`` and ``lane:$Lane``, and remove ``ready``, before you branch. Read the issue back. If another lane owns it, stop. If nothing is ``ready``, report and stop. Do not start an issue that is not labelled ``ready``.
5. In each repo you will change, branch ``lane/$Lane/<slug>`` from current ``origin/main``.
6. Test before you push. API tests use ``.\.venv\Scripts\python.exe -m unittest tests.test_board`` from ``hackathon-api``. Android uses JDK 17 and ``.\gradlew.bat assembleDebug``.
7. Commit only your files. Author on this PC: ``Michael Thomson <michael.thomson@cloudconnectsoftware.com>``. Push the lane branch. After a rebase, ``git push --force-with-lease`` is allowed on that branch only.
8. Open a pull request into ``main``. Link ``Tyneside-Software/hackathon-site#ISSUE``. Do not merge it.
9. Report the pull request URL and stop, unless the human told you to take the next ready issue.
"@
}

Set-Content -Path $prompt -Value $body -Encoding utf8
Write-Host "LANE-OK $dest role=$Role"
