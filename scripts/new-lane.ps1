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
        $branch = (git -C $path rev-parse --abbrev-ref HEAD).Trim()
        $dirty = git -C $path status --porcelain --untracked-files=no
        if (-not $dirty -and $branch -eq "main") {
            git -C $path pull --ff-only origin main
            if ($LASTEXITCODE -ne 0) { throw "fast-forward failed for $name" }
        }
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

Read ``hackathon-site\docs\radio\README.md``, then ``## Now`` in ``docs\radio\integrator.md``. The desk folder is retired. If the human says ``continue``, that word is the whole order. Do not put a password in a note.

Standing orders:

1. Do not edit product code. You may commit and squash-merge a branch that changes only ``docs/radio/po.md``.
2. Do not deploy. Do not run ``box.ps1`` or ``deploy-if-product.ps1``. Do not read ``C:\Users\MichaelThomson\Desktop\hackathon-linux.md``. Do not copy ``C:\Users\MichaelThomson\Desktop\confidential docs`` into a repo.
3. Do not touch ``C:\Users\MichaelThomson\source\hackathon-site``, ``hackathon-api``, or ``hackathon-android``. Those folders belong to the integrator session.
4. Number the work ``## Now`` names. Set each dev ``Next`` to it. Keep sixteen unfinished slices that someone can watch, or that make the next slice smaller. A clear of one field is not one of them.
5. Do not add ``ready``. Leave September 2026 issues 1, 2, 3, 4, and 18 alone. Leave issues 22 and 29 ``blocked``. Leave API pull request ``reeve-branch`` alone.
6. Do not give both devs the same file. grok-dev-1 owns the empire API. grok-dev-2 owns ``play.html`` and ``play.js``.
7. After the radio merge, pull ``main`` and read the other radio files. Keep going for about 30 minutes. Do not deploy.
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

Read ``hackathon-site\docs\radio\README.md``, then ``## Now`` in ``docs\radio\integrator.md``. The desk folder is retired. If the human says ``continue``, that word is the whole order. Do not put a password in a note.

Standing orders:

1. Do not deploy. Do not run ``box.ps1`` or ``deploy-if-product.ps1``. Do not read ``C:\Users\MichaelThomson\Desktop\hackathon-linux.md``. Do not copy ``C:\Users\MichaelThomson\Desktop\confidential docs`` into a repo.
2. Do not edit ``C:\Users\MichaelThomson\source\hackathon-site``, ``hackathon-api``, or ``hackathon-android``. Those folders belong to the integrator session.
3. Build the unfinished line ``## Now`` names for this lane. One slice is one pull request, then four radio lines, then the next slice. A clear of one field is not the slice.
4. From ``hackathon-site``, run ``.\scripts\lane-sync.ps1`` before you edit and again before you push.
5. Branch ``lane/$Lane/<slug>`` from current ``origin/main``. Author ``Michael Thomson <michael.thomson@cloudconnectsoftware.com>``. ``git push --force-with-lease`` is allowed on that lane branch only.
6. Test before you push. From ``hackathon-api``, ``.\.venv\Scripts\python.exe -m unittest tests.test_empire`` for game work, and ``tests.test_board`` for board work.
7. Squash-merge your own pull request. Link ``Tyneside-Software/hackathon-site#ISSUE``. Do not use Closes, Fixes, or Resolves. Then merge your radio file and keep going for about 30 minutes.
8. Do not edit the other dev's files. grok-dev-1 owns the empire API. grok-dev-2 owns ``play.html`` and ``play.js``. The page shows the feed. It does not invent places or positions.
"@
}

Set-Content -Path $prompt -Value $body -Encoding utf8
Write-Host "LANE-OK $dest role=$Role"
