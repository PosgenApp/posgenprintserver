# PowerShell script to install as Windows Service using NSSM
# NSSM (Non-Sucking Service Manager) - https://nssm.cc/

$serviceName = "PosgenPrintService"
$serviceDisplayName = "Posgen Local Print Service"
$serviceDescription = "Local WebSocket print service for Posgen"
$exePath = Join-Path $PSScriptRoot "posgenprintservice.exe"

# Check if NSSM is installed
$nssmPath = "C:\Program Files\nssm\nssm.exe"
if (-not (Test-Path $nssmPath)) {
    $nssmPath = "C:\Program Files (x86)\nssm\nssm.exe"
}

if (-not (Test-Path $nssmPath)) {
    Write-Host "NSSM not found!" -ForegroundColor Red
    Write-Host "Please install NSSM from: https://nssm.cc/download" -ForegroundColor Yellow
    Write-Host "Or download and extract to C:\Program Files\nssm\" -ForegroundColor Yellow
    exit 1
}

# Check if executable exists
if (-not (Test-Path $exePath)) {
    Write-Host "posgenprintservice.exe not found at: $exePath" -ForegroundColor Red
    exit 1
}

# Check if service already exists
$service = Get-Service -Name $serviceName -ErrorAction SilentlyContinue
if ($service) {
    Write-Host "Service already exists. Removing..." -ForegroundColor Yellow
    & $nssmPath stop $serviceName
    & $nssmPath remove $serviceName confirm
}

# Install service
Write-Host "Installing service..." -ForegroundColor Green
& $nssmPath install $serviceName $exePath
& $nssmPath set $serviceName DisplayName $serviceDisplayName
& $nssmPath set $serviceName Description $serviceDescription
& $nssmPath set $serviceName Start SERVICE_AUTO_START
& $nssmPath set $serviceName AppDirectory (Split-Path $exePath -Parent)

Write-Host "Service installed successfully!" -ForegroundColor Green
Write-Host "Starting service..." -ForegroundColor Cyan
Start-Service -Name $serviceName

Write-Host "Service is running!" -ForegroundColor Green
Write-Host "You can manage it with: Get-Service $serviceName" -ForegroundColor Cyan



