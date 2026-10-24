# Deploy the Linux box when the game page or the API app has changed.
# Uses scripts\box.ps1, which reads the SSH password from the Desktop sheet.
# Do not print that password. Do not delete the live database.
# A radio-only commit does not deploy.
$ErrorActionPreference = "Stop"
$Site = Split-Path $PSScriptRoot -Parent
Set-Location $Site
$Api = "C:\Users\MichaelThomson\source\hackathon-api"
$StatePath = "C:\Users\MichaelThomson\source\hackathon-deploy-loop.json"

function Invoke-BoxScript([string[]]$ArgList) {
    $out = & pwsh -NoProfile -File (Join-Path $Site "scripts\box.ps1") @ArgList 2>&1 | Out-String
    return @{ Code = $LASTEXITCODE; Text = $out }
}

git fetch origin
if ($LASTEXITCODE -ne 0) { Write-Output "DEPLOY-FAIL site fetch"; exit 1 }
git -C $Api fetch origin
if ($LASTEXITCODE -ne 0) { Write-Output "DEPLOY-FAIL api fetch"; exit 1 }
$siteOrigin = (git rev-parse "origin/main").Trim()
$apiOrigin = (git -C $Api rev-parse "origin/main").Trim()

$state = $null
if (Test-Path $StatePath) {
    $state = Get-Content $StatePath -Raw | ConvertFrom-Json
}

$reasons = @()
if (-not $state -or -not $state.site -or -not $state.api) {
    $reasons += "no record of the last product deploy"
} else {
    git cat-file -e "$($state.site)^{commit}" 2>$null
    $siteKnown = $LASTEXITCODE -eq 0
    git -C $Api cat-file -e "$($state.api)^{commit}" 2>$null
    $apiKnown = $LASTEXITCODE -eq 0
    if (-not $siteKnown -or -not $apiKnown) {
        $reasons += "saved deploy is not in this clone"
    } else {
        $siteDiff = @(git diff --name-only $state.site $siteOrigin -- play.html play.js config.js)
        $apiDiff = @(git -C $Api diff --name-only $state.api $apiOrigin -- app)
        if ($siteDiff.Count -gt 0) { $reasons += ("site " + ($siteDiff -join ", ")) }
        if ($apiDiff.Count -gt 0) { $reasons += ("api " + ($apiDiff -join ", ")) }
    }
}

if ($reasons.Count -eq 0) {
    Write-Output "DEPLOY-SKIP site=$siteOrigin api=$apiOrigin"
    exit 0
}

Write-Output ("DEPLOY-RUN " + ($reasons -join "; "))
$update = Invoke-BoxScript @("update")
Write-Output $update.Text
if ($update.Code -ne 0) {
    Write-Output "DEPLOY-FAIL update exit $($update.Code)"
    exit 1
}

$siteSha = $siteOrigin
$apiSha = $apiOrigin
if ($update.Text -match "(?m)^--- site ---\r?\n([0-9a-f]+)") { $siteSha = $Matches[1] }
if ($update.Text -match "(?m)^--- api ---\r?\n([0-9a-f]+)") { $apiSha = $Matches[1] }

$check = & pwsh -NoProfile -File (Join-Path $Site "scripts\check.ps1") 2>&1 | Out-String
Write-Output $check
if ($check -notmatch "CHECK-OK") {
    Write-Output "DEPLOY-FAIL check"
    exit 1
}

@{
    site = $siteSha
    api  = $apiSha
    utc  = (Get-Date).ToUniversalTime().ToString("o")
} | ConvertTo-Json | Set-Content -Path $StatePath -Encoding utf8
Write-Output "DEPLOY-OK site=$siteSha api=$apiSha"
