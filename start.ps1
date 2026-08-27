#Requires -Version 5.1
<#
.SYNOPSIS
  Start the hackathon front end (port 5500) and back end (port 8080).

Clone both repos as siblings:
  source\hackathon-site
  source\hackathon-api

Then from this folder:
  .\start.ps1
#>
$ErrorActionPreference = "Stop"
$SiteRoot = $PSScriptRoot
$ApiRoot = Join-Path (Split-Path $SiteRoot -Parent) "hackathon-api"

if (-not (Test-Path (Join-Path $ApiRoot "app\main.py"))) {
    Write-Error "API not found at $ApiRoot`nClone https://github.com/Tyneside-Software/hackathon-api next to hackathon-site."
}

$venvPy = Join-Path $ApiRoot ".venv\Scripts\python.exe"
if (-not (Test-Path $venvPy)) {
    Write-Host "Creating API virtualenv..."
    python -m venv (Join-Path $ApiRoot ".venv")
}
if (-not (Test-Path $venvPy)) {
    Write-Error "Could not create $venvPy"
}

Write-Host "Installing API deps if needed..."
& $venvPy -m pip install -q -r (Join-Path $ApiRoot "requirements.txt")

$siteCmd = @"
Set-Location -LiteralPath '$SiteRoot'
Write-Host 'SITE   http://127.0.0.1:5500/'
Write-Host 'Map    http://127.0.0.1:5500/app/'
Write-Host 'Board  http://127.0.0.1:5500/board.html'
python -m http.server 5500
"@

$apiCmd = @"
Set-Location -LiteralPath '$ApiRoot'
Write-Host 'API    http://127.0.0.1:8080/health'
Write-Host 'Docs   http://127.0.0.1:8080/docs'
& '$venvPy' -m uvicorn app.main:app --reload --port 8080
"@

Start-Process powershell -ArgumentList @("-NoExit", "-Command", $siteCmd)
Start-Process powershell -ArgumentList @("-NoExit", "-Command", $apiCmd)

Write-Host ""
Write-Host "Opened two windows:"
Write-Host "  Front end  http://127.0.0.1:5500/"
Write-Host "  Back end   http://127.0.0.1:8080/health"
Write-Host "Close those windows to stop."
Start-Sleep -Seconds 1
Start-Process "http://127.0.0.1:5500/"
