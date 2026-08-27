#Requires -Version 5.1
# Serve the logistics site locally (no Cloud Run).
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot
Write-Host "Tyneside Logistics — local site"
Write-Host "  http://127.0.0.1:5500/"
Write-Host "  Map:  http://127.0.0.1:5500/app/"
Write-Host "  Board: http://127.0.0.1:5500/board.html"
Write-Host ""
Write-Host "Optional API (other terminal):"
Write-Host "  cd ..\hackathon-api"
Write-Host "  .\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8080"
python -m http.server 5500
