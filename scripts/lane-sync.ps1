# Fast-forward main, or rebase the current lane/* branch onto origin/main.
# Run from hackathon-site. Refuses to stash, to deploy, or to touch a branch
# that is neither main nor lane/*.
#
#   .\scripts\lane-sync.ps1

$ErrorActionPreference = "Stop"
$SiteRoot = Split-Path -Parent $PSScriptRoot
$Parent = Split-Path -Parent $SiteRoot
$LaneFile = Join-Path $Parent "LANE.txt"
$lane = "integrator"
$role = "integrator"

if (Test-Path $LaneFile) {
    $text = Get-Content -Path $LaneFile -Raw
    if ($text -match '(?m)^LANE=(.+)$') { $lane = $Matches[1].Trim() }
    if ($text -match '(?m)^ROLE=(.+)$') { $role = $Matches[1].Trim() }
}

$names = @("hackathon-site", "hackathon-api", "hackathon-android")
foreach ($name in $names) {
    $dir = Join-Path $Parent $name
    if (-not (Test-Path (Join-Path $dir ".git"))) {
        Write-Host "SKIP $name"
        continue
    }
    Push-Location $dir
    try {
        Write-Host "== $name =="
        git fetch origin
        if ($LASTEXITCODE -ne 0) { throw "git fetch failed in $name" }
        $branch = (git rev-parse --abbrev-ref HEAD).Trim()
        $dirty = git status --porcelain
        if ($dirty) {
            throw "$name has uncommitted work on $branch. lane-sync will not stash it."
        }
        if ($branch -eq "main") {
            git pull --ff-only origin main
            if ($LASTEXITCODE -ne 0) { throw "fast-forward failed in $name" }
        }
        elseif ($branch.StartsWith("lane/")) {
            if ($role -eq "po") {
                throw "$name is on $branch. The product-owner checkout stays on main."
            }
            git rebase origin/main
            if ($LASTEXITCODE -ne 0) {
                throw "rebase failed in $name. Fix that repo, then run lane-sync again. Do not skip commits."
            }
        }
        else {
            throw "$name is on $branch. Use main, or a branch named lane/<owner>/<slug>."
        }
        git status -sb
    }
    finally {
        Pop-Location
    }
}

Write-Host "SYNC-OK lane=$lane role=$role"
