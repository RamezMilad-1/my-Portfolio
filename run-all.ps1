# run-all.ps1
# Boots the portfolio + all 4 showcased projects on dedicated localhost ports.
# Each service opens in its own PowerShell window so logs are visible per service.
#
# Usage:   .\run-all.ps1
# Stop:    close each window, or  .\run-all.ps1 -Stop

[CmdletBinding()]
param(
  [switch]$Stop,
  [switch]$SkipInstall
)

$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot

# ── Service registry ──────────────────────────────────────────────────────────
# Each service describes:
#   Name      label shown in the new window title
#   Cwd       working directory for npm/next
#   InstallNeededIf  truthy => run `npm install` if node_modules missing
#   PreCmd    extra PS commands to run before the start command (env vars, etc.)
#   StartCmd  the npm/next command line that keeps the service running
#   Color     window background color
$services = @(
  @{
    Name     = 'portfolio-backend'
    Cwd      = "$root\portfolio\backend"
    InstallNeededIf = $true
    PreCmd   = ''
    StartCmd = 'npm run start:dev'
    Color    = 'DarkBlue'
  },
  @{
    Name     = 'portfolio-frontend'
    Cwd      = "$root\portfolio\frontend"
    InstallNeededIf = $true
    PreCmd   = ''
    StartCmd = 'npm run dev'
    Color    = 'DarkBlue'
  },
  @{
    Name     = 'earlyhub-backend'
    Cwd      = "$root\projects\events-ticketing-system-berlin\backend"
    InstallNeededIf = $true
    PreCmd   = ''   # PORT=4001 comes from .env in this folder
    StartCmd = 'npm run dev'
    Color    = 'DarkRed'
  },
  @{
    Name     = 'earlyhub-frontend'
    Cwd      = "$root\projects\events-ticketing-system-berlin\frontend"
    InstallNeededIf = $true
    # tracked .env in this submodule points at :3001 — override at runtime so we don't dirty the repo
    PreCmd   = '$env:VITE_API_BASE_URL = "http://localhost:4001/api/v1"'
    StartCmd = 'npm run dev -- --port 4002 --strictPort'
    Color    = 'DarkRed'
  },
  @{
    Name     = 'bellavista-backend'
    Cwd      = "$root\projects\restaurant-reservation-system\backend"
    InstallNeededIf = $true
    PreCmd   = ''
    StartCmd = 'npm run start:dev'
    Color    = 'DarkGreen'
  },
  @{
    Name     = 'bellavista-frontend'
    Cwd      = "$root\projects\restaurant-reservation-system\frontend"
    InstallNeededIf = $true
    PreCmd   = ''
    StartCmd = 'npm run dev -- --port 4004 --strictPort'
    Color    = 'DarkGreen'
  },
  @{
    Name     = 'hrsystem-backend'
    Cwd      = "$root\projects\semester-5-software-project\backend"
    InstallNeededIf = $true
    PreCmd   = ''
    StartCmd = 'npm run start:dev'
    Color    = 'DarkMagenta'
  },
  @{
    Name     = 'hrsystem-frontend'
    Cwd      = "$root\projects\semester-5-software-project\frontend"
    InstallNeededIf = $true
    PreCmd   = ''
    StartCmd = 'npm run dev -- --port 4006'
    Color    = 'DarkMagenta'
  }
)

# Ports each service is expected to bind. Used for -Stop only.
$portMap = @{
  'portfolio-backend'    = 3001
  'portfolio-frontend'   = 3000
  'earlyhub-backend'     = 4001
  'earlyhub-frontend'    = 4002
  'bellavista-backend'   = 4003
  'bellavista-frontend'  = 4004
  'hrsystem-backend'     = 4005
  'hrsystem-frontend'    = 4006
}

# ── Helpers ───────────────────────────────────────────────────────────────────

function Stop-AllServices {
  Write-Host "Stopping all known dev servers..." -ForegroundColor Yellow
  foreach ($entry in $portMap.GetEnumerator()) {
    $port = $entry.Value
    $conns = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
    foreach ($c in $conns) {
      try {
        $proc = Get-Process -Id $c.OwningProcess -ErrorAction Stop
        Write-Host "  Stopping $($entry.Key) (PID $($proc.Id) on port $port)..."
        Stop-Process -Id $proc.Id -Force
      } catch { }
    }
  }
  Write-Host "Done." -ForegroundColor Green
}

if ($Stop) {
  Stop-AllServices
  exit 0
}

# ── MongoDB sanity ────────────────────────────────────────────────────────────
$mongoSvc = Get-Service -Name 'MongoDB' -ErrorAction SilentlyContinue
if (-not $mongoSvc) {
  Write-Host "MongoDB service not found. Install it first from the .msi at the workspace root." -ForegroundColor Red
  exit 1
}
if ($mongoSvc.Status -ne 'Running') {
  Write-Host "MongoDB is installed but not running. Starting it now..." -ForegroundColor Yellow
  Start-Service MongoDB
}

# ── Pre-flight: install deps where missing ────────────────────────────────────
if (-not $SkipInstall) {
  foreach ($s in $services) {
    if ($s.InstallNeededIf -and -not (Test-Path "$($s.Cwd)\node_modules")) {
      Write-Host "[$($s.Name)] node_modules missing — running npm install..." -ForegroundColor Cyan
      Push-Location $s.Cwd
      try {
        npm install --no-audit --no-fund
        if ($LASTEXITCODE -ne 0) {
          Write-Host "[$($s.Name)] npm install failed (exit $LASTEXITCODE)." -ForegroundColor Red
          Pop-Location
          exit 1
        }
      } finally { Pop-Location }
    }
  }
}

# ── Stop anything that's already running on our ports ─────────────────────────
Stop-AllServices
Start-Sleep -Milliseconds 500

# ── Spawn each service in its own window ──────────────────────────────────────
foreach ($s in $services) {
  $title = "ramez-portfolio :: $($s.Name)"
  $script = @"
`$Host.UI.RawUI.WindowTitle = '$title'
Set-Location -LiteralPath '$($s.Cwd)'
$($s.PreCmd)
Write-Host '=== $($s.Name) ===' -ForegroundColor Cyan
Write-Host 'cwd: $($s.Cwd)'
Write-Host 'cmd: $($s.StartCmd)'
Write-Host ''
$($s.StartCmd)
Write-Host ''
Write-Host 'Process exited. Press any key to close this window.' -ForegroundColor Yellow
[void][System.Console]::ReadKey(`$true)
"@
  $tempFile = Join-Path $env:TEMP "ramez-launch-$($s.Name).ps1"
  Set-Content -Path $tempFile -Value $script -Encoding UTF8
  Start-Process -FilePath 'powershell' -ArgumentList '-NoExit', '-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', $tempFile | Out-Null
  Start-Sleep -Milliseconds 300
}

Write-Host ""
Write-Host "All services launching..." -ForegroundColor Green
Write-Host ""
Write-Host "  Portfolio       http://localhost:3000"
Write-Host "  EarlyHub        http://localhost:4002      (api on :4001)"
Write-Host "  Bella Vista     http://localhost:4004      (api on :4003)"
Write-Host "  HR System       http://localhost:4006      (api on :4005)"
Write-Host "  NYC             https://nyc-collision-studio.vercel.app  (no local server)"
Write-Host ""
Write-Host "First boot may take 30-60s while each service compiles."
Write-Host "To shut everything down:  .\run-all.ps1 -Stop"
