# PowerShell script to uninstall Windows Service

$serviceName = "PosgenPrintService"
$nssmPath = "C:\Program Files\nssm\nssm.exe"
if (-not (Test-Path $nssmPath)) {
    $nssmPath = "C:\Program Files (x86)\nssm\nssm.exe"
}

if (-not (Test-Path $nssmPath)) {
    Write-Host "NSSM not found!" -ForegroundColor Red
    exit 1
}

$service = Get-Service -Name $serviceName -ErrorAction SilentlyContinue
if (-not $service) {
    Write-Host "Service not found!" -ForegroundColor Yellow
    exit 0
}

Write-Host "Stopping service..." -ForegroundColor Yellow
Stop-Service -Name $serviceName -Force -ErrorAction SilentlyContinue

Write-Host "Removing service..." -ForegroundColor Yellow
& $nssmPath remove $serviceName confirm

Write-Host "Service uninstalled successfully!" -ForegroundColor Green



