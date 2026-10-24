# Talk to the hackathon Linux box without typing a password.
# The password lives in C:\Users\MichaelThomson\Desktop\hackathon-linux.md
# and must not be copied into this repo.
#
#   .\scripts\box.ps1 health
#   .\scripts\box.ps1 update
#   .\scripts\box.ps1 ssh "hostname; id"

param(
    [Parameter(Position = 0)]
    [ValidateSet("health", "update", "ssh")]
    [string]$Action = "health",

    [Parameter(Position = 1, ValueFromRemainingArguments = $true)]
    [string[]]$Remote
)

$ErrorActionPreference = "Stop"
$Sheet = "C:\Users\MichaelThomson\Desktop\hackathon-linux.md"
if (-not (Test-Path $Sheet)) {
    throw "Missing $Sheet. That file holds SSH_HOST, SSH_USER, and SSH_PASSWORD."
}
$raw = Get-Content -Path $Sheet -Raw

function Read-Sheet([string]$Name) {
    if ($raw -match "(?m)^$Name=(.+)$") {
        return $Matches[1].Trim()
    }
    throw "Missing $Name in $Sheet"
}

$SshHost = Read-Sheet "SSH_HOST"
$SshUser = Read-Sheet "SSH_USER"
$SshPassword = Read-Sheet "SSH_PASSWORD"
$ApiBase = Read-Sheet "API_BASE"
$SiteBase = Read-Sheet "SITE_BASE"

function Invoke-Box([string]$RemoteCommand) {
    $ask = Join-Path $env:TEMP ("hackathon-askpass-{0}.cmd" -f $PID)
    try {
        Set-Content -Path $ask -Encoding ascii -Value "@echo off`r`necho $SshPassword`r`n"
        $env:SSH_ASKPASS = $ask
        $env:SSH_ASKPASS_REQUIRE = "force"
        $env:DISPLAY = "localhost:0"
        & "$env:SystemRoot\System32\OpenSSH\ssh.exe" `
            -o StrictHostKeyChecking=accept-new `
            -o PreferredAuthentications=password `
            -o PubkeyAuthentication=no `
            -o ConnectTimeout=15 `
            -o ServerAliveInterval=30 `
            -o NumberOfPasswordPrompts=1 `
            "$SshUser@$SshHost" `
            $RemoteCommand
        if ($null -ne $LASTEXITCODE -and $LASTEXITCODE -ne 0) {
            exit $LASTEXITCODE
        }
    }
    finally {
        Remove-Item Env:SSH_ASKPASS, Env:SSH_ASKPASS_REQUIRE, Env:DISPLAY -ErrorAction SilentlyContinue
        Remove-Item $ask -Force -ErrorAction SilentlyContinue
    }
}

switch ($Action) {
    "health" {
        Write-Host "GET $ApiBase/health"
        curl.exe -fsS --max-time 20 "$ApiBase/health"
        Write-Host ""
        Write-Host "GET $SiteBase/board.html"
        curl.exe -fsS -o NUL -D - --max-time 20 "$SiteBase/board.html" | Select-Object -First 8
        Invoke-Box "echo SSH-OK; hostname"
    }
    "update" {
        Invoke-Box "/usr/local/bin/update"
    }
    "ssh" {
        if (-not $Remote -or $Remote.Count -eq 0) {
            throw "Pass a remote command: .\scripts\box.ps1 ssh `"hostname`""
        }
        Invoke-Box ($Remote -join " ")
    }
}
