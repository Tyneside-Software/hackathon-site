# Append one order to docs/radio/michael.md and push origin/main.
# The four sessions read that file. They do not write it.
param(
    [Parameter(Position = 0)]
    [string]$Message,
    [switch]$Clear
)

$ErrorActionPreference = "Stop"
if ($Clear -and $Message) {
    throw "Pass a message or -Clear, not both."
}
if (-not $Clear -and [string]::IsNullOrWhiteSpace($Message)) {
    throw "Usage: .\scripts\tell-agents.ps1 ""what they should do""    or    .\scripts\tell-agents.ps1 -Clear"
}

$root = Split-Path $PSScriptRoot -Parent
Set-Location $root
git fetch origin main
git checkout main
git pull --rebase origin main

$path = Join-Path $root "docs\radio\michael.md"
if (-not (Test-Path $path)) {
    throw "docs/radio/michael.md is missing."
}

$utf8 = New-Object System.Text.UTF8Encoding $false
$text = [IO.File]::ReadAllText($path)
$unreadHead = "## Unread"
$heardHead = "## Heard"
$unreadAt = $text.IndexOf($unreadHead)
$heardAt = $text.IndexOf($heardHead)
if ($unreadAt -lt 0 -or $heardAt -lt 0 -or $heardAt -le $unreadAt) {
    throw "docs/radio/michael.md needs ## Unread and ## Heard, in that order."
}

$unreadBodyStart = $unreadAt + $unreadHead.Length
$unreadBody = $text.Substring($unreadBodyStart, $heardAt - $unreadBodyStart)
$heardBody = $text.Substring($heardAt + $heardHead.Length)

function Bullets([string]$body) {
    $found = @()
    foreach ($line in ($body -split "`r?`n")) {
        if ($line.StartsWith("- ")) {
            $found += $line.TrimEnd()
        }
    }
    return $found
}

if ($Clear) {
    $pending = Bullets $unreadBody
    if ($pending.Count -eq 0) {
        Write-Output "Inbox already empty. Nothing pushed."
        exit 0
    }
    $newUnread = "`r`n`r`nNone yet.`r`n`r`n"
    $moved = (($pending -join "`r`n") + "`r`n")
    $newHeard = "`r`n" + $moved + $heardBody.TrimStart("`r", "`n")
    if (-not $newHeard.EndsWith("`n")) {
        $newHeard += "`r`n"
    }
    $commit = "Clear Michael's radio inbox."
} else {
    $flat = ($Message -replace "\s+", " ").Trim()
    if ($flat.Length -gt 500) {
        throw "Keep a message under 500 characters. The sessions read it in one line."
    }
    $stamp = [DateTime]::UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ")
    $line = "- $stamp — $flat"
    $newUnread = "`r`n`r`n$line`r`n`r`n"
    $existing = Bullets $unreadBody
    if ($existing.Count -gt 0) {
        $newUnread = "`r`n`r`n" + (($existing + $line) -join "`r`n") + "`r`n`r`n"
    }
    $newHeard = $heardBody
    if (-not $newHeard.StartsWith("`r") -and -not $newHeard.StartsWith("`n")) {
        $newHeard = "`r`n" + $newHeard
    }
    $short = $flat
    if ($short.Length -gt 72) {
        $short = $short.Substring(0, 72).TrimEnd()
    }
    $commit = "Tell the lanes: $short"
}

$updated = $text.Substring(0, $unreadAt) + $unreadHead + $newUnread + $heardHead + $newHeard
[IO.File]::WriteAllText($path, $updated, $utf8)

git add -- "docs/radio/michael.md"
git commit -m $commit
git push origin main
if ($LASTEXITCODE -ne 0) {
    git pull --rebase origin main
    git push origin main
}
if ($LASTEXITCODE -ne 0) {
    throw "Push failed. The line is committed locally. Pull, then push docs/radio/michael.md."
}
Write-Output "Pushed. The sessions see it the next time they pull main."
