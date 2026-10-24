# Show the work queue, open pull requests, and whether live /health matches origin/main.
# Read-only. Does not deploy and does not comment on GitHub.
#
#   .\scripts\lane-status.ps1

$ErrorActionPreference = "Continue"
$SiteRoot = Split-Path -Parent $PSScriptRoot
$Parent = Split-Path -Parent $SiteRoot
$LaneFile = Join-Path $Parent "LANE.txt"

if (Test-Path $LaneFile) {
    Write-Host "=== lane file ==="
    Get-Content -Path $LaneFile
}
else {
    Write-Host "=== lane file ==="
    Write-Host "none. This checkout is the integrator if it is under source\hackathon-site."
}

Write-Host "=== issues on hackathon-site ==="
gh issue list --repo Tyneside-Software/hackathon-site --state open --limit 30

Write-Host "=== open pull requests ==="
foreach ($repo in @("hackathon-site", "hackathon-api", "hackathon-android")) {
    Write-Host "-- $repo --"
    gh pr list --repo "Tyneside-Software/$repo" --state open --limit 20
}

Write-Host "=== origin/main ==="
foreach ($name in @("hackathon-site", "hackathon-api", "hackathon-android")) {
    $dir = Join-Path $Parent $name
    if (-not (Test-Path (Join-Path $dir ".git"))) {
        Write-Host "$name missing"
        continue
    }
    git -C $dir fetch origin main 2>$null
    $sha = (git -C $dir rev-parse --short origin/main).Trim()
    $branch = (git -C $dir rev-parse --abbrev-ref HEAD).Trim()
    Write-Host "$name branch=$branch origin/main=$sha"
}

$api = Join-Path $Parent "hackathon-api"
if (Test-Path (Join-Path $api ".git")) {
    $versionLine = git -C $api show origin/main:app/config.py | Select-String -Pattern '^VERSION\s*='
    Write-Host "config $versionLine"
}

Write-Host "=== live health ==="
curl.exe -fsS --max-time 20 "http://100.65.94.5:8080/health"
if ($LASTEXITCODE -ne 0) {
    Write-Host "HEALTH-UNREACHABLE"
}
Write-Host ""
Write-Host "STATUS-OK"
