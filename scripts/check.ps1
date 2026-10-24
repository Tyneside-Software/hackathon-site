# Read-only proof that this PC can see a live box which matches the API tree.
# Does not deploy, does not write the board, does not start an emulator.
#
#   .\scripts\check.ps1
#
# Prints CHECK-OK or exits non-zero. The password file is never printed.

$ErrorActionPreference = "Stop"
$SiteRoot = Split-Path -Parent $PSScriptRoot
$ApiRoot = Join-Path (Split-Path -Parent $SiteRoot) "hackathon-api"
$Config = Join-Path $ApiRoot "app\config.py"
$Python = Join-Path $ApiRoot ".venv\Scripts\python.exe"
$Sheet = "C:\Users\MichaelThomson\Desktop\hackathon-linux.md"
$Api = "http://100.65.94.5:8080"

if (-not (Test-Path $Config)) {
    throw "Missing $Config. hackathon-api must sit beside hackathon-site."
}
if (-not (Test-Path $Python)) {
    throw "Missing $Python. Create the API venv and install requirements before this check."
}
if (Test-Path $Sheet) {
    $raw = Get-Content -Path $Sheet -Raw
    if ($raw -match '(?m)^API_BASE=(.+)$') {
        $Api = $Matches[1].Trim()
    }
}

& $Python -c @"
import json, re, sys, urllib.request
from pathlib import Path

api = '$Api'.rstrip('/')
cfg = Path(r'$Config').read_text(encoding='utf-8')
match = re.search(r'(?m)^VERSION\s*=\s*\"([^\"]+)\"', cfg)
if not match:
    sys.exit('VERSION is missing from app/config.py')
want = match.group(1)

def get(path):
    with urllib.request.urlopen(api + path, timeout=30) as response:
        return json.load(response)

health = get('/health')
live = str(health.get('version') or '')
print(f'health {live}')
if live != want:
    sys.exit(f'live version {live} does not match app/config.py {want}')

board = get('/v1/board')
cards = board.get('cards') or []
cols = {}
probes = []
for card in cards:
    column = str(card.get('column') or '')
    cols[column] = cols.get(column, 0) + 1
    if str(card.get('title') or '') == 'Workflow probe':
        probes.append(str(card.get('id')))
order = ['backlog', 'todo', 'next', 'doing', 'ready', 'done']
bits = [f'{name}={cols[name]}' for name in order if name in cols]
extra = [f'{name}={count}' for name, count in sorted(cols.items()) if name not in order]
print('board', len(cards), 'people', len(board.get('people') or []), ' '.join(bits + extra))
if probes:
    sys.exit('Workflow probe cards still on the board: ' + ', '.join(probes))

buses = get('/v1/buses')
if not buses.get('ok'):
    sys.exit('GET /v1/buses did not return ok')
print('buses', buses.get('count'), 'source', buses.get('source'), 'stale', buses.get('stale'))
"@
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Push-Location $ApiRoot
try {
    & $Python -m unittest tests.test_board
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}
finally {
    Pop-Location
}

Write-Host "CHECK-OK"
